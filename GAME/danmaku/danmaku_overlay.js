/**
 * 避弹算法可视化 + 驱动（第 4 层）
 *
 * 每关自动挂一个物体：
 *   script  —— 每帧驱动 danmakuAI.step()（感知/分型/规划/评价）
 *   render  —— 开着 stg_show_danmaku_ai 时，在 UI 画布上把弹型、源点、影子自机、
 *              评价面板画出来（和命中判定 overlay 同一套画布机制，layer 99）
 *
 * 开关：全局变量 stg_show_danmaku_ai（STGGLOBAL.js）
 *   0 = 关；1 = 画弹型/影子/评价
 */
//Math 方法加载时取出（同 STGCORE.js 的 var sin=Math.sin）
var _dm_max=Math.max,_dm_min=Math.min,_dm_floor=Math.floor,_dm_ceil=Math.ceil,
    _dm_atan2=Math.atan2,_dm_sqrt=Math.sqrt;

var danmakuView={
    layer:99,
    COLORS:{
        multi:"rgba(255,170,40,0.9)",
        fan:"rgba(40,220,255,0.9)",
        ring:"rgba(255,240,60,0.9)",
        whip:"rgba(255,80,200,0.9)",
        ring_whip:"rgba(255,60,60,0.9)",
        static:"rgba(160,160,160,0.8)",
        single:"rgba(220,220,220,0.7)",
        ghost:"rgba(80,255,120,1)"
    },
    draw:function(c){
        if(!stg_show_danmaku_ai)return;
        if(!c||!c.beginPath)return;
        try{
            this._draw(c);
            this.frames=(this.frames||0)+1;
        }catch(e){
            //画图出错也不能把游戏主循环带崩
            this.err=(this.err||0)+1;
            this.last_error=String(e&&e.message||e);
        }
    },
    _draw:function(c){
        var ai=danmakuAI;
        var off=this.offset();
        var ox=off[0],oy=off[1];
        c.save();
        c.globalAlpha=1;
        c.lineJoin="round";
        this.drawTracks(c,ox,oy);
        this.drawGroups(c,ox,oy);
        this.drawGhost(c,ox,oy);
        this.drawHud(c,ox,oy);
        c.restore();
    },

    offset:function(){
        if(typeof hyz!="undefined"&&hyz&&hyz.full_screen_object&&hyz.full_screen_object.pos){
            return hyz.full_screen_object.pos;
        }
        return [0,0];
    },

    //UI 画布平时在场地画布之上（ui=20 > frame=5）。但读盘/切场景时 frame 会被临时抬到 30，
    //那样 UI 画布就整个被压在下面，什么都看不见。这里保证 UI 画布在上。
    ensureOnTop:function(){
        var ui=stg_textures.ui,fr=stg_textures.frame;
        if(!ui||!fr||!ui.style||!fr.style)return;
        var zu=parseInt(ui.style.zIndex||"0",10)||0;
        var zf=parseInt(fr.style.zIndex||"0",10)||0;
        if(zu<=zf)ui.style.zIndex=""+(zf+1);
    },

    drawTracks:function(c,ox,oy){
        var tracks=danmakuCore.tracks;
        var kindMap=this.kindOf();
        for(var i=0;i<tracks.length;i++){
            var t=tracks[i];
            if(t.lost>1)continue;
            var col=kindMap[t.id]||this.COLORS.single;
            var r=t.r||2;
            if(r>10){
                //大判定（环形弹/大玉）只画轮廓，不然整屏都被糊住
                c.strokeStyle=col;
                c.lineWidth=1.5;
                c.globalAlpha=0.55;
                c.beginPath();
                c.arc(ox+t.x,oy+t.y,r,0,PI2);
                c.stroke();
                c.globalAlpha=1;
            }else{
                c.fillStyle=col;
                c.globalAlpha=0.55;
                c.beginPath();
                c.arc(ox+t.x,oy+t.y,_dm_max(2,r),0,PI2);
                c.fill();
                c.globalAlpha=1;
            }
        }
    },

    //track id → 所在弹型的颜色
    kindOf:function(){
        var m={};
        var pat=danmakuAI.pattern;
        if(!pat)return m;
        for(var i=0;i<pat.groups.length;i++){
            var g=pat.groups[i];
            var col=this.COLORS[g.kind]||this.COLORS.single;
            for(var j=0;j<g.bullets.length;j++){
                m[g.bullets[j].id]=col;
            }
        }
        return m;
    },

    //每组只用一根线把成员连起来：多重弹按沿射线的距离排（连出来是直线），
    //复数/甩/圈按角度排（连出来是折线/环）。线色 = 该弹型的颜色。
    drawGroups:function(c,ox,oy){
        var pat=danmakuAI.pattern;
        if(!pat)return;
        for(var i=0;i<pat.groups.length;i++){
            var g=pat.groups[i];
            if(g.kind==="static")continue;
            var bs=g.bullets;
            if(!bs||bs.length<2)continue;
            var col=this.COLORS[g.kind]||this.COLORS.single;
            var multi=(g.kind==="multi");
            var j,b,dx=0,dy=0;
            if(multi){
                for(j=0;j<bs.length;j++){dx+=bs[j].vx;dy+=bs[j].vy;}
                var len=_dm_sqrt(dx*dx+dy*dy);
                if(len<1e-6){dx=0;dy=1;len=1;}
                dx/=len;dy/=len;
            }
            var ox0=g.origin[0],oy0=g.origin[1];
            var pts=[],amin=1e9,amax=-1e9;
            for(j=0;j<bs.length;j++){
                b=bs[j];
                var ax=b.x-ox0,ay=b.y-oy0;
                var age=(b.src&&b.src.frame!==undefined)?b.src.frame:b.age;
                if(age<amin)amin=age;
                if(age>amax)amax=age;
                pts.push({x:b.x,y:b.y,
                    age:age,
                    ang:_dm_atan2(ay,ax),
                    d:multi?(ax*dx+ay*dy):_dm_sqrt(ax*ax+ay*ay)});
            }
            //多重弹：沿射线排（连出来是直线）；
            //依次发射的（弹龄有差）：按发射顺序排 —— 甩弹连出来就是那条鞭子/螺旋；
            //同时齐射的（弹龄相同）：按角度排 —— 复数弹/圈弹连出来是圆弧。
            var byAge=!multi&&((amax-amin)>=2);
            pts.sort(function(p,q){
                if(multi)return p.d-q.d;
                if(byAge)return q.age-p.age;
                return p.ang-q.ang;
            });
            c.strokeStyle=col;
            c.lineWidth=1.5;
            c.globalAlpha=0.85;
            //一组一条路径，但相邻两发隔太远就抬笔：否则一整圈弹幕会被连成横跨全屏的乱线
            var gap=56,g2=gap*gap;
            c.beginPath();
            c.moveTo(ox+pts[0].x,oy+pts[0].y);
            for(j=1;j<pts.length;j++){
                var pv=pts[j-1],cu=pts[j];
                var gx2=cu.x-pv.x,gy2=cu.y-pv.y;
                if(gx2*gx2+gy2*gy2<=g2)c.lineTo(ox+cu.x,oy+cu.y);
                else c.moveTo(ox+cu.x,oy+cu.y);
            }
            c.stroke();
            c.globalAlpha=1;
        }
    },

    drawGhost:function(c,ox,oy){
        var g=danmakuAI.ghost;
        if(!g)return;
        var hist=danmakuAI.history;
        c.strokeStyle=this.COLORS.ghost;
        c.lineWidth=1;
        if(hist.length>1){
            c.globalAlpha=0.5;
            c.beginPath();
            c.moveTo(ox+hist[0][0],oy+hist[0][1]);
            for(var i=1;i<hist.length;i++)c.lineTo(ox+hist[i][0],oy+hist[i][1]);
            c.stroke();
            c.globalAlpha=1;
        }
        var gx=ox+g.x,gy=oy+g.y;
        c.beginPath();
        c.arc(gx,gy,6,0,PI2);
        c.stroke();
        c.beginPath();
        c.moveTo(gx-9,gy);c.lineTo(gx+9,gy);
        c.moveTo(gx,gy-9);c.lineTo(gx,gy+9);
        c.stroke();
        var pl=danmakuAI.plan;
        if(pl&&pl.dir&&(pl.dir[0]||pl.dir[1])){
            var l=18;
            c.beginPath();
            c.moveTo(gx,gy);
            c.lineTo(gx+pl.dir[0]*l,gy+pl.dir[1]*l);
            c.stroke();
        }
    },

    drawHud:function(c,ox,oy){
        var ai=danmakuAI,pat=ai.pattern,r=ai.report,pl=ai.plan,g=ai.ghost;
        var lines=[];
        if(pat){
            var cnt={};
            for(var i=0;i<pat.groups.length;i++){
                var k=pat.groups[i].label;
                cnt[k]=(cnt[k]||0)+1;
            }
            var s=[];
            for(var kk in cnt)s.push(kk+"×"+cnt[kk]);
            lines.push("弹型: "+(s.length?s.join(" "):"—")+"   单发:"+pat.singles.length);
        }
        if(ai.hint)lines.push("提示: "+ai.hint.kind+"（"+ai.hint.reason+"）");
        if(pl)lines.push("规划: "+(ai.nameTechnique()||"-")+" minC="+pl.minC.toFixed(1)+" AI="+(g?g.hits:0)+" 站桩="+(ai.idle?ai.idle.hits:0));
        if(r)lines.push("实机: 间距="+(r.clear===undefined?"-":r.clear.toFixed(1))+" TTL="+r.ttl+" "+r.motion+" 中弹="+r.player_hits+" 评分="+r.score.toFixed(0));
        lines.push("看见="+danmakuCore.seen+" 记忆="+danmakuCore.unknown);
        var x=ox+3,y=oy+12;
        c.font="10px sans-serif";
        c.textAlign="left";
        c.textBaseline="top";
        c.fillStyle="rgba(0,0,0,0.5)";
        c.fillRect(x-3,y-3,282,lines.length*13+6);
        for(var j=0;j<lines.length;j++){
            c.fillStyle=j===0?"#8ff":"#fff";
            c.fillText(lines[j],x,y+j*13);
        }
    }
};

//每帧驱动 + 绘制
var danmaku_view_object={
    layer:99,
    init:function(){
        this.layer=danmakuView.layer;
        this.render=new StgRender("testShader2");
        this.render.type=4;
        this.render.script=function(context){
            danmakuView.draw(context);
        };
    },
    script:function(){
        danmakuAI.enabled=stg_show_danmaku_ai?1:0;
        //接管模式下也要跑大脑（每帧只在这里跑一次）
        if(danmakuAI.enabled||danmakuAI.takeover_active)danmakuAI.step();
        if(danmakuAI.enabled&&(danmakuCore.frame%30===0))danmakuView.ensureOnTop();
    }
};

function danmakuViewAttach(){
    var o=danmaku_view_object;
    for(var i=0;i<_pool.length;i++){
        if(_pool[i]===o)return o;
    }
    stgAddObject(o);
    return o;
}

(function(){
    var orig=_stgStartLevel;
    _stgStartLevel=function(){
        orig.apply(null,arguments);
        danmakuAI.reset();
        danmakuViewAttach();
    };
})();
