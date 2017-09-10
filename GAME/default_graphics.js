/**
 * Created by Exbo on 2015/11/18.
 */


var ifeSpriteShader={
    active:0,
    context:null,
    glset:0,
    mode:0,
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


            _gl.enable(_gl.BLEND);
            _gl.blendEquation(_gl.FUNC_ADD);
            _gl.blendFunc(_gl.ONE,_gl.ONE_MINUS_SRC_ALPHA);

            if(!this.glset){
                webglCompileShader(this);
                _webGlUniformInput(this,"uWindow",webgl2DMatrix(pro.o_width,pro.o_height));
                this.glset=1;
            }
            _gl.useProgram(this.program);
            this.context= _gl;
            this.mode=1;
            for(var i in this.dma_pool){
                for(var j in this.dma_pool[i]) {
                    this.dma_pool[i][j].clean();
                    this.dma_pool[i][j].frameStart();
                }
            }
            if (pro.background) {
                var c=getRgb(pro.background);
                _gl.clearColor(c[0]/255,c[1]/255,c[2]/255,1);
                _gl.clear(_gl.COLOR_BUFFER_BIT);
            }
        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    object_frame:function(object,render,procedureName){
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
            var t;
            var q=this.dma_pool[object.layer];
            if(!q) {
                q = {};
                this.dma_pool[object.layer]=q;
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
            if(!render.webgl || object.update){
                render.webgl=1;
                var tex=stg_textures[render.texture];
                object.render.aUVT=webglTextureAssign(null,object.render.uvt,tex.width,tex.height);
                object.render.aRec=new Float32Array([
                        render.offset[0]*render.scale[0],render.offset[1]*render.scale[1],
                        (render.offset[0]+render.uvt[2])*render.scale[0],render.offset[1]*render.scale[1],
                        (render.offset[0]+render.uvt[2])*render.scale[0],(render.offset[1]+render.uvt[3])*render.scale[1],
                        render.offset[0]*render.scale[0],(render.offset[1]+render.uvt[3])*render.scale[1]
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
    draw_frame:function(procedureName){
        if(this.mode==0) {
            var pool = this.pool;
            var l;
            var tn;
            var obj;
            var i;
            var p=stg_procedures[procedureName];
            var c = this.context;
            var sx= c.canvas.width/p.o_width;
            var sy= c.canvas.height/p.o_height;
            for (l = 0; l < pool.length; l++) {
                if (pool[l]) {
                    for (tn in pool[l]) {
                        var tex = stg_textures[tn];
                        if (tex) {
                            //if (tex)
                            for (i = 0; i < pool[l][tn].length; i++) {
                                var obj = pool[l][tn][i];
                                c.globalAlpha=obj.alpha;
                                c.setTransform(sx, 0, 0, sy, obj.cx*sx, obj.cy*sy);

                                c.rotate(obj.r);
                                c.drawImage(tex, obj.uvt[0], obj.uvt[1], obj.uvt[2], obj.uvt[3], obj.cmx*obj.scale[0], obj.cmy*obj.scale[1], obj.uvt[2]*obj.scale[0], obj.uvt[3]*obj.scale[1]);
                            }
                        }
                    }
                }
            }
        }else if(this.mode==1){
            _gl.useProgram(this.program);
            for(var q in this.dma_pool){
                for(var i in this.dma_pool[q]) {
                    // _gl.bindTexture(_gl.TEXTURE_2D, stg_textures[i].gltex);
                    // _gl.activeTexture(_gl.TEXTURE0);
                    _webGlUniformInput(this, "texture", stg_textures[i]);
                    this.dma_pool[q][i].draw();
                }
            }
        }
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
       // "gl_FragColor  = vColor[3] * smpColor * vec4(vColor[0],vColor[1],vColor[2],1.0);" +
        "gl_FragColor  = vec4(vColor[0],vColor[1],vColor[2],1.0)*vec4(smpColor[0],smpColor[1],smpColor[2],1.0)*smpColor[3]*vColor[3];" +
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
    dma_pool:[]
};


var default_2d_shader={
    active:0,
    context:null,
    glset:0,
    mode:0,
    shader_init:function(){
        if(_gl) {
            webglCompileShader(default_2d_shader);
            _gl.enable(_gl.BLEND);
            _gl.blendEquation(_gl.FUNC_ADD);
            _gl.blendFunc(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA);
        }
    }, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){
        default_2d_shader.pool=[];
        default_2d_shader.active=0;
        var pro=stg_procedures[procedureName];
        if(!pro){
            console.log("Cannot initialize shader 2d: bad procedure name ["+procedureName+"]");
            console.log(stg_procedures);
            return;
        }
        default_2d_shader.pro=pro;
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];
        if(!tgt){
            return;
        }
        if(tgt.type==stg_const.TEX_CANVAS2D) {
            default_2d_shader.context = tgt.getContext("2d");
            if (!default_2d_shader.context)return;
            default_2d_shader.active = 1;
            default_2d_shader.context.setTransform(1, 0, 0, 1, 0, 0);
            default_2d_shader.context.globalAlpha=1;
            if (pro.background) {

                default_2d_shader.context.fillStyle = pro.background;
                default_2d_shader.context.fillRect(0, 0, tgt.width, tgt.height);
            }
            default_2d_shader.mode=0;
        }else if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.disable(_gl.DEPTH_TEST);
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, tgt.buffer||null);
            _gl.viewport(0,0,tgt.width,tgt.height);
            if(!default_2d_shader.glset){
                webglCompileShader(default_2d_shader);
                _webGlUniformInput(default_2d_shader,"uWindow",webgl2DMatrix(tgt.width,tgt.height));
                default_2d_shader.glset=1;
            }
            _gl.useProgram(default_2d_shader.program);
            default_2d_shader.context= _gl;
            default_2d_shader.mode=1;
            for(var i in default_2d_shader.dma_pool){
                for(var j in default_2d_shader.dma_pool[i]) {
                    default_2d_shader.dma_pool[i][j].clean();
                    default_2d_shader.dma_pool[i][j].frameStart();
                }
            }
            if (pro.background) {
                var c=getRgb(pro.background);
                _gl.clearColor(c[0]/255,c[1]/255,c[2]/255,1);
                _gl.clear(_gl.COLOR_BUFFER_BIT);
            }
        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    object_frame:function(object,render,procedureName){
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
            var t;
            var q=this.dma_pool[object.layer];
            if(!q) {
                q = {};
                this.dma_pool[object.layer]=q;
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
            if(!render.webgl || object.update){
                render.webgl=1;
                var tex=stg_textures[render.texture];
                /*
                if(!tex.webgl){
                    tex.webgl=1;
                    tex.gltex= _gl.createTexture();
                    _gl.bindTexture(_gl.TEXTURE_2D, tex.gltex);
                    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, tex);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                    _gl.generateMipmap(_gl.TEXTURE_2D);
                }
                */
                //if(!tex.width){
                //}
                object.render.aUVT=webglTextureAssign(null,object.render.uvt,tex.width,tex.height);
                object.render.aRec=new Float32Array([
                        render.offset[0]*render.scale[0],render.offset[1]*render.scale[1],
                    (render.offset[0]+render.uvt[2])*render.scale[0],render.offset[1]*render.scale[1],
                    (render.offset[0]+render.uvt[2])*render.scale[0],(render.offset[1]+render.uvt[3])*render.scale[1],
                        render.offset[0]*render.scale[0],(render.offset[1]+render.uvt[3])*render.scale[1]
                    ]);
                var ta=(object.alpha===undefined?1:object.alpha/255);
                object.render.aColor= new Float32Array([1, 1, 1, ta, 1, 1, 1, ta, 1, 1, 1, ta, 1, 1, 1, ta]);
            }
            t.parseObject(object);
        }
    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){
        if(this.mode==0) {
            var pool = this.pool;
            var l;
            var tn;
            var obj;
            var i;
            var c = this.context;
            for (l = 0; l < pool.length; l++) {
                if (pool[l]) {
                    for (tn in pool[l]) {
                        var tex = stg_textures[tn];
                        if (tex) {
                            //if (tex)
                                for (i = 0; i < pool[l][tn].length; i++) {
                                    var obj = pool[l][tn][i];
                                    c.globalAlpha=obj.alpha;
                                    c.setTransform(1, 0, 0, 1, obj.cx, obj.cy);
                                    c.rotate(obj.r);
                                    c.drawImage(tex, obj.uvt[0], obj.uvt[1], obj.uvt[2], obj.uvt[3], obj.cmx, obj.cmy, obj.uvt[2], obj.uvt[3]);
                                }
                        }
                    }
                }
            }
        }else if(this.mode==1){
            _gl.useProgram(this.program);
            for(var q in this.dma_pool){
                for(var i in this.dma_pool[q]) {
                   // _gl.bindTexture(_gl.TEXTURE_2D, stg_textures[i].gltex);
                   // _gl.activeTexture(_gl.TEXTURE0);
                    _webGlUniformInput(this, "texture", stg_textures[i]);
                    this.dma_pool[q][i].draw();
                }
            }
        }
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
        "gl_FragColor  = vColor * smpColor;" +
        //"gl_FragColor  = vColor;" +
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
    dma_pool:[]
};
stg_shaders.testShader=default_2d_shader;

var default_2d_misc_shader={
    active:0,
    context:null,
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
                if(pro.transparent){
                    default_2d_misc_shader.context.clearRect(0, 0, tgt.width, tgt.height);
                }else {
                    default_2d_misc_shader.context.fillStyle = pro.background;
                    default_2d_misc_shader.context.fillRect(0, 0, tgt.width, tgt.height);
                }
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
                        if(obj.fontsize)c.font=""+obj.fontsize+ c.font;
                        if(obj.bold)c.font="bold "+ c.font;

                        c.textAlign=obj.textAlign||"start";
                        c.textBaseline=obj.textBaseline||"top";

                        if(obj.backcolor){
                            c.fillStyle=obj.backcolor||"#000";
                            c.fillText(obj.text||"",obj.x+ obj.cx+0.8, obj.y+obj.cy+0.8,obj.maxWidth);
                        }
                        c.fillStyle=obj.color||"#FFF";
                        c.fillText(obj.text||"",obj.x+ obj.cx, obj.y+obj.cy,obj.maxWidth);
                        if(obj.outcolor){
                            c.beginPath();
                            c.strokeStyle=obj.outcolor||"#000";
                            c.strokeText(obj.text||"",obj.x+ obj.cx, obj.y+obj.cy,obj.maxWidth);
                            c.stroke();
                            c.closePath();
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
stg_shaders.testShader2=default_2d_misc_shader;

function renderCreate2DTemplateA1(sTemplateName,sTextureName,vX,vY,vW,vH,iColorX,iColorY,oRotate,iCenter){
    renderCreate2DTemplateA1[sTemplateName]={
        tex:sTextureName,
        data:[vX,vY,vW,vH,iColorX,iColorY,oRotate],
        c:iCenter,
        mode:1
    };
    return  renderCreate2DTemplateA1[sTemplateName];
}
function renderCreate2DTemplateA2(sTemplateName,sTextureName,vX,vY,vW,vH,iColorX,iColorY,oRotate,iCenter){
    renderCreate2DTemplateA1[sTemplateName]={
        tex:sTextureName,
        data:[vX,vY,vW,vH,iColorX,iColorY,oRotate],
        c:iCenter,
        mode:2
    };
    return  renderCreate2DTemplateA1[sTemplateName];
}

function renderApply2DTemplate2(oRender,sTemplate,iColor){
    var oTemplate=renderCreate2DTemplateA1[sTemplate];
    iColor=iColor%(oTemplate.data[4]*oTemplate.data[5]);
    var idy=iColor%oTemplate.data[5];
    var idx=(iColor-idy)/oTemplate.data[5];
    oRender.uvt=[oTemplate.data[0]+oTemplate.data[2]*idx,oTemplate.data[1]+oTemplate.data[3]*idy,oTemplate.data[2],oTemplate.data[3]];
    oRender.texture=oTemplate.tex;
    oRender.offset = [0, 0];
    oRender.rotate = oTemplate.data[6];
    if(oTemplate.c){
        renderApply2DCenter(oRender);
    }
}

function renderApply2DTemplate3(oRender,sTemplate,iColor){
    var oTemplate=renderCreate2DTemplateA1[sTemplate];
    iColor=iColor%(oTemplate.data[4]*oTemplate.data[5]);
    var idx=iColor%oTemplate.data[4];
    var idy=(iColor-idx)/oTemplate.data[4];
    oRender.uvt=[oTemplate.data[0]+oTemplate.data[2]*idx,oTemplate.data[1]+oTemplate.data[3]*idy,oTemplate.data[2],oTemplate.data[3]];
    oRender.texture=oTemplate.tex;
    oRender.offset = [0, 0];
    oRender.rotate = oTemplate.data[6];
    if(oTemplate.c){
        renderApply2DCenter(oRender);
    }
}

function _renderApply2DTemplate(oRender,oTemplate,iColor){
    oRender.uvt=[oTemplate.data[0]+oTemplate.data[4]*iColor,oTemplate.data[1]+oTemplate.data[5]*iColor,oTemplate.data[2],oTemplate.data[3]];
    oRender.texture=oTemplate.tex;
    oRender.offset = [0, 0];
    oRender.rotate = oTemplate.data[6];
    if(oTemplate.c){
        renderApply2DCenter(oRender);
    }
}
function renderObjectApply2DTemplate(object,sTemplate,iColor){
    if(!object.render)object.render=new StgRender("sprite_shader");
    renderApply2DTemplate(object.render,sTemplate,iColor);
}

function renderApply2DTemplate(oRender,sTemplate,iColor){

    oRender=oRender||stg_target.render;
    if(oRender.render)oRender=oRender.render;
    var oTemplate=renderCreate2DTemplateA1[sTemplate];
    if(oTemplate.mode==2){
        return renderApply2DTemplate3(oRender,sTemplate,iColor);
    }
    oRender.uvt=[oTemplate.data[0]+oTemplate.data[4]*iColor,oTemplate.data[1]+oTemplate.data[5]*iColor,oTemplate.data[2],oTemplate.data[3]];
    oRender.texture=oTemplate.tex;
    oRender.offset = [0, 0];
    oRender.rotate = oTemplate.data[6];
    if(oTemplate.c){
        renderApply2DCenter(oRender);
        if(oTemplate.data[2]<0)oRender.offset[0]=-oRender.offset[0];
        if(oTemplate.data[3]<0)oRender.offset[1]=-oRender.offset[1];
    }
}
function renderApply2DCenter(oRender,vaCenterXY){
    if(!vaCenterXY){
        oRender.offset[0]=-oRender.uvt[2]/2;
        oRender.offset[1]=-oRender.uvt[3]/2;
    }else{
        oRender.offset[0]=-vaCenterXY[0];
        oRender.offset[1]=-vaCenterXY[1];
    }
}

function renderApplyFullTexture(oRender,sTextureName){
    oRender.texture=sTextureName;
    var tex=stg_textures[sTextureName];
    if(tex.type==stg_const.TEX_IMG){
        oRender.uvt=[0,0,tex.width,tex.height];
        oRender.offset=[0,0];
        oRender.rotate=0;
        oRender.scale=[1,1];

    }else{
        oRender.uvt=[0,tex.height,tex.width,-tex.height];
        oRender.offset=[0,0];
        oRender.rotate=0;
        oRender.scale=[1,1];

    }
}

function RenderText(x,y,text,noadd){
    var ax = this;
    ax.render = new StgRender("testShader2");
    miscApplyAttr(ax.render,{type:2,x:x,y:y,color:"#000"});
    ax.layer = 100;
    ax.render.text=text||"";
    if(!noadd)stgAddObject(ax);
    /*
    var ay = new StgObject;
    ay.render = new StgRender("testShader2");

    miscApplyAttr(ay.render,{type:0,x:x,y:y,w:200,h:40,color:"#000" +
        ""});
    ay.layer = 90;
    ay.base={type:stg_const.BASE_COPY,target:ax,auto_remove:1};
    ay.script=function(){
        stg_target.render.w=50+stg_target.base.target.render.text.length*15;
    };
    stgAddObject(ay);
    */
    //return ax;
}
RenderText.prototype.setText=function(text){
    this.render.text=text;
    return this;
};
RenderText.prototype.setFont=function(fontname,size,color,backcolor){
    if(fontname||size){
        this.render.font=(size?''+(size>>0)+'px ':'')+(fontname?fontname:'');
    }
    this.render.color=color;
    this.render.backcolor=backcolor;
};



var zoomer_shader={
    active:0,
    context:null,
    shader_init:function(){}, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){
        var pro=stg_procedures[procedureName];
        if(!pro){
            console.log("Cannot initialize zoomer: bad procedure name ["+procedureName+"]");
            console.log(stg_procedures);
            return;
        }
        zoomer_shader.pro=pro;
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];
        if(!tgt){
            return;
        }
        if(tgt.type!=stg_const.TEX_CANVAS2D)return;
        zoomer_shader.context=tgt.getContext("2d");
        if(!zoomer_shader.context)return;
    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    object_frame:function(object,render,procedureName){
        if(!render.texture)return;
        var c=zoomer_shader.context;
        var prot= stg_textures[zoomer_shader.pro.render_target];
        var tex=stg_textures[render.texture];
        c.drawImage(tex,0,0,tex.width,tex.height,0,0,prot.width,prot.height);
    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){
    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    shader_finalize_procedure:function(procedureName){
    } //移除procedure时会执行一次，用来释放资源
};
stg_shaders.testZoomer=zoomer_shader;



var default_2d_prim_shader={
    active:0,
    context:null,
    glset:0,
    mode:0,
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
        var pro=stg_procedures[procedureName];
        if(!pro){

            return;
        }
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];
        if(!tgt){
            return;
        }
        if(tgt.type==stg_const.TEX_CANVAS2D) {
            return;
        }else if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.disable(_gl.DEPTH_TEST);
            _gl.bindFramebuffer(_gl.FRAMEBUFFER, tgt.buffer||null);
            _gl.viewport(0,0,tgt.width,tgt.height);
            if(!this.glset){
                webglCompileShader(this);
                _webGlUniformInput(this,"uWindow",webgl2DMatrix(tgt.width,tgt.height));
                this.glset=1;
            }
            _gl.useProgram(this.program);
            this.context= _gl;
            this.mode=1;

        }

    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    object_frame:function(object,render,procedureName){
            var vtx=new Float32Array(render.count*2);
            var tex=new Float32Array(render.count*2);
            for(var i=0;i<render.count;i++){
                vtx[i*2]=object.pos[0]+render.vtx[i][0];
                vtx[i*2+1]=object.pos[1]+render.vtx[i][1];
                tex[i*2]=render.tex[i][0];
                tex[i*2+1]=render.tex[i][1];
            }
            if (!render.texture)return;
            var t=stg_textures[render.texture];
            _webGlUniformInput(this,"aPosition",vtx);
            _webGlUniformInput(this,"aTexture",tex);
            _webGlUniformInput(this, "texture",t );
            if(t.script)t.script();
            _gl.drawArrays(render.mode,0,render.count);

    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){

    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    shader_finalize_procedure:function(procedureName){

    }, //移除procedure时会执行一次，用来释放资源
    template:{},

    vertex:"attribute vec2 aPosition;" +
        //"attribute vec2 aOffset;" +
        "attribute vec2 aTexture;" +
        "attribute vec4 aColor;" +
       // "attribute float aRotate;" +
        "" +
        "uniform vec2 uWindow;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vColor = aColor;" +
        "vec2 r = aPosition;" +
        "vec4 t = vec4( (r + aPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
        "gl_Position = t;" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main(void){" +
        "vec4 smpColor = texture2D(texture, vTexture);" +
        "gl_FragColor  = vColor * smpColor;" +
        //"gl_FragColor  = vColor;" +
        "}",
    input:{
        aPosition:[0,2,null,0,1,0],
        //aOffset:[0,2,null,0,0,1],
        aTexture:[0,2,null,0,0,1],
        aColor:[0,4,null,0,0,3],
      //  aRotate:[0,1,null,0,1,4],
        uWindow:[1,2],
        texture:[2,0]
    },
    dma_pool:[]
};
stg_shaders["prim_shader"]=default_2d_prim_shader;

function RenderPrim(){
    StgRender.call(this,"prim_shader");
    this.count=0;
    this.mode=stg_const.TRIANGLES;
    this.vtx=[];
    this.tex=[];

}
RenderPrim.prototype.setVertexNum=function(n){
    if(n>this.vtx.length){
        for(var i=0;i<n-this.count;i++){
            this.vtx.push([0,0]);
            this.tex.push([0,0]);
        }
    }
    this.count=n;
};


