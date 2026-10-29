/**
 * 判定形状 overlay（调试用）
 *
 * 把当前帧参与碰撞判定的所有形状，半透明地画在 UI 画布最上层：
 *   _hit_pool    每个对象的 hitdef —— 「可被击中」的判定（敌机/Boss 本体、子弹、激光段、圆环……）
 *   _hit_by_pool 每个对象的 hitby  —— 「攻击判定」的判定（自机的被弹点、敌机的受击范围、自机激光……）
 * 与 STGCORE.js 的 stgDist() 一一对应，四种形状：
 *   type 0 圆        setPointA1
 *   type 1 激光段    setLaserA1 / setLaserA2（两端半径不同的胶囊）
 *   type 2 椭圆      setEllipse  / toEllipse（朝 rdir 旋转，半径 rs/re）
 *   type 3 圆环带    setCircleA1 / setCircleA2（内径 rs、外径 re）
 *
 * 显示开关是全局变量 stg_show_hitbox（STGGLOBAL.js），这里只读它，不复制状态。
 * 画布：复用 GAME/default_graphics.js 的 default_2d_misc_shader（UI 流程 drawUI = testShader2，
 *       640x480 的 2D 画布、层段 81~100），所以我们只要挂一个 type=4 的自绘对象在 layer 100，
 *       引擎每帧渲染到 UI 画布时就会回调 stgHitboxOverlayDraw()。
 * 坐标：判定形状用的是「场地坐标」（stg_frame_w x stg_frame_h），而 UI 画布是整块画面，
 *       场地在其中有一个左上角偏移，取 hyz.full_screen_object.pos（shw = 32,16；hyz = 16,16）。
 *       双画面时再用 hyzGetFramePos() 把 sid 2/3 的场地挪到右半屏。
 *
 * 注意：本文件必须加载在 default_graphics / hyz_level 之后（见 javastage.js 的 default_scripts），
 *       且依赖 STGCORE.js 里已定义的 _stgStartLevel（下面会包一层，用于每关自动挂载）。
 */

var stg_hitbox_overlay={
    //统一颜色（半透明填充）。目前所有形状都用它。
    color:"rgba(0,255,128,0.35)",
    //可选：给不同的来源/形状分别上色，键可以是 "hitdef"、"hitby"、"hitdef1"、"3" 等；
    //查不到就回落到 color。例：{hitdef:"rgba(255,60,60,0.35)", hitby:"rgba(60,160,255,0.35)"}
    colors:null,
    //判定半径小于这个值时就按这个值画（自机被弹点 range 常为 0，不兜底就什么都看不见）
    min_radius:1.5,
    //场地左上角在 UI 画布上的位置；null = 自动（hyz.full_screen_object.pos，取不到就 [0,0]）
    offset:null,
    draw_hitdef:1,   //画「可被击中」的判定
    draw_hitby:1,    //画「攻击判定」
    layer:100,       //UI 流程层段是 81~100，取最大 = 盖在 HUD 之上
    max_shapes:3000, //单帧最多画多少个，防止压力测试里 9000 发弹幕把调试画面拖死
    drawn:0,         //上一帧实际画了几个（调试/自检用）
    skipped:0        //上一帧因为 max_shapes 被跳过了几个
};

function stgHitboxOverlayColor(group,type){
    var t=stg_hitbox_overlay.colors;
    if(t){
        if(t[group+type]!==undefined)return t[group+type];
        if(t[group]!==undefined)return t[group];
        if(t[type]!==undefined)return t[type];
    }
    return stg_hitbox_overlay.color;
}

//场地左上角在 UI 画布上的偏移
var _stg_hitbox_overlay_zero=[0,0];
function _stgHitboxOverlayOffset(){
    var f=stg_hitbox_overlay.offset;
    if(f)return f;
    if(typeof hyz!="undefined"&&hyz&&hyz.full_screen_object&&hyz.full_screen_object.pos){
        return hyz.full_screen_object.pos;
    }
    return _stg_hitbox_overlay_zero;
}

function _stgHitboxFillCircle(c,x,y,r){
    if(!(r>0.05))r=0.05;
    c.beginPath();
    c.arc(x,y,r,0,PI2);
    c.fill();
}

//type 1：从 ls 处的半径 rs 到 le 处的半径 re 的胶囊（两端半圆 + 中间梯形）
function _stgHitboxFillLaser(c,x,y,h){
    var l1=h.ls||0,l2=h.le||0,r1=h.rs||0,r2=h.re||0,t;
    if(l1>l2){t=l1;l1=l2;l2=t;t=r1;r1=r2;r2=t;}
    var dir=h.rdir||0,s=sin(dir),co=cos(dir);
    var x1=x+l1*co,y1=y+l1*s,x2=x+l2*co,y2=y+l2*s;
    c.beginPath();
    c.moveTo(x1-r1*s,y1+r1*co);
    c.lineTo(x2-r2*s,y2+r2*co);
    c.lineTo(x2+r2*s,y2-r2*co);
    c.lineTo(x1+r1*s,y1-r1*co);
    c.closePath();
    c.fill();
    if(r1>0.05)_stgHitboxFillCircle(c,x1,y1,r1);
    if(r2>0.05)_stgHitboxFillCircle(c,x2,y2,r2);
}

