/**
 * Created by Exbo on 2016/1/16.
 */

function loadItemSystem(){
    stgCreateImageTexture("item_tex", "res/Item.png");
    renderCreate2DTemplateA1("item0","item_tex",0,0,16,16,19,0,0,1);
    renderCreate2DTemplateA1("item1","item_tex",2,21,12,12,19,0,0,1);
    stgLoadSE("se_item","se/se_item00.wav").ready=1;
}

stg.enemySystem={};
stg.enemySystem.pre_load=function(){
    stgCreateImageTexture("fairy_red", "res/fairy_red.png");
    stgCreateImageTexture("fairy_circle","res/fairy_circle.png");
    renderCreate2DTemplateA1("fairy_circle_w","fairy_circle",128,175,64,64,0,0,0,1);

};
stgRegisterModule("enemy_system",stg.enemySystem);

function EnemyAppearEffect(enemysprite){
    this.base=new StgBase(enemysprite,stg_const.BASE_MOVE,1);
    stgEnableMove(this);

    this.enemy=enemysprite;
    this.self_rotate=5*PI180;
}

EnemyAppearEffect.prototype.init=function(){
    stgSetPositionA1(this,0,0);
    this.layer=stg_const.LAYER_ENEMY+1;
    renderCreateSpriteRender(this);
    renderSetSpriteColor(255,255,255,0,this.enemy);
    renderSetSpriteColor(255,255,255,400,this);
    renderApply2DTemplate(this.render,"fairy_circle_w",0);
    renderSetObjectSpriteBlend(this,blend_add);
};
EnemyAppearEffect.prototype.script=function(){
    var enemy=this.enemy;
    var b=[1,1];
    renderGetSpriteSize(b,enemy);
    renderSetSpriteSize(2*b[0]*(40-this.frame)/40,2*b[0]*(40-this.frame)/40,this);
    renderSetSpriteColor(255,255,255,255*(this.frame)/40,enemy);
    if(this.frame>=40){
        stgDeleteSelf();
    }
};



function EnemyFairyHolder(base,tx,ty,tw,th){
    this._lastx=0;
    this._lasty=0;
    this._last_anime=0;
    this._last_anime_frame=0;
    this._last_anime_id=0;
    this._enemy=base;
    this._tx=tx;
    this._ty=ty;
    this.render=new StgRender("sprite_shader");
    renderCreate2DTemplateA1("fairy"+tx+ty,"fairy_red",tx,ty,tw,th,tw,0,0,1);
    renderApply2DTemplate(this.render,"fairy"+tx+ty,0);
    this.layer=stg_const.LAYER_ENEMY;
    this.pos= [base.pos[0],base.pos[1],0];
}

EnemyFairyHolder.prototype.init=function(){
    this.effect1=new EnemyAppearEffect(this);
    stgAddObject(this.effect1);
};

EnemyFairyHolder.prototype.script=function(){
    var e=this._enemy;
    if(e.remove){
        stgDeleteSelf();
    }else{
        this.pos[0]= e.pos[0];
        this.pos[1]= e.pos[1];
        this.sid= e.sid;
        var a=0;
        if(this.pos[0]<this._lastx-1){
            a=1;
        }else if(this.pos[0]>this._lastx+1){
            a=2;
        }
        if(e.move){
            a=0;
            var dv=e.move.speed_angle;
            if(dv<0)dv+=PI2;
            if(dv<PI/3 || dv>PI/3*5){
                a=2;
            }else if(dv>PI/3*2 && dv<PI/3*4){
                a=1;
            }
        }
        if(a==this._last_anime){
            this._last_anime_frame++;
            if(this._last_anime_frame>4){
                this._last_anime_frame=0;
                this._last_anime_id++;
                if(this._last_anime_id==3)this._last_anime_id=0;
                if(this._last_anime_id==7)this._last_anime_id=4;
            }
        }else{
            this._last_anime_frame=0;
            this._last_anime_id=a?3:0;
            this.render.scale[0]=(a==1)?-1:1;
        }
        this.update=1;
        renderApply2DTemplate(this.render,"fairy"+this._tx+this._ty,this._last_anime_id);

        this._lastx=this.pos[0];
        this._lasty=this.pos[1];
        this._last_anime=a;
    }
    if(!this.effect1.remove) {
        stgRefreshPosition(this.effect1);
    }
};

function DNHBossHolder(base,texturename){
    this.animes={};
    this.render=new StgRender("sprite_shader");
    this.tname="boss_"+texturename;
    this.boss=base;
    this.current_anime=null;
    this.current_head=1;
    this.current_frame=0;
    this.current_id=0;
    renderCreate2DTemplateA2(this.tname,texturename,0,0,128,128,4,8,0,1);
    renderApply2DTemplate2(this.render,this.tname,0);
}

//picids=[frame_speed,id0,id1,id2,...,idx,-loopidcount]
DNHBossHolder.prototype.addAnimation=function(animename,picids){
    this.animes[animename]=picids;
};
DNHBossHolder.prototype.addDefaultAnimations=function(){

};
DNHBossHolder.prototype.run=function(){
    var e=this.boss;
    if(e.remove){
        stgDeleteSelf();
    }else{
        var f=this.current_frame+1;
        var id=this.current_id>=0?this.current_id:0;
        if(this.current_anime) {
            if (f > this.current_anime[0]) {
                this.current_head=this.current_head+1;
                if( this.current_head>=this.current_anime.length){
                    this.current_head=1;
                }
                id=this.current_anime[this.current_head];
                if(id<0){
                    this.current_head=this.current_head-id;
                    id=this.current_anime[this.current_head];
                }
            }
        }
        this.current_frame=f;
        if(id!= this.current_id){
            this.current_id=id;
            renderApply2DTemplate2(this.render,this.tname,id);
        }
    }
};
