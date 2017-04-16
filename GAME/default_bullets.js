/**
 * Created by Exbo on 2015/11/21.
 */

var BULLET={};

function stgCreate2DBulletTemplateA1(sTemplateName,sTextureName,vX,vY,vW,vH,iColorX,iColorY,oRotate,iCenter,oHitBox,oMisc){
    BULLET[sTemplateName]={
        tex:sTextureName,
        data:[vX,vY,vW,vH,iColorX,iColorY,oRotate],
        c:iCenter,
        hit:oHitBox,
        misc:oMisc
    };
}

var LASER={};

var _hit_box_tiny=new StgHitDef();
_hit_box_tiny.range=1;
var _hit_box_small=new StgHitDef();
_hit_box_small.range=2;
var _hit_box_medium=new StgHitDef();
_hit_box_medium.range=4;
var _hit_box_large=new StgHitDef();
_hit_box_large.range=14;
var _hit_box_laser={};

var PIUP=90*PI180;

function bullet00Assignment(){
    stgCreateImageTexture("bullet","bullet00.png");
    stgCreate2DBulletTemplateA1("sKWD","bullet",0,0,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("sBD","bullet",0,16,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("sZYD","bullet",0,32,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("sFZMD","bullet",0,48,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("sXD","bullet",0,64,16,16,16,0,PIUP,1,_hit_box_small,{self_rotate:0.1});
    stgCreate2DBulletTemplateA1("sLD","bullet",0,80,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("sZD","bullet",0,96,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("sXY","bullet",0,112,16,16,16,0,PIUP,1,_hit_box_small,null);
    stgCreate2DBulletTemplateA1("sXHY","bullet",0,128,16,16,16,0,PIUP,1,_hit_box_small,null);
    stgCreate2DBulletTemplateA1("sMD","bullet",0,144,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});

    stgCreate2DBulletTemplateA1("mXD","bullet",0,160,32,32,32,0,PIUP,1,_hit_box_medium,{self_rotate:0.1});
    stgCreate2DBulletTemplateA1("mZY","bullet",0,192,32,32,32,0,PIUP,1,_hit_box_medium,null);
    stgCreate2DBulletTemplateA1("mHDD","bullet",0,224,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mDD","bullet",0,256,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mMD","bullet",0,288,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});

    stgCreate2DBulletTemplateA1("tDD","bullet",0,320,8,8,8,0,PIUP,1,_hit_box_tiny,null);
    stgCreate2DBulletTemplateA1("tQD","bullet",128,320,16,16,16,0,PIUP,1,_hit_box_small,{move_rotate:1});

    stgCreate2DBulletTemplateA1("mLD","bullet",0,336,32,32,32,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mLD2","bullet",0,368,32,32,32,0,PIUP,1,_hit_box_small,{move_rotate:1});

    stgCreate2DBulletTemplateA1("lDY","bullet",0,448,64,64,64,0,PIUP,1,_hit_box_large,{move_rotate:1});

    stgCreate2DBulletTemplateA1("plMainShot","siki_body",0,144,16,16,16,0,0,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("plMainShot2","siki_body",192,144,64,16,0,0,0,1,_hit_box_large,{move_rotate:1,alpha:150});
    stgCreate2DBulletTemplateA1("plMainShot3","siki_body",0,144+32,64,16,0,0,0,1,_hit_box_large,{move_rotate:1,alpha:150});

    stgAddShader("sprite_shader",default_2d_shader);
    stg_bullet_parser=render01BltParser;
}

function render01BltParser(object,name){
    object.render=new StgRender("sprite_shader");
    object.color=object.color||0;
    _renderApply2DTemplate(object.render,BULLET[name],object.color);
    object.hitdef={};
    miscApplyAttr(object.hitdef,BULLET[name].hit);
    object.hitdef.pos=[0,0,0];
    object.hitdef.rpos=[0,0,0];
    if(BULLET[name].misc) {
        miscApplyAttr(object,BULLET[name].misc)
    }
    if(name=="tDD"){
        hyz.dot_pool.add(object);
    }
}

function HeadedLaserA1(max_frame_length,x,y,w){
    this.poslist=new Float32Array(max_frame_length*2);
    this.maxn=max_frame_length;
    this.objlist=[];
    this.last_pos=[x,y];
    this.poslisttail=0;
    this.width=w;
}


HeadedLaserA1.prototype.finalize=function(){
    this.plist.clearContent();
    this.clist.clearContent();
    this.ilist.clearContent();
    this.tlist.clearContent();
};

HeadedLaserA1.prototype.init=function(){
    this.plist=WGLA.newBuffer(_gl,4,2,2*this.maxn,WGLConst.DATA_FLOAT);
    this.clist=WGLA.newBuffer(_gl,4,4,2*this.maxn,WGLConst.DATA_FLOAT);
    this.ilist=WGLA.newBuffer(_gl,2,1,2*this.maxn,WGLConst.DATA_INTEGER);
    var buf=this.clist.buffer;
    var n=4*2*this.maxn;
    var i;
    for(i=0;i<n;i++){
        buf[i]=1.0;
    }
    this.clist.uploadData();
    this.tlist=WGLA.newBuffer(_gl,4,2,2*this.maxn,WGLConst.DATA_FLOAT);
    buf=this.tlist.buffer;
    n=this.maxn;
    for(i=0;i<n;i++){
        buf[i*4]=0.0;
        buf[i*4+1]=i/n;
        buf[i*4+2]=1.0;
        buf[i*4+3]=i/n;
    }
    this.tlist.uploadData();
    this.plist.uploadData();
    this.ilist.uploadIndexData();
    stgSetPositionA1(this,this.last_pos[0],this.last_pos[1]);


    this._n=0;
    this.n=this.maxn-1;
    this.objlist[0]=this;
    this.render=new StgRender("basic_shader");
    this.render.texture="123";
};

HeadedLaserA1.prototype.on_render=function(gl){

    GlBufferInput(hyzPrimitive2DShader, "aPosition",this.plist);
    GlBufferInput(hyzPrimitive2DShader, "aColor",this.clist);
    GlBufferInput(hyzPrimitive2DShader, "aTexture",this.tlist);
    var n=this._n;
    var i=0;
    var poslisthead=(this.poslisttail-1+this.maxn)%this.maxn;
    for(i=0;i<n;i++){
       // if(this.objlist[i] && !this.objlist[i].remove){
            this.ilist.buffer[i*2]=poslisthead*2;
            this.ilist.buffer[i*2+1]=poslisthead*2+1;
      //  }
        poslisthead--;
        if(poslisthead<0)poslisthead=this.maxn-1;
    }

    if(this._n>1){
        this.ilist.uploadIndexData(0,0,gl.STREAM_DRAW);
        this.ilist.useIndexBuffer();
      //  gl.drawArrays(gl.TRIANGLE_STRIP,0,this._n*2);
        gl.drawElements(gl.TRIANGLE_STRIP,this._n*2,gl.UNSIGNED_SHORT,0);
    }
}

HeadedLaserA1.prototype.beforehit=function(){
    var i;
    var n=this.n;
    var _n=this._n;
    var b;
    var w=this.width;
    if(n>this.maxn)n=this.maxn;
    if(n>this.frame)n=this.frame;
    var poslisthead=(this.poslisttail)%this.maxn;
    this.poslisttail++;
    this.poslist[poslisthead*2]=this.pos[0];
    this.poslist[poslisthead*2+1]=this.pos[1];
    if(this.frame>1){
        b =(poslisthead-1+this.maxn)%this.maxn*2;
        var r0=atan2(this.pos[1]-this.poslist[b+1],this.pos[0]-this.poslist[b])+PI/2;
        var ddx=cos(r0)*w;
        var ddy=sin(r0)*w;
        b=(b+2)%(this.maxn*2);
        this.plist.buffer[b*2]=this.pos[0]+ddx;
        this.plist.buffer[b*2+1]=this.pos[1]+ddy;
        this.plist.buffer[b*2+2]=this.pos[0]-ddx;
        this.plist.buffer[b*2+3]=this.pos[1]-ddy;

        if(this.frame==2){
            this.plist.buffer[0]=this.poslist[0]+ddx;
            this.plist.buffer[1]=this.poslist[1]+ddy;
            this.plist.buffer[2]=this.poslist[0]-ddx;
            this.plist.buffer[3]=this.poslist[1]-ddy;
            this.plist.uploadData(0,4);
        }else{
            this.plist.uploadData(b,2);
        }
    }
    /*
    for(i=0;i<n;i++){

        if(i>_n){
            this.objlist[i]=new StgBullet();
            this.objlist[i].hitdef=StgHitDef();
            this.objlist[i].hitdef.setPointA1(0,0,this.width/2.0);
        }
        var a=this.objlist[i];
        if(a && !a.remove) {
           b =(poslisthead-i+this.maxn)%this.maxn*2;
            stgSetPositionA1(a,this.poslist[b],this.poslist[b+1]);
            stgRefreshPosition(a);
        }
    }*/
    this._n=n;
};

HeadedLaserA1.prototype.addPosToHead=function(pos){
    var poslisthead=(this.poslisttail+this.n)%this.maxn;
    this.poslist.set(pos,poslisthead*2);
    var i;
    for(i=0;i<this.n;i++){
        var a=this.objlist[i];
        if(a && !a.remove){
            var b=(this.poslisttail+this.n-i)%this.maxn*2;
            a.pos[0]=this.poslist[b];
            a.pos[1]=this.poslist[b+1];
            stgRefreshPosition(a);
        }
    }
};


HeadedLaserA1.prototype.setLength=function(ilength){

};
