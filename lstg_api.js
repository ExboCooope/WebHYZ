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

function luaCreateRenderTarget(sName){
    return stgCreateCanvas(sName,stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);
}

var luaShader={
    shader_init:function(){
        if(!this.glset){
            webglCompileShader(this.shader_3d);
            _gl.useProgram(this.shader_3d.program);
            luastg.setupBuffer();
            this.glset=1;
        }
    }, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){
        this.pool=[];
        this.active=0;
        var pro=stg_procedures[procedureName];
        if(!pro){
            console.log("Cannot initialize shader 2d: bad procedure name ["+procedureName+"]");
            console.log(stg_procedures);
            return;
        }
        this.pro=pro;
        this.sid=pro.sid||0;
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];
        this.target=tgt;
        if(!tgt){
            return;
        }
        pro.o_width=pro.o_width||tgt.width;
        pro.o_height=pro.o_height||tgt.height;
       if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.disable(_gl.DEPTH_TEST);
            _gl.enable(_gl.BLEND);
            _gl.viewport(0,0,tgt.width,tgt.height);
            if(!this.glset){
                webglCompileShader(this.shader_3d);
                _gl.useProgram(this.shader_3d.program);
                luastg.setupBuffer();
                this.glset=1;
            }
            stg_active_shader=this;
            _gl.useProgram(this.shader_3d.program);
       //     _webGlUniformInput(this.shader_3d,"uWindow",webgl2DMatrix(pro.o_width,pro.o_height));
            this.context= _gl;
            this.mode=1;
           if(tgt.use){
               tgt.use();
           }else{
               _gl.bindFramebuffer(_gl.FRAMEBUFFER,null);
           }
           if (pro.background) {
               var c=getRgb(pro.background);
               _gl.clearColor(c[0]/255,c[1]/255,c[2]/255,1);
               _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
           }
        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中

    post_layer:function(procedureName,layerid){

    },

    object_frame:function(object,render,procedureName){
        if(stg_active_shader!=this){
            stg_active_shader=this;
            _gl.useProgram(this.program.shader_3d.program);
        }



        if(object.on_render)object.on_render(_gl,this.target);

    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){

    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制

    draw_layer:function(procedureName,layerid){
        luaShader.invalid=1;
        luastg.flushBuffer();
    },

    shader_finalize_procedure:function(procedureName){
        this.pool=[];
    }, //移除procedure时会执行一次，用来释放资源
    template:{},

    shader_3d:{
        vertex:"attribute vec3 aPosition;" +
            "attribute vec2 aTexture;" +
            "uniform mat4 uView;" +
           // "uniform mat4 uModel;" +
            "varying vec2 vTexture;" +
            "varying vec3 pos;" +
            "void main( void ){" +
            "vTexture = aTexture;" +
            "gl_Position = uView*vec4(aPosition,1.0);" +
            "pos = vec3(gl_Position);" +
            "}",
        fragment:"precision mediump float;" +
            "uniform sampler2D texture;" +
            "varying vec2 vTexture;" +
            "uniform vec4 fogColor;" +
            "uniform vec4 texColor;" +
            "uniform float blendMode;" +
            "varying vec3 pos;" +
            "uniform vec2 fogArea;"+
            "void main(void){" +
            "vec4 smpColor = texture2D(texture, vTexture);" +
            "vec4 cmul=smpColor*vec4(texColor.rgb,1.0);" +
            "vec4 cadd=smpColor+texColor;" +
            //"smpColor=cmul*(1.0-blendMode)+blendMode*cadd;" +
            "smpColor=cmul;" +
            "float c=smoothstep(fogArea[0],fogArea[1],pos[2]);" +
            "gl_FragColor  =smpColor.a*vec4(smpColor.rgb*(1.0-c)+c*fogColor.rgb,smpColor.a);" +
           // "gl_FragColor  =vec4(1.0,0.0,0.0,1.0);" +
            "}",
        input:{
            aPosition:[0,3,null,0,1,0],
            aTexture:[0,2,null,0,0,2],
            uView:[1,16],
          //  uModel:[1,16],
            texColor:[1,4],
            fogColor:[1,4],
            fogArea:[1,2],
            blendMode:[1,1],
            texture:[2,0]
        }
    }
};

