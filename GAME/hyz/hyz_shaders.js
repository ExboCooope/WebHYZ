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
        this.target=tgt;
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
            if(tex!=this.target) {
                _webGlUniformInput(this, "texture", tex);
            }
            if(object.on_render)object.on_render(_gl,this.target);
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
//         "gl_FragColor  = vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
      //  "gl_FragColor  = vec4(smpColor[3],0,0,1.0);" +
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
      //  "gl_FragColor  = smpColor*smpColor[3];" +
       //  "gl_FragColor  = smpColor * vColor ;"+//vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
      //  "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3]*vColor[3];" +
        "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*smpColor*smpColor[3]*vColor[3];" +
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

var hyzAuraShader={
    active:0,
    context:null,
    glset:0,
    use:function(){
        if(!this.glset){
            webglCompileShader(this);
            this.glset=1;
        }
         _gl.useProgram(this.program);
    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    vertex:"attribute vec2 aPosition;" +
        "attribute vec2 aTexture;" +
        "" +
        "uniform vec2 uWindow;" +
        "uniform vec2 uPosition;" +

        "varying vec2 vTexture;" +
        "varying vec2 vPosition;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vPosition = aPosition;" +
        "vec4 t = vec4( (aPosition+uPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
        "gl_Position = t;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "varying vec2 vTexture;" +
        "varying vec2 vPosition;" +
        "uniform vec3 uT;" +
        "uniform vec2 uSize;" +
        "uniform vec4 uColor;" +
        "void main(void){" +
        "float d = 1.0-length(vPosition)/uT[2];" +
        "if(d<0.0){discard;}" +
        "vec2 p = (vec2(uT)+vPosition)/8.0;" +
        "vec2 u = vec2(p[0]-p[1]);" +
        "vec4 smpColor = texture2D(texture, vTexture+10.0*sin(u)*d/uSize);" +
   //     "vec4 smpColor = texture2D(texture, vTexture);" +
        // "gl_FragColor  = vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
        "gl_FragColor  = uColor * smpColor;" +//vec4(smpColor[0],smpColor[1],smpColor[2],smpColor[3]);" +
        "}",
    input:{
        aPosition:[0,2,null,0,1,0],
        aTexture:[0,2,null,0,0,1],
        uWindow:[1,2],
        uColor:[1,4],
        uPosition:[1,2],
        uT:[1,3],
        uSize:[1,2],
        texture:[2,0]
    }
};

var hyzCircleBlendShader={
    active:0,
    context:null,
    glset:0,
    use:function(){
        if(!this.glset){
            webglCompileShader(this);
            this.glset=1;
        }
        _gl.useProgram(this.program);
    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    vertex:"attribute vec2 aPosition;" +
        "attribute vec2 aTexture;" +
        "" +
        "uniform vec2 uWindow;" +
        "uniform vec2 uPosition;" +

        "varying vec2 vTexture;" +
        "varying vec2 vPosition;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vPosition = aPosition;" +
        "vec4 t = vec4( (aPosition+uPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
        "gl_Position = t;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "varying vec2 vTexture;" +
        "varying vec2 vPosition;" +
        "uniform vec2 uSize;" +
        "uniform vec4 uColor;" +
        "void main(void){" +
        "float d = length(vPosition);" +
        "vec4 smpColor = texture2D(texture, vTexture);" +
        "float q = smoothstep(uSize[0],uSize[1],d);" +
       "gl_FragColor  = uColor*q+(1.0-q)*smpColor;" +//vec4(smpColor[0],smpColor[1],smpColor[2],smpColor[3]);" +
        "}",
    input:{
        aPosition:[0,2,null,0,1,0],
        aTexture:[0,2,null,0,0,1],
        uWindow:[1,2],
        uColor:[1,4],
        uPosition:[1,2],
        uSize:[1,2],
        texture:[2,0]
    }
};

var hyzLaserShader={
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
        this.target=tgt;
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
            if(tex!=this.target) {
                _webGlUniformInput(this, "texture", tex);
            }
            if(object.on_render)object.on_render(_gl,this.target);
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
        "attribute vec2 aOffset;" +
        "attribute vec4 aColor;" +
        "" +
        "uniform vec2 uWindow;" +
        "varying vec2 vOffset;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vColor = aColor;" +
        "vOffset = aOffset;" +
        "vec4 t = vec4( (aPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
        "gl_Position = t;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "uniform vec2 uTexture0;" +
        "uniform vec2 uTexture1;" +
        "varying vec2 vTexture;" +
        "varying vec2 vOffset;" +
        "varying vec4 vColor;" +
        "void main(void){" +
        "vec4 smpColor = texture2D(texture, vOffset/vTexture*uTexture1+uTexture0);" +
//         "gl_FragColor  = vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
      // "vec2 temp  = vOffset/vTexture;" +
        // "gl_FragColor  = vec4(temp[1],0.0,-temp[1],1.0);" +
        "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3]*vColor[3];" +
        "}",
    input:{
        aPosition:[0,2,null,0,1,0],
        aTexture:[0,2,null,0,0,1],
        aOffset:[0,2,null,0,0,3],
        aColor:[0,4,null,0,0,2],
        uWindow:[1,2],
        uTexture0:[1,2],
        uTexture1:[1,2],
        texture:[2,0]
    },
    layer_blend:[]
};

stgAddShader("laser_shader",hyzLaserShader);


var hyzSpriteShaderV2={
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

        }else if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.disable(_gl.DEPTH_TEST);
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, tgt.buffer||null);
            _gl.viewport(0,0,tgt.width,tgt.height);



            if(!this.glset){
                webglCompileShader(this);
                this.glset=1;
            }

            _gl.useProgram(this.program);
         //   _webGlUniformInput(this,"uWindow",EVec([pro.o_width,pro.o_height]));
            _webGlUniformInput(this,"uWindow",[tgt.width,tgt.height,pro.o_width,pro.o_height]);
            this.scalerate=tgt.width/pro.o_width;
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
                t=new WebglDMAX(this,1000);
                t.frameStart();
                q[render.texture]=t;
                t.objectParser = shader2_object_parserV2;
            }
            t=q[render.texture];
            if(object.alpha!= object.last_alpha){
                object.update=1;
                object.last_alpha=object.alpha;
            }
            if(!this.active_pool[render.texture]){
                this.active_pool[render.texture]=t;
            }
            var w0=render.uvt[2];
            w0=w0<0?-w0:w0;
            var h0=render.uvt[3];
            h0=h0<0?-h0:h0;
            if(!render.webgl || object.update){
                render.webgl=1;
                if(!object.render._color){
                    object.render._color=new Float32Array(4);
                }
                var ta=(object.alpha===undefined?1:object.alpha/255);
                if(render.color) {
                    object.render._color[0]=render.color[0];
                    object.render._color[1]=render.color[1];
                    object.render._color[2]=render.color[2];
                    object.render._color[3]=ta;
                }else{
                    object.render._color[0]=1;
                    object.render._color[1]=1;
                    object.render._color[2]=1;
                    object.render._color[3]=ta;                }
            }
            object.render._w=w0*render.scale[0];
            object.render._h=h0*render.scale[1];
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
            _webGlUniformInput(this, "texturesize", [stg_textures[i].width,stg_textures[i].height]);

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

    vertex:
        "attribute vec2 aVertex;" +
        "attribute vec2 aTextureOffset;" +
        "attribute vec4 aTexture;" +
        "attribute vec3 aScale;" +
        "attribute vec4 aColor;" +
        "" +
        "uniform vec4 uWindow;" +
        "varying vec4 vTexture;" +
        "varying vec3 vScale;" +
        "varying vec2 vSC;" +
        "varying vec4 vColor;" +
        "void main( void ){" +
        "vec2 sc = vec2(sin(aScale.z),cos(aScale.z));" +
        "vec2 realsize = aScale.xy*uWindow.rg/uWindow.ba;" +
        "vec2 realpos = aScale.xy*(0.5+ aTextureOffset/abs(aTexture.ba));" +
        "vec2 realpos2 = aVertex+vec2(realpos.x*sc.y-realpos.y*sc.x,realpos.x*sc.x+realpos.y*sc.y);" +
        "realpos = (realpos2/uWindow.ba*2.0-1.0)*vec2(1.0,-1.0);" +
        "vTexture = aTexture;" +
        "vColor = aColor;" +
        "vSC = sc;" +
        "float psize = length(realsize);" +
        "vScale = vec3(realsize,psize);" +
        "gl_Position = vec4(realpos,0,1);" +
        "gl_PointSize = psize;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "uniform vec2 texturesize;" +
        "varying vec4 vTexture;" +
        "varying vec3 vScale;" +
        "varying vec2 vSC;" +
        "varying vec4 vColor;" +
        "void main(void){" +
        "vec2 cnt = gl_PointCoord-0.5;" +
        "vec2 cnt2 = vec2(cnt.x*vSC.y+cnt.y*vSC.x,-cnt.x*vSC.x+cnt.y*vSC.y);" +
        " cnt = cnt2*vScale.z/vScale.xy+0.5;" +
        " if(cnt[0]<0.0||cnt[0]>1.0||cnt[1]<0.0||cnt[1]>1.0){discard;};" +
        "cnt2 = (vTexture.ba*cnt+vTexture.rg)/texturesize;" +
        "vec4 smpColor = texture2D(texture, cnt2);" +
         "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*smpColor*smpColor[3]*vColor[3];" +
        //   "gl_FragColor  = vColor*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3];" +
        "}",
    input:{
        aVertex:[0,2,null,0,1,0],
        aTexture:[0,4,null,0,0,1],
        aTextureOffset:[0,2,null,0,0,2],
        aColor:[0,4,null,0,0,3],
        aScale:[0,3,null,0,1,4],
        uWindow:[1,4],
        texture:[2,0],
        texturesize:[1,2]
    },
    layer_blend:[],
    dma_pool:{},
    active_pool:{}
};

