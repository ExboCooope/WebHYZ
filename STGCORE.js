/**
 * Created by Exbo on 2015/10/15.
 */
var sin=Math.sin;
var cos=Math.cos;
var tan=Math.tan;
var atan2=Math.atan2;
var sqrt=Math.sqrt;
var PI=Math.PI;
var PI2=PI*2;
var PI180=PI/180;
var stg={};
var atan2p=function(source,dest){
    return atan2(dest[1]-source[1],dest[0]-source[0]);
};
var atan2pr=function(source,dest){
    return atan2(dest[1]-source[1],dest[0]-source[0])/PI180;
};
var sqrt2=function(source,dest){
    return sqrt((source[0]-dest[0])*(source[0]-dest[0])+(source[1]-dest[1])*(source[1]-dest[1]));
};
var sqrt2d=function(x,y,res){
    res[0]=sqrt(x*x+y*y);
    res[1]=res[0]?x/res[0]:0;
    res[2]=res[0]?y/res[0]:0;
}
var sind=function(x){
    return sin(x*PI180);
}
var cosd=function(x){
    return cos(x*PI180);
}
var tand=function(x){
    return tan(x*PI180);
}

var sqrt2x=function(x,y){
    return sqrt(x*x+y*y);
};

var linear=function(low,high,tick,total){
    return total?(high-low)*tick/total+low:(high-low)*tick+low;
}

function miscApplyAttr(oObject,oAttribute){
    for(var i in oAttribute){
        oObject[i]=oAttribute[i];
    }
}

function _vec3(vX,vY,vZ){
    return [vX,vY,vZ];
}

function stgSetPositionA1(target,x,y){
    if(!target.pos){
        target.pos=[];

    }
    target.pos[0]=x;
    target.pos[1]=y;
    if(target.move){
        target.move.pos[0]=x;
        target.move.pos[1]=y;
    }
}

function stgSetPositionSpeedAngleA1(target,last_pos,current_pos){

    if(!target.pos){
        target.pos=[];
    }
    target.pos[0]=current_pos[0];
    target.pos[1]=current_pos[1];
    if(target.move) {
        target.move.pos[0] = current_pos[0];
        target.move.pos[1] = current_pos[1];
        target.move.speed = sqrt2(last_pos, current_pos);
        target.move.speed_angle = atan2p(last_pos, current_pos);
    }
}

function stgMovePositionA1(target,dir,len){
    var x=target.pos[0];
    var y=target.pos[1];
    stgSetPositionA1(target,x+cos(dir)*len,y+sin(dir)*len);
}

function stgMovePositionA2(target,tx,ty,len){


    var x=target.pos[0];
    var y=target.pos[1];
    var tu=sqrt2x(ty-y,tx-x);
    if(tu<len){
        stgSetPositionA1(target,tx,ty);
        return 0;
    }else {
        stgSetPositionA1(target, x + (tx-x)/tu * len, y + (ty-y)/tu  * len);
        return 1;
    }
}

function stgEnableMove(obj){
    obj=obj||stg_target;
    if(!obj.move){
        obj.move=new StgMove();
        if(obj.pos){
            obj.move.pos[0]=obj.pos[1];
            obj.move.pos[0]=obj.pos[1];
        }
    }
}

function stgDisableMove(obj){
    obj=obj||stg_target;
    if(obj.move){
       delete obj.move;
    }
}

function StgMove(){
    this.pos=[0,0,0];
    this.speed=0;
    this._speed=[0,0,0];
    this.speed_angle=0;
    this.speed_angleY=0;
    this.max_speed=0;
    this.acceleration=0;
    this._acceleration=[0,0,0];
    this.acceleration_angle=0;
    this.speed_angle_acceleration=0;
    this.acceleration_angle_default=1;
}

StgMove.prototype.setSpeed=function(speed,angle) {
    this.speed=speed;
    this.speed_angle=angle*PI180;
};

StgMove.prototype.setAccelerate=function(acc,angle){
    if(angle===undefined || angle===null){
        this.acceleration_angle_default=true;
    }else{
        this.acceleration_angle_default=false;
        this.acceleration_angle=angle;
    }
    this.acceleration=acc;
};

function stgSetRotate(angle,obj){
    obj=obj||stg_target;
    if(!obj.rotate)obj.rotate=[0,0,0];
    obj.rotate[2]=angle*PI180;
}


StgMove.prototype.resolve=function(pos){
    this._speed[0]=pos[0]-this.pos[0];
    this._speed[1]=pos[1]-this.pos[1];
    this.speed=sqrt2x(this._speed[0],this._speed[1]);
    this.speed_angle= this.speed?atan2p(this.pos,pos):this.speed_angle;
    this.pos[0]=pos[0];
    this.pos[1]=pos[1];

};

function StgHitDef(){
    this.type=0;
    this.pos=[0,0];
    this.rpos=[0,0];
    this.range=0;
    this.dir=0;
    this.rdir=0;
    this.sdir=0;
    this.cdir=1;
    this.ls=0;
    this.le=0;
    this.rs=0;
    this.re=0;
}
StgHitDef.prototype.setPointA1=function(x,y,r){
    this.type=0;
    this.pos=[x,y];
    this.rpos=[x,y];
    this.range=r;
    return this;
};
StgHitDef.prototype.setLaserA1=function(x,y,dir,r1,l1,r2,l2){
    this.type=1;
    this.pos=[x,y];
    this.rpos=[x,y];
    this.dir=dir;
    this.ls=l1;
    this.le=l2;
    this.rs=r1;
    this.re=r2;
    this.sdir=sin(dir);
    this.cdir=cos(dir);
    this.rdir=dir;
    return this;
};
StgHitDef.prototype.setLaserA2=function(x1,y1,r1,x2,y2,r2){
    this.type=1;
    this.pos=[x1,y1];
    this.rpos=[x1,y1];
    this.dir=atan2(y2-y1,x2-x1);
    this.ls=0;
    this.le=sqrt2x(y2-y1,x2-x1);
    this.rs=r1;
    this.re=r2;
    this.ls=r1;
    this.le=r2;
    this.sdir=sin(this.dir);
    this.cdir=cos(this.dir);
    this.rdir=this.dir;
    return this;
};
StgHitDef.prototype.setEllipse=function(x,y,dir,r1,r2){
    this.type=2;
    this.pos=[x,y];
    this.rpos=[x,y];
    this.dir=dir;
    this.sdir=sin(dir);
    this.cdir=cos(dir);
    this.rdir=dir;
    this.rs=r1;
    this.re=r2;
    this.range=(r1+r2)/2;
};
StgHitDef.prototype.toEllipse=function(dir){
    if(this.type==0){
        this.dir=dir;
        this.rdir=dir;
        this.sdir=sin(dir);
        this.cdir=cos(dir);
        this.rs=this.range;
        this.re=this.range;
        this.ls=this.range;
        this.le=this.range;
        this.type=2;
    }
};
StgHitDef.prototype.update=function(object){
    object=object||stg_target;
    var a=this;
    a.rpos[0]= a.pos[0]+ object.pos[0];
    a.rpos[1]= a.pos[1]+ object.pos[1];
    a.rd= object.rotate[2];
    a.rdir= a.dir+ object.rotate[2];
    if(a.type==1){
        a.sdir=sin(a.rdir);
        a.cdir=cos(a.rdir);
    }else if(a.type==2){
        a.sdir=sin(a.rdir);
        a.cdir=cos(a.rdir);
        if(object.render){
            if(object.render.scale){
                a.rs= a.ls*object.render.scale[0];
                a.re= a.le*object.render.scale[1];
            }
        }
    }
};

