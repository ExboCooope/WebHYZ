/**
 * Created by Exbo on 2015/12/5.
 */
var default_3d_shader={
    active:0,
    context:null,
    glset:0,
    drawer:null,
    mode:0,
    shader_init:function(){
        if(_gl) {
            webglCompileShader(default_3d_shader);
            //_gl.enable(_gl.BLEND);
           // _gl.blendEquation(_gl.FUNC_ADD);
           // _gl.blendFunc(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA);
            default_3d_shader.drawer=function(e){
                if(!e.matM)e.matM=EMat4().setPerspective(0.6,0.6/stg_frame_w*stg_frame_h,1,100).newLookAt([1,0,0],[0,0,0],[0,1,0]);
                _webGlUniformInput(default_3d_shader,"uModel", e.matM);
                if(e.update || !e._vb1){
                    e._vb1=_webGlUniformInput(default_3d_shader,"aPosition",EVec(e.out_vertex));
                    e._tb1=_webGlUniformInput(default_3d_shader,"aTexture",EVec(e.out_texture));
                }else{
                    _webGlReput(default_3d_shader,"aPosition",  e._vb1);
                    _webGlReput(default_3d_shader,"aTexture",  e._tb1);
                }
                for(var i= 0;i< e.faces.length;i++){
                    var f= e.faces[i];
                    var t=stg_textures[f.tex]|| e.texture[f.tex];
                    _webGlUniformInput(default_3d_shader,"texture",t);
                    if(f.mode==EFace.TRIANGLES){
                        _gl.drawArrays(_gl.TRIANGLES, f.sn, f.pn);
                    }else if(f.mode==EFace.TRIANGLE_FAN){
                        _gl.drawArrays(_gl.TRIANGLE_FAN, f.sn, f.pn);
                    }else if(f.mode==EFace.TRIANGLE_STRIP){
                        _gl.drawArrays(_gl.TRIANGLE_STRIP, f.sn, f.pn);
                    }
                }
            }
            Set3DFog([0.8,0.8,0.8,1],10,20);
        }
    }, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){

        default_3d_shader.pool=[];
        default_3d_shader.active=0;
        var pro=stg_procedures[procedureName];
        if(!pro){
            console.log("Cannot initialize shader 2d: bad procedure name ["+procedureName+"]");
            console.log(stg_procedures);
            return;
        }
        default_3d_shader.pro=pro;
        var _matV=pro.matV;
        if(!_matV)_matV=EMat4().setIdentity();
        _gl.useProgram(default_3d_shader.program);

        _webGlUniformInput(default_3d_shader,"uView", _matV);
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];

        if(!tgt){
            return;
        }
        if(tgt.type==stg_const.TEX_CANVAS2D) {
            /*
            default_3d_shader.context = tgt.getContext("2d");
            if (!default_3d_shader.context)return;
            default_3d_shader.active = 1;
            default_3d_shader.context.setTransform(1, 0, 0, 1, 0, 0);
            default_3d_shader.context.globalAlpha=1;
            if (pro.background) {

                default_3d_shader.context.fillStyle = pro.background;
                default_3d_shader.context.fillRect(0, 0, tgt.width, tgt.height);
            }
            default_3d_shader.mode=0;
            */
        }else if(tgt.type==stg_const.TEX_CANVAS3D || tgt.type==stg_const.TEX_CANVAS3D_TARGET){
            _gl.enable(_gl.DEPTH_TEST);
            _gl.viewport(0,0,tgt.width,tgt.height);
            default_3d_shader.context= _gl;
            default_3d_shader.mode=1;
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
    object_frame:function(object,render,procedureName){
        if(default_3d_shader.mode==0) {
            /*
            var pool = default_3d_shader.pool;
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
            */
        }else if(default_3d_shader.mode==1){
            if(!render.mesh)return;
            default_3d_shader.drawer(render.mesh);
        }
    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:function(procedureName){
        /*
        if(default_3d_shader.mode==0) {
            var pool = default_3d_shader.pool;
            var l;
            var tn;
            var obj;
            var i;
            var c = default_3d_shader.context;
            for (l = 0; l < pool.length; l++) {
                if (pool[l]) {
                    for (tn in pool[l]) {
                        var tex = stg_textures[tn];
                        if (tex) {
                            if (tex)
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
        }else if(default_3d_shader.mode==1){
            for(var q in default_3d_shader.dma_pool){
                for(var i in default_3d_shader.dma_pool[q]) {
                    _gl.bindTexture(_gl.TEXTURE_2D, stg_textures[i].gltex);
                    _gl.activeTexture(_gl.TEXTURE0);
                    _webGlUniformInput(default_3d_shader, "texture", 0);
                    default_3d_shader.dma_pool[q][i].draw();
                }
            }
        }
        */
    }, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    shader_finalize_procedure:function(procedureName){
        default_3d_shader.pool=[];
    }, //移除procedure时会执行一次，用来释放资源
    template:{},

    vertex:"attribute vec3 aPosition;" +
        "attribute vec2 aTexture;" +
        "uniform mat4 uView;" +
        "uniform mat4 uModel;" +
        "varying vec2 vTexture;" +
        "varying vec3 pos;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "gl_Position = uView*uModel*vec4(aPosition,1.0);" +
        "pos = vec3(gl_Position);" +
        "}",
    fragment:"precision mediump float;" +
        "uniform sampler2D texture;" +
        "varying vec2 vTexture;" +
        "uniform vec4 fogColor;" +
        "varying vec3 pos;" +
        "uniform vec2 fogArea;"+
        "void main(void){" +
        "vec4 smpColor = texture2D(texture, vTexture);" +
  //      "vec4 c=vec4(0.8,0.8,0.8,1.0);" +
        "float c=smoothstep(fogArea[0],fogArea[1],pos[2]);" +
        "gl_FragColor  =smpColor*(1.0-c)+c*fogColor;" +
        //"gl_FragColor  =fogColor;" +
        "}",
    input:{
        aPosition:[0,3,null,0,1,0],
        aTexture:[0,2,null,0,0,2],
        uView:[1,16],
        uModel:[1,16],
        fogColor:[1,4],
        fogArea:[1,2],
        texture:[2,0]
    },
    dma_pool:[]
};
//stg_shaders.test3d=default_3d_shader;

function Set3DFog(color,near,far){
    _webGlUniformInput(default_3d_shader,"fogColor", color);
    _webGlUniformInput(default_3d_shader,"fogArea", [near,far]);
}