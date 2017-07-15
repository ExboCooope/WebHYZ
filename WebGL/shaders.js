/**
 * Created by Exbo on 2015/10/27.
 */

/*
This file contains things related to WebGL
A sample of shader
A direct memory accessor
这个文件包含和WebGL有关的内容，其中有一个渲染器，Webgl的简单封装和一个DMA直接存储器
*/
var WebGLShader={};
WebGLShader.SpriteShaderSimple={
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
    }
};

var _gl;
var webgl_canvas;

//从Canvas中
function webglCreateFromCanvas(canvas){

    var gl;
    var arg={preserveDrawingBuffer:true, premultipliedAlpha: true};
    gl=canvas.getContext("webgl",arg)||canvas.getContext("experimental-webgl",arg);
    if(!gl){
        console.log("Cannot Create Webgl Context.");
        alert("初始化WebGL失败，已切换为普通Canvas模式，请刷新页面");
        stgSaveData("render_type",1);
    }
    _gl=gl;
    //gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
    webgl_canvas=canvas;
    stg_const.TRIANGLES=gl.TRIANGLES;
    stg_const.TRIANGLE_FAN=gl.TRIANGLE_FAN;
    stg_const.TRIANGLE_STRIP=gl.TRIANGLE_STRIP;
    stg_const.LINE_LOOP=gl.LINE_LOOP;
    stg_const.LINES=gl.LINES;
}

function webglCompileShader(shader){
    var gl=_gl;
    var fragmentShader = _webGlCompileSingle(shader.fragment,gl.FRAGMENT_SHADER);
    var vertexShader = _webGlCompileSingle(shader.vertex,gl.VERTEX_SHADER);

    // Create the shader program

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl.useProgram(shaderProgram);
    for(var i in shader.input){
        var t=shader.input[i];
        if(t[0]==0) {
            t[2]=gl.getAttribLocation(shaderProgram,i);
        }else if(t[0]==1){
            t[2]=gl.getUniformLocation(shaderProgram,i);
        }else if(t[0]==2){
            t[2]=gl.getUniformLocation(shaderProgram,i);
        }
    }
    shader.program=shaderProgram;
}

function _webGlUniformInput(shader,text,value){
    var i=text;
    var t=shader.input[i];
    var gl=_gl;
    if(!t)return;
    if(t[0]==0) {
        var x= t.buffer? t.buffer:gl.createBuffer();
        t.buffer=x;
        gl.bindBuffer(gl.ARRAY_BUFFER, t.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(t[2]);
        gl.vertexAttribPointer(t[2], t[1], gl.FLOAT, false, t[1]*4, 0);
        return x;
    }else if(t[0]==1){
        if(t[1]==1){
            gl.uniform1fv(t[2],value);
        }else if(t[1]==2){
            gl.uniform2fv(t[2],value);
        }else if(t[1]==3){
            gl.uniform3fv(t[2],value);
        }else if(t[1]==4){
            gl.uniform4fv(t[2],value);
        }else if(t[1]==16){
            gl.uniformMatrix4fv(t[2],false,value);
        }else if(t[1]==9){
            gl.uniformMatrix3fv(t[2],false,value);
        }
    }else if(t[0]==2){

        var tex=value;
        if(!tex.webgl){
            tex.webgl=1;
            tex.gltex= _gl.createTexture();
            _gl.bindTexture(_gl.TEXTURE_2D, tex.gltex);
            _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, tex);

            if(POW2[tex.width] && POW2[tex.height]) {

                 _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST);
               // _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                _gl.generateMipmap(_gl.TEXTURE_2D);
            }else{
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
                _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);

            }
        }
        _gl.bindTexture(_gl.TEXTURE_2D, tex.gltex);
        if(t[1]==0){
            _gl.activeTexture(_gl.TEXTURE0);
        }else if(t[1]==1){
            _gl.activeTexture(_gl.TEXTURE1);
        }
        gl.uniform1i(t[2],t[1]);
    }
}
function _webGlReput(shader,text,value){
    var i=text;
    var t=shader.input[i];
    var gl=_gl;
    if(!t)return;
    if(t[0]==0) {
        var x=value;
        t.buffer=x;
        gl.bindBuffer(gl.ARRAY_BUFFER, t.buffer);
        gl.enableVertexAttribArray(t[2]);
        gl.vertexAttribPointer(t[2], t[1], gl.FLOAT, false, t[1]*4, 0);
        return x;
    }
}

function GlBufferInput(shader,text,value){
    var i=text;
    var t=shader.input[i];
    var gl=_gl;
    if(!t)return;
    if(t[0]==0) {
        value.useBuffer(t[2]);
    }
}

function webgl2DMatrix(w,h){
    var a=[
        2/w,-2/h
    ]
    return a;
}

function _webGlCompileSingle(text,type){
    var gl=_gl;
    var shader = gl.createShader(type);
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}
var DMAID=0;

//Direct memory accessor
function WebglDMA(shader,iDefaultCapability){
    var gl=_gl;
    this.buffers=[];
    this.glbuffers=[];
    this.usage=[];
    this.cap=iDefaultCapability;
    this.capa=iDefaultCapability;
    this.id=DMAID++;
    this.index=new Uint16Array(iDefaultCapability*6);
    this.indexbuffer=gl.createBuffer();
    this.indexn=0;
    this.lcnt=[];
    var j=0;
    for(var i in shader.input){

        var t= shader.input[i];
        if(t[0]==0) {
            j = t[5];
            this.lcnt[j] = t;
            this.buffers[j] = new Float32Array(iDefaultCapability * 4 * t[1]);
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
WebglDMA.prototype.invalidate=function(i){
    if(i<this.invalid_min)this.invalid_min=i;
    if(i>this.invalid_max)this.invalid_max=i;
};
WebglDMA.prototype.parseObject=function(oObject){
    if(!oObject.dma){
        oObject.dma=[];
    }
    var i;
    var j;
    var flush=0;
    var gl=_gl;
    if(oObject.dma[this.id]===undefined){
        flush=1;
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
                this.buffers[j]=new Float32Array(n*4*t[1]);
                this.buffers[j].set(sw);
                if(!t[4]){
                    gl.bufferData(gl.ARRAY_BUFFER,this.buffers[j],gl.DYNAMIC_DRAW);
                }
            }

            sw=this.index;
            this.index=new Uint16Array(n*6);
            this.index.set(sw);
            this.cap=this.cap+this.capa;


        }
        oObject.dma[this.id]=i;
        this.usage[i]=oObject;
    }
    i=oObject.dma[this.id]*4;
    this.index.set([i,i+1,i+2,i,i+2,i+3],this.indexn);
    this.indexn+=6;
    this.objectParser(this,oObject,oObject.dma[this.id],flush);
};

WebglDMA.prototype.clean=function(){
    for(var i in this.usage){
        if(this.usage[i]){
            if(this.usage[i].remove){
                this.deleteObject(this.usage[i]);
            }
        }
    }
};



WebglDMA.prototype.deleteObject=function(oObject){
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

WebglDMA.prototype.frameStart=function(){
    var gl=_gl;
 //   for(var j in this.lcnt){
  //      var t= this.lcnt[j];
 //       gl.enableVertexAttribArray(t[2]);
  //  }
    this.indexn=0;
    this.invalid_min=this.cap+1;
    this.invalid_max=-1;
};

WebglDMA.prototype.draw=function(){
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
            gl.bufferSubData(gl.ARRAY_BUFFER,this.invalid_min*4*t[1]*4,this.buffers[j].subarray(this.invalid_min*t[1]*4,(this.invalid_max+1)*t[1]*4));
        }
        gl.vertexAttribPointer(t[2], t[1], gl.FLOAT, false, t[1]*4, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indexbuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.index,gl.STREAM_DRAW);
    gl.drawElements(gl.TRIANGLES,this.indexn,gl.UNSIGNED_SHORT,0);
};


WebglDMA.prototype.release=function(){
    var j;
    var gl=_gl;
    for(j in this.usage){
        delete this.usage[j].dma[this.id];
    }
};


function shader1_object_parser(oDMA,oObject,iIndex,iNew){
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
     //   gl.bindBuffer(gl.ARRAY_BUFFER,oDMA.glbuffers[1]);
    //    gl.bufferSubData(gl.ARRAY_BUFFER,iIndex*8*4,oObject.render.aRec);
        oDMA.buffers[3].set(oObject.render.aColor,iIndex*16);
     //   gl.bindBuffer(gl.ARRAY_BUFFER,oDMA.glbuffers[3]);
      //  gl.bufferSubData(gl.ARRAY_BUFFER,iIndex*16*4,oObject.render.aColor);
        oDMA.buffers[2].set(oObject.render.aUVT,iIndex*8);
      //  gl.bindBuffer(gl.ARRAY_BUFFER,oDMA.glbuffers[2]);
      //  gl.bufferSubData(gl.ARRAY_BUFFER,iIndex*8*4,oObject.render.aUVT);
        oDMA.invalidate(iIndex);
    }
}

function new_test() {
    var test_object = {
        pos: [0, 0, 0],
        render: {
            aColor: new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
            // aRec:new Float32Array([0,0,1,0,1,1,0,1]),
            aRec: new Float32Array([-16, -16, 16, -16, 16, 16, -16, 16]),
            aUVT: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])
        }
    };
    return test_object;
}

function webglTextureAssign(tex,iUVT,w,h){
    var x, y,xn,yn;
    if(iUVT[2]<0) {
         x = (iUVT[0] - 0.1) / w;
         xn = (iUVT[0] + iUVT[2] + 0.1) / w;
    }else{
        x = (iUVT[0] + 0.1) / w;
        xn = (iUVT[0] + iUVT[2] - 0.1) / w;
    }
    if(iUVT[3]<0) {
        y = (iUVT[1] - 0.1) / h;
        yn = (iUVT[1] + iUVT[3] + 0.1) / h;
    }else {
        y = (iUVT[1] + 0.1) / h;
        yn = (iUVT[1] + iUVT[3] - 0.1) / h;
    }
    return new Float32Array([x,y,xn,y,xn,yn,x,yn]);
}