//stgAddShader("point_shader",hyzSpriteShaderV2);
stgAddShader("sprite_shader",hyzSpriteShaderV2);

function shader2_object_parserV2(oDMA,oObject,iIndex,iNew){
    var gl=_gl;
    if(oObject.update)iNew=1;
    oObject.update=0;
    var x=oObject.pos[0];
    var y=oObject.pos[1];
    var r=oObject.rotate[2]+(oObject.render.rotate||0);
    var i2=iIndex*2;
    oDMA.buffers[0][i2]=x;
    oDMA.buffers[0][i2+1]=y;
    i2=iIndex*3;
    oDMA.buffers[4][i2]=oObject.render._w;
    oDMA.buffers[4][i2+1]=oObject.render._h;
    oDMA.buffers[4][i2+2]=r;
    if(iNew) {
        oDMA.buffers[1].set(oObject.render.uvt,iIndex*4);
        oDMA.buffers[2].set(oObject.render.offset,iIndex*2);
        oDMA.buffers[3].set(oObject.render._color,iIndex*4);
        oDMA.invalidate(iIndex);
    }
}

function shader2_object_parser(oDMA,oObject,iIndex,iNew){
    var gl=_gl;
    if(oObject.update)iNew=1;
    oObject.update=0;
    var x=oObject.pos[0];
    var y=oObject.pos[1];
    var r=oObject.rotate[2]+(oObject.render.rotate||0);
    oDMA.buffers[0].set([x,y,x,y,x,y,x,y],iIndex*8);
    oDMA.buffers[4].set([r,r,r,r],iIndex*4);
    if(iNew) {
        oDMA.buffers[1].set(oObject.render.aRec,iIndex*8);
    //    gl.bindBuffer(gl.ARRAY_BUFFER,oDMA.glbuffers[1]);
     //   gl.bufferSubData(gl.ARRAY_BUFFER,iIndex*8*4,oObject.render.aRec);
        oDMA.buffers[3].set(oObject.render.aColor,iIndex*16);
     //   gl.bindBuffer(gl.ARRAY_BUFFER,oDMA.glbuffers[3]);
     //   gl.bufferSubData(gl.ARRAY_BUFFER,iIndex*16*4,oObject.render.aColor);
        oDMA.buffers[2].set(oObject.render.aUVT,iIndex*8);
     //   gl.bindBuffer(gl.ARRAY_BUFFER,oDMA.glbuffers[2]);
     //   gl.bufferSubData(gl.ARRAY_BUFFER,iIndex*8*4,oObject.render.aUVT);
        oDMA.invalidate(iIndex);
    }
}