var stg_wait_script=null;

var stg_laser_dl=0;
var stg_laser_dd=0;
var stg_laser_close=[0,0];
function stgDist(p1,p2){
    if(p1.type==0 && p2.type==0){
        return sqrt2(p1.rpos,p2.rpos)-p1.range-p2.range;
    }else if(p1.type==0 && p2.type==1){
        var kdx=p1.rpos[0]-p2.rpos[0];
        var kdy=p1.rpos[1]-p2.rpos[1];
        var sinr=p2.sdir;
        var cosr=p2.cdir;
        var dl=kdx*cosr+kdy*sinr;
        var dd=kdy*cosr-kdx*sinr;
        stg_laser_dl=dl;
        stg_laser_dd=dd;
        if(dl<=p2.ls){
            stg_laser_close[0]=p2.rpos[0]+p2.ls*cosr;
            stg_laser_close[1]=p2.rpos[1]+p2.ls*sinr;
            return sqrt2x(dl-p2.ls,dd)-p1.range-p2.rs;
        }
        if(dl>=p2.le){
            stg_laser_close[0]=p2.rpos[0]+p2.le*cosr;
            stg_laser_close[1]=p2.rpos[1]+p2.le*sinr;
            return sqrt2x(dl-p2.le,dd)-p1.range-p2.re;
        }
        stg_laser_close[0]=p2.rpos[0]+dl*cosr;
        stg_laser_close[1]=p2.rpos[1]+dl*sinr;
        var rate=(dl-p2.ls)/(p2.le-p2.ls);
        return (dd<0?-dd:dd)-p1.range-rate*p2.rs-(1-rate)*p2.re;
    }else if(p1.type==1 && p2.type==0){
        return stgDist(p2,p1);
    }else if(p1.type==1 && p2.type==1){
        //参数方程为  X=x1+c1*L1=x2+c2*L2
        //            Y=y1+s1*L1=y2+s2*L2
        //s1x1-c1y1=s1x2-c1y2+(s1c2-s2c1)L2
        //尽量不要用两个激光判定
        var s1=p1.sdir;var s2=p2.sdir;
        var c1=p1.cdir;var c2=p2.cdir;
        var x1=p1.rpos[0];var x2=p2.rpos[0];
        var y1=p1.rpos[1];var y2=p2.rpos[1];
        var l2=(s1*(x1-x2)+c1*(y2-y1))/(s1*c2-s2*c1);
        if(l2<=p2.ls){
            return pointToLine(x2+p2.ls*c2,y2+p2.ls*s2,p2.rs,x1,y1,p1.rdir,p1.ls,p1.rs,p1.le,p1.re);
        }
        if(l2>=p2.le){
            return pointToLine(x2+p2.le*c2,y2+p2.le*s2,p2.re,x1,y1,p1.rdir,p1.ls,p1.rs,p1.le,p1.re);
        }
        //var l1=c1?(l2*c2+x2-x1)/c1:(l2*s2+y2-y1)/s1;
        var l1=(s2*(x2-x1)+c2*(y1-y2))/(s2*c1-s1*c2);
        if(l1<=p1.ls){
            return pointToLine(x1+p1.ls*c1,y1+p1.ls*s1,p1.rs,x2,y2,p2.rdir,p2.ls,p2.rs,p2.le,p2.re);
        }
        if(l1>=p1.le){
            return pointToLine(x1+p1.le*c1,y1+p1.le*s1,p1.re,x2,y2,p2.rdir,p2.ls,p2.rs,p2.le,p2.re);
        }
        rate=(l2-p2.ls)/(p2.le-p2.ls);
        dd=(l1-p1.ls)/(p1.le-p1.ls);
        return -(rate*p2.rs+(1-rate)*p2.re+dd*p1.rs+(1-dd)*p1.re);
    }else if(p1.type==0 && p2.type==2){
        kdx=p1.rpos[0]-p2.rpos[0];
        kdy=p1.rpos[1]-p2.rpos[1];
        sinr=p2.sdir;
        cosr=p2.cdir;
        dl=kdx*cosr+kdy*sinr;
        dd=kdy*cosr-kdx*sinr;
        var a=(p2.rs+p1.range)*(p2.rs+p1.range);
        var b=(p2.re+p1.range)*(p2.re+p1.range);
        dl=dl*dl;
        dd=dd*dd;
        var dt=a*dl+b*dd-a*b;
        var rr=dl+dd-a-b;
        rate=(rr+sqrt(rr*rr+4*dt))/2;
        return rate>=0?sqrt(rate):-sqrt(-rate);
    }else if(p1.type==2){
        return stgDist(p2,p1);
    }else if(p1.type==1 && p2.type==2){
        p2.type=0;
        rate=stgDist(p1,p2);
        p2.type=2;
        return rate;
    }
    return 100;
}


function StgObject(){
    this.script=null;
    this.move=null;
    this.render=null;
    this.hitdef=null;
    this.hitby=null;
}

function stgApplyEnemy(e){
    e.on_hit_by=default_enemy_onhitby;
    e.type=stg_const.OBJ_ENEMY;
    e.score=10;
    return e;
}

function stgApplyBoss(e){
    e.spell_time=0;
    e.spell_life=0;
    e.spell_bonus=0;
}

function default_enemy_onhitby(bullet){
    if(bullet.damage)stg_target.life-=bullet.damage*(1-(stg_target.shot_resistance||0));
}

function StgRender(sShaderName){
    this.shader_name=sShaderName;
    this.procedures={};
    this.scale=[1,1,1];
}

function StgProcedure(sTarget,iStartLayer,iEndLayer){
    this.render_target=sTarget;
    this.o_width=stg_textures[sTarget].width;
    this.o_height=stg_textures[sTarget].height;
    this.layers=[];
    for(var i=iStartLayer;i<=iEndLayer;i++){
        this.layers[i]=1;
    }
    this.shader_order=[];
    this.active=1;
}

