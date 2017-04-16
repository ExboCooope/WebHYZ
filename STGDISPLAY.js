/**
 * Created by Exbo on 2015/11/8.
 */
function createCanvas(iWidth,iHeight){
    var a=document.createElement("canvas");
    a.setAttribute("width",""+iWidth);
    a.setAttribute("height",""+iHeight);
    a.style.alignContent=""
    return a;
}

function createImage(sSource){
    var a=document.createElement("img");
    a.src=sSource;
    a.onload=function(){a.ready=1;};
    return a;
}

function stgCreateImageTexture(sTexName,sSource){
    if(stg_textures[sTexName])return;
    var a=createImage(sSource);
    a.type=stg_const.TEX_IMG;
    stg_textures[sTexName]=a;
}

function _runProcedure(sProcedure){
    var oProcedure=stg_procedures[sProcedure];
    var j;
    var s;
    if(!oProcedure)return;
    if(!oProcedure.active)return;
    for(j=0;j<oProcedure.shader_order.length;j++){
        if(oProcedure.shader_order[j]){
            s=stg_shaders[oProcedure.shader_order[j]];
            if(s.post_frame)s.post_frame(sProcedure);
        }
    }
    if(!oProcedure.no_object_frame) {
        for (var i in _pool) {
            if (_pool[i]) {
                if (_pool[i].active && _pool[i].render) {
                    if (oProcedure.layers[_pool[i].layer]) {
                        for (j = 0; j < oProcedure.shader_order.length; j++) {
                            if (oProcedure.shader_order[j]) {
                                if (_pool[i].render.shader_name == oProcedure.shader_order[j]) {
                                    s = stg_shaders[oProcedure.shader_order[j]];
                                    if(s.object_frame)s.object_frame(_pool[i], _pool[i].render, sProcedure);

                                }
                            }
                        }
                    }
                }
            }
        }
    }
    for(j=0;j<oProcedure.shader_order.length;j++){
        if(oProcedure.shader_order[j]){
            s=stg_shaders[oProcedure.shader_order[j]];
            if(s.draw_frame)s.draw_frame(sProcedure);

        }
    }
}

var _render_pool=[];

function _runProcedure0(){
    _render_pool=[];
    for (var i in _pool) {
        if (_pool[i]) {
            if (_pool[i].active && _pool[i].render) {
                if(!_render_pool[_pool[i].layer])_render_pool[_pool[i].layer]=[];
                _render_pool[_pool[i].layer].push(_pool[i]);
            }
        }
    }
}
function _runProcedure01(){
    /*
    for (var i in _pool) {
        if (_pool[i]) {
            if (_pool[i].active && _pool[i].render && _pool[i].immediate) {
                if(!_render_pool[_pool[i].layer])_render_pool[_pool[i].layer]=[];
                _render_pool[_pool[i].layer].push(_pool[i]);
            }
        }
    }
    */
}

function _runProcedure2(sProcedure){
    var oProcedure=stg_procedures[sProcedure];
    var j;
    var s;
    var i;
    if(!oProcedure)return;
    if(!oProcedure.active)return;
    for(j=0;j<oProcedure.shader_order.length;j++){
        if(oProcedure.shader_order[j]){
            s=stg_shaders[oProcedure.shader_order[j]];
            if(s.post_frame)s.post_frame(sProcedure);
        }
    }
    if(!oProcedure.no_object_frame) {
        for(j=0;j<=300;j++){
            if(oProcedure.layers[j]){
                var _pool=_render_pool[j];
                if(_pool){
                    for (var k = 0; k < oProcedure.shader_order.length; k++) {
                        if (oProcedure.shader_order[k]) {
                            s = stg_shaders[oProcedure.shader_order[k]];

                            if(s.post_layer)s.post_layer(oProcedure,j);
                            var tpn = _pool.length;
                            for (i = 0; i < tpn; i++) {
                                if (!_pool[i].remove) {
                                    if (_pool[i].render.shader_name == oProcedure.shader_order[k]) {
                                        if (s.object_frame)s.object_frame(_pool[i], _pool[i].render, sProcedure);
                                    }


                                }
                            }
                            if(s.draw_layer)s.draw_layer(oProcedure,j);
                        }
                    }
                }
           }
        }

    }
    for(j=0;j<oProcedure.shader_order.length;j++){
        if(oProcedure.shader_order[j]){
            s=stg_shaders[oProcedure.shader_order[j]];
            if(s.draw_frame)s.draw_frame(sProcedure);

        }
    }
}