luastg.setupBuffer=function(){
    luaShader.posbuffer=WGLA.newBuffer(_gl,4,3,64,WGLConst.DATA_FLOAT);
    luaShader.texbuffer=WGLA.newBuffer(_gl,4,2,64,WGLConst.DATA_FLOAT);
    luaShader.indexbuffer=WGLA.newBuffer(_gl,2,6,64,WGLConst.DATA_INTEGER);
    luaShader.bufferIndex=0;
    luaShader.indexIndex=0;
    luaShader.lastTexture=0;
    luaShader.invalid=0;
    luaShader.blendmode=-1;
    luaShader.blend=-1;
    luaShader.color=[1,1,1,1];
    lstg.view3d.eye=EVec3([0,0,0]);
    lstg.view3d.at=EVec3([0,0,1]);
    lstg.view3d.up=EVec3([0,1,0]);
    lstg.view3d.z=[1,2];
    lstg.view3d.fovy=[0.6];
    lstg.view3d.fog=[100,100,[0,0,0,1]];

    luastg.updateMatrix();


    luastg.blendmap["mul+add"]=blend_add;

 };
luastg.updateMatrix=function(){
    luaShader.matView=EMat4().setPerspective(lstg.view3d.fovy/2/stg_frame_h*stg_frame_w,lstg.view3d.fovy/2,lstg.view3d.z[0],lstg.view3d.z[1]).newLookAt(lstg.view3d.eye, lstg.view3d.at,lstg.view3d.up);
    //luaShader.matView=EMat4().setPerspective(0.6,0.6,1,100).newLookAt([50,50,0],[0,0,0],[0,1,0]);
    //luaShader.matView=EMat4().setIdentity();
    _webGlUniformInput(luaShader.shader_3d,"uView",luaShader.matView);
};
luastg.pushBuffer=function(x,y,z,u,v){
    var i=luaShader.bufferIndex;
    var b1=luaShader.posbuffer.buffer;
    b1[i*3]=x;
    b1[i*3+1]=y;
    b1[i*3+2]=z;
    b1=luaShader.texbuffer.buffer;
    b1[i*2]=u;
    b1[i*2+1]=v;
    luaShader.bufferIndex++;
};
luastg.pushIndex=function(i){
    var b=luaShader.indexbuffer.buffer;
    var j=luaShader.indexIndex*6;
    b[j]=i;b[j+1]=i+1;b[j+2]=i+2;
    b[j+3]=i;b[j+4]=i+2;b[j+5]=i+3;
    luaShader.indexIndex++;
};
function LoadImageFromFile(name,path){
    return stgCreateImageTexture(name,path);
}
function LoadTexture(name,path){
    return stgCreateImageTexture(name,path);
}
function LoadImage(name,resname,x,y,w,h){
    return renderCreate2DTemplateA1(name,resname,x,y,w,h,0,0,0,1);
}

luastg.flushBuffer=function(){
    if(luaShader.bufferIndex>=60 || luaShader.indexIndex>=50){
        luaShader.invalid=1;
    }
    if(luastg.matflag){
        luastg.matflag=0;
        luastg.updateMatrix();
    }
    if(luaShader.invalid && luaShader.lastTexture) {
        //set texture
        var tex=stg_textures[luaShader.lastTexture];
        _webGlUniformInput(luaShader.shader_3d, "texture", tex);
        if(tex.blend!=luaShader.blend){
            luaShader.blend=tex.blend;
            if(luaShader.blend){
                luaShader.blend();
            }else{
                blend_default();
            }
        }
        if(tex.blendmode!=luaShader.blendmode){
            luaShader.blendmode=tex.blendmode;
            _webGlUniformInput(luaShader.shader_3d,"blendMode",[luaShader.blendmode||0])
        }
        if(tex.color!=luaShader.color){
            luaShader.color=tex.color;
            _webGlUniformInput(luaShader.shader_3d,"texColor",luaShader.color||[1,1,1,1]);
        }
        if( luaShader.bufferIndex){
            luaShader.indexbuffer.uploadIndexData(0, 0, _gl.STREAM_DRAW);
            luaShader.posbuffer.uploadData(0, 0, _gl.STREAM_DRAW);
            luaShader.texbuffer.uploadData(0, 0, _gl.STREAM_DRAW);
            GlBufferInput(luaShader.shader_3d,"aPosition",luaShader.posbuffer);
            GlBufferInput(luaShader.shader_3d,"aTexture",luaShader.texbuffer);
            luaShader.indexbuffer.useIndexBuffer();
            _gl.drawElements(_gl.TRIANGLES, luaShader.indexIndex * 6, _gl.UNSIGNED_SHORT, 0);
            luaShader.bufferIndex = 0;
            luaShader.indexIndex = 0;
            luaShader.invalid = 0;
        }
    }
};