function _tickMove(stgMove){

    stgMove.speed_angle+=stgMove.speed_angle_acceleration;
    if(!stgMove.speed_angleY){
        stgMove._speed[0]=stgMove.speed*cos(stgMove.speed_angle);
        stgMove._speed[1]=stgMove.speed*sin(stgMove.speed_angle);
    }else{
        stgMove._speed[0]=stgMove.speed*cos(stgMove.speed_angle)*cos(stgMove.speed_angleY);
        stgMove._speed[1]=stgMove.speed*sin(stgMove.speed_angle)*cos(stgMove.speed_angleY);
        stgMove._speed[2]=stgMove.speed*sin(stgMove.speed_angleY);
    }
    if(stgMove.acceleration_angle_default){
        stgMove.acceleration_angle=stgMove.speed_angle;
    }
    stgMove.pos[0]+=stgMove._speed[0];
    stgMove.pos[1]+=stgMove._speed[1];
    stgMove.pos[2]+=stgMove._speed[2];
    if(stgMove.acceleration){
        stgMove._acceleration[0]=stgMove.acceleration*cos(stgMove.acceleration_angle);
        stgMove._acceleration[1]=stgMove.acceleration*sin(stgMove.acceleration_angle);
        stgMove._speed[0]+=stgMove._acceleration[0];
        stgMove._speed[1]+=stgMove._acceleration[1];
        stgMove._speed[2]+=stgMove._acceleration[2];
    }
    stgMove.speed=sqrt( stgMove._speed[0]* stgMove._speed[0]+ stgMove._speed[1]* stgMove._speed[1]+ stgMove._speed[2]* stgMove._speed[2]);
    if(stgMove.max_speed && stgMove.speed>stgMove.max_speed)stgMove.speed=stgMove.max_speed;
    stgMove.speed_angle=stgMove.speed?atan2(stgMove._speed[1],stgMove._speed[0]):stgMove.speed_angle;
}

function stgApplyPlayer(target){
    _StgDefaultPlayer(target||stg_target);
}

function _StgDefaultPlayer(stgPlayerObject){
    stgPlayerObject.character_name="";
    stgPlayerObject.slot=0;
    stgPlayerObject.life=3;
    stgPlayerObject.bomb=3;
    stgPlayerObject.power=0;
    stgPlayerObject.graze=0;
    stgPlayerObject.point_bonus=10000;
    stgPlayerObject.point=0;
    stgPlayerObject.pos=[0,0,0];
    stgPlayerObject.key=[];
    stgPlayerObject.state=stg_const.PLAYER_NORMAL;
    stgPlayerObject.invincible=0;
    stgPlayerObject.bombing=0;
    stgPlayerObject.move_speed=[4,2];
    stgPlayerObject.slow=0;
    stgPlayerObject.no_move=0;
    stgPlayerObject.no_shot=0;
    stgPlayerObject.no_bomb=0;
    stgPlayerObject.type=stg_const.OBJ_PLAYER;
    stgPlayerObject.score=0;
    stgPlayerObject.hiscore=0;
    stgPlayerObject.item_attract_range=32;
    stgPlayerObject.counter_bomb_time=12;
    stgPlayerObject.down_time=30;
    stgPlayerObject.rebirth_time=30;
    stgPlayerObject.rebirth_x=192;
    stgPlayerObject.rebirth_y=400;
    stgPlayerObject.start_time=240;
    stgPlayerObject.content={score:0};
    stgPlayerObject.graze_range=24;
    stgPlayerObject.last_x=0;
    stgPlayerObject.last_y=0;
    stgPlayerObject.layer=stg_const.LAYER_PLAYER;
}


function _frameMoveCheck(){

}

function _stgMainLoop_Render(){
    _runProcedure01();
    for(var i in stg_display){
        _runProcedure2(stg_display[i]);
    }
}
function _stgMainLoop_BeforeHit(){
    for(var i in _pool){
        if(_pool[i].active){
            if(_pool[i].beforehit){
                if(stg_super_pause_time && !_pool[i].ignore_super_pause){
                    continue;
                }
                stg_local_player=stg_players[stg_local_player_pos];
                stg_target=_pool[i];
                _pool[i].beforehit();
            }
        }
    }
    stg_target=null;
}

function _stgMainLoop_RunScript(){
    for(var i in _pool){
        if(_pool[i].active){
            if(_pool[i].script){
                if(stg_super_pause_time && !_pool[i].ignore_super_pause){
                    continue;
                }
                stg_local_player=stg_players[stg_local_player_pos];
                stg_target=_pool[i];
                _pool[i].script();
            }
        }
    }
    stg_target=null;
}
function _stgMainLoop_RemoveObjects(){
    var i;
    /*
    for(i=0;i<_pool.length;i++){
        if(_pool[i].remove){
            if(_pool[i].finalize){
                stg_target=_pool[i];
                _pool[i].finalize();
            }
        }
    }
    var j=0;
    for(i=0;i<_pool.length;i++){
        if(!_pool[i].remove){
            if(j!=i){
                _pool[j]=_pool[i];
                delete _pool[i];
            }
            j++;
        }
    }
    _pool.length=j;
    */
    var pool=[];
    for(i=0;i<_pool.length;i++){
        if(_pool[i].remove){
            if(_pool[i].finalize){
                stg_target=_pool[i];
                _pool[i].finalize();
            }
        }else{
            pool.push(_pool[i]);
        }
    }
    _pool=pool;
}

function _stgMainLoop(){
    if(!_stg_no_input){
        if(stg_wait_for_all_texture){
            if(stgCheckResources()){
                if(stg_wait_script){
                    stg_wait_script();
                }
                return;
            }
            stg_wait_for_all_texture=0;
            return;
        }
        _stgMainLoop_GameStateChanger();
        _stgMainLoop_SendInput();
    }
    _stg_no_input=!_stgMainLoop_GetInput();
    if(_stg_no_input)return;
    _stgMainLoop_Pause();
    _stgMainLoop_Engine();
    _stgMainLoop_BeforeHit();
    _stgMainLoop_Hit();
    _stgMainLoop_PlayerState();
    _runProcedure0();
    _stgMainLoop_RunScript();
    _stgMainLoop_RemoveObjects();
    _stgMainLoop_Render();
}
var stg_fps=0;
var stg_stop=0;
var stg_clip=16;
var stg_frame_w=384;
var stg_frame_h=448;

//游戏本体大小
var stg_width=640;
var stg_height=480;
//实际的窗口大小在stg_main_canvas中获取
//游戏中使用的坐标以stg_width和stg_height为准