function stgCreateCanvas(sName,iWidth,iHeight,iTextureType){
    if(stg_textures[sName])return stg_textures[sName];
    var a;
    if(iTextureType==stg_const.TEX_CANVAS3D_TARGET){
        a=new WebglRenderTarget(iWidth,iHeight);
        a.type = iTextureType;
        a.ready = 1;
        a.width = iWidth;
        a.height = iHeight;
        _addTexture(sName, a);

    }else {
        a = createCanvas(iWidth, iHeight);
        a.type = iTextureType;
        a.ready = 1;
        a.width = iWidth;
        a.height = iHeight;
        _addTexture(sName, a);
        if (iTextureType == stg_const.TEX_CANVAS3D) {
            webglCreateFromCanvas(a);
        }
        return a;
    }
    return a;
}

function stgResizeCanvas(sName,x0,y0,dx,dy,iWidth,iHeight,scale){
    var a=stg_textures[sName];
    a.width = iWidth*scale;
    a.height = iHeight*scale;
    a.style.left=(x0+dx*scale)+"px";
    a.style.top=(y0+dy*scale)+"px";
    return a;
}


function _addTexture(name,texture){
    stg_textures[name]=texture;
}

function stgShowCanvas(sName,vX,vY,vW,vH,vLayer){
    var a=stg_textures[sName];
    if(a.type==stg_const.TEX_CANVAS3D_TARGET)return;
    vW=vW|| a.width;
    vH=vH|| a.height;
    vX=vX||0;
    vY=vY||0;
    vLayer=vLayer||0;
    a.style.position="absolute";
    a.style.zIndex=""+(vLayer>>0);
    a.style.left=vX+"px";
    a.style.top=vY+"px";
    if(a.parentNode)return;
    document.body.appendChild(a);
}

function stgHideCanvas(sName){
    var a=stg_textures[sName];
    document.body.removeChild(a);
}

function stgClearCanvas(sName){
    var a=stg_textures[sName];
    if(a.type==stg_const.TEX_CANVAS2D) {
        a.width = a.width;
    }else if(a.type==stg_const.TEX_CANVAS3D){
        _gl.clearColor(0,0,0,0);
        _gl.clear(_gl.COLOR_BUFFER_BIT);
    }else if(a.type==stg_const.TEX_CANVAS3D_TARGET){
        a.use();
        _gl.clearColor(0,0,0,0);
        _gl.clear(_gl.COLOR_BUFFER_BIT);
        _gl.bindFramebuffer(_gl.FRAMEBUFFER,null);
    }
}

function stgLoadSE(sName,sSource){
    if(stg_textures[sName])return stg_textures[sName];
    var a=document.createElement("audio");
    a.type=stg_const.TEX_AUDIO;

    a.onload=function(){
        a.ready=1;
    };
    a.src=sSource;
    stg_textures[sName]=a;
    return a;
}

var _stg_se_pool=[];

function stgPlaySE(sName,area){
    var a;
    if(!sName || !(a=stg_textures[sName])){
        if(area){
            if(_stg_se_pool[area]){
                _stg_se_pool[area].pause();
                delete _stg_se_pool[area];
            }
        }
    }else {
        if (a.type == stg_const.TEX_AUDIO) {

            if (area) {
                if (_stg_se_pool[area]) {
                    _stg_se_pool[area].pause();
                }
                _stg_se_pool[area] = a;
            }
            a.currentTime = 0;
            a.play();
        }
    }
    return a;
}

function stgPauseSE(area){
    if(area){
            if(_stg_se_pool[area]){
                _stg_se_pool[area].pause();
            }
    }
}
function stgResumeSE(area){
    if(area){
        if(_stg_se_pool[area]){
            _stg_se_pool[area].play();
        }
    }
}

function stgCreateProcedure1(proceduername,targetcanvasname,minlayer,maxlayer,shader,backgroundcolor){
    var p2=new StgProcedure(targetcanvasname,minlayer,maxlayer);
    p2.shader_order=[shader];
    stg_procedures[proceduername] = p2;
    p2.background=backgroundcolor;
    return p2;
}

function stgCreateProcedure2(proceduername,targetcanvasname,minlayer,maxlayer,shaders,backgroundcolor){
    var p2=new StgProcedure(targetcanvasname,minlayer,maxlayer);
    p2.shader_order=shaders;
    stg_procedures[proceduername] = p2;
    p2.background=backgroundcolor;
    return p2;
}