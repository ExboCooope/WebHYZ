/**
 * Created by Exbo on 2015/12/16.
 */

/*
* 格式：
* 以小写对应动词开头的为以自身为输入的运算，并且保存到自身
* 以set开头的为抛弃原来的值，设置新的值
* 以new开头的为以本体和参数运算得到新的对象
*
*
* 以数字结尾的，为本体对象长度
* 以S数字结尾的，为本体对象长度，同时参数为单一数
* 以M数字结尾的，为矩阵阶数，参数也为矩阵
* 以V数字开头的，为矩阵阶数，同时参数为向量
* 不以数字结尾的为通用版，但是性能较差
* 都返回运算结果
*
* 本对象作为Float32Array存在，可以直接输入uniform4fv
* 本对象可以以下标直接访问内部
* 本对象部分方法支持输入向量或数组
*
* 如果想要临时设置新的对象，可以以工厂函数处理一个数组或对象进行克隆
* */


//构造函数（工厂函数）
function EVec(a){
    return new Float32Array(a);
}
function EVec3(a){
    return a? new Float32Array(a): new Float32Array(3);
}
function EVec4(a){
    return a? new Float32Array(a): new Float32Array(4);
}
function EMat4(a){
    return a? new Float32Array(a): new Float32Array(16);
}

//基本运算
Float32Array.prototype.addS=function(a){
    for(var i=0;i<this.length;i++){
        this[i]+=a;
    }
    return this;
};
Float32Array.prototype.subS=function(a){
    for(var i=0;i<this.length;i++){
        this[i]-=a;
    }
    return this;
};
Float32Array.prototype.not=function(){
    for(var i=0;i<this.length;i++){
        this[i]=-this[i];
    }
    return this;
};
Float32Array.prototype.normalize=function(){
    var q=0;
    var i;
    for(i=0;i<this.length;i++){
        q+=this[i]*this[i];
    }
    if(q){
        q=1/Math.sqrt(q);
        for(i=0;i<this.length;i++){
            this[i]*=q;
        }
    }
    return this;
};
Float32Array.prototype.add=function(a){
    for(var i=0;i<this.length;i++){
        this[i]+=a[i];
    }
    return this;
};
Float32Array.prototype.sub=function(a){
    for(var i=0;i<this.length;i++){
        this[i]-=a[i];
    }
    return this;
};
Float32Array.prototype.mul=function(a){
    for(var i=0;i<this.length;i++){
        this[i]*=a[i];
    }
    return this;
};
Float32Array.prototype.mulS=function(a){
    for(var i=0;i<this.length;i++){
        this[i]*=a;
    }
    return this;
};
Float32Array.prototype.div=function(a){
    for(var i=0;i<this.length;i++){
        this[i]/=a[i];
    }
    return this;
};
//Use mulS(1/a) for divS
Float32Array.prototype.dot=function(a){
    var t=0;
    for(var i=0;i<this.length;i++){
        t+=this[i]*a[i];
    }
    return t;
};
//3阶向量
Float32Array.prototype.newCross3=function(a){
    var b=new Float32Array(3);
    b[0]=this[1]*a[2]-this[2]*a[1];
    b[1]=this[2]*a[0]-this[0]*a[2];
    b[2]=this[0]*a[1]-this[1]*a[0];
    return b;
};
Float32Array.prototype.normalize3=function(){
    var q=this[0]*this[0]+this[1]*this[1]+this[2]*this[2];
    var i;
    if(q){
        q=1/Math.sqrt(q);
        this[0]*=q;
        this[1]*=q;
        this[2]*=q;
    }
    return this;
};
Float32Array.prototype.normalize4=function(){
    if(this[3]){
        this[0]/=this[3];
        this[1]/=this[3];
        this[2]/=this[3];
        this[3]=1;
    }
    return this;
};

//矩阵
Float32Array._IdentityM4=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
Float32Array.prototype.setIdentity=function(){
    this.set(Float32Array._IdentityM4);
    return this;
};