function Render4V(name,x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4){
    var uv=Render4V.uv;
    name=luastg.getImageUV(name,uv);
    if(luaShader.lastTexture!=name){
        luaShader.invalid=1;
        luastg.flushBuffer();
        luaShader.lastTexture=name;
    }
    luastg.flushBuffer();
    var i=luaShader.bufferIndex;
    luastg.pushBuffer(x1,y1,z1,uv[0],uv[1]);
    luastg.pushBuffer(x2,y2,z2,uv[2],uv[1]);
    luastg.pushBuffer(x3,y3,z3,uv[2],uv[3]);
    luastg.pushBuffer(x4,y4,z4,uv[0],uv[3]);
    luastg.pushIndex(i);
}
Render4V.uv=[0,0,1,1];
function Class(base_class){
    var a=function(){
        base_class.call(this);
    };
    for(var i in base_class.prototype){
        a.prototype[i]=base_class.prototype[i];
    }
    return a;
}
Math.mod=function(a,b){
    return a-math.floor(a/b)*b;
};
var math=Math;
var lstg={};
lstg.view3d={};
function Set3D(option){
    if(lstg.view3d[option]){
        for(var i=0;i<arguments.length-1;i++){
            lstg.view3d[option][i]=arguments[i+1];
        }
        //luastg.updateMatrix();
        luastg.matflag=1;
    }
    if(option=='fog'){
        _gl.useProgram(luaShader.shader_3d.program);
        _webGlUniformInput(luaShader.shader_3d,"fogArea",[arguments[1],arguments[2]]);
        var c=arguments[3];
        _webGlUniformInput(luaShader.shader_3d,"fogColor",c);
    }

}

var background={
    init:function(){}
};

function Color(a){
    if(arguments.length==1){
        return [(a%256)/255,((a>>8)%256)/255,((a>>16)%256)/255,((a>>24)%256)/255];
    }else if(arguments.length==4){
        return [arguments[0]/255,arguments[1]/255,arguments[2]/255,arguments[3]/255];
    }
}

luastg.blendmap={

};

luastg.getImageUV=function(res,uv){
    if(renderCreate2DTemplateA1[res]){
        var a=renderCreate2DTemplateA1[res];
        var s= a.tex;
        var p=stg_textures[s];
        uv[0]= a.data[0]/ p.width;
        uv[1]= a.data[1]/ p.height;
        uv[2]= uv[0]+a.data[2]/ p.width;
        uv[3]= uv[1]+a.data[3]/ p.height;
        return s;
    }else{
        uv[0]=0;
        uv[1]=0;
        uv[2]=1;
        uv[3]=1;
        return res;
    }
};


function SetImageState(resname,mode,color){
    var s=stg_textures[resname];
    var b=luastg.blendmap[mode];
    var colormode=0;
    if(mode[0]='m' || !mode[0]){
        colormode=0;
    }else{
        colormode=1;
    }
    s.blend=b;
    s.blendmode=colormode;
    s.color=color;
}
function SetViewMode(mode){}
var object=function(){
    this.render=new StgRender("lua_shader");
    this.layer=150;
};
var SQRT2_2=sqrt(2)/2;
function RenderClear(color){
    _gl.clearColor(color[0],color[1],color[2],1);
    _gl.clear(_gl.COLOR_BUFFER_BIT);
}