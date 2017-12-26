/**
 * Created by Exbo on 2017/9/6.
 */
stgCreateImageTexture("th_res","res/thres.png");
renderCreate2DTemplateA1("ele_icon","th_res",0,11*32,32,32,32,0,0,1);
renderCreate2DTemplateA1("ele_num","th_res",0,12*32,32,32,32,0,0,1);
renderCreate2DTemplateA1("ele_max","th_res",4*32,12*32,64,32,0,0,0,1);
renderCreate2DTemplateA1("ele_text","th_res",0,15*32,32,32,32,0,0,1);

stgCreateImageTexture("fairy_circle","res/fairy_circle.png");
renderCreate2DTemplateA1("fairy_circle_w","fairy_circle",128,177,64,64,0,0,0,1);



var element_system={};
element_system.init=function(){
    if(!stg_common_data.element){
        stg_common_data.element=[0,0,0];
    }
    element_system.lgz=[];
    element_system.gzcd=[];
    for(var i=0;i<stg_players_number;i++){
        element_system.lgz[i]=stg_players[i].graze;
        element_system.gzcd[i]=0;
    }
    stgCreate2DBulletTemplateA1("eD","bullet",0,400,16,16,16,0,PIUP,1,_hit_box_medium,{move_rotate:1});

};
element_system.script=function(){
    var add=[0,0,0];
    for(var i=0;i<stg_players_number;i++){
        var p=stg_players[i];
        if(p.state==thc.PLAYER_NORMAL){
            if(((p.key[thc.KEY_UP]- p.key[thc.KEY_DOWN])||(p.key[thc.KEY_LEFT]- p.key[thc.KEY_RIGHT]))){
                add[1]+=p.key[thc.KEY_SLOW]?1:-2;
            }
            if(p.key[thc.KEY_SHOT]){
                if(element_system.gzcd[i]==0){
                    add[0]+=1;
                }else{
                    element_system.gzcd[i]--;
                }
            }
            if(p.graze>element_system.lgz[i]){
                add[0]-= (p.graze-element_system.lgz[i])*3;
                element_system.gzcd[i]=45;
            }
            if(p.pos[1]<stg_frame_h/3){
                add[2]-=2;
            }
            if(p.pos[1]<stg_frame_h/2){
                add[2]-=1;
            }
            if(p.bombing){
                add[2]+=2;
            }
        }
        element_system.lgz[i]=stg_players[i].graze;
    }
    for(var j=0;j<3;j++){
        stg_common_data.element[j]+=add[j];
        if(stg_common_data.element[j]>800){
            stg_common_data.element[j]=800;
        }
        if(stg_common_data.element[j]<-800){
            stg_common_data.element[j]=-800;
        }
    }


};
element_system.getLevel=function(id){
    if(!stg_common_data.element)return 0;
    var i= stg_common_data.element[id];
    i=(i>=0?(i/200)>>0:-((-i/200)>>0));
    if(i>3)return 3;
    if(i<-3)return -3;
    return i;
};



function ElementBase(x,y,color1,color2,scale,idx){
    this.x=x;
    this.y=y;
    this.color1=color2;
    this.color2=color1;
    this.scale=scale||1;
    this.idx=idx;
}
ElementBase.prototype.init=function(){
    this.vtx=new HyzPrimitive2DVertexList(8);
    this.vtx.setTextureName("th_res");
    var x=this.x;
    var y=this.y;
    var s=this.scale;
    this.vtx.setVertex(0,0,0,0,14*32,255,255,255,256);//左上角
    this.vtx.setVertex(1,0,32*s,0,15*32,255,255,255,256);//左下角
    this.vtx.setVertex(2,6*32*s,32*s,6*32,15*32,255,255,255,256);//右下角
    this.vtx.setVertex(3,6*32*s,0,6*32,14*32,255,255,255,256);//右上角
    renderCreatePrimitiveRender(this);
    this.render.texture="th_res";
    this.layer=260;
    var a=th.objCreateObject();
    th.spriteSet(a,"ele_num",0,262);
    stgSetPositionA1(a,this.x+32*3*s,this.y+16*s);
    renderSetSpriteColor(255,255,255,0,a);
    this.txt=a;

    a=th.objCreateObject();
    th.spriteSet(a,"ele_text",this.idx*2+1,262);
    stgSetPositionA1(a,this.x-14,this.y+16*s);

    a=th.objCreateObject();
    th.spriteSet(a,"ele_text",this.idx*2,262);
    stgSetPositionA1(a,this.x+32*6*s+14,this.y+16*s);



};
ElementBase.prototype.script=function() {
    if(this.frame==2){
        for(var i=0;i<stg_players_number;i++){
            stgAddObject(new element_system.FireOptionController(stg_players[i]));
        }
    }
};

