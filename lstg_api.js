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
    obj.after_move=luastg.moveTo;
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

    obj.after_move=luastg.bmoveTo;
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

    obj.after_move=luastg.bmoveTo;
}

luastg.moveTo=function(){
    var a=this.lua.move;
    a.cframe++;
    var f= a.cframe/ a.frame;
    stgSetPositionSpeedAngleA1(this, a.lpos, [a.script(a.spos[0], a.tpos[0],f), a.script(a.spos[1], a.tpos[1],f)]);
    if(a.cframe== a.frame){
        this.after_move=0;
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
        this.after_move=0;
    }
    a.lpos[0]=this.pos[0];
    a.lpos[1]=this.pos[1];
};

luastg.BossResourceHolder=function(ImageName,xs,ys,standi,lefti,righti,spelli,boss){
    this.resname=ImageName+"_lua";
    var tw=stg_textures[ImageName].width;
    var th=stg_textures[ImageName].height;
    renderCreate2DTemplateA2(this.resname,ImageName,0,0,tw/xs,th/ys,xs,ys,0,1);
    this.render=new StgRender("sprite_shader");
    this.boss=boss;
    this.base=new StgBase(boss,stg_const.BASE_NONE,1);
    this.resolve_move=1;
    this.animes=[standi,righti,lefti,spelli];
    this.xs=xs;
    this.layer=stg_const.LAYER_ENEMY;
    stgEnableMove(this);
};

luastg.BossResourceHolder.prototype.on_move=function() {
    this.pos[0]=this.boss.pos[0];
    this.pos[1]=this.boss.pos[1];
};
luastg.BossResourceHolder.prototype.init=function() {
    this.anime=0;
    this.animei=0;
    this.animef=0;
    this.cast=0;
};
luastg.BossResourceHolder.prototype.script=function(){
    //获得当前动作
    var angle=this.move.speed?this.move.speed_angle/PI180:90;
    var ani=0;
    if(angle<0)angle=angle+360;
    if(angle>125 && angle<215){
        ani=2;
    }else if(angle<55 || angle>305){
        ani=1;
    }
    if(this.boss.cast){
        ani=3;
    }

    if(this.anime==ani){
        this.animef++;
        if(this.animef>6){
            this.animef=0;
            this.animei++;
            if(this.animei>=this.animes[ani][0]){
                this.animei=this.animes[ani][1];
            }
            renderApply2DTemplate3(this.render,this.resname,ani*this.xs+this.animei);
            this.update=1;
        }
    }else{
        this.animef=0;
        this.animei=0;
        this.anime=ani;
        renderApply2DTemplate3(this.render,this.resname,ani*this.xs+this.animei);
        this.update=1;
    }
};


luastg.general={};
luastg.general.define=function(svar){

};

luastg.task={};
luastg.task.wait=function(itime){

};

var luastg_runtime={};

luastg._replace_function=function(v){
    return v.search(/\d/)?"luastg_runtime."+v:v;
};

luastg._expressions={};

luastg.express=function(sexpr){
    if(luastg._expressions[sexpr]){
        return luastg._expressions[sexpr];
    }
    var a= sexpr.replace(/\w+/g,luastg._replace_function);
    var s="luastg._tempfunction=function(){return "+a+";}";
    eval(s);
    luastg._expressions[sexpr]=luastg._tempfunction;
    return luastg._tempfunction;
};

function luaSetPosition(x,y,obj){
    obj=obj||stg_target;
    stgSetPositionA1(obj,x+stg_frame_w/2,stg_frame_h/2-y);
}

function LSTGTaskBase(){
    this.yield=0;
    this.ip=0;
    this.ipa=0;
    this.restart=0;
    this.countip=0;
    this.count=0;
    this.break=0;
    this.value={};
    this.stack=[];
}
var _lstgtask={};
var local=null;
LSTGTaskBase.prototype.run=function(task){
    var a=_lstgtask;

    _lstgtask=this;
    local= _lstgtask.value;
    _lstgtask.restart=0;
   // _lstgtask.yield=0;
    this.countip=0;
    task();
    while(_lstgtask.restart){
        _lstgtask.restart=0;
        _lstgtask.countip=0;
        task();
    }
    _lstgtask=a;
    local= a.value;
};
LSTGTaskBase.prototype.start_function=function(ips){

};