function WebglDMAX(shader,iDefaultCapability){
    var gl=_gl;
    this.buffers=[];
    this.glbuffers=[];
    this.usage=[];
    this.cap=iDefaultCapability;
    this.capa=iDefaultCapability;
    this.id=DMAID++;
    this.index=new Uint16Array(iDefaultCapability);
    this.indexbuffer=gl.createBuffer();
    this.indexn=0;
    this.lcnt=[];
    var j=0;
    for(var i in shader.input){

        var t= shader.input[i];
        if(t[0]==0) {
            j = t[5];
            this.lcnt[j] = t;
            this.buffers[j] = new Float32Array(iDefaultCapability  * t[1]);
            this.glbuffers[j] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.glbuffers[j]);
            gl.bufferData(gl.ARRAY_BUFFER, this.buffers[j], t[4] ? gl.STREAM_DRAW : gl.DYNAMIC_DRAW);
        }
    }
    for(var j in this.lcnt){
        var t= this.lcnt[j];
        gl.enableVertexAttribArray(t[2]);
    }
    this.objectParser=null;
    this.last_index=0;
    this.invalid_min=0;
    this.invalid_max=-1;
}
WebglDMAX.prototype.invalidate=function(i){
    if(i<this.invalid_min)this.invalid_min=i;
    if(i>this.invalid_max)this.invalid_max=i;
};
WebglDMAX.prototype.parseObject=function(oObject){
    if(!oObject.dma){
        oObject.dma=[];
    }
    var i;
    var j;
    var flush=0;
    var gl=_gl;
    if(oObject.dma[this.id]===undefined){
        flush=1
        if(!this.usage[this.last_index]){
            i=this.last_index;

        }else{
            for(i=this.last_index;i<this.usage.length;i++){
                if(!this.usage[i]){
                    break;
                }
            }
        }
        this.last_index=i+1;
        if(i==this.usage.length && i>=this.cap){
            console.log("Reaching vector pool capability "+this.cap+", new capability "+(this.cap+this.capa)+" .");
            var n=(this.cap+this.capa);
            var sw;
            for(j in this.lcnt){
                var t= this.lcnt[j];
                this.glbuffers[j]=gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER,this.glbuffers[j]);
                sw=this.buffers[j];
                this.buffers[j]=new Float32Array(n*t[1]);
                this.buffers[j].set(sw);
                if(!t[4]){
                    gl.bufferData(gl.ARRAY_BUFFER,this.buffers[j],gl.DYNAMIC_DRAW);
                }
            }

            sw=this.index;
            this.index=new Uint16Array(n);
            this.index.set(sw);
            this.cap=this.cap+this.capa;


        }
        oObject.dma[this.id]=i;
        this.usage[i]=oObject;
    }
    i=oObject.dma[this.id];
    this.index[this.indexn]=i;
    this.indexn+=1;
    this.objectParser(this,oObject,oObject.dma[this.id],flush);
};