//矩阵乘
Float32Array.prototype.newMulM4=function(a){
    var b=new Float32Array(16);
    b[0]=this[0]*a[0]+this[4]*a[1]+this[8]*a[2]+this[12]*a[3];
    b[1]=this[1]*a[0]+this[5]*a[1]+this[9]*a[2]+this[13]*a[3];
    b[2]=this[2]*a[0]+this[6]*a[1]+this[10]*a[2]+this[14]*a[3];
    b[3]=this[3]*a[0]+this[7]*a[1]+this[11]*a[2]+this[15]*a[3];
    b[4]=this[0]*a[4]+this[4]*a[5]+this[8]*a[6]+this[12]*a[7];
    b[5]=this[1]*a[4]+this[5]*a[5]+this[9]*a[6]+this[13]*a[7];
    b[6]=this[2]*a[4]+this[6]*a[5]+this[10]*a[6]+this[14]*a[7];
    b[7]=this[3]*a[4]+this[7]*a[5]+this[11]*a[6]+this[15]*a[7];
    b[8]=this[0]*a[8]+this[4]*a[9]+this[8]*a[10]+this[12]*a[11];
    b[9]=this[1]*a[8]+this[5]*a[9]+this[9]*a[10]+this[13]*a[11];
    b[10]=this[2]*a[8]+this[6]*a[9]+this[10]*a[10]+this[14]*a[11];
    b[11]=this[3]*a[8]+this[7]*a[9]+this[11]*a[10]+this[15]*a[11];
    b[12]=this[0]*a[12]+this[4]*a[13]+this[8]*a[14]+this[12]*a[15];
    b[13]=this[1]*a[12]+this[5]*a[13]+this[9]*a[14]+this[13]*a[15];
    b[14]=this[2]*a[12]+this[6]*a[13]+this[10]*a[14]+this[14]*a[15];
    b[15]=this[3]*a[12]+this[7]*a[13]+this[11]*a[14]+this[15]*a[15];
    return b;
};

Float32Array.prototype.mulV4=function(a){
    var b=new Float32Array(4);
    b[0]=this[0]*a[0]+this[4]*a[1]+this[8]*a[2]+this[12]*a[3];
    b[1]=this[1]*a[0]+this[5]*a[1]+this[9]*a[2]+this[13]*a[3];
    b[2]=this[2]*a[0]+this[6]*a[1]+this[10]*a[2]+this[14]*a[3];
    b[3]=this[3]*a[0]+this[7]*a[1]+this[11]*a[2]+this[15]*a[3];
    return b;
};

Float32Array.prototype.mulM4=function(a){
    this.set(this.newMulM4(a));
    return this;
};

Float32Array.prototype.translateXYZ=function(x,y,z){
    this[12]+=this[0]*x+this[4]*y+this[8]*z;
    this[13]+=this[1]*x+this[5]*y+this[9]*z;
    this[14]+=this[2]*x+this[6]*y+this[10]*z;
    this[15]+=this[3]*x+this[7]*y+this[11]*z;
    return this;
};

//投影矩阵
Float32Array.prototype.setLookAt=function(eye,center,up){
    var fd=EVec(center).sub(eye).normalize3();
    var fud=EVec(up).normalize3();
    var fc=fd.newCross3(fud).normalize3();
    var fu=fc.newCross3(fd).normalize3();
    this.set([fc[0],fu[0],-fd[0],0,fc[1],fu[1],-fd[1],0,fc[2],fu[2],-fd[2],0,0,0,0,1]);
    this.translateXYZ(-eye[0],-eye[1],-eye[2]);
    return this;
};
Float32Array.prototype.newLookAt=function(eye,center,up){
    return EVec(this).mulM4(EMat4().setLookAt(eye,center,up));
};
Float32Array.prototype.newLookTo=function(eye,dir,len,up){
    return EVec(this).mulM4(EMat4().setLookAt(eye,EVec(eye).add(EVec(dir).normalize3().mulS(len)),up));
};

Float32Array.prototype.setPerspective=function(tanX,tanY,near,far){
    var w=2*near*tanX;
    var h=2*near*tanY;
    this.set([-1/tanX,0,0,0,0,1/tanY,0,0,0,0,(far+near)/(near-far),-1,0,0,2*near*far/(near-far),0]);
    return this;
};