var stg_hit_check=[
    [0,1,1],
    [1,0,1],
    [1,1,0]
];
/*
function stgInstantRefresh(){
    _hit_by_pool=[];
    _hit_pool=[];
    for(var i=0;i<_pool.length;i++){
        if(_pool[i].active){
            var a=_pool[i];
            if(!a.pos){
                a.pos=[0,0,0];
            }
            if(!a.rotate){
                a.rotate=[0,0,0];
            }
            if(a.move){
                a.pos[0]= a.move.pos[0];
                a.pos[1]= a.move.pos[1];
                a.pos[2]= a.move.pos[2];
            }
            if(a.move_rotate){
                a.rotate[2]= a.move.speed_angle;
            }
            if(a.opos){
                a.pos[0]+= a.opos[0];
                a.pos[1]+= a.opos[1];
                a.pos[2]+= a.opos[2];
            }
            if(a.base){
                if(a.base.type==stg_const.BASE_COPY){
                    a.pos[0]= a.base.target.pos[0];
                    a.pos[1]= a.base.target.pos[1];
                    a.pos[2]= a.base.target.pos[2];
                    a.rotate[0]= a.base.target.rotate[0];
                    a.rotate[0]= a.base.target.rotate[0];
                    a.rotate[0]= a.base.target.rotate[0];
                }else if(a.base.type==stg_const.BASE_MOVE){
                    a.pos[0]+= a.base.target.pos[0];
                    a.pos[1]+= a.base.target.pos[1];
                    a.pos[2]+= a.base.target.pos[2];
                }
            }
            if(a.hitby && !a.ignore_hit){
                a.hitby.rpos[0]= a.pos[0]+ a.hitby.pos[0];
                a.hitby.rpos[1]= a.pos[1]+ a.hitby.pos[1];
                a.hitby.rd= a.rotate[2];
                a.hitby.rdir= a.hitby.dir+ a.rotate[2];
                if(a.hitby.type==1){
                    a.hitby.sdir=sin(a.hitby.rdir);
                    a.hitby.cdir=cos(a.hitby.rdir);
                }
                _hit_by_pool.push(a);
                a.hit_by_list=[];
            }
            if(a.hitdef && !a.ignore_hit && !a.invincible){
                a.hitdef.rpos[0]= a.pos[0]+ a.hitdef.pos[0];
                a.hitdef.rpos[1]= a.pos[1]+ a.hitdef.pos[1];
                a.hitdef.rd= a.rotate[2];
                a.hitdef.rdir= a.hitdef.dir+ a.rotate[2];
                if(a.hitdef.type==1){
                    a.hitdef.sdir=sin(a.hitdef.rdir);
                    a.hitdef.cdir=cos(a.hitdef.rdir);
                }
                _hit_pool.push(a);
                a.hit_list=[];
            }
        }
    }
}*/

function stgRefreshPosition(object) {
    var a = object;
    if (!a.pos) {
        a.pos = [0, 0, 0];
    }
    if (!a.rotate) {
        a.rotate = [0, 0, 0];
    }
    if (a.move) {
        if( a.move_rotate==-1){
            a.move.speed_angle=a.rotate[2];
        }
        if(a.resolve_move) {
            a.move.resolve(a.pos);
        }else {
            a.pos[0] = a.move.pos[0];
            a.pos[1] = a.move.pos[1];
            a.pos[2] = a.move.pos[2];
        }
        if (a.move_rotate==1) {
            a.rotate[2] = a.move.speed_angle;
        }
    }

    if (a.opos) {
        a.pos[0] += a.opos[0];
        a.pos[1] += a.opos[1];
        a.pos[2] += a.opos[2];
    }
    if (a.base) {
        if (a.base.type == stg_const.BASE_COPY) {
            a.pos[0] = a.base.target.pos[0];
            a.pos[1] = a.base.target.pos[1];
            a.pos[2] = a.base.target.pos[2];
            if (a.rotate) {
                a.rotate[0] = a.base.target.rotate[0];
                a.rotate[1] = a.base.target.rotate[1];
                a.rotate[2] = a.base.target.rotate[2];
            }
        } else if (a.base.type == stg_const.BASE_MOVE) {
            a.pos[0] += a.base.target.pos[0];
            a.pos[1] += a.base.target.pos[1];
            a.pos[2] += a.base.target.pos[2];
        }else if(a.base.type==stg_const.BASE_MOVE_ROTATE){
            a.pos[0] += a.base.target.pos[0];
            a.pos[1] += a.base.target.pos[1];
            a.pos[2] += a.base.target.pos[2];
            if (a.rotate) {
                a.rotate[0] += a.base.target.rotate[0];
                a.rotate[1] += a.base.target.rotate[1];
                a.rotate[2] += a.base.target.rotate[2];
            }
        }else if(a.base.type==stg_const.BASE_ROTATE_MOVE){
            var ang=a.base.target.rotate[2];
            var tmpx= a.base.target.pos[0] + a.pos[0]*cos(ang) - a.pos[1]*sin(ang);
            var tmpy= a.base.target.pos[1] + a.pos[0]*sin(ang) + a.pos[1]*cos(ang);
            a.pos[0] =tmpx;
            a.pos[1] =tmpy;
            a.pos[2] += a.base.target.pos[2];

        }else if(a.base.type==stg_const.BASE_ROTATE_MOVE_ROTATE){
            var ang=a.base.target.rotate[2];
            var tmpx= a.base.target.pos[0] + a.pos[0]*cos(ang) - a.pos[1]*sin(ang);
            var tmpy= a.base.target.pos[1] + a.pos[0]*sin(ang) + a.pos[1]*cos(ang);
            a.pos[0] =tmpx;
            a.pos[1] =tmpy;
            a.pos[2] += a.base.target.pos[2];
            if (a.rotate) {
                a.rotate[0] += a.base.target.rotate[0];
                a.rotate[1] += a.base.target.rotate[1];
                a.rotate[2] += a.base.target.rotate[2];
            }
        }

        if(a.base.sid){
            a.sid= a.base.target.sid;
        }
    }
    if (a.orotate) {
        a.rotate[0] += a.orotate[0];
        a.rotate[1] += a.orotate[1];
        a.rotate[2] += a.orotate[2];
    }
    if (a.hitby && !a.ignore_hit) {
        a.hitby.update(a);
        a.hit_by_list = [];
    }
    if (a.hitdef && !a.ignore_hit && !a.invincible) {
        a.hitdef.update(a);
        a.hit_list = [];
    }
    if (a.type == stg_const.OBJ_BULLET) {
        if (a.invincible && !a._shoted) {
            if (!a._shot_scale) {
                a._shot_scale = [a.render.scale[0], a.render.scale[1]];
                a._shot_alpha = a.alpha || 255;
            }
            var ms = a.invincible / 6 + 1;
            if (ms > 2)ms = 2;
            a.render.scale[0] = a._shot_scale[0] * ms;
            a.render.scale[1] = a._shot_scale[1] * ms;
            a.alpha = 100;
            a.update = 1;

        } else {
            if (a._shot_scale) {
                a.render.scale[0] = a._shot_scale[0];
                a.render.scale[1] = a._shot_scale[1];
                delete a._shot_scale;
                a.alpha = a._shot_alpha;
                delete a._shot_alpha;
                a.update = 1;
            } else {
                a._shoted = 1;
                a.update = 0;
            }
        }
    }
    if (a.type == stg_const.OBJ_BULLET || a.type == stg_const.OBJ_ENEMY || a.type == stg_const.OBJ_ITEM) {
        if (!a.keep) {
            if (a.pos[0] > stg_frame_w + 30 || a.pos[0] < -30 || a.pos[1] > stg_frame_h + 30 || a.pos[1] < -30) {
                stgDeleteObject(a);
            }
        }
    }
    if(a.type == stg_const.OBJ_PLAYER && a.state!=stg_const.PLAYER_REBIRTH){
        if (a.pos[0] > stg_frame_w - stg_clip)a.pos[0] = stg_frame_w - stg_clip;
        if (a.pos[0] < stg_clip)a.pos[0] = stg_clip;
        if (a.pos[1] > stg_frame_h - stg_clip)a.pos[1] = stg_frame_h - stg_clip;
        if (a.pos[1] < stg_clip)a.pos[1] = stg_clip;
    }
}