ElementBase.prototype.on_render=function(gl){

    var p=stg_common_data.element;
    if(!p)return;
    var s=this.scale;
    p=p[this.idx]/2;
    if(p>300)p=300;
    if(p<-300)p=-300;
    var l=3*32*s*p/300;
    var l2=3*32*p/300;
    var c1=32*3*s;
    var t0=l>0?6*32:0;
    var t1=t0-l2;
    var c=l>0?this.color2:this.color1;
    this.vtx.setVertex(4,c1,0,t1,13*32,c[0],c[1],c[2],c[3])//左上角
    this.vtx.setVertex(5,c1,32*s,t1,14*32,c[0],c[1],c[2],c[3])//左下角
    this.vtx.setVertex(6,c1+l,0,t0,13*32,c[0],c[1],c[2],c[3])//右下角
    this.vtx.setVertex(7,c1+l,32*s,t0,14*32,c[0],c[1],c[2],c[3])//右上角
    var a=this.txt;
    renderSetSpriteColor(c[0],c[1],c[2],255,a);
    if(p>=300){
        th.spriteSet(a,"ele_max",0,262);
    }else if(p>=200){
        th.spriteSet(a,"ele_num",1,262);
    }else if(p>=100){
        th.spriteSet(a,"ele_num",0,262);
    }else if(p<=-300){
        th.spriteSet(a,"ele_max",0,262);
    }else if(p<=-200){
        th.spriteSet(a,"ele_num",3,262);
    }else if(p<=-100){
        th.spriteSet(a,"ele_num",2,262);
    }else{
        renderSetSpriteColor(0,0,0,0,a);
    }


    hyzSetPrimitiveOffset(this.x,this.y);
    this.vtx.update(1,1,1);
    this.vtx.use();
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.drawArrays(gl.TRIANGLE_STRIP,4,4);
};

ElementBase.prototype.finalize=function(){
    stgDeleteSubObjects(this);
    this.vtx.clear();
};

element_system.FireOptionController=function(player){
    this.player=player;
    this.base=new StgBase(player,thc.BASE_COPY,1,1);
};

element_system.FireOptionController.prototype.init=function(){
    this.options=[];
    for(var i=0;i<3;i++){
        var a={};
        th.spriteSet(a,"fairy_circle_w",0,thc.LAYER_PLAYER);
        renderSetSpriteColor(255,0,0,128,a);
        renderSetObjectSpriteBlend(a,blend_add);
        renderSetSpriteScale(0.3,0.3,a);
        a.self_rotate=0.1;
        stgEnableMove(a);
        a.base=new StgBase(this.player,thc.BASE_MOVE,1,1);
        this.options[i]=a;
    }
    this.count=0;
};
element_system.FireOptionController.prototype.shot=function(objbase) {
    stgCreateShotP1(objbase.pos[0]-4,objbase.pos[1],12,270,"eD",0,0,1,60);
    stgCreateShotP1(objbase.pos[0]+4,objbase.pos[1],12,270,"eD",0,0,1,60);
    renderSetObjectSpriteBlend(stg_last,blend_add);
};
element_system.FireOptionController.prototype.script=function(){
    var l=element_system.getLevel(0);
    if(l<0)l=0;
    var i=0;
    if(l!=this.count){
        if(l>this.count){
            for(i=this.count;i<l;i++){
                stgAddObject(this.options[i]);
            }
        }else{
            for(i=l;i<this.count;i++){
                stgDeleteObject(this.options[i]);
            }
        }
        if(l==1){
            this.options[0].move.pos[0]=0;
            this.options[0].move.pos[1]=-40;
        }else if(l==2){
            this.options[0].move.pos[0]=20;
            this.options[0].move.pos[1]=-35;
            this.options[1].move.pos[0]=-20;
            this.options[1].move.pos[1]=-35;
        }else if(l==3){
            this.options[0].move.pos[0]=20;
            this.options[0].move.pos[1]=-30;
            this.options[1].move.pos[0]=0;
            this.options[1].move.pos[1]=-40;
            this.options[2].move.pos[0]=-20;
            this.options[2].move.pos[1]=-30;
        }
    }
    if(th.actionCoolDown("t",3,this.player.key[thc.KEY_SHOT])){
        for(i=0;i<l;i++){
            this.shot(this.options[i]);
        }
    }


    this.count=l;
};
