/**
 * Created by Exbo on 2015/12/22.
 */
function EMesh(){
    this.matM=EMat4().setIdentity();
    this.matA=EMat4().setIdentity();
    this.vertex=[];
    this.texture=[];
    this.faces=[];
    this.out_vertex=null;
    this.out_texture=null;
}

EMesh.prototype.addVertex=function(a){
    var b=EVec4();
    b.set(a);
    var t=this.matA.mulV4(b).normalize4();
    this.vertex.push([t[0],t[1],t[2]]);
};

EMesh.prototype.addTriangle=function(p1,p2,p3,u1,u2,u3,texid){
    var n=this.vertex.length;
    this.addVertex(p1);
    this.addVertex(p2);
    this.addVertex(p3);
    var f=new EFace();
    f.index=[n,n+1,n+2];
    f.tex=texid;
    f.pn=3;
    f.mode=EFace.TRIANGLES;
    f.texa=[u1,u2,u3];
    this.faces.push(f);
};


EMesh.prototype.addTriangle2=function(p1,p2,p3,p4,u1,u2,u3,u4,texid) {
    var n=this.vertex.length;
    this.addVertex(p1);
    this.addVertex(p2);
    this.addVertex(p3);
    this.addVertex(p4);
    var f=new EFace();
    f.index=[n,n+1,n+2,n,n+2,n+3];
    f.tex=texid;
    f.pn=6;
    f.mode=EFace.TRIANGLES;
    f.texa=[u1,u2,u3,u1,u3,u4];
    this.faces.push(f);
};

EMesh.prototype.setTexture=function(id,tex){
    this.texture[id]=tex;
};

EMesh.prototype.compile=function(){
    this.out_vertex=[];
    this.out_texture=[];
    var i,j;
    for(i=0;i<this.faces.length;i++){
        var f=this.faces[i];
        f.sn=this.out_vertex.length/3;
       // if(f.mode==EFace.TRIANGLES){
            for(j=0;j<f.pn;j++){
                this.out_texture.push(f.texa[j][0],f.texa[j][1]);
                this.out_vertex.push(this.vertex[f.index[j]][0],this.vertex[f.index[j]][1],this.vertex[f.index[j]][2]);
            }
      //  }
    }
};

function EFace(){
    this.mode=0;
    this.index=[];
    this.pn=0;
    this.texa=[];
    this.tex=0;
    this.sn=0;
}
EFace.TRIANGLES=0;
EFace.TRIANGLE_FAN=1;
EFace.TRIANGLE_STRIP=2;