function _stgMainLoop_Hit(){
    var i;
    var j;
    if(stg_super_pause_time>0)return;
    for(var i in _hit_by_pool){
        var a=_hit_by_pool[i];
        var s=a.side;
        if(a.type==stg_const.OBJ_PLAYER){
            for (var j in _hit_pool) {

                var b = _hit_pool[j];
                if(hyz.battle_style==0 && b.sid!= a.sid)continue;
                if (stg_hit_check[s][b.side]) {
                    var d = stgDist(a.hitby, b.hitdef);
                    if(b.type==stg_const.OBJ_BULLET && d< a.graze_range){
                        if(!b.grazed){
                            b.grazed=[];
                        }
                        if(!b.grazed[a.slot]){
                            b.grazed[a.slot]=1;
                            a.graze++;
                            if(a.on_graze){
                                stg_target=a;
                                a.on_graze(b,d);
                            }
                        }
                    }

                    if (d < 0) {
                        //console.log(b);
                        a.hit_by_list.push(b);
                        b.hit_list.push(a);
                        stg_target=b;
                        if(b.on_hit)b.on_hit(a,d);

                        stg_target=a;
                        if(a.on_hit_by)a.on_hit_by(b,d);

                        if(b.type==stg_const.OBJ_BULLET){

                            if(!b.invincible){
                                if(!a.invincible && a.state==stg_const.PLAYER_NORMAL){
                                    a.state=stg_const.PLAYER_HIT;
                                    a.invincible= a.counter_bomb_time;
                                }
                                /*
                                b.penetrate--;
                                if(b.penetrate<=0){
                                    b.fade_remove=33;
                                    b.alpha=255;
                                    b.ignore_hit=1;
                                }*/


                            }
                        }

                        if(b.type==stg_const.OBJ_ENEMY){
                            if(!a.invincible && a.state==stg_const.PLAYER_NORMAL){
                                a.state=stg_const.PLAYER_HIT;
                                a.invincible= a.counter_bomb_time;
                            }
                        }

                        if(b.type==stg_const.OBJ_ITEM){
                            if(b.content){
                                for(var i in b.content){
                                    a.content[i]=(a.content[i]||0)+ b.content[i];
                                }
                            }
                            stg_target=b;
                            if(b.on_collect)b.on_collect(a);
                            stg_target=a;
                            if(a.on_collect)a.on_collect(b);
                            stgDeleteObject(b);
                        }
                    }
                }
            }
        }else {
            for (j in _hit_pool) {
                b = _hit_pool[j];
                if(hyz.battle_style==0 && b.sid!= a.sid)continue;
                if (stg_hit_check[s][b.side]) {
                    d = stgDist(a.hitby, b.hitdef);
                    if (d < 0) {
                        if(b.type==stg_const.OBJ_BULLET){
                            if(b.penetrate>0) {
                                a.hit_by_list.push(b);
                                b.hit_list.push(a);
                                stg_target=b;
                                if(b.on_hit)b.on_hit(a,d);
                                stg_target=a;
                                if(a.on_hit_by)a.on_hit_by(b,d);
                                b.penetrate--;
                                if (b.penetrate <= 0) {
                                    b.fade_remove = 33;
                                    b.alpha = b.alpha||255;
                                    b.ignore_hit = 1;
                                }
                            }
                        }else{
                            a.hit_by_list.push(b);
                            b.hit_list.push(a);
                            stg_target=b;
                            if(b.on_hit)b.on_hit(a,d);
                            stg_target=a;
                            if(a.on_hit_by)a.on_hit_by(b,d);
                        }
                    }

                    /*
                    if (d < 0) {
                        //console.log(b);
                        a.hit_by_list.push(b);
                        b.hit_list.push(a);
                        if(a.on_hit_by)a.on_hit_by(b);
                    }*/
                }
            }
        }
    }
}

function _stgMainLoop_HitScript(){
    var i;
    var j;
    var a;
    var b;
    if(stg_game_state==stg_const.GAME_RUNNING) {
        for (i = 0; i < stg_players_number; i++) {
            a = stg_players[i];
            if (a.active) {
               if(a.hit_by_list.length){
                   for(j in a.hit_by_list){
                       b=a.hit_by_list[j];

                   }
               }
            }

        }
    }
}

var stg_frame_height=448;
var stg_frame_width=384;

