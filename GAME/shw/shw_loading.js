/**
 * Created by Exbo on 2017/6/22.
 */
shw.loading={}
shw.loading.pre_load=function(){
    stgCreateImageTexture("loading","GAME/shw/LoadingBoard.png");
    stgCreateImageTexture("white","white.png");
    renderCreate2DTemplateA1("loading_gate1","loading",0,0,448,480,0,0,0,0);
    renderCreate2DTemplateA1("loading_gate2","loading",448,0,400,480,0,0,0,0);
    renderCreate2DTemplateA1("now_loading","loading",330,480,244,32,0,32,0,1);
};
shw.loading.left_gate={};
shw.loading.left_gate.init=function(){
    stgSetPositionA1(this,-448,0);
    this.layer=280;
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this,"loading_gate1",0);
    luaMoveTo(-54,0,30,1,this);
    this.start=0;
};
shw.loading.left_gate.script=function(){
    if(shw.loading.finish && this.frame>30 && this.start==0){
        this.start=1;
        luaMoveTo(-448,0,30,1,this);
    }
    if(this.start){
        this.start++;
        if(this.start>=30){
            stgDeleteSelf();
        }
    }
};
shw.loading.right_gate={};
shw.loading.right_gate.init=function(){
    stgSetPositionA1(this,320+448-54-29,0);
    this.layer=278;
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this,"loading_gate2",0);
    luaMoveTo(320-45,0,30,1,this);
    this.start=0;
};
shw.loading.right_gate.script=function(){
    if(shw.loading.finish && this.frame>30 && this.start==0){
        this.start=1;
        luaMoveTo(320+448-54-29,0,30,1,this);
    }
    if(this.start){
        this.start++;
        if(this.start>=30){
            stgDeleteSelf();
        }
    }
};

shw.loading.now_loading_base={};
shw.loading.now_loading_base.init=function(){
    stgSetPositionA1(this,320,360);
    this.layer=284;
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this,"now_loading",0);
    this.start=0;
};
shw.loading.now_loading_base.script=function(){
    if(shw.loading.finish){
        stgDeleteSelf();
    }
};
shw.loading.now_loading_bar={};
shw.loading.now_loading_bar.init=function(){
    stgSetPositionA1(this,320,360);
    this.layer=285;
    renderCreatePrimitiveRender(this);
    this.vtx=new HyzPrimitive2DVertexList(4);
    this.vtx.setColor(255,255,255,255);
    this.vtx.setTextureName("loading");
    this.render.texture="loading";
    this.start=0;
    this.left=stgCheckResources()+30;
};
shw.loading.now_loading_bar.script=function(){
    var f=30-this.frame;
    if(f<0)f=0;
    var a=stgCheckResources()+f;
    if(a){
        console.log(a,stg_to_load);
    }
    if(a>this.left)this.left=a;
    this.vtx.setPositionI(320-122,360-16,0);
    this.vtx.setTextureI(0,330,480+32,0);
    this.vtx.setPositionI(320-122,360+16,1);
    this.vtx.setTextureI(0,330,480+32+32,1);
    var rate=this.left?1-a/this.left:1;
    this.vtx.setPositionI(320-122+244*rate,360-16,2);
    this.vtx.setTextureI(0,330+244*rate,480+32,2);
    this.vtx.setPositionI(320-122+244*rate,360+16,3);
    this.vtx.setTextureI(0,330+244*rate,480+32+32,3);
    this.vtx.update(1,1,0);
    if(shw.loading.finish){
        stgDeleteSelf();
    }
};
shw.loading.now_loading_bar.on_render=function(gl){
    this.vtx.use();
    hyzSetPrimitiveOffset(0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
};
shw.loading.now_loading_bar.finalize=function(){
    this.vtx.clear();
};
shw.loading.init=function(){
    this.finish=0;
    this.resleft=stgCheckResources();
    stgAddObject(shw.loading.left_gate);
    stgAddObject(shw.loading.right_gate);
    stgShowCanvas("frame", 0, 0, 0, 0, 30);
    hyz.resolution.refresh();
    stg_ignore_input=3;
};
shw.loading.script=function(){
    var a=stgCheckResources();
    if(this.frame==30){
        this.resleft=a;
       if(this.resleft){
            stgAddObject(shw.loading.now_loading_base);
            stgAddObject(shw.loading.now_loading_bar);
       }
    }else if(this.frame>30){

    }
    if(this.frame>60 && a==0 && !this.finish){
        this.finish=1;
    }
    if(this.finish){
        this.finish++;
        if(this.finish>30){
            stgDeleteSelf();
            stg_ignore_input=0;
            stgShowCanvas("frame", 0, 0, 0, 0, 5);
            hyz.resolution.refresh();
        }
    }
};