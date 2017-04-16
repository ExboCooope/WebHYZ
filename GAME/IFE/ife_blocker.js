/**
 * Created by Exbo on 2016/4/14.
 */

ife.blockers=[];
stgCreateImageTexture("pure_black","black.png");
renderCreate2DTemplateA1("black","pure_black",0,0,1,1,0,0,0,1);

Blocker.id=1;
function Blocker(x,y,w,h){
    this.id=Blocker.id++;
    this.render=new StgRender("sprite_shader");
    renderApply2DTemplate(this.render,"black",0);
    this.pos=[x+w/2,y+h/2,0];
    this.render.scale[0]=w;
    this.render.scale[1]=h;
    this.layer = 75;
    this.blockdata=[x,y,w,h];
    stgAddObject(this);
    stgAddObject(new Blocker_Line(x,y,x+w,y,8,this));
    stgAddObject(new Blocker_Line(x+w,y,x+w,y+h,8,this));
    stgAddObject(new Blocker_Line(x+w,y+h,x,y+h,8,this));
    stgAddObject(new Blocker_Line(x,y+h,x,y,8,this));
    new IfeNode(x-12,y-12);
    new IfeNode(x-12,y+h+12);
    new IfeNode(x+w+12,y-12);
    new IfeNode(x+w+12,y+h+12);

    ife.blockers.push(this);
}
Blocker.prototype.instant_cancel=function(){
    ife.blockers.pop();
    ife.nodes.pop().removeNodeLinks();
    ife.nodes.pop().removeNodeLinks();
    ife.nodes.pop().removeNodeLinks();
    ife.nodes.pop().removeNodeLinks();
    _pool.pop();
    _pool.pop();
    _pool.pop();
    _pool.pop();
    _pool.pop();
};

function Blocker_Line(x0,y0,x1,y1,r,base){
    this.type=stg_const.OBJ_NONE;
    this.id=base.id;
    this.hitdef=new StgHitDef().setLaserA1(x0,y0,atan2(y1-y0,x1-x0),r,0,r,sqrt2x(y1-y0,x1-x0));
    this.hitby=new StgHitDef().setLaserA1(x0,y0,atan2(y1-y0,x1-x0),r,0,r,sqrt2x(y1-y0,x1-x0));
    if(base)this.base={target:base,auto_remove:1};
}

Blocker_Line.prototype.init=function(){
    this.hited=[];
    this.side=stg_const.SIDE_TERRAIN;
};

Blocker_Line.prototype.on_hit=function(target,insd){
    if(target.type==stg_const.OBJ_PLAYER || target.type==stg_const.OBJ_ENEMY){
        if(stg_laser_dd<=0) {
            if(!target.pushed) {
                target.pushed = this.id;
                this.hited.push(target);
                stgMovePositionA1(target, atan2(stg_laser_close[1] - target.pos[1], stg_laser_close[0] - target.pos[0]), insd);
            }else if(target.pushed!=this.id){
                target.pos[0]=target.last_x;
                target.pos[1]=target.last_y;
            }
        }
    }
};

Blocker_Line.prototype.script=function(){
    for(var i=0;i<this.hited.length;i++){
        delete this.hited[i].pushed;
    }
    this.hited=[];
};

function ifeCommonHitCheck(hitdef){
    var mind=999;
    for(var j=0;j<_hit_by_pool.length;j++){
        var t2=_hit_by_pool[j];
        if(t2.side==stg_const.SIDE_TERRAIN){
            var d=stgDist(hitdef,t2.hitby);
            if(d<mind)mind=d;
        }
    }
    if(hitdef.type==0){
        var z=stg_clip-2;
        if(mind>hitdef.rpos[0]-z)mind=hitdef.rpos[0]-z;
        if(mind>stg_frame_w-z-hitdef.rpos[0])mind=stg_frame_w-z-hitdef.rpos[0];
        if(mind>hitdef.rpos[1]-z)mind=hitdef.rpos[1]-z;
        if(mind>stg_frame_h-z-hitdef.rpos[1])mind=stg_frame_h-z-hitdef.rpos[1];
    }
    return mind;
}

ife.dest_x=240;
ife.dest_y=50;
ife.start_x=240;
ife.start_y=520;

function ifeBuildBlocks(){

}