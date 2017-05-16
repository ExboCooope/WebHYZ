/**
 * Created by Exbo on 2017/1/8.
 */

function Player_Remilia(iPosition){
    this.player_pos=iPosition;
}

stg_player_templates["remilia"]=Player_Remilia;

Player_Remilia.prototype.init=function(){
    Player_Remilia.pre_load();
    this.side=stg_const.SIDE_PLAYER;
    var b=new StgObject();
    _StgDefaultPlayer(b);
    b.hitby=new StgHitDef();
    b.hitby.setPointA1(0,0,2);
    b.on_death=Player_Remilia.on_death;
    b.on_collect=function(){
        stgPlaySE("se_item");
    };
    b.on_graze=function(){
        stgPlaySE("se_graze");
        var a=new GrazeParticle(this.pos[0],this.pos[1],stg_rand(0,360));
        stgAddObject(a);
    };
    if(stg_common_data.player){
        if(stg_common_data.player[this.player_pos]){
            miscApplyAttr(b,stg_common_data.player[this.player_pos]);
        }
    }
    stg_players[this.player_pos]=b;
    stgSetPositionA1(b,stg_frame_width/2,stg_frame_height*0.8);

    var c=new StgGrazer(b);
    stgAddObject(b);
    stgAddObject(c);
    NewHyzSpriteObject(b,"remilia_stand",0);
    b.script=Player_Remilia.player_script;
    b.shot_f=0;

    this.options=[new Player_Remilia.Option(b,0),new Player_Remilia.Option(b,1),new Player_Remilia.Option(b,2),new Player_Remilia.Option(b,3)];
    stgAddObject(this.options[0]);
    stgAddObject(this.options[1]);
    stgAddObject(this.options[2]);
    stgAddObject(this.options[3]);

    var d=new esp.GodMagnet(b,0);
    stgAddObject(d);
};

Player_Remilia.on_death=function(){
    var a=new BreakCircleEffect(90);
    stgAddObject(a);
    stgSetPositionA1(a,this.pos[0],this.pos[1]);
};

Player_Remilia.player_script=function(){
    this.t=this.t||0;
    this._c=this._c||0;
    this._c1=this._c1||0;
    var key=this.key;
    var current_dir=key[stg_const.KEY_LEFT]-key[stg_const.KEY_RIGHT];
    if(current_dir!=(this.last_anime||0)){
        this.t=0;
        this._c=-1;
        this._c1=0;
    }else{
        this.t++;
    }
    //this.render.scale=1;
    var t=this.t;
    if(t%4==0){
        if(current_dir==0) {
            if (!this._c1) {
                this._c += 1;
                if (this._c == 3) {
                    this._c1 = 1;
                }
            } else {
                this._c -= 1;
                if (this._c == 0) {
                    this._c1 = 0;
                }
            }
            hyzChangeSprite(this, "remilia_stand", this._c);
        }else if(current_dir==1){
            if (!this._c1) {
                this._c += 1;
                if (this._c == 4) {
                    this._c1 = 1;
                }
            } else {
                this._c -= 1;
                if (this._c == 2) {
                    this._c1 = 0;
                }
            }
            hyzChangeSprite(this, "remilia_left", this._c);
        }else{
            if (!this._c1) {
                this._c += 1;
                if (this._c == 4) {
                    this._c1 = 1;
                }
            } else {
                this._c -= 1;
                if (this._c == 2) {
                    this._c1 = 0;
                }
            }
            hyzChangeSprite(this, "remilia_right", this._c);
        }
    }
    this.last_anime=current_dir;
   if(key[stg_const.KEY_SPELL]){
       if(!this.bombing){
           if(stgPlayerSpell(this,new Player_Remilia.Spell(this))){
               this.invincible=330;
           }
       }
   }
    if(this.state==stg_const.PLAYER_NORMAL || this.state==stg_const.PLAYER_REBIRTH ){
        spriteUseInviEffect();
    }
    if(this.state==stg_const.PLAYER_NORMAL){
        //Player_Remilia.shoot_function();
    }

};