var task={};
task._start=function(ips){
    ips=ips||1;
    _lstgtask.countip+=ips;
    if(_lstgtask.countip<=_lstgtask.ip+ips && _lstgtask.countip>_lstgtask.ip){
        _lstgtask.ips=ips;
        _lstgtask.ipa=_lstgtask.ip-_lstgtask.countip+ips;
        _lstgtask.ip=_lstgtask.countip;
        return true;
    }else{
        return false;
    }
};
task._yield=function(count){
    _lstgtask.yield++;
    if(_lstgtask.yield>count){
        _lstgtask.yield=0;
        return false;
    }else{
        _lstgtask.ip-=_lstgtask.ips;
        return true;
    }
};
task._goto=function(ip){
    if(ip>=_lstgtask.ip){
        _lstgtask.ip=ip;
    }else{
        _lstgtask.ip=ip;
        _lstgtask.restart=1;
    }
};
task._begin_block=function(){
    if(_lstgtask.break){
        _lstgtask.break++;
        return 0;
    }
    if(!task._start(3))return 0;
    if(_lstgtask.ipa==0){//first enter
        _lstgtask.stack.push([_lstgtask.countip-3]);
        return 1;
    }else if(_lstgtask.ipa==1){
        return 2;
    }else{
        _lstgtask.stack.pop();
        _lstgtask.break=1;
        return 3;
    }
};

task._break=function(){
    _lstgtask.ip=-1;
    _lstgtask.break=1;
};
task._getblock=function(){
    return _lstgtask.stack[_lstgtask.stack.length-1];
};

task.wait=function(time){
    if(!task._start(1))return;
    task._yield(time);
};
task.repeat=function(times,interval){
    var rt=task._begin_block();
    if(!rt)return;
    var n=arguments.length;
    var i=2;
    if(rt==1){
        if(n>2){
            for(i=2;i<n;i+=3){
                local[arguments[i]]=arguments[i+1];
            }
        }
        _lstgtask.stack[_lstgtask.stack.length-1][2]=0;
    }else if(rt==2){
        var p=_lstgtask.stack[_lstgtask.stack.length-1][2]++;

        if(interval){
            if(task._yield(interval)){
                _lstgtask.stack[_lstgtask.stack.length-1][2]--;
                _lstgtask.ip++;
                return;
            }
        }
        if(p>=times-1){
            task._break();
            return;
        }
        if(n>2){
            for(i=2;i<n;i+=3){
                local[arguments[i]]+=arguments[i+2];
            }
        }
    }else if(rt==3){
        task._break();
        return;
    }
};

task.end=function(){
    if(task._start(1)){//正常运行至end
        task._goto(task._getblock()[0]+1);
    }else{
        if(_lstgtask.break){
            _lstgtask.break--;
            if(_lstgtask.break==0){//接到了break
                _lstgtask.ip=_lstgtask.countip;
            }
        }
    }
};
task.code=function(code){
    if(task._start()){
        code();
    }
};
task.jump=function(condition){
    if(!task._start(1))return;
    if(condition===undefined || condition===null || condition){
        task._break();
    }
};


function testTask1(){
    task.wait(1);
    task.repeat(100,1,'a',0,1);
        task.jump(local.a==2);
        task.code(testTask1.code1);
    task.end();
    task.code(testTask1.code2);
}
testTask1.code1=function(){
    console.log(testTask1.a);
};
testTask1.code2=function(){
    console.log("finished!");
};
testTask1.a=0;
var testTask=new LSTGTaskBase();
function testResume(){
    testTask1.a++;
    console.log("pass :"+testTask1.a);
    testTask.run(testTask1);
}
