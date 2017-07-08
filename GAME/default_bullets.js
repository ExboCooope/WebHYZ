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

function stgCreate2DBulletTemplateA2(sTemplateName,sTemplateNameList,delay){
    var a=BULLET[sTemplateNameList[0]];
    BULLET[sTemplateName]={
        tex:a.tex,
        data:a.data,
        c: a.c,
        hit: a.hit,
        misc: a.misc,
        anim: sTemplateNameList,
        delay:delay
    };
}

var LASER={};

var _hit_box_tiny=new StgHitDef();
_hit_box_tiny.range=2;
var _hit_box_small=new StgHitDef();
_hit_box_small.range=4;
var _hit_box_medium=new StgHitDef();
_hit_box_medium.range=6;
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
    stgCreate2DBulletTemplateA1("tJD","bullet",128,27*16,16,16,16,0,PIUP,1,_hit_box_tiny,{self_rotate:0.1});

    stgCreate2DBulletTemplateA1("mLD","bullet",0,336,32,32,32,0,PIUP,1,_hit_box_small,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mLD2","bullet",0,368,32,32,32,0,PIUP,1,_hit_box_small,{move_rotate:1});

    stgCreate2DBulletTemplateA1("lDY","bullet",0,448,64,64,64,0,PIUP,1,_hit_box_large,{move_rotate:1});

    stgCreate2DBulletTemplateA1("plMainShot","siki_body",0,144,16,16,16,0,0,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("plMainShot2","siki_body",192,144,64,16,0,0,0,1,_hit_box_large,{move_rotate:1,alpha:150});
    stgCreate2DBulletTemplateA1("plMainShot3","siki_body",0,144+32,64,16,0,0,0,1,_hit_box_large,{move_rotate:1,alpha:150});

    stgCreate2DBulletTemplateA1("mGHD0","bullet",256,384,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mGHD1","bullet",256,384+32,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mGHD2","bullet",256,384+64,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mGHD3","bullet",256,384+96,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA2("mGHD",["mGHD0","mGHD1","mGHD2","mGHD3"],6);

    stgCreate2DBulletTemplateA1("mSZD0","bullet",256,384-128,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mSZD1","bullet",256,384+32-128,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mSZD2","bullet",256,384+64-128,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("mSZD3","bullet",256,384+96-128,32,32,32,0,PIUP,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA2("mSZD",["mSZD0","mSZD1","mSZD2","mSZD3"],6);


    stgAddShader("sprite_shader",default_2d_shader);
    stg_bullet_parser=render01BltParser;

    stgCreateImageTexture("break_circle","th14_BreakCircle.png");
    renderCreate2DTemplateA1("bcircle","break_circle",0,0,256,256,0,0,0,1);

}

function render01AnimeFunc(){
    this._anim++;
    if(this._anim>this._animt){
        this._anim=0;
        this._animi++;
        if(this._animi>=this._anims.length){
            this._animi=0;
        }
        _renderApply2DTemplate(this.render,BULLET[this._anims[this._animi]],this.color);
        this.update=true;
    }
}

function bulletChangeType(object,name,color){
    object.color=color;
    _renderApply2DTemplate(object.render,BULLET[name],object.color);
    object.hitdef={};
    miscApplyAttr(object.hitdef,BULLET[name].hit);
    object.hitdef.pos=[0,0,0];
    object.hitdef.rpos=[0,0,0];
    if(BULLET[name].misc) {
        miscApplyAttr(object,BULLET[name].misc)
    }
    if(BULLET[name].anim){
        object._anim=0;
        object._animt=BULLET[name].delay;
        object._animi=0;
        object._anims=BULLET[name].anim;
        object._system=render01AnimeFunc;
    }
    object.update=1;
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
    if(BULLET[name].anim){
        object._anim=0;
        object._animt=BULLET[name].delay;
        object._animi=0;
        object._anims=BULLET[name].anim;
        object._system=render01AnimeFunc;

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
    b=(poslisthead-1+this.maxn)%this.maxn*2;
    for(i=0;i<n;i++){
        var sy=(this.tex_data[2]-this.tex_data[0])*i/this.maxn+this.tex_data[0];
        this.tlist.buffer[b*2+1]=this.tex_data[1];
        this.tlist.buffer[b*2]=sy;
        this.tlist.buffer[b*2+3]=this.tex_data[3];
        this.tlist.buffer[b*2+2]=sy;
        b=b-2;
        if(b<0)b+=this.maxn*2;
    }
    this.tlist.uploadData();
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

HeadedLaserA1.prototype.SetTexture=function(sTexture,sx1,sy1,sx2,sy2,dir){
    this.render=new StgRender("basic_shader");
    this.render.texture=sTexture;
    var w=stg_textures[sTexture].width;
    var h=stg_textures[sTexture].height;
    this.tex_data=[sx1/w,sy1/h,sx2/w,sy2/h];
    this.tex_dir=dir;
};

HeadedLaserA1.prototype.setLength=function(ilength){

};

//mode: 0 complex    1 no child control
function ComplexLaser(maxlen,mode){

    this.objlist=[];
    this.texture_speed=0;
    this.texture_pos=0;
    this.texture_width=16;
    this.texture_length=100;
    this.hit_witdh=8;
    this.width_add=0.2;
    this.head_witdh=1.0;
    this.target_length=0;
    this.laser_active=1;
    this.max_length=maxlen;
    this.layer=stg_const.LAYER_BULLET;
    this.move=new StgMove();
    this.mode=mode||0;
   // renderCreatePrimitiveRender(this);
    this.render=new StgRender("laser_shader");
}

ComplexLaser.prototype.formLaser=function(objlist){
    this.objlist=objlist;
};

ComplexLaser.prototype.setTexture=function(texname,x1,y1,x2,y2,dir){
    this.render.texture=texname;
    this.u1=x1;
    this.u2=x2;
    this.u3=x2-x1+1;
    this.v1=y1;
    this.v2=y2;
    this.v3=y2-y1+1;
    this.texdir=dir;
    this.dir=dir;
    this.texture_width=dir?this.u3:this.v3;
    this.texture_length=dir?this.v3:this.u3;
    this.vtx.setTextureName(texname);
};

ComplexLaser.prototype.init=function(){
    this.vtx=new HyzPrimitive2DVertexList(this.max_length*2+4);
    this.olist=WGLA.newBuffer(_gl,4,2,this.max_length*2+4,WGLConst.DATA_FLOAT);
    stgPlaySE("se_laser");
};

ComplexLaser.prototype.finalize=function(){
    this.vtx.clear();
    this.olist.clearContent();
};

ComplexLaser.prototype._system=function(){
    if(this.remove)return;
    //计算控制点数
    var p=this.objlist;
    var n0= p.length;
    if(!this.tail){
        this.tail={laser_active:1,keep:1};
        if(n0){
            stgSetPositionA1(this.tail,p[n0-1].pos[0],p[n0-1].pos[1]);

        }else{
            stgSetPositionA1(this.tail,this.pos[0],this.pos[1]);
        }
    }
    var i;
    var n=n0+2;
    //计算宽度
    var w=0;
    var wa=this.width_add;
    for(i=0;i<n0;i++){
        w=w+wa;
        if(w>1)w=1;
        if(!p[i].laser_active){
            w=0;
        }
        p[i].laser_width=w;
    }
    w=0;
    for(i=n0-1;i>=0;i--){
        w=w+wa;
        if(w>1)w=1;
        if(!p[i].laser_active){
            w=0;
            if(p[i].hitdef){
                p[i].hitdef=0;
            }
        }
        if(p[i].laser_width>w)p[i].laser_width=w;
    }
    //计算角度
    var temp=[0,0,0];
    var vtx=this.vtx;
    var u0=this.texture_pos;
    var u1=this.texture_pos;
    var v0=1;
    var v1=3;
    var ob=this.olist.buffer;
    var u2=this.dir?this.texture_length:this.texture_width;
    var v2=!this.dir?this.texture_length:this.texture_width;
    if(this.texdir==0){
        u0=this.u1+this.texture_pos;
        u1=u0;
        v0=this.v1;
        v1=this.v2;
    }else{
        u0=this.u1;
        u1=this.u2;
        v0=this.v1+this.texture_pos;
        v1=v0;
    }
    this.laser_width=0;
    this.tail.laser_width=0;
    var witdh=this.texture_width/2;
    w=0;
    var l=0;
    var hw=this.hit_witdh;
    temp[1]=cos(this.move.speed_angle)*w*witdh;
    temp[2]=sin(this.move.speed_angle)*w*witdh;
    if(this.dir){
        u2=w;//||0.0001;
        ob[i*4]=w;
        ob[i*4+1]=l;
        ob[i*4+2]=-w;
        ob[i*4+3]=l;
    }else{
        v2=w;//||0.0001;
        ob[i*4]=l;
        ob[i*4+1]=w;
        ob[i*4+2]=l;
        ob[i*4+3]=-w;

    }
    vtx.setVertexRaw(0,this.pos[0]+temp[2],this.pos[1]-temp[1],u2,v2,1,1,1,1);
    vtx.setVertexRaw(1,this.pos[0]-temp[2],this.pos[1]+temp[1],u2,v2,1,1,1,1);
    for(i=1;i<n;i++){
        var a=((i==n-1)?this.tail:p[i-1]);
       var  b=(i>1?p[i-2]:this);
        sqrt2d(b.pos[0]-a.pos[0], b.pos[1]- a.pos[1],temp);
        l+=temp[0];
        w=a.laser_width*witdh;
       // w=witdh;
        if(!this.dir){
            v2=w;//||0.0001;
            ob[i*4]=l;
            ob[i*4+1]=w;
            ob[i*4+2]=l;
            ob[i*4+3]=-w;
        }else{
            u2=w;//||0.0001;
            ob[i*4]=w;
            ob[i*4+1]=l;
            ob[i*4+2]=-w;
            ob[i*4+3]=l;
        }
        temp[2]*= w;
        temp[1]*= w;
        vtx.setVertexRaw(i*2,a.pos[0]+temp[2],a.pos[1]-temp[1],u2,v2,1,1,1,1);
        vtx.setVertexRaw(i*2+1,a.pos[0]-temp[2],a.pos[1]+temp[1],u2,v2,1,1,1,1);
        if(a.laser_active){
            var thw=hw* a.laser_width;
            if(!a.hitdef)a.hitdef=new StgHitDef();
            if(this.mode==0){
                if(false){//temp[0]>thw+2){
                    a.hitdef.setLaserA2(a.pos[0], a.pos[1],thw, b.pos[0], b.pos[1],thw);
                }else{
                    a.hitdef.setPointA1(0,0,thw);
                    //a.hitdef.update(a);
                }
            }else{
                if(false){//temp[0]>thw+2){
                    a.hitdef.setLaserA2(a.pos[0], a.pos[1],thw, b.pos[0], b.pos[1],thw);
                }else{
                    a.hitdef.setPointA1(a.pos[0],a.pos[1],thw);
                    //a.hitdef.update(a);
                }
                a.side=this.side;
                stgAddHitDef(a);
            }
        }
    }
    this._n=n;
    if(this.stop || (this.move&&this.move.speed==0)) {

    }else{
        if(this.target_length>0){
            this.target_length--;
            a={laser_active:1,type:stg_const.OBJ_BULLET,keep:1};
            if(this.mode==0)stgAddObject(a);
            if(n%4!=0){
                a.grazed=[1,1];
            }
            stgSetPositionA1(a,this.tail.pos[0],this.tail.pos[1]);
            p.push(a);
            n++;
        }else{
            stgSetPositionA1(this.tail, p[n0-1].pos[0], p[n0-1].pos[1]);
        }
        for(i=n-2;i>0;i--){
             a=p[i-1];
             b=i>1?p[i-2]:this;
           stgSetPositionA1(a, b.pos[0], b.pos[1]);
        }
    }

    vtx.update(1,1,1);
};
ComplexLaser.prototype.on_render=function(gl){
    if(this.blend)this.blend();
    this.vtx.useLaser();
    this.olist.uploadData();
    GlBufferInput(hyzLaserShader, "aOffset",this.olist);
    var t=stg_textures[this.render.texture];
    var tw= t.width;
    var th= t.height;
    if(!this.dir){
        _webGlUniformInput(hyzLaserShader,"uTexture0",[this.u1/tw,(this.v1+this.v2)/(th*2)]);
        _webGlUniformInput(hyzLaserShader,"uTexture1",[(this.u2-this.u1)/tw,(this.v2-this.v1)/(th*2)]);
    }else{
        _webGlUniformInput(hyzLaserShader,"uTexture0",[(this.u1+this.u2)/(tw*2),this.v1/(th*2)]);
        _webGlUniformInput(hyzLaserShader,"uTexture2",[(this.u2-this.u1)/(tw*2),(this.v2-this.v1)/(th*2)]);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP,0,this._n*2);
    if(this.blend)blend_default();
};

ComplexLaser.prototype.destroyLaser1=function(){
    stgDeleteObject(this);
    if(this.tail)stgDeleteObject(this.tail);
    if(this.mode==0) {
        for (var i = 0; i < this.objlist.length; i++) {
            stgDeleteObject(this.objlist[i]);
        }
    }
};