Player_Remilia.shoot_function=function(){
    var key=stg_target.key;
    var key_shot=key[stg_const.KEY_SHOT];
    var key_slow=key[stg_const.KEY_SLOW];
    var key_bomb=key[stg_const.KEY_SPELL];
    var f=stg_target.shot_f;
var blt;
    if(key_shot){
        if(f==0){
            blt=stgCreateShotP1(stg_target.pos[0]-4,stg_target.pos[1]-8,12,270,"remilia_sht1",0,1,3,1);
            renderSetSpriteScale(1,0.4,blt);
          //  renderSetSpriteColor(255,255,255,128,blt);
         //   blt.layer++;
            blt=stgCreateShotP1(stg_target.pos[0]+4,stg_target.pos[1]-8,12,270,"remilia_sht1",0,1,3,1);
            renderSetSpriteScale(1,0.4,blt);
        //    renderSetSpriteColor(255,255,255,128,blt);
        //    blt.layer++;
        }
        f=(f+1)%3;
    }

};

Player_Remilia.Spell=function(player){
    this.ignore_super_pause=true;
    this.player=player;
};

Player_Remilia.Spell.prototype.init=function(){
    hyzSetSuperPauseTime(60);
    stgPlaySE("se_cast");
    var a=new Player_Remilia.CutInPic(stg_frame_w/2,stg_frame_h/2+50);
    stgAddObject(a);
};

Player_Remilia.Spell.prototype.script=function(){
    if(this.frame>60){
        var key_shot=this.player.key[stg_const.KEY_SHOT];
        if(key_shot){
            var blt;
            var p=this.player.pos;
            if(this.frame%6==0){
                blt=stgCreateShotP1(p[0]-16,p[1]-8,12,270,"remilia_sht1",0,1,3,1);
                renderSetSpriteScale(2,4,blt);
                blt=stgCreateShotP1(p[0]+16,p[1]-8,12,270,"remilia_sht1",0,1,3,1);
                renderSetSpriteScale(2,4,blt);
                blt=stgCreateShotP1(p[0],p[1]-20,12,270,"remilia_sht1",0,1,3,1);
                renderSetSpriteScale(2,4,blt);
            }
        }
    }
    if(this.frame>300){
        stgDeleteSelf();
    }
};



Player_Remilia.pre_load=function(){
    stgCreateImageTexture("remilia_b","players/remilia_boss.png");
    stgCreateImageTexture("remilia_a","players/remilia_player.png");
    stgCreateImageTexture("remilia_pic1","players/remilia_pic1.png");

    renderCreate2DTemplateA1("remilia_stand","remilia_a",0,96,48,48,48,0,0,1);
    renderCreate2DTemplateA1("remilia_left","remilia_a",0,96+48,48,48,48,0,0,1);
    renderCreate2DTemplateA1("remilia_right","remilia_a",48,96+48,-48,48,48,0,0,1);
    renderCreate2DTemplateA1("remilia_option","remilia_a",0,192,32,32,0,0,0,1);
    renderCreate2DTemplateA1("remilia_option2","remilia_a",32,192,20,32,0,0,0,1);
    renderCreate2DTemplateA1("remilia_pic1","remilia_pic1",0,0,800,600,0,0,0,1);


    stgCreateImageTexture("pl_effect","etama2.png");
    renderCreate2DTemplateA1("pan_ding_dian","pl_effect",0,112,64,64,64,0,0,1);

    stgCreate2DBulletTemplateA1("remilia_sht1","remilia_a",64,224,32,16,0,16,0,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("remilia_sht2","remilia_a",32,192,20,32,0,0,0,1,_hit_box_large,{move_rotate:1});

    renderSetSpriteBlend(stg_const.LAYER_PLAYER_BULLET,"remilia_a",blend_add);

};

Player_Remilia.CutInPic=function(x,y){
    this.ignore_super_pause=1;
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,"remilia_pic1",0);
    this.pos=[x,y,0];
};

