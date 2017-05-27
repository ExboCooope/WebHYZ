/**
 * Created by Exbo on 2017/1/2.
 */

var hyzPrimitive2DShader={
    active:0,
    context:null,
    glset:0,
    mode:0,
    sid:0,//场地id
    shader_init:function(){
        if(_gl) {
            webglCompileShader(this);
            _gl.enable(_gl.BLEND);
            _gl.blendEquation(_gl.FUNC_ADD);
            _gl.blendFunc(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA);
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
        if(!tgt){
            return;
        }
        pro.o_width=pro.o_width||tgt.width;
        pro.o_height=pro.o_height||tgt.height;
        if(tgt.type==stg_const.TEX_CANVAS2D) {
            this.context = tgt.getContext("2d");
            if (!this.context)return;
            this.active = 1;
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.globalAlpha=1;
            if (pro.background) {

                this.context.fillStyle = pro.background;
                this.context.fillRect(0, 0, tgt.width, tgt.height);
            }
            this.mode=0;
        }else if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.disable(_gl.DEPTH_TEST);

            if(!this.glset){
                webglCompileShader(this);
                this.glset=1;
            }
            stg_active_shader=this;
            _gl.useProgram(this.program);
            _webGlUniformInput(this,"uWindow",webgl2DMatrix(pro.o_width,pro.o_height));
            this.context= _gl;
            this.mode=1;
        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中

    post_layer:function(procedureName,layerid){

    },

    object_frame:function(object,render,procedureName){

        if(!object.sid)object.sid=0;
        if(object.sid!=this.sid && this.sid!=3)return;
        if(object.sid==0 && this.sid==3)return;
        if(this.mode==0) {

        }else if(this.mode==1){
            if(stg_active_shader!=this){
                stg_active_shader=this;
                _gl.useProgram(this.program);
            }
            var tex=0;
            if (!render.texture || !stg_textures[render.texture]){
                tex=stg_textures["white"];
            }else{
                tex=stg_textures[render.texture];
            }
            if(!tex)return;
            _webGlUniformInput(this,"texture",tex);
            if(object.on_render)object.on_render(_gl);
        }
    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){

    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制

    draw_layer:function(procedureName,layerid){

    },

    shader_finalize_procedure:function(procedureName){
        this.pool=[];
    }, //移除procedure时会执行一次，用来释放资源
    template:{},

    vertex:"attribute vec2 aPosition;" +
        "attribute vec2 aTexture;" +
        "attribute vec4 aColor;" +
        "" +
        "uniform vec2 uWindow;" +
        "uniform vec2 uPosition;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vColor = aColor;" +
        "vec4 t = vec4( (aPosition+uPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
        "gl_Position = t;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main(void){" +
        "vec4 smpColor = texture2D(texture, vTexture);" +
        // "gl_FragColor  = vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
        "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3]*vColor[3];" +
        "}",
    input:{
        aPosition:[0,2,null,0,1,0],
        aTexture:[0,2,null,0,0,1],
        aColor:[0,4,null,0,0,2],
        uWindow:[1,2],
        uPosition:[1,2],
        texture:[2,0]
    },
    layer_blend:[]
};
function hyzSetPrimitiveOffset(x,y){
    _webGlUniformInput(hyzPrimitive2DShader,"uPosition",[x,y]);
}


var hyz_2d_misc_shader={
    active:0,
    context:null,
    sid:0,
    shader_init:function(){}, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){
        default_2d_misc_shader.pool=[];
        default_2d_misc_shader.active=0;
        var pro=stg_procedures[procedureName];
        if(!pro){
            console.log("Cannot initialize shader 2d: bad procedure name ["+procedureName+"]");
            console.log(stg_procedures);
            return;
        }
        default_2d_misc_shader.pro=pro;
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];
        if(!tgt){
            return;
        }
        if(tgt.type==stg_const.TEX_CANVAS2D){
            default_2d_misc_shader.context=tgt.getContext("2d");
            if(!default_2d_misc_shader.context)return;
            default_2d_misc_shader.active=1;
            default_2d_misc_shader.context.setTransform(1,0,0,1,0,0);
            if(pro.background){
                default_2d_misc_shader.context.fillStyle=pro.background;
                default_2d_misc_shader.context.fillRect(0,0,tgt.width,tgt.height);
            }
        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    object_frame:function(object,render,procedureName){
        var pool=default_2d_misc_shader.pool;
        var l=object.layer;
        if(!pool[l])pool[l]=[];
        var rld=render.reload||0;
        if(!render.procedures[procedureName]){
            render.procedures[procedureName]={};
            rld=1;
        }
        var t=render;
        t.cx=object.pos?object.pos[0]:0;
        t.cy=object.pos?object.pos[1]:0;
        pool[l].push(t);
    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){
        var pool=default_2d_misc_shader.pool;
        var l;
        var tn;
        var i;
        var c=default_2d_misc_shader.context;
        var p=stg_procedures[procedureName];
        var sx= c.canvas.width/p.o_width;
        var sy= c.canvas.height/p.o_height;

        c.textAlign="start";
        c.textBaseline="top";
        for(l=0;l<pool.length;l++){
            if(pool[l]){
                for(i=0;i<pool[l].length;i++) {
                    var obj = pool[l][i];
                    c.setTransform(sx,0,0,sy,0,0);
                    c.globalAlpha=(obj.alpha===undefined)?1:obj.alpha/255;
                    if(obj.type==0){
                        c.clearRect(obj.x+ obj.cx, obj.y+obj.cy,obj.w,obj.h);
                    }else if(obj.type==1){
                        c.fillStyle=obj.color||"#000";
                        c.fillRect(obj.x+ obj.cx, obj.y+obj.cy,obj.w,obj.h);
                    }else if(obj.type==2){
                        c.font=obj.font||"20px 宋体";
                        c.fillStyle=obj.color||"#000";
                        c.textAlign=obj.textAlign||"start";
                        c.textBaseline=obj.textBaseline||"top";
                        if(obj.maxWidth){
                            c.fillText(obj.text||"",obj.x+ obj.cx, obj.y+obj.cy,obj.maxWidth);
                        }else{
                            c.fillText(obj.text||"",obj.x+ obj.cx, obj.y+obj.cy);
                        }
                    }else if(obj.type==3){
                        if(stg_textures[obj.texture].type!=stg_const.TEX_CANVAS3D_TARGET){
                            c.drawImage(stg_textures[obj.texture],obj.x+ obj.cx, obj.y+obj.cy,obj.w,obj.h);
                        }
                    }else if(obj.type==4){
                        obj.script(c);
                    }
                }
            }
        }
    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    shader_finalize_procedure:function(procedureName){
        default_2d_misc_shader.pool=[];
    }, //移除procedure时会执行一次，用来释放资源
    template:{}
};

var stg_active_shader=0;

var hyzSpriteShader={
    active:0,
    context:null,
    glset:0,
    mode:0,
    sid:0,//场地id
    shader_init:function(){
        if(_gl) {
            webglCompileShader(this);
            _gl.enable(_gl.BLEND);
            _gl.blendEquation(_gl.FUNC_ADD);
            _gl.blendFunc(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA);
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
        if(!tgt){
            return;
        }
        pro.o_width=pro.o_width||tgt.width;
        pro.o_height=pro.o_height||tgt.height;
        if(tgt.type==stg_const.TEX_CANVAS2D) {
            this.context = tgt.getContext("2d");
            if (!this.context)return;
            this.active = 1;
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.globalAlpha=1;
            if (pro.background) {

                this.context.fillStyle = pro.background;
                this.context.fillRect(0, 0, tgt.width, tgt.height);
            }
            this.mode=0;
        }else if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.disable(_gl.DEPTH_TEST);
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, tgt.buffer||null);
            _gl.viewport(0,0,tgt.width,tgt.height);



            if(!this.glset){
                webglCompileShader(this);
                this.glset=1;
            }

            _gl.useProgram(this.program);
            _webGlUniformInput(this,"uWindow",webgl2DMatrix(pro.o_width,pro.o_height));
            this.context= _gl;
            this.mode=1;
            this.smear=pro.smear;
            if (pro.background) {
                var c=getRgb(pro.background);
                _gl.clearColor(c[0]/255,c[1]/255,c[2]/255,1-(pro.transparent||0));
                _gl.clear(_gl.COLOR_BUFFER_BIT);
            }
        }
        for(var j in this.dma_pool) {
            this.dma_pool[j].clean();
        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中

    post_layer:function(procedureName,layerid){

        for(var j in this.dma_pool) {
           // this.dma_pool[j].clean();
            this.dma_pool[j].frameStart();
        }
        this.active_pool={};
    },

    object_frame:function(object,render,procedureName){
        if(!object.sid)object.sid=0;
        if(object.sid!=this.sid && this.sid!=3)return;
        if(object.sid==0 && this.sid==3)return;
        if(this.mode==0) {
            var pool = this.pool;
            var l = object.layer;
            if (!pool[l])pool[l] = {};
            if (!render.texture)return;
            if (!pool[l][render.texture])pool[l][render.texture] = [];
            var rld = render.reload || 0;
            if (!render.procedures[procedureName]) {
                render.procedures[procedureName] = {};
                rld = 1;
            }
            var t = render.procedures[procedureName];
            t.cx = object.pos[0];
            t.cmx = render.offset[0];
            t.cy = object.pos[1];
            t.cmy = render.offset[1];
            t.r = object.rotate[2] + render.rotate;
            t.uvt = render.uvt;
            t.scale = render.scale;
            t.alpha = (object.alpha===undefined?1:object.alpha/255);
            pool[l][render.texture].push(t);
        }else if(this.mode==1){
            if (!render.texture)return;
            if(this.smear && !render.smear){
                return;
            }
            var t;
            var q=this.dma_pool;
            if(!q) {
                q = {};
                this.dma_pool=q;
            }
            if(!q[render.texture]){
                t=new WebglDMA(this,1000);
                t.frameStart();
                q[render.texture]=t;
                t.objectParser = shader1_object_parser;
            }
            t=q[render.texture];
            if(object.alpha!= object.last_alpha){
                object.update=1;
                object.last_alpha=object.alpha;
            }
            if(!this.active_pool[render.texture]){
                this.active_pool[render.texture]=t;
            }
            if(!render.webgl || object.update){
                render.webgl=1;
                var tex=stg_textures[render.texture];
                object.render.aUVT=webglTextureAssign(null,object.render.uvt,tex.width,tex.height);
                var w0=render.uvt[2];
                w0=w0<0?-w0:w0;
                var h0=render.uvt[3];
                h0=h0<0?-h0:h0;

                object.render.aRec=new Float32Array([
                        render.offset[0]*render.scale[0],render.offset[1]*render.scale[1],
                        (render.offset[0]+w0)*render.scale[0],render.offset[1]*render.scale[1],
                        (render.offset[0]+w0)*render.scale[0],(render.offset[1]+h0)*render.scale[1],
                        render.offset[0]*render.scale[0],(render.offset[1]+h0)*render.scale[1]
                ]);
                var ta=(object.alpha===undefined?1:object.alpha/255);
                if(render.color) {
                    object.render.aColor = new Float32Array([
                        render.color[0], render.color[1], render.color[2], ta,
                        render.color[0], render.color[1], render.color[2], ta,
                        render.color[0], render.color[1], render.color[2], ta,
                        render.color[0], render.color[1], render.color[2],ta]);
                }else{
                    object.render.aColor = new Float32Array([1, 1, 1, ta, 1, 1, 1, ta, 1, 1, 1, ta, 1, 1, 1, ta]);
                }
            }
            t.parseObject(object);
        }
    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_layer:function(procedureName,layerid){
        if(stg_active_shader!=this){
            stg_active_shader=this;
            _gl.useProgram(this.program);
        }
        blend_default();
        var p=stg_procedures[procedureName];
        var q=layerid;
        for(var i in this.active_pool) {
            // _gl.bindTexture(_gl.TEXTURE_2D, stg_textures[i].gltex);
            // _gl.activeTexture(_gl.TEXTURE0);
            _webGlUniformInput(this, "texture", stg_textures[i]);
            if(this.smear){
                this.smear=1;
            }
            if(this.layer_blend[q] && this.layer_blend[q][i] ){
                this.layer_blend[q][i]();
                this.active_pool[i].draw();
                blend_default();
            }else{
                this.active_pool[i].draw();
            }

        }
    },

    draw_frame:function(procedureName){

    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    shader_finalize_procedure:function(procedureName){
        this.pool=[];
    }, //移除procedure时会执行一次，用来释放资源
    template:{},

    vertex:"attribute vec2 aPosition;" +
        "attribute vec2 aOffset;" +
        "attribute vec2 aTexture;" +
        "attribute vec4 aColor;" +
        "attribute float aRotate;" +
        "" +
        "uniform vec2 uWindow;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vColor = aColor;" +
        "vec2 r = aOffset*cos(aRotate)+vec2(-aOffset[1],aOffset[0])*sin(aRotate);" +
        "vec4 t = vec4( (r + aPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
        "gl_Position = t;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main(void){" +
        "vec4 smpColor = texture2D(texture, vTexture);" +
       // "gl_FragColor  = vec4(1.0,1.0,1.0,0.0) ;"+
       //  "gl_FragColor  = smpColor * vColor ;"+//vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
        "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3]*vColor[3];" +
    //   "gl_FragColor  = vColor*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3];" +
        "}",
    input:{
        aPosition:[0,2,null,0,1,0],
        aOffset:[0,2,null,0,0,1],
        aTexture:[0,2,null,0,0,2],
        aColor:[0,4,null,0,0,3],
        aRotate:[0,1,null,0,1,4],
        uWindow:[1,2],
        texture:[2,0]
    },
    layer_blend:[],
    dma_pool:{},
    active_pool:{}
};

function NewHyzSpriteObject(obj,templatename,color){
    obj.render=new StgRender("sprite_shader");
    renderApply2DTemplate(obj.render,templatename,color||0);
}

function hyzChangeSprite(obj,templatename,color) {
    renderApply2DTemplate(obj.render,templatename,color||0);
    obj.update=1;
}
/*
 原始  R0*（1-A1A2） +  R1*R2*A1*A2，A0 *（1-A1A2）+ A1*A2
 */
/*
var blend_default=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFunc(_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA);
}*/
var blend_add=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFunc(_gl.ONE,_gl.ONE);
};
var blend_default=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA,_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA);
};
var blend_test2=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFunc(_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA);
};
var blend_test3=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.ZERO,_gl.SRC_COLOR,_gl.ZERO,_gl.ONE);
};

var blend_xor1=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.ONE_MINUS_DST_COLOR,_gl.ONE_MINUS_SRC_COLOR,_gl.ZERO,_gl.ONE);
};

var blend_clear=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.ZERO,_gl.ONE,_gl.ZERO,_gl.SRC_ALPHA);
};