WebglDMAX.prototype.clean=function(){
    for(var i in this.usage){
        if(this.usage[i]){
            if(this.usage[i].remove){
                this.deleteObject(this.usage[i]);
            }
        }
    }
};



WebglDMAX.prototype.deleteObject=function(oObject){
    if(!oObject.dma){
        return;
    }
    var i;
    var j;
    var flush=0;
    var gl=_gl;
    if(!oObject.dma[this.id]){
        return;
    }
    i=oObject.dma[this.id];
    this.usage[i]=null;
    if(i<this.last_index)this.last_index=i;
};

WebglDMAX.prototype.frameStart=function(){
    var gl=_gl;
    //   for(var j in this.lcnt){
    //      var t= this.lcnt[j];
    //       gl.enableVertexAttribArray(t[2]);
    //  }
    this.indexn=0;
    this.invalid_min=this.cap+1;
    this.invalid_max=-1;
};

WebglDMAX.prototype.draw=function(){
    var j;
    var gl=_gl;
    if(!this.indexn)return;
    for(j in this.lcnt){
        var t= this.lcnt[j];
        gl.bindBuffer(gl.ARRAY_BUFFER,this.glbuffers[j]);
        // gl.enableVertexAttribArray(t[2]);
        if(t[4]){
            gl.bufferData(gl.ARRAY_BUFFER,this.buffers[j],gl.STREAM_DRAW);
        }else if(this.invalid_min<=this.invalid_max){
            gl.bufferSubData(gl.ARRAY_BUFFER,this.invalid_min*4*t[1],this.buffers[j].subarray(this.invalid_min*t[1],(this.invalid_max+1)*t[1]));
        }
        gl.vertexAttribPointer(t[2], t[1], gl.FLOAT, false, t[1]*4, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexbuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.index,gl.STREAM_DRAW);
    gl.drawElements(gl.POINTS,this.indexn,gl.UNSIGNED_SHORT,0);
};


WebglDMAX.prototype.release=function(){
    var j;
    var gl=_gl;
    for(j in this.usage){
        delete this.usage[j].dma[this.id];
    }
};


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
var blend_test1=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA,_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA);
};
var blend_test2=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    //_gl.blendFunc(_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA);
    _gl.blendFuncSeparate(_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA,_gl.ONE_MINUS_DST_ALPHA,_gl.ONE);
};
var blend_test3=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.ZERO,_gl.SRC_COLOR,_gl.ZERO,_gl.ONE);
};

var blend_xor1=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.ONE_MINUS_DST_COLOR,_gl.ONE_MINUS_SRC_COLOR,_gl.ZERO,_gl.ONE);
};
var blend_copy=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFunc(_gl.ONE,_gl.ZERO);
};
var blend_clear=function(){
    _gl.blendEquation(_gl.FUNC_ADD);
    _gl.blendFuncSeparate(_gl.ZERO,_gl.ONE,_gl.ZERO,_gl.SRC_ALPHA);
};

blend_default=blend_test2;