Player_Remilia.CutInPic.prototype.init=function(){
    this.layer=76;
    renderSetSpriteScale(0.04,0.04,this);
};
Player_Remilia.CutInPic.prototype.script=function(){
    if(this.frame<=10){
        renderSetSpriteScale(0.4*this.frame/10,0.04,this);
    }else if(this.frame<=20){
        renderSetSpriteScale(0.4,0.4*(this.frame-10)/10,this);
    }else if(this.frame>40){
        renderSetSpriteColor(255,255,255,255*(1-(this.frame-40)/20));
        if(this.frame>60){
            stgDeleteSelf();
        }
    }
};


Player_Remilia.ExLargeBullet=function(x,y,type1,type2,angle){
    this.x=x;
    this.y=y;
    this.type1=type1;
    this.type2=type2;
    this.angle=angle;
    stgApplyShot(this,"lDY",0);
};

Player_Remilia.ExLargeBullet.prototype.init=function(){
    stgSetPositionA1(this,this.x,this.y);
    this.move.max_speed=2.4;
    this.move.setSpeed(2.4,this.angle);
    if(this.type2){
        this.a1=stg_rand(360);
    }
};

Player_Remilia.ExLargeBullet.prototype.script=function(){
    if(this.type1 && this.frame>=12 && this.frame<=90){
        this.move.speed_angle+=this.type1*PI180;
    }
    if(this.frame<180 && this.frame%15==4){
        var blt=stgCreateShotA1(this.pos[0],this.pos[1],0,0,"sXY",15,0);
        if(this.type2){
            blt.tangle=this.a1;
            this.a1+=this.type2*16;
        }else{
            blt.tangle=stg_rand(360);
        }
        blt.tframe=180-this.frame;
        blt.script=Player_Remilia.ExSmallBulletFunc;
    }
};

Player_Remilia.Option=function(player,id){
    this.player=player;
    this.id=id;
};
Player_Remilia.Option.prototype.init=function(){
//    renderCreateSpriteRender();
//    renderApply2DTemplate(0,"remilia_option2",0);
    this.layer=stg_const.LAYER_PLAYER_BULLET+1;
    this._base=new StgBase(this.player,stg_const.BASE_MOVE,1);
    this.circle=new Player_Remilia.OptionCircle(this);
    stgAddObject(this.circle);

};
Player_Remilia.Option.prototype.on_move=function(){
    if(this.player.key[stg_const.KEY_SLOW]){
        this.base=0;
        renderSetSpriteColor(255,0,0,255,this.circle);
    }else{
        this.base=this._base;
        renderSetSpriteColor(255,255,255,255,this.circle);
        if(this.id==0){
            this.pos[0]=45;
            this.pos[1]=-20;
        }else if(this.id==1){
            this.pos[0]=22;
            this.pos[1]=-30;
        }else if(this.id==2){
            this.pos[0]=-22;
            this.pos[1]=-30;
        }else if(this.id==3){
            this.pos[0]=-45;
            this.pos[1]=-20;
        }
    }
    this.rotate[2]=270*PI180;
};

Player_Remilia.Option.prototype.script=function(){
    if(this.player.key[stg_const.KEY_SHOT]){
        if(this.frame%6==0){
            stgCreateShotP1(this.pos[0],this.pos[1],9,stg_rand(260,280),"remilia_sht2",0,0,6,1).layer++;
        }
    }
};


Player_Remilia.OptionCircle=function(option){
    this.option=option;
};

Player_Remilia.OptionCircle.prototype.init=function(){
    renderCreateSpriteRender();
    renderApply2DTemplate(0,"remilia_option",0);
    this.layer=stg_const.LAYER_PLAYER_BULLET;
    this.base=new StgBase(this.option,stg_const.BASE_COPY,1);
    this.self_rotate=4*PI180;
};