function _stgMainLoop_PlayerState(){
    var a;
    var i;
    if(stg_game_state==stg_const.GAME_RUNNING) {
        for (i = 0; i < stg_players_number; i++) {
            a = stg_players[i];
            if(!a)a={};
            if (a.active) {
                a.slow = a.key[stg_const.KEY_SLOW];

                //if(a.invincible>0){
                    //a.invincible--;
                    if(a.invincible==0 && a.state==stg_const.PLAYER_REBIRTH){
                        a.state=stg_const.PLAYER_NORMAL;
                        a.invincible= a.start_time;
                    }
                    if(a.invincible==0 && a.state==stg_const.PLAYER_HIT){
                        a.state=stg_const.PLAYER_DEAD;
                        if(a.on_death){
                            stg_target=a;
                            a.on_death();
                        }
                        a.invincible= a.down_time;
                    }
                    if(a.invincible==0 && a.state==stg_const.PLAYER_DEAD){
                        a.state=stg_const.PLAYER_REBIRTH;
                        a.invincible= a.rebirth_time;
                    }
               // }

            }

        }
    }
}
function _stgMainLoop_Engine(){
    stg_super_pause_time=_stg_super_pause_time;
    if(_stg_super_pause_time>0)_stg_super_pause_time--;


    _hit_by_pool=[];
    _hit_pool=[];
    stg_enemy=[];
    var i;
    var a;
    if(stg_game_state==stg_const.GAME_RUNNING) {
        for (i = 0; i < stg_players_number; i++) {
            a = stg_players[i];
            if(a.active){
                if(a.on_ai){
                    a.on_ai();
                }else{
                    if ((!stg_super_pause_time|| a.ignore_super_pause)) {
                        a.slow = a.key[stg_const.KEY_SLOW];
                        a.last_x= a.pos[0];
                        a.last_y= a.pos[1];
                        if (!a.no_move && a.state==stg_const.PLAYER_NORMAL) {
                            var x = a.key[stg_const.KEY_RIGHT] - a.key[stg_const.KEY_LEFT];
                            //  var x=a.key[10]-a.key[9];
                            var y = a.key[stg_const.KEY_DOWN] - a.key[stg_const.KEY_UP];
                            if (x || y) {
                                var s = a.move_speed[a.slow];
                                if (x && y) {
                                    s = s / 1.4142;
                                }
                                x = x * s;
                                y = y * s;
                                a.pos[0] += x;
                                a.pos[1] += y;
                            }
                        }
                        if(a.state==stg_const.PLAYER_REBIRTH){
                            a.pos[0]= a.rebirth_x;
                            a.pos[1]= (stg_frame_height+50-a.rebirth_y)* a.invincible/ a.rebirth_time+a.rebirth_y;
                        }else {
                            if (a.pos[0] > stg_frame_w - stg_clip)a.pos[0] = stg_frame_w - stg_clip;
                            if (a.pos[0] < stg_clip)a.pos[0] = stg_clip;
                            if (a.pos[1] > stg_frame_h - stg_clip)a.pos[1] = stg_frame_h - stg_clip;
                            if (a.pos[1] < stg_clip)a.pos[1] = stg_clip;
                        }
                        playerSpellRefresh(a);
                    }
                }
            }


        }
    }
    for(i=0;i<_pool.length;i++){
        if(_pool[i].active && (!stg_super_pause_time|| _pool[i].ignore_super_pause)){
            a=_pool[i];
            _pool[i].frame++;
            if(!a.pos){
                a.pos=[0,0,0];
            }
            if(!a.rotate){
                a.rotate=[0,0,0];
            }
            if(a.on_move){
                a.on_move();
            }
            if(a.move && a.move_rotate==-1){
                a.move.speed_angle=a.rotate[2];
            }

            if(a.move && !a.resolve_move){

                _tickMove(a.move);
                a.pos[0]= a.move.pos[0];
                a.pos[1]= a.move.pos[1];
                a.pos[2]= a.move.pos[2];

            }

            if(a.move && a.resolve_move) {
                a.move.resolve(a.pos);
            }
            if(a.move && a.move_rotate==1){
                a.rotate[2]= a.move.speed_angle;
            }
            if(a.after_move){
                a.after_move();
            }
            if(a.opos){
                a.pos[0]+= a.opos[0];
                a.pos[1]+= a.opos[1];
                a.pos[2]+= a.opos[2];
            }
            if(a.base){
                if(a.base.type==stg_const.BASE_COPY){
                    a.pos[0]= a.base.target.pos[0];
                    a.pos[1]= a.base.target.pos[1];
                    a.pos[2]= a.base.target.pos[2];
                    if(a.rotate) {
                        a.rotate[0] = a.base.target.rotate[0];
                        a.rotate[1] = a.base.target.rotate[1];
                        a.rotate[2] = a.base.target.rotate[2];
                    }
                }else if(a.base.type==stg_const.BASE_MOVE){
                    a.pos[0]+= a.base.target.pos[0];
                    a.pos[1]+= a.base.target.pos[1];
                    a.pos[2]+= a.base.target.pos[2];
                }else if(a.base.type==stg_const.BASE_MOVE_ROTATE){
                    a.pos[0] += a.base.target.pos[0];
                    a.pos[1] += a.base.target.pos[1];
                    a.pos[2] += a.base.target.pos[2];
                    if (a.rotate) {
                        a.rotate[0] += a.base.target.rotate[0];
                        a.rotate[1] += a.base.target.rotate[1];
                        a.rotate[2] += a.base.target.rotate[2];
                    }
                }else if(a.base.type==stg_const.BASE_ROTATE_MOVE){
                    var ang=a.base.target.rotate[2];
                    var tmpx= a.base.target.pos[0] + a.pos[0]*cos(ang) - a.pos[1]*sin(ang);
                    var tmpy= a.base.target.pos[1] + a.pos[0]*sin(ang) + a.pos[1]*cos(ang);
                    a.pos[0] =tmpx;
                    a.pos[1] =tmpy;
                    a.pos[2] += a.base.target.pos[2];

                }else if(a.base.type==stg_const.BASE_ROTATE_MOVE_ROTATE){
                    var ang=a.base.target.rotate[2];
                    var tmpx= a.base.target.pos[0] + a.pos[0]*cos(ang) - a.pos[1]*sin(ang);
                    var tmpy= a.base.target.pos[1] + a.pos[0]*sin(ang) + a.pos[1]*cos(ang);
                    a.pos[0] =tmpx;
                    a.pos[1] =tmpy;
                    a.pos[2] += a.base.target.pos[2];
                    if (a.rotate) {
                        a.rotate[0] += a.base.target.rotate[0];
                        a.rotate[1] += a.base.target.rotate[1];
                        a.rotate[2] += a.base.target.rotate[2];
                    }
                }

                if(a.base.auto_remove && a.base.target.remove){
                    if(!a._auto_remove) {
                        a._auto_remove=a.base.auto_remove;
                        a._auto_remove--;
                        if(a._auto_remove<=0) {
                            stgDeleteObject(a);
                        }
                    }else{
                        a._auto_remove--;
                        if(a._auto_remove<=0) {
                            stgDeleteObject(a);
                        }
                    }
                }
                if(a.base.sid){
                    if(!a.base.target){
                        console.log(a);
                    }
                    a.sid= a.base.target.sid;
                }
            }
            if(a.look_at){
                if(a.look_at.turn_rate){
                    var t=sArrowRotateTo(a.rotate[2],sLookAt(a.pos, a.look_at.target.pos));
                    if(t>a.look_at.turn_rate)t=a.look_at.turn_rate;
                    if(t<-a.look_at.turn_rate)t=-a.look_at.turn_rate;
                    a.rotate[2]+=t;
                }else{
                    a.rotate[2]=sLookAt(a.pos, a.look_at.target.pos);
                }
            }
            if(a.self_rotate){
                a.rotate[2]+=a.self_rotate;
            }
            if(a.orotate){
                a.rotate[0]+= a.orotate[0];
                a.rotate[1]+= a.orotate[1];
                a.rotate[2]+= a.orotate[2];
            }
            if(a.hitby && !a.ignore_hit){
                a.hitby.update(a);

                _hit_by_pool.push(a);
                a.hit_by_list=[];
            }
            if(a.hitdef && !a.ignore_hit && !a.invincible){
                a.hitdef.update(a);
                _hit_pool.push(a);
                a.hit_list=[];
            }
            if(a.invincible)a.invincible--;
            if(a.type==stg_const.OBJ_BULLET && a.render){
                if(a.invincible && !a._shoted){
                    if(!a._shot_scale) {
                        a._shot_scale = [a.render.scale[0], a.render.scale[1]];
                        a._shot_alpha = a.alpha||255;
                    }
                        var ms= a.invincible/6+1;
                        if(ms>2)ms=2;
                        a.render.scale[0]= a._shot_scale[0]*ms;
                        a.render.scale[1]= a._shot_scale[1]*ms;
                        a.alpha= 100;
                        a.update=1;

                }else{
                    if(a._shot_scale){
                        a.render.scale[0]= a._shot_scale[0];
                        a.render.scale[1]= a._shot_scale[1];
                        delete a._shot_scale;
                        a.alpha= a._shot_alpha;
                        delete a._shot_alpha;
                        a.update=1;
                    }else {
                        a._shoted = 1;
                        a.update=0;
                    }
                }
            }
            if(a.fade_remove){
                if(a.alpha===undefined){
                    a.alpha=255;
                }
                a.alpha-=a.fade_remove;
                if(a.alpha<=0){
                    stgDeleteObject(a);
                }
            }

            if (a.type == stg_const.OBJ_BULLET || a.type == stg_const.OBJ_ENEMY || a.type == stg_const.OBJ_ITEM) {
                if(!a.keep) {
                    if (a.pos[0] > stg_frame_w +32 || a.pos[0] <  -32 ||a.pos[1] > stg_frame_h +32||a.pos[1] < -32){
                        stgDeleteObject(a);
                    }
                }
            }

            if(a.type==stg_const.OBJ_ENEMY){
                stg_enemy.push(a);
            }
        }
    }
    if(stg_game_state==stg_const.GAME_RUNNING) {
        for (i = 0; i < stg_players_number; i++) {
            a = stg_players[i];
            if(a.active){
                if(a.on_ai_after_move){
                    a.on_ai_after_move();
                    if (a.active && (!stg_super_pause_time|| a.ignore_super_pause)) {
                        a.slow = a.key[stg_const.KEY_SLOW];
                        a.last_x= a.pos[0];
                        a.last_y= a.pos[1];
                        if (!a.no_move && a.state==stg_const.PLAYER_NORMAL) {
                            var x = a.key[stg_const.KEY_RIGHT] - a.key[stg_const.KEY_LEFT];
                            //  var x=a.key[10]-a.key[9];
                            var y = a.key[stg_const.KEY_DOWN] - a.key[stg_const.KEY_UP];
                            if (x || y) {
                                var s = a.move_speed[a.slow];
                                if (x && y) {
                                    s = s / 1.4142;
                                }
                                x = x * s;
                                y = y * s;
                                a.pos[0] += x;
                                a.pos[1] += y;
                            }
                        }
                        if(a.state==stg_const.PLAYER_REBIRTH){
                            a.pos[0]= a.rebirth_x;
                            a.pos[1]= (stg_frame_height+50-a.rebirth_y)* a.invincible/ a.rebirth_time+a.rebirth_y;
                        }else {
                            if (a.pos[0] > stg_frame_w - stg_clip)a.pos[0] = stg_frame_w - stg_clip;
                            if (a.pos[0] < stg_clip)a.pos[0] = stg_clip;
                            if (a.pos[1] > stg_frame_h - stg_clip)a.pos[1] = stg_frame_h - stg_clip;
                            if (a.pos[1] < stg_clip)a.pos[1] = stg_clip;
                        }
                        playerSpellRefresh(a);

                        if(a.hitby && !a.ignore_hit){
                            a.hitby.rpos[0]= a.pos[0]+ a.hitby.pos[0];
                            a.hitby.rpos[1]= a.pos[1]+ a.hitby.pos[1];
                        }
                        if(a.hitdef && !a.ignore_hit && !a.invincible){
                            a.hitdef.rpos[0]= a.pos[0]+ a.hitdef.pos[0];
                            a.hitdef.rpos[1]= a.pos[1]+ a.hitdef.pos[1];
                        }
                    }
                }
            }
       }
    }

}
var _stg_no_input=0;
function stgCreateRefresher(){
    var last_f=(new Date()).getTime();
    var uf=last_f;
    var cnt=0;
    var tictoc=0;
    var e=function(){
        last_f=(new Date()).getTime();
        _stgMainLoop();
        if(_stg_no_input==1){
            setTimeout(e,1);
            return;
        }
        cnt++;
        var f=(new Date()).getTime();
        var df=f-last_f;
        last_f=f;
        if(df>16)df=16;
        if(cnt==30){
            stg_fps=30*1000/(last_f-uf);
            uf=last_f;
            cnt=0;
        }
        if(stg_stop){
            return;
        }
        if(stg_refresher_type){
            tictoc=(tictoc+1)%3;
            setTimeout(e,15-df+(tictoc==0?1:0));
        }else {
            requestAnimationFrame(e);
        }
    };
    e();
}

