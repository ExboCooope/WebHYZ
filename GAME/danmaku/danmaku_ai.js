/**
 * 避弹算法（第 3 层）：预测 → 规划 → 技巧命名 → 影子自机 / 接管 / 评价
 *
 * 三层结构：
 *   danmakuCore    视野 + 记忆（看到什么、记得什么）
 *   danmakuPattern 弹型分解（这是什么弹幕）
 *   danmakuAI      这一层（该怎么躲、躲得怎么样）
 *
 * 规划器是「有限视界滚动 + 候选动作打分」：
 *   候选 = 8 方向 × {高速,低速} + 原地不动；每个候选把自机按引擎的移动规则推演 H 帧，
 *   沿途对预测弹幕算最小间距 / 危险积分 / 位移 / 贴底 / 与前一次决策的一致性，取总分最高。
 *   技巧（即死/超即死/微移/折返/混线/反进/亲变更）不是硬编码动作，而是
 *   分类器的结论 → 给候选动作加偏置（danmakuAI.hint），再回读成名字。
 *
 * 两种用法：
 *   1. danmakuAI.step()          每帧跑一次：感知、分型、规划"影子自机"、评价真实自机；
 *   2. danmakuAI.takeOver(player) 把某个自机的操作交给它（真实自主躲避）。
 */
//Math 的方法在加载时就取出来（和 STGCORE.js 的 var sin=Math.sin 同一套写法）：
//vm/headless 环境里全局 Math 的绑定偶尔会丢，运行期再取 Math.xxx 会变成 undefined.xxx。
var _dm_sin=Math.sin,_dm_cos=Math.cos,_dm_sqrt=Math.sqrt,_dm_atan2=Math.atan2,
    _dm_abs=Math.abs,_dm_max=Math.max,_dm_min=Math.min,_dm_floor=Math.floor,
    _dm_round=Math.round,_dm_PI=Math.PI;