Player_Remilia.ExSmallBulletFunc=function(){
    if(this.frame>this.tframe){
        this.move.max_speed=1.8;
        this.move.acceleration=0.08;
        this.move.speed_angle=this.tangle*PI180;
        delete this.script;
    }
};

Player_Remilia.ExShooter=function(x,y){
    this.x=x;
    this.y=y;
};
Player_Remilia.ExShooter.prototype.init=function(){
    var a=stg_rand(360);
    var type1=stg_rand_int(-1,1);
    var type2=stg_rand_int(-1,1);
    var b1=new Player_Remilia.ExLargeBullet(this.x,this.y,type1,type2,a);
    var b2=new Player_Remilia.ExLargeBullet(this.x,this.y,type1,type2,a+180);
    stgAddObject(b1);
    stgAddObject(b2);
    stgDeleteSelf();
};

Player_Remilia.ChargeShooter=function(x,y,rank){
    this.x=x;
    this.y=y;
    this.rank=rank;
};

Player_Remilia.ChargeShooter.prototype.init=function(){
    this.wave=this.rank>8?3:2;
    if(this.rank==16)this.wave=4;
    stgSetPositionA1(this,this.x,this.y);
};

Player_Remilia.ChargeShooter.prototype.script=function() {
    if(this.frame%30==1) {
        var rank=this.rank/16;
        if (this.wave>0){
            this.wave--;
            var player=hyzGetPlayer();
            var angle=atan2pr(this.pos,player.pos);
            //大玉
            stgCreateShotA1(this.x,this.y,linear(3.2,6.2,rank),angle,"lDY",15,0);
            //zhongyu
            var cnt=linear(1,3.1,rank);
            var s1=linear(3, 6, rank);
            var i;
            for(i=0;i<cnt;i++) {
                stgCreateShotA1(this.x, this.y,  stg_rand(2,s1), angle+stg_rand(-5,5), "mZY", 15, 0);
            }
            cnt=linear(1,3,rank);
            s1=linear(2, 4, rank);
            for(i=0;i<cnt;i++) {
                stgCreateShotA1(this.x, this.y, stg_rand(2,s1), angle+stg_rand(-5,5), "sXY", 15, 0);
            }
            cnt=linear(6,8,rank);
            s1=linear(2, 4, rank);
            for(i=0;i<cnt;i++) {
                stgCreateShotA1(this.x, this.y, stg_rand(2,s1), angle+stg_rand(-8,8), "tDD", 15, 0);
            }
        }else{
            stgDeleteSelf();
        }
    }
};


Player_Remilia.ChargeShooter2=function(x,y,rank){
    this.x=x;
    this.y=y;
    this.rank=rank;
};

Player_Remilia.ChargeShooter2.prototype.init=function(){
    this.wave=3;
    this.dir=stg_rand_int(0,1)?1:-1;
    this.diri=-this.dir;
    stgSetPositionA1(this,this.x,this.y);
};

Player_Remilia.ChargeShooter2.prototype.script=function() {
    if(this.frame%10==1) {
        var rank=this.rank/16;
        if (this.wave>0){
            this.wave--;
            var player=hyzGetPlayer();
            var angle=atan2pr(this.pos,player.pos)+((1-rank)*18+18)*this.diri;
            this.diri+=this.dir;
            //大玉
            stgCreateShotA1(this.x,this.y,linear(3.2,6.2,rank),angle,"lDY",15,0);
            //zhongyu
            var cnt=linear(3,7,rank);
            var s1=linear(3, 6, rank);
            var i;
            for(i=0;i<cnt;i++) {
                stgCreateShotA1(this.x, this.y,  stg_rand(2,s1), angle+stg_rand(-7,7), "mZY", 15, 0);
            }
            cnt=linear(6,12,rank);
            s1=linear(2, 6, rank);
            for(i=0;i<cnt;i++) {
                stgCreateShotA1(this.x, this.y, stg_rand(2,s1), angle+stg_rand(-8,8), "sXY", 15, 0);
            }
        }else{
            stgDeleteSelf();
        }
    }
};