function stgAddObject(oStgObject){
    if(!oStgObject)return;
    _pool.push(oStgObject);
    var tmp=stg_target;
    if(tmp){
        if(!(tmp.side===undefined)){
            oStgObject.side=tmp.side;
        }
        if(!(tmp.sid===undefined)){
            oStgObject.sid=tmp.sid;
        }
        oStgObject.parent=tmp;
    }
    stg_target=oStgObject;
    oStgObject.active=1;
    oStgObject.remove=0;
    oStgObject.frame=0;
    if(oStgObject.init){
        oStgObject.init();
    }
    if(oStgObject.render){
        if(!oStgObject.pos){
            oStgObject.pos=[0,0,0];
            if(oStgObject.move) {
                oStgObject.pos[0] = oStgObject.move.pos[0];
                oStgObject.pos[1] = oStgObject.move.pos[1];
                oStgObject.pos[2] = oStgObject.move.pos[2];
            }else if(tmp && tmp.pos){
                oStgObject.pos[0] = tmp.pos[0];
                oStgObject.pos[1] = tmp.pos[1];
                oStgObject.pos[2] = tmp.pos[2];
            }
        }
        if(!oStgObject.rotate){
            oStgObject.rotate=[0,0,0];
            if(oStgObject.move && oStgObject.move_rotate) {
                oStgObject.rotate[2] = oStgObject.move.speed_angle;
            }
        }
    }
    stg_target=tmp;
    stg_last=oStgObject;
}

