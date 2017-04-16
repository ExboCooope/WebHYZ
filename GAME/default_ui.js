/**
 * Created by Exbo on 2015/12/6.
 */
var default_ui_shader={
    active:0,
    context:null,
    glset:0,
    mode:0,
    shader_init:function(){
        if(_gl) {
            webglCompileShader(default_ui_shader);
            _gl.enable(_gl.BLEND);
            _gl.blendEquation(_gl.FUNC_ADD);
            _gl.blendFunc(_gl.SRC_ALPHA,_gl.ONE_MINUS_SRC_ALPHA);
        }
    }, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){
        default_ui_shader.pool=[];
        default_ui_shader.active=0;
        var pro=stg_procedures[procedureName];
        var pro_pool=pro.pool;
        var tgt_n=pro.render_target;
        var tgt=stg_textures[tgt_n];
        if(!tgt){
            return;
        }

        if(document.webkitIsFullScreen){
            var tx=window.screen.availWidth;
            var ty=window.screen.availHeight;
            if(tx/640>ty/480){
                tx=ty/480*640;
            }else{
                ty=tx/640*480;
            }
            var tt=window.screen.availTop;
            var ts=window.screen.availLeft;

            webgl_canvas.style.left=((ts+(window.screen.availWidth-tx)/2)>>0)+"px";
            webgl_canvas.style.top=((tt+(window.screen.availHeight-ty)/2)>>0)+"px";
            webgl_canvas.width=tx;
            webgl_canvas.height=ty;
            _last_full_screen=1;

        }else{
            if(_last_full_screen){
                webgl_canvas.style.left="0px";
                webgl_canvas.style.top="0px";
                webgl_canvas.width=_o_width;
                webgl_canvas.height=_o_height;
                _last_full_screen=0;
            }else{
                _o_width=webgl_canvas.width;
                _o_height=webgl_canvas.height;
            }
        }

        _gl.viewport(0,0,tgt.width,tgt.height);

        _gl.useProgram(default_ui_shader.program);
        _webGlUniformInput(default_ui_shader,"uWindow",webgl2DMatrix(pro.o_width,pro.o_height));
        _gl.bindFramebuffer(_gl.FRAMEBUFFER,null);
        _gl.disable(_gl.DEPTH_TEST);
        for(var i=0;i<pro_pool.length;i++){
            if(pro_pool[i] && pro_pool[i].texture){
                var p=pro_pool[i];
                var k=stg_textures[pro_pool[i].texture];
                if(!k|| p.alpha==0)continue;
                if(!p.pos)p.pos=[0,0,0];
                if(!p.w)p.w= k.width;
                if(!p.h)p.h= k.height;
                var pa= p.alpha;
                _webGlUniformInput(default_ui_shader,"aPosition",new Float32Array([
                    p.pos[0], p.pos[1],p.pos[0], p.pos[1]+ p.h,p.pos[0]+ p.w, p.pos[1]+ p.h,
                    p.pos[0], p.pos[1],p.pos[0]+ p.w, p.pos[1]+ p.h,p.pos[0]+ p.w, p.pos[1]]));
                if(k.type==stg_const.TEX_CANVAS3D_TARGET) {
                    _webGlUniformInput(default_ui_shader, "aTexture", new Float32Array([
                        0,1, 0, 0, 1, 0,
                        0, 1, 1, 0, 1, 1]));
                }else{
                    _webGlUniformInput(default_ui_shader, "aTexture", new Float32Array([
                        0, 0, 0, 1, 1, 1,
                        0, 0, 1, 1, 1, 0]));
                }
                _webGlUniformInput(default_ui_shader,"aColor",new Float32Array([
                    1,1,1,pa, 1,1,1,pa, 1,1,1,pa,
                    1,1,1,pa, 1,1,1,pa, 1,1,1,pa]));
                if(!k.webgl){
                    k.webgl=1;
                    k.gltex= _gl.createTexture();
                    _gl.bindTexture(_gl.TEXTURE_2D, k.gltex);
                    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, k);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
                }else {
                    _gl.bindTexture(_gl.TEXTURE_2D, k.gltex);

                    if (k.type == stg_const.TEX_CANVAS2D) {
                        if (!k.no_update) {
                            _gl.bindTexture(_gl.TEXTURE_2D, k.gltex);
                            _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, k);
                            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
                            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
                            _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
                        }
                    }
                }

                _gl.activeTexture(_gl.TEXTURE0);
                _webGlUniformInput(default_ui_shader, "texture", k);

                _gl.drawArrays(_gl.TRIANGLES,0,6);
            }
        }


    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    object_frame:null, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    draw_frame:null, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    shader_finalize_procedure:function(procedureName){
    }, //移除procedure时会执行一次，用来释放资源
    template:{},

    vertex:"attribute vec2 aPosition;" +
        "attribute vec2 aTexture;" +
        "attribute vec4 aColor;" +
        "" +
        "uniform vec2 uWindow;" +
        "varying vec2 vTexture;" +
        "varying vec4 vColor;" +
        "void main( void ){" +
        "vTexture = aTexture;" +
        "vColor = aColor;" +
        "vec4 t = vec4( (aPosition)*uWindow+vec2(-1.0,1.0) , 0.0 , 1.0 );" +
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
        aTexture:[0,2,null,0,0,2],
        aColor:[0,4,null,0,0,3],
        uWindow:[1,2],
        texture:[2,0]
    },
    procedure_1:{
        o_width:640,
        o_height:480,
        pool:[
            {texture:"back",alpha:1},{texture:"frame",alpha:0,pos:[32,16]},{texture:"ui",alpha:1},{texture:"pause",alpha:0}
        ]
    }
};

function zoomerSetFrameAlpha(a){
    default_ui_shader.procedure_1.pool[1].alpha=a;
}