//type 2：椭圆，长轴 rs、短轴 re，按 rdir 旋转
function _stgHitboxFillEllipse(c,x,y,h){
    var m=stg_hitbox_overlay.min_radius;
    var rx=(h.rs===undefined||h.rs===null)?h.range:h.rs;
    var ry=(h.re===undefined||h.re===null)?h.range:h.re;
    if(!(rx>m))rx=m;
    if(!(ry>m))ry=m;
    var dir=h.rdir||0;
    if(c.ellipse){
        c.beginPath();
        c.ellipse(x,y,rx,ry,dir,0,PI2);
        c.fill();
    }else{
        c.save();
        c.translate(x,y);
        c.rotate(dir);
        c.scale(1,ry/rx);
        c.beginPath();
        c.arc(0,0,rx,0,PI2);
        c.fill();
        c.restore();
    }
}

//type 3：内径 rs、外径 re 的圆环带 —— 用线宽等于带宽的圆描边正好就是这条环
function _stgHitboxStrokeRing(c,x,y,h){
    var r1=h.rs||0,r2=h.re||0,t;
    if(r2<r1){t=r1;r1=r2;r2=t;}
    var mid=(r1+r2)*0.5;
    var w=r2-r1;
    if(!(mid>0.05))return;
    if(!(w>0.5))w=0.5;
    c.beginPath();
    c.arc(x,y,mid,0,PI2);
    c.lineWidth=w;
    c.stroke();
}

//画一个判定形状，返回 1=画了
function _stgHitboxDrawOne(c,o,h,ox,oy,group){
    if(!h||!h.rpos)return 0;
    var px=h.rpos[0],py=h.rpos[1];
    if(typeof hyzGetFramePos=="function"){
        var p=[px,py];
        hyzGetFramePos(o.sid||0,p,p);
        px=p[0];
        py=p[1];
    }
    px+=ox;
    py+=oy;
    var color=stgHitboxOverlayColor(group,h.type);
    var m=stg_hitbox_overlay.min_radius;
    c.fillStyle=color;
    c.strokeStyle=color;
    if(h.type==1){
        _stgHitboxFillLaser(c,px,py,h);
    }else if(h.type==2){
        _stgHitboxFillEllipse(c,px,py,h);
    }else if(h.type==3){
        _stgHitboxStrokeRing(c,px,py,h);
    }else{
        _stgHitboxFillCircle(c,px,py,(h.range>m)?h.range:m);
    }
    return 1;
}

function _stgHitboxDrawPool(c,pool,group,ox,oy){
    var n=0,cap=stg_hitbox_overlay.max_shapes;
    for(var i=0;i<pool.length;i++){
        if(n>=cap){stg_hitbox_overlay.skipped++;continue;}
        var o=pool[i];
        if(!o)continue;
        n+=_stgHitboxDrawOne(c,o,group=="hitdef"?o.hitdef:o.hitby,ox,oy,group);
    }
    return n;
}

//由 type=4 的自绘对象每帧调用一次，c 是 UI 画布的 2D context
function stgHitboxOverlayDraw(c){
    if(!stg_show_hitbox)return;
    if(!c||!c.beginPath)return;
    var off=_stgHitboxOverlayOffset();
    var ox=off[0]||0,oy=off[1]||0;
    var n=0;
    stg_hitbox_overlay.drawn=0;
    stg_hitbox_overlay.skipped=0;
    c.save();
    c.globalAlpha=1; //引擎在调用 type=4 之前会按对象 alpha 设 globalAlpha，颜色本身已带透明度
    c.lineJoin="round";
    if(stg_hitbox_overlay.draw_hitdef)n+=_stgHitboxDrawPool(c,_hit_pool,"hitdef",ox,oy);
    if(stg_hitbox_overlay.draw_hitby)n+=_stgHitboxDrawPool(c,_hit_by_pool,"hitby",ox,oy);
    c.restore();
    stg_hitbox_overlay.drawn=n;
}

//常驻的 overlay 物体：一个只负责「每帧往 UI 画布上画」的空物体
var stg_hitbox_overlay_object={
    layer:100,
    init:function(){
        this.layer=stg_hitbox_overlay.layer;
        this.render=new StgRender("testShader2");
        this.render.type=4;
        this.render.script=function(context){
            stgHitboxOverlayDraw(context);
        };
    }
};

function stgHitboxOverlayAttach(){
    var o=stg_hitbox_overlay_object;
    for(var i=0;i<_pool.length;i++){
        if(_pool[i]===o)return o;
    }
    stgAddObject(o);
    return o;
}

//每关开始时 _stgStartLevel() 会清空 _pool，这里包一层，清空后把 overlay 重新挂上
(function(){
    var stgStartLevel_orig=_stgStartLevel;
    _stgStartLevel=function(){
        stgStartLevel_orig.apply(null,arguments);
        stgHitboxOverlayAttach();
    };
})();
