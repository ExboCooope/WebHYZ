/**
 * 避弹算法可视化 + 驱动（第 4 层）
 *
 * 每关自动挂一个物体：
 *   script  —— 每帧驱动 danmakuAI.step()（感知/分型/规划/评价）
 *   render  —— 开着 stg_show_danmaku_ai 时，在 UI 画布上把弹型、源点、影子自机、
 *              危险热区和评价面板画出来（和命中判定 overlay 同一套画布机制，layer 99）
 *
 * 开关：全局变量 stg_show_danmaku_ai（STGGLOBAL.js）
 *   0 = 关；1 = 画弹型/影子/评价；2 = 再加危险热区
 */
//Math 方法加载时取出（同 STGCORE.js 的 var sin=Math.sin）
var _dm_max=Math.max,_dm_min=Math.min;

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
        ghost:"rgba(80,255,120,1)",
        heat:"rgba(255,40,40,"
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
        if(stg_show_danmaku_ai>=2)this.drawHeat(c,ox,oy);
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

    //危险热区：粗略网格，每格取未来若干帧的最小间距
    drawHeat:function(c,ox,oy){
        var cell=16,H=12;
        var obs=danmakuCore.visible();
        if(!obs.length)return;
        for(var gx=0;gx<stg_frame_w;gx+=cell){
            for(var gy=0;gy<stg_frame_h;gy+=cell){
                var cx=gx+cell*0.5,cy=gy+cell*0.5;
                var minC=999;
                for(var i=0;i<obs.length;i++){
                    var q=obs[i];
                    if(Math.abs(q.x-cx)>cell*4+q.r+40&&Math.abs(q.y-cy)>cell*4+q.r+40)continue;
                    for(var t=0;t<=H;t+=2){
                        var qx=q.x+q.vx*t,qy=q.y+q.vy*t;
                        var dx=cx-qx,dy=cy-qy;
                        var d=Math.sqrt(dx*dx+dy*dy)-q.r-6;
                        if(d<minC)minC=d;
                        if(minC<0)break;
                    }
                    if(minC<0)break;
                }
                if(minC<6){
                    var a=minC<=0?0.35:0.12;
                    c.fillStyle=this.COLORS.heat+a+")";
                    c.fillRect(ox+gx,oy+gy,cell,cell);
                }
            }
        }
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

    drawGroups:function(c,ox,oy){
        var pat=danmakuAI.pattern;
        if(!pat)return;
        c.font="11px sans-serif";
        c.textAlign="center";
        c.textBaseline="bottom";
        for(var i=0;i<pat.groups.length;i++){
            var g=pat.groups[i];
            if(g.kind==="static")continue;
            var col=this.COLORS[g.kind]||this.COLORS.single;
            var gx=ox+g.origin[0],gy=oy+g.origin[1];
            //源点
            c.strokeStyle=col;
            c.lineWidth=1;
            c.beginPath();
            c.moveTo(gx-4,gy-4);c.lineTo(gx+4,gy+4);
            c.moveTo(gx+4,gy-4);c.lineTo(gx-4,gy+4);
            c.stroke();
            //扇形：从源点到最远两发的角度范围
            if(g.kind==="fan"||g.kind==="whip"||g.kind==="ring"||g.kind==="ring_whip"){
                var a0=1e9,a1=-1e9,rmax=0;
                for(var j=0;j<g.bullets.length;j++){
                    var b=g.bullets[j];
                    var dx=b.x-g.origin[0],dy=b.y-g.origin[1];
                    var ang=Math.atan2(dy,dx);
                    if(ang<a0)a0=ang;
                    if(ang>a1)a1=ang;
                    var d=Math.sqrt(dx*dx+dy*dy);
                    if(d>rmax)rmax=d;
                }
                if(a1-a0<6.0&&rmax>4){
                    var wr=_dm_min(rmax,360);
                    c.globalAlpha=0.10;
                    c.fillStyle=col;
                    c.beginPath();
                    c.moveTo(gx,gy);
                    c.arc(gx,gy,wr,a0,a1);
                    c.closePath();
                    c.fill();
                    c.globalAlpha=1;
                }
            }
            //标签
            var lab=g.label+"×"+g.n;
            if(g.aimed)lab+=" 狙";
            c.fillStyle=col;
            c.fillText(lab,gx,gy-6);
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