var danmakuAI={
    enabled:0,
    horizon:44,          //推演帧数
    safety_margin:8,     //"安全"的最小间距（像素）
    danger_weight:1.1,
    clear_weight:12,
    travel_weight:0.012,
    turn_weight:3.5,
    bottom_weight:0.35,
    hint_weight:6,
    view:{radius:320,reaction:0,max_bullets:500},

    pattern:null,
    plan:null,           //影子自机的规划 {dir,slow,minC,score}
    player_plan:null,    //真实自机位置上的规划（接管时用）
    last_plan:null,
    last_player_plan:null,
    ghost:null,
    idle:null,           //对照组：站桩不动的影子
    report:null,         //对真实自机的评价
    hint:null,
    history:[],          //影子自机的轨迹（画图用）

    reset:function(){
        this.pattern=null;
        this.plan=null;
        this.player_plan=null;
        this.last_plan=null;
        this.last_player_plan=null;
        this.history=[];
        this.report=null;
        this.ghost=null;
        this.idle=null;
        this.err=0;
        this.last_error=null;
        this._last_state=undefined;
        danmakuCore.reset();
    },

    //---------------------------------------------------------------- 引擎适配
    localPlayer:function(){
        if(typeof stg_players==="undefined"||!stg_players.length)return null;
        var p=stg_players[stg_local_player_pos||0]||stg_players[0];
        return p||null;
    },
    playerRadius:function(p){
        if(p&&p.hitby&&p.hitby.range!==undefined)return p.hitby.range;
        return 0;
    },
    //把 _hit_pool 里的判定形状转成 {x,y,vx,vy,r} 列表
    gather:function(){
        var raw=[];
        if(typeof _hit_pool==="undefined")return raw;
        for(var i=0;i<_hit_pool.length;i++){
            var o=_hit_pool[i];
            if(!o||!o.hitdef||!o.hitdef.rpos)continue;
            if(o.side===stg_const.SIDE_PLAYER)continue;   //自己的子弹不算
            if(o.type===stg_const.OBJ_ITEM)continue;
            var h=o.hitdef;
            var vx=0,vy=0;
            if(o.move&&o.move._speed){
                vx=o.move._speed[0]||0;
                vy=o.move._speed[1]||0;
            }
            raw.push({
                x:h.rpos[0],y:h.rpos[1],vx:vx,vy:vy,
                r:this.hitRadius(h),type:h.type,sid:o.sid,src:o
            });
        }
        return raw;
    },
    hitRadius:function(h){
        if(!h)return 0;
        if(h.type===1)return _dm_max(h.rs||0,h.re||0);
        if(h.type===2)return _dm_max(h.rs||0,h.re||0);
        if(h.type===3)return h.re||0;
        return h.range||0;
    },

    //---------------------------------------------------------------- 每帧主流程
    step:function(){
        if(!this.enabled&&!this.takeover_active)return null;
        var p=this.localPlayer();
        if(!p||!p.pos)return null;
        try{
            return this._step(p);
        }catch(e){
            //这是个调试/分析工具，绝不能把异常抛回游戏主循环
            this.err=(this.err||0)+1;
            this.last_error=String(e&&e.message||e);
            return this.plan;
        }
    },
    _step:function(p){
        var pos={x:p.pos[0],y:p.pos[1],r:this.playerRadius(p)};
        var raw=this.gather();
        danmakuCore.update(raw,pos,this.view);
        this.pattern=danmakuPattern.analyze(danmakuCore.tracks,{player:pos,frame:danmakuCore.frame});
        this.hint=this.pickHint(this.pattern,pos);

        //影子自机：只能看视野内的弹幕（与真值解耦，模拟"信息受限"）
        var obs=danmakuCore.visible();
        if(!this.ghost)this.spawnGhost(pos);
        var g=this.ghost;
        this.plan=this.planMove(g.x,g.y,g.r,obs,this.bounds(),{hint:this.hint,prev:this.last_plan,slow:g.slow});
        g.last=this.plan.dir;
        g.slow=this.plan.slow;
        var sp=this.speedOf(g.slow);
        g.x+=this.plan.dir[0]*sp;
        g.y+=this.plan.dir[1]*sp;
        this.clamp(g);
        g.frames++;
        this.history.push([g.x,g.y,this.plan.dir[0],this.plan.dir[1]]);
        if(this.history.length>90)this.history.shift();
        //碰撞：影子自机碰到就记一次，然后回版底重生
        var c=danmakuCore.minClearance(g.x,g.y,g.r);
        g.clear=c;
        if(c<0){
            g.hits++;
            g.x=stg_frame_w*0.5;
            g.y=stg_frame_h-40;
            g.ghost_reset=1;
        }
        //接管时，真实自机要按"它自己位置"的规划走（影子的规划只对影子有效）
        this.player_plan=this.planMove(pos.x,pos.y,pos.r,obs,this.bounds(),
            {hint:this.hint,prev:this.last_player_plan,slow:p.slow||0});
        //对照组：同一个弹幕里"站桩不动"的影子，用来衡量 AI 到底躲掉了多少
        if(!this.idle)this.idle={x:pos.x,y:pos.y,r:pos.r,hits:0,frames:0,clear:0};
        var idle=this.idle;
        idle.frames++;
        idle.clear=danmakuCore.minClearance(idle.x,idle.y,idle.r);
        if(idle.clear<0){
            idle.hits++;
            idle.x=pos.x;
            idle.y=pos.y;
        }
        this.last_plan=this.plan;
        this.last_player_plan=this.player_plan;

        this.evalPlayer(p,pos);
        return this.plan;
    },

    spawnGhost:function(pos){
        this.ghost={x:pos.x,y:pos.y,r:pos.r,frames:0,hits:0,slow:1,last:[0,0],clear:0};
    },

    bounds:function(){
        var m=(typeof stg_clip!="undefined"?stg_clip:16);
        return {x0:m,y0:m,x1:stg_frame_w-m,y1:stg_frame_h-m};
    },
    speedOf:function(slow){
        var p=this.localPlayer();
        var s=(p&&p.move_speed&&p.move_speed[slow])||(slow?2:4);
        return s;
    },
    clamp:function(g){
        var b=this.bounds();
        if(g.x<b.x0)g.x=b.x0;
        if(g.x>b.x1)g.x=b.x1;
        if(g.y<b.y0)g.y=b.y0;
        if(g.y>b.y1)g.y=b.y1;
    },

    //---------------------------------------------------------------- 规划器
    //返回 {dir:[dx,dy],slow,minC,score,bind}
    planMove:function(x,y,r,obs,bounds,opt){
        opt=opt||{};
        var H=this.horizon;
        var speeds=[this.speedOf(0),this.speedOf(1)];
        var cands=[];
        var ddx,ddy;
        for(var si=0;si<2;si++){
            for(ddx=-1;ddx<=1;ddx++){
                for(ddy=-1;ddy<=1;ddy++){
                    if(!ddx&&!ddy)continue;
                    cands.push([ddx,ddy,si]);
                }
            }
        }
        cands.push([0,0,1]);

        //先粗筛：H 帧内根本追不上的子弹不参与
        var near=[];
        var rmax=8*H+160;
        for(var i=0;i<obs.length;i++){
            var o=obs[i];
            var dx=o.x-x,dy=o.y-y;
            if(dx*dx+dy*dy<rmax*rmax)near.push(o);
        }

        var best=null,bestScore=-1e9;
        var margin=this.safety_margin;
        for(var c=0;c<cands.length;c++){
            var cn=cands[c];
            var s=speeds[cn[2]];
            var vx=cn[0],vy=cn[1];
            if(vx&&vy){vx*=s/1.4142;vy*=s/1.4142;}
            else{vx*=s;vy*=s;}
            var px=x,py=y;
            var minC=1e9,danger=0,travel=0,bind=null;
            for(var t=1;t<=H;t++){
                px+=vx;py+=vy;
                if(px<bounds.x0){px=bounds.x0;}
                if(px>bounds.x1){px=bounds.x1;}
                if(py<bounds.y0){py=bounds.y0;}
                if(py>bounds.y1){py=bounds.y1;}
                travel+=_dm_sqrt(vx*vx+vy*vy);
                for(var k=0;k<near.length;k++){
                    var q=near[k];
                    var qx=q.x+q.vx*t,qy=q.y+q.vy*t;
                    var ddx2=px-qx,ddy2=py-qy;
                    var d=_dm_sqrt(ddx2*ddx2+ddy2*ddy2)-q.r-r;
                    if(d<minC){minC=d;bind=q;}
                    if(d<margin)danger+=margin-d;
                }
            }
            var score=minC*this.clear_weight-danger*this.danger_weight-travel*this.travel_weight;
            //贴底偏好：越靠下越有余量
            score+=(py-y)*this.bottom_weight;
            //决策一致性：别左右横跳
            if(opt.prev&&opt.prev.dir){
                var pd=opt.prev.dir;
                if((pd[0]&&pd[0]!==cn[0])||(pd[1]&&pd[1]!==cn[1]))score-=this.turn_weight;
            }
            //技巧偏置
            score+=this.hintBonus(opt.hint,cn,x,y,obs);
            if(score>bestScore){
                bestScore=score;
                best={dir:[cn[0],cn[1]],slow:cn[2],minC:minC,score:score,bind:bind,
                       vx:vx,vy:vy,px:px,py:py};
            }
        }
        return best;
    },

    //分类器结论 → 候选动作偏置
    hintBonus:function(hint,cn,x,y,obs){
        if(!hint)return 0;
        var w=this.hint_weight;
        if(hint.kind==="stay"){
            return (cn[0]===0&&cn[1]===0)?w:0;
        }
        if(hint.kind==="micro"){
            //微移：小步横向 + 低速
            if(cn[1]===0&&cn[0]!==0&&cn[2]===1)return w;
            if(cn[1]===0&&cn[0]!==0)return w*0.3;
            return 0;
        }
        if(hint.kind==="cross"){
            //混线：允许一次大步横向
            if(cn[1]===0&&cn[0]!==0&&cn[2]===0)return w*0.8;
            return 0;
        }
        if(hint.kind==="retreat"){
            return (cn[1]>0)?w*0.5:0;
        }
        return 0;
    },

    //从弹型推技巧提示
    pickHint:function(pat,pos){
        if(!pat||!pat.groups||!pat.groups.length)return {kind:"stay",reason:"无弹幕"};
        var whip=0,multi=0,fan=0,aimed=0,ring=0;
        for(var i=0;i<pat.groups.length;i++){
            var g=pat.groups[i];
            if(g.kind==="whip"||g.kind==="ring_whip")whip++;
            if(g.kind==="multi")multi++;
            if(g.kind==="fan")fan++;
            if(g.kind==="ring"||g.kind==="ring_whip")ring++;
            if(g.aimed)aimed++;
        }
        if(aimed&&!whip&&!ring)return {kind:"micro",reason:"自机狙→微移/折返"};
        if(whip&&!ring)return {kind:"cross",reason:"甩弹→混线/反进"};
        if(ring&&!whip)return {kind:"stay",reason:"圈弹→找安全区即死"};
        if(multi&&!fan&&!whip)return {kind:"stay",reason:"多重弹→即死/超即死"};
        return {kind:"none",reason:"混合弹幕"};
    },

    //---------------------------------------------------------------- 真实自机的评价
    evalPlayer:function(p,pos){
        var r=this.report;
        if(!r||r.frames===undefined||r.reset){
            r=this.report={frames:0,min_clear:1e9,danger:0,hits:0,regret:0,
                           technique:"",motion:"",t_clear:[],score:100,player_hits:0};
        }
        //真实自机的中弹次数（状态跳进 PLAYER_HIT 就算一次）
        if(this._last_state!==undefined&&p.state!==this._last_state&&
           p.state===stg_const.PLAYER_HIT)r.player_hits++;
        this._last_state=p.state;
        r.frames++;
        var clear=danmakuCore.minClearance(pos.x,pos.y,pos.r);
        r.clear=clear;
        if(clear<r.min_clear)r.min_clear=clear;
        if(clear<this.safety_margin)r.danger++;
        //如果原地不动，还有几帧被撞
        r.ttl=this.freezeTTL(pos.x,pos.y,pos.r);
        r.motion=this.classifyMotion();
        r.technique=this.nameTechnique();
        r.hints=this.hint?this.hint.kind:"";
        //"后悔值"：同一帧里规划器本可以拿到的间距 - 实际拿到的间距
        if(this.player_plan&&this.player_plan.minC!==undefined){
            var reg=this.player_plan.minC-clear;
            if(reg>0)r.regret+=reg;
        }
        //评分（0~100）：危险帧占比为主，中弹和贴脸额外扣
        r.danger_ratio=r.danger/r.frames;
        var s=100;
        s-=r.danger_ratio*55;
        s-=r.player_hits*8;
        if(r.min_clear<0)s-=_dm_min(20,-r.min_clear);
        s-=_dm_min(10,_dm_max(0,30-clear)*0.3);
        r.score=_dm_max(0,_dm_min(100,s));
    },

    //若自机原地不动，多少帧后会被撞（无则返回 999）
    freezeTTL:function(x,y,r){
        var obs=danmakuCore.visible();
        var H=this.horizon*2;
        for(var t=0;t<=H;t++){
            for(var i=0;i<obs.length;i++){
                var q=obs[i];
                var qx=q.x+q.vx*t,qy=q.y+q.vy*t;
                var dx=x-qx,dy=y-qy;
                if(dx*dx+dy*dy<(q.r+r)*(q.r+r))return t;
            }
        }
        return 999;
    },

    //看自机最近 30 帧的轨迹判定动作类型（评价"他用的是什么技巧"）
    classifyMotion:function(){
        var n=30;
        var tr=danmakuCore.trail;
        var f=danmakuCore.frame;
        var pts=[];
        for(var i=f-n;i<=f;i++){
            if(tr[i])pts.push(tr[i]);
        }
        if(pts.length<3)return "静止";
        var net=_dm_sqrt(Math.pow(pts[pts.length-1][0]-pts[0][0],2)+Math.pow(pts[pts.length-1][1]-pts[0][1],2));
        var path=0,flips=0,lastdx=0;
        var mx=0,my=0;
        for(i=1;i<pts.length;i++){
            var dx=pts[i][0]-pts[i-1][0],dy=pts[i][1]-pts[i-1][1];
            path+=_dm_sqrt(dx*dx+dy*dy);
            mx+=dx;my+=dy;
            if(dx*lastdx<0)flips++;
            if(dx)lastdx=dx;
        }
        if(net<6&&path<20)return "即死/不动";
        if(flips>=2&&_dm_abs(mx)<_dm_abs(my)+8)return "微移";
        if(flips>=1&&path>60)return "折返";
        if(_dm_abs(mx)>_dm_abs(my)*2)return "横拉";
        if(_dm_abs(my)>_dm_abs(mx)*2)return "上下拉";
        return "绕圈";
    },

    nameTechnique:function(){
        var pl=this.plan,pat=this.pattern;
        if(!pl)return "";
        //亲变更：真正"卡住"这次决策的那发弹，只在记忆里（视野外/已丢失），
        //也就是说这个位置是靠预判换来的，不是靠看着它躲的。
        if(pl.bind&&pl.bind.lost>0&&this.hint&&this.hint.kind!=="stay")return "亲变更";
        if(pl.dir[0]===0&&pl.dir[1]===0&&pl.minC>this.safety_margin)return "即死";
        if(pl.minC>this.safety_margin&&pl.slow===1&&pat){
            for(var i=0;i<pat.groups.length;i++){
                if(pat.groups[i].kind==="whip"&&pat.groups[i].aimed)return "反进法";
            }
        }
        if(this.hint&&this.hint.kind==="micro"&&pl.dir[1]===0)return "微移";
        if(this.hint&&this.hint.kind==="cross"&&pl.dir[1]===0&&pl.slow===0)return "混线";
        var pd=this.last_plan&&this.last_plan.dir;
        if(pd&&pl.dir[0]&&pd[0]&&pl.dir[0]!==pd[0])return "折返";
        if(pl.minC>this.safety_margin*2)return "超即死";
        return "走位";
    },

    //---------------------------------------------------------------- 接管真实自机
    takeover_active:0,
    takeOver:function(player){
        if(!player)player=this.localPlayer();
        if(!player)return 0;
        var self=this;
        this.enabled=1;
        this.takeover_active=1;
        player.on_ai=function(){};
        player.on_ai_after_move=function(){
            self.controlStep(this);
        };
        return 1;
    },
    release:function(player){
        if(!player)player=this.localPlayer();
        if(!player)return 0;
        player.on_ai=null;
        player.on_ai_after_move=null;
        this.takeover_active=0;
        return 1;
    },
    controlStep:function(player){
        if(!this.enabled&&!this.takeover_active)return;
        //注意：这里不跑 step()。大脑每帧只在 RunScript 阶段跑一次（见 danmaku_overlay.js），
        //这里只把上一帧算好的动作落到按键上，避免同一帧跑两遍分析。
        var pl=this.player_plan||this.plan;
        if(!pl||!pl.dir)return;
        var k=player.key;
        if(!k)return;
        k[stg_const.KEY_LEFT]=pl.dir[0]<0?1:0;
        k[stg_const.KEY_RIGHT]=pl.dir[0]>0?1:0;
        k[stg_const.KEY_UP]=pl.dir[1]<0?1:0;
        k[stg_const.KEY_DOWN]=pl.dir[1]>0?1:0;
        k[stg_const.KEY_SLOW]=pl.slow;
    }
};
