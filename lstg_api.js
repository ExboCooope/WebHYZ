/**
 * Created by Exbo on 2017/4/16.
 */
var luastg={};
function luaMoveTo(x,y,frames,mode,obj){
    obj=obj||stg_target;
    if(!obj.lua)obj.lua={};
    obj.lua.move={};
    obj.lua.move.mod=mode;
    obj.lua.move.spos=[obj.pos[0],obj.pos[1]];
    obj.lua.move.lpos=[obj.pos[0],obj.pos[1]];
    obj.lua.move.tpos=[x,y];
    obj.lua.move.frame=frames;
    obj.lua.move.cframe=0;
    obj.lua.move.script=mode?bezier42:clamp;
    obj.on_move=luastg.moveTo;
}
function luaBezierMoveTo(poslist,frames,obj){
    obj=obj||stg_target;
    if(!obj.lua)obj.lua={};
    obj.lua.move={};
    obj.lua.move.spos=[obj.pos[0],obj.pos[1]];
    obj.lua.move.lpos=[obj.pos[0],obj.pos[1]];
    obj.lua.move.tpos=poslist;
    obj.lua.move.frame=frames;
    obj.lua.move.cframe=0;

    obj.on_move=luastg.bmoveTo;
}
function luaSmoothBezierMoveTo(rate,pos,frames,obj){
    obj=obj||stg_target;
    if(!obj.lua)obj.lua={};
    obj.lua.move={};
    obj.lua.move.spos=[obj.pos[0],obj.pos[1]];
    obj.lua.move.lpos=[obj.pos[0],obj.pos[1]];
    obj.lua.move.tpos=[extendlength(obj.pos,obj.move?obj.move.speed_angle:0,rate),pos];
    obj.lua.move.frame=frames;
    obj.lua.move.cframe=0;

    obj.on_move=luastg.bmoveTo;
}

luastg.moveTo=function(){
    var a=this.lua.move;
    a.cframe++;
    var f= a.cframe/ a.frame;
    stgSetPositionSpeedAngleA1(this, a.lpos, [a.script(a.spos[0], a.tpos[0],f), a.script(a.spos[1], a.tpos[1],f)]);
    if(a.cframe== a.frame){
        this.on_move=0;
    }
    a.lpos[0]=this.pos[0];
    a.lpos[1]=this.pos[1];
};
function beziern(target,poss,posl,f){
    var n=posl.length;
    var q=1-f;
    if(n==1){
        target[0]=q*poss[0]+f*posl[0][0];
        target[1]=q*poss[1]+f*posl[0][1];
    }else if(n==2){
        target[0]=q*q*poss[0]+2*q*f*posl[0][0]+f*f*posl[1][0];
        target[1]=q*q*poss[1]+2*q*f*posl[0][1]+f*f*posl[1][1];
    }else if(n>=3){
        target[0]=q*q*q*poss[0]+3*q*q*f*posl[0][0]+3*f*q*f*posl[1][0]+f*f*f*posl[2][0];
        target[1]=q*q*q*poss[1]+3*q*q*f*posl[0][1]+3*f*q*f*posl[1][1]+f*f*f*posl[2][1];
    }
}
luastg.bmoveTo=function(){
    var a=this.lua.move;
    a.cframe++;
    var f= a.cframe/ a.frame;
    beziern(this.pos, a.spos,a.tpos,f);
    stgSetPositionSpeedAngleA1(this, a.lpos, this.pos);
    if(a.cframe== a.frame){
        this.on_move=0;
    }
    a.lpos[0]=this.pos[0];
    a.lpos[1]=this.pos[1];
};