function stgDeleteObject(oStgObject){
    oStgObject.remove=1;
    oStgObject.active=0;
}
var _temp_pool;
function _stgMainLoop_Pause(){
    if(stg_game_state==stg_const.GAME_RUNNING){
        if(stg_system_input[stg_const.KEY_PAUSE] && _stg_pause_lock==0){
            _stgChangeGameState(stg_const.GAME_PAUSED);
        }else{
            _stg_pause_lock=0;
        }
    }
}
var _stg_pause_lock=0;
function _stgMainLoop_GameStateChanger(){
    if(!(_stg_next_game_state===undefined)){
        if(_stg_next_game_state==stg_const.GAME_PAUSED){
            _temp_pool=[_pool,stg_procedures,stg_display];
            stg_procedures=[];
            stg_display=[];
            _pool=[];
            if(stg_in_replay){
                stg_players_number=_replay_watchers;
            }
            stgAddObject(stg_pause_script);
        }else if(_stg_next_game_state==stg_const.GAME_RUNNING){
            if(stg_game_state==stg_const.GAME_PAUSED){
                stg_procedures=_temp_pool[1];
                stg_display=_temp_pool[2];
                _pool=_temp_pool[0];
                _temp_pool=[];
                _stg_pause_lock=1;
                if(stg_in_replay){
                    stg_players_number=stg_players.length;
                }
            }else if(stg_game_state==stg_const.GAME_MENU){
                if(!stg_in_replay)replayClear();
                _stgStartLevel();
            }else if(stg_game_state==stg_const.GAME_RUNNING){
                _stgStartLevel();
            }
        }else if(_stg_next_game_state==stg_const.GAME_MENU){
            if(stg_game_state==stg_const.GAME_PAUSED){
                stg_procedures=_temp_pool[1];
                stg_display=_temp_pool[2];
            }else if(stg_game_state==stg_const.GAME_MENU){

            }else if(stg_game_state==stg_const.GAME_RUNNING){
                _pool=[];
            }
            stgAddObject(stg_menu_script);
        }
        stg_game_state=_stg_next_game_state;
        _stg_next_game_state=undefined;
    }
}

function stgCheckResources(){
    var f=0;
    for(var i in stg_textures){
        if(stg_textures[i]){
            if(stg_textures[i].ready){

            }else{
                f++;
            }
        }
    }
    return f;
}

function _stgChangeGameState(iNextGameState){
    _stg_next_game_state=iNextGameState;
}

function stgAddShader(sName,oShader){
    stg_shaders[sName]=oShader;
    oShader.shader_init();
}
var _start_level=[];
function stgStartLevel(sLevelName,vaPlayerNames,oCommonData){
    _start_level=[sLevelName,vaPlayerNames,oCommonData];
    _stgChangeGameState(stg_const.GAME_RUNNING);
}

function _stgStartLevel(){
    for(var i in _pool){
        stgDeleteObject(_pool[i]);
    }
    _pool=[];
    if(!stg_in_replay){
        _start_level[2].rand_seed=stg_rand_seed[0];
    }else{
        stg_rand_seed[0]=_start_level[2].rand_seed;
    }
    stg_common_data=clone(_start_level[2]);
    stg_target=stg_const.TARGET_ENEMY;
    stgAddObject(stg_system_script);
    stgAddObject(stg_level_templates[_start_level[0]]);

    stg_players=[];
    for(var i=0;i<_start_level[1].length;i++){
        _addPlayer(_start_level[1][i],i)
    }
    stg_players_number=stg_players.length;
    if(!stg_in_replay) {
        replayNewLevel();
        _stg_save_input=1;
    }else{
        _stg_save_input=1;
    }

}
function _addPlayer(sPlayerName,iSlot){
    stg_target=stg_const.TARGET_PLAYER;
    var b=new StgObject();
    _StgDefaultPlayer(b);
    stg_players[iSlot]=b;
    var p=new stg_player_templates[sPlayerName](iSlot);
    hyzAddObject(p,iSlot+1);
}

function stgStart(){
    stg_game_state=stg_const.GAME_MENU;
    _stgChangeGameState(stg_const.GAME_MENU);
    stg_players_number=0;
    stg_players=[];

    requestAnimationFrame(_stgStart2);
    var time;
    function _stgStart2(t){
        time=t;
        requestAnimationFrame(_stgStart4)
    }
    function _stgStart4(t){
        time=t;
        requestAnimationFrame(_stgStart3)
    }
    function _stgStart3(t){
        time=1000/(t-time);
        if(time<55 || time>65){
            console.log("Your screen seems not refreshing at 60fps. VSync disabled.");
            console.log(time);
            stg_refresher_type=1;
        }
        else{
            stg_refresher_type=0;
        }
        stgCreateRefresher();
    }
}


function stgDeleteSelf(){
    stgDeleteObject(stg_target);
}

function _stgEndLevel(){

}

function stgCloseLevel(){
    _stgEndLevel();
    _stgChangeGameState(stg_const.GAME_MENU);
    stg_common_data.menu_state=1;
}

function stgGetRandomPlayer(){
    var i=stg_players_number;
    var k=(stg_rand(0,1)*i)>>0;
    return stg_players[k];
}

function stgLookAtTarget(object,target,turnrate){
    object=object||stg_target;
    turnrate=turnrate?turnrate*PI180:null;
    object.look_at={target:target,turn_rate:turnrate};
}

function StgBase(target,type,auto_remove,clonesid){
    if(!target){
        console.log("StgBase with out target!");
    }
    this.target=target;
    this.type=type;
    this.auto_remove=auto_remove||0;
    this.sid=clonesid===undefined?1:clonesid;
}

var stg_module={};

function stgLoadModule(sModuleName){
    if(stg_module[sModuleName]){
        if(!stg_module[sModuleName].loaded){
            stg_module[sModuleName].loaded=true;
        }else{
            return true;
        }
        if(stg_module[sModuleName].pre_load){
            stg_module[sModuleName].pre_load();
        }
        return true;
    }
    return false;
}

function stgLoadModuleObject(oModule){
    if(!oModule.loaded){
        oModule.loaded=true;
    }else{
        return true;
    }
    if(oModule.pre_load){
        oModule.pre_load();
    }
}

function stgRegisterModule(sModuleName,moduleobject){
    stg_module[sModuleName]=moduleobject;
    return true;
}
function stgRegisterPlayer(sPlayerName,nPlayerMaker){
    stg_player_templates[sPlayerName]=nPlayerMaker;
}