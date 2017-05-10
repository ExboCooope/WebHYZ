/**
 * Created by Exbo on 2017/2/2.
 */

///

var WGLA={

};

var WGLConst={
    DATA_INTEGER:1,
    DATA_FLOAT:2,
    DECLARE_UNIFORM:1,
    DECLARE_ATTRIBUTE:2,
    DECLARE_SAMPLER:3,
    VAR_FLOAT:1,
    VAR_INT:2
};

WGLA.newBuffer=function(glcontext,databytelength,datagroupcount,datacount,datatype){

    if(!glcontext.null_buffer)glcontext.null_buffer=glcontext.createBuffer();
    return new WGLA._WGLBuffer(glcontext,databytelength,datagroupcount,datacount,datatype);
}

//create a generic buffer
WGLA._WGLBuffer=function(glcontext,databytelength,datagroupcount,datacount,datatype){
    this.gl=glcontext;
    this.databytelength=databytelength;
    this.datagroupcount=datagroupcount;
    this.datacount=datacount;
    this.glbuffer=glcontext.createBuffer();
    this.datatype=datatype;
    this.gldatatype=0;
    var data_selector;
    var gl=this.gl;
    if(databytelength==1){
        data_selector=Uint8Array;
        this.gldatatype=gl.UNSIGNED_BYTE;
    }else if(databytelength==2){
        data_selector=Uint16Array;
        this.gldatatype=gl.UNSIGNED_SHORT;
    }else if(databytelength==4){
        if(!datatype || datatype==WGLConst.DATA_FLOAT){
            data_selector=Float32Array;
            this.gldatatype=gl.FLOAT;
        }else{
            data_selector=Int32Array;
            this.gldatatype=gl.INT;
        }
    }else if(databytelength==8){
      //  data_selector=Float64Array;
       // this.gldatatype
    }
    this.buffer=new data_selector(datagroupcount*datacount);
};

//returns a dataview at target location
WGLA._WGLBuffer.prototype.locateData=function(dataid,datacount){
    dataid=dataid||0;
    datacount=datacount||this.datacount-dataid;
   // return new DataView(this.buffer,dataid*this.databytelength*this.datagroupcount,datacount*this.databytelength*this.datagroupcount);
    return this.buffer.slice(dataid*this.datagroupcount,(dataid+datacount)*this.datagroupcount);
};

WGLA._WGLBuffer.prototype.uploadData=function(dataid,datacount,usage){
    var gl=this.gl;
    usage=usage||gl.DYNAMIC_DRAW;
    if(!dataid && !datacount){
        //full upload
        gl.bindBuffer(gl.ARRAY_BUFFER,this.glbuffer);
        gl.bufferData(gl.ARRAY_BUFFER,this.buffer,usage);
    }else{
        dataid=dataid||0;
        datacount=datacount||this.datacount-dataid;
        gl.bindBuffer(gl.ARRAY_BUFFER,this.glbuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER,dataid*this.databytelength*this.datagroupcount,this.locateData(dataid,datacount));
    }
};

WGLA._WGLBuffer.prototype.uploadIndexData=function(dataid,datacount,usage){
    var gl=this.gl;
    usage=usage||gl.DYNAMIC_DRAW;
    if(!dataid && !datacount){
        //full upload
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glbuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,this.buffer,usage);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.null_buffer);
    }else{
        dataid=dataid||0;
        datacount=datacount||this.datacount-dataid;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glbuffer);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,dataid*this.databytelength*this.datagroupcount,this.locateData(dataid,datacount));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.null_buffer);
    }
};

WGLA._WGLBuffer.prototype.useBuffer=function(shaderattributeid){
    var gl=this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER,this.glbuffer);
    gl.vertexAttribPointer(shaderattributeid,this.datagroupcount,this.gldatatype,false,this.datagroupcount*this.databytelength,0);
};

WGLA._WGLBuffer.prototype.useIndexBuffer=function(){
    var gl=this.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.glbuffer);
};

WGLA._WGLBuffer.prototype.clearContent=function(){
    delete this.buffer;
    var gl=this.gl;
    gl.deleteBuffer(this.glbuffer);
    delete this.gl;
};

WGLA._WGLShader=function(glcontext,vssource,fssource,shaderprofile){
    this.gl=glcontext;
    var gl=this.gl;
    var fragmentShader = gl.compileSingleShader(fssource,gl.FRAGMENT_SHADER);
    var vertexShader = gl.compileSingleShader(vssource,gl.VERTEX_SHADER);

    // Create the shader program

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    this.fragment_shader=fragmentShader;
    this.vertex_shader=vertexShader;
    this.program=shaderProgram;
    this.profile={};
};

WGLA._WGLShader.prototype.useShader=function(){
    this.gl.useProgram(this.program);
};

WGLA._WGLShader.prototype.addProfile=function(sourcevarname,inputname,declaretype,vartype,length){
    inputname=inputname||sourcevarname;
    var pf=[sourcevarname,declaretype,vartype,length,0,0,0];
    this.useShader();
    var gl=this.gl;
    if(declaretype==WGLConst.DECLARE_UNIFORM || declaretype==WGLConst.DECLARE_SAMPLER){
        pf[4]=gl.getUniformLocation(this.program,sourcevarname);
    }else if(declaretype==WGLConst.DECLARE_ATTRIBUTE){
        pf[4]=gl.getAttribLocation(this.program,sourcevarname);
        pf[6]=gl.createBuffer();
    }
    this.profile[inputname]=pf;
};

WGLA._WGLShader.prototype.inputData=function(inputname,data){
    var gl=this.gl;
    var t=this.profile[inputname];
    if(!t)return;
    if(t[1]==WGLConst.DECLARE_UNIFORM){
        if(t[2]==WGLConst.VAR_FLOAT){
            if(t[3]==1){
                gl.uniform1fv(t[4],data);
            }else if(t[3]==2){
                gl.uniform2fv(t[4],data);
            }else if(t[3]==3){
                gl.uniform3fv(t[4],data);
            }else if(t[3]==4){
                gl.uniform3fv(t[4],data);
            }else if(t[3]==16){
                gl.uniformMatrix4fv(t[4],false,data);
            }else if(t[3]==9){
                gl.uniformMatrix3fv(t[4],false,data);
            }
        }else if(t[2]==WGLConst.VAR_INT){
            if(t[3]==1){
                gl.uniform1iv(t[4],data);
            }else if(t[3]==2){
                gl.uniform2iv(t[4],data);
            }else if(t[3]==3){
                gl.uniform3iv(t[4],data);
            }else if(t[3]==4){
                gl.uniform3iv(t[4],data);
            }
        }
    }else if(t[1]==WGLConst.DECLARE_ATTRIBUTE){
        if(!data)return;
        gl.enableVertexAttribArray(t[4]);
        if(data.glbuffer){
            data.useBuffer(t[4])
        }else{
            gl.bindBuffer(gl.ARRAY_BUFFER, t[6]);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
            gl.vertexAttribPointer(t[4], t[3], gl.FLOAT, false, t[3]*4, 0);
        }
    }else if(t[1]==WGLConst.DECLARE_SAMPLER){

    }
}

WebGLRenderingContext.prototype.compileSingleShader=function(shadertext,type){
    var gl=this;
    var shader = gl.createShader(type);
    gl.shaderSource(shader, shadertext);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};


WebGLRenderingContext.prototype.GenerateLegacyContent=function(){
    this._legacy={};
};

WGLA.functions={};

WGLA.functions.glBegin=function(glmode){
    this._legacy.drawmode=glmode;
    this._legacy.drawinst={
        texturecoord:[],
        vertexcoord:[],
        color:[],
        pn:0,
        currentcolor:this._legacy.currentcolor
    };
};

WGLA.functions.glEnd=function(){

};










