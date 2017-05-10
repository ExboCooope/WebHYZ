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
       this.invincible=360;
   }
    if(this.state==stg_const.PLAYER_NORMAL || this.state==stg_const.PLAYER_REBIRTH ){
        spriteUseInviEffect();
    }

};


Player_Remilia.pre_load=function(){
    stgCreateImageTexture("remilia_b","players/remilia_boss.png");
    stgCreateImageTexture("remilia_a","players/remilia_player.png");

    renderCreate2DTemplateA1("remilia_stand","remilia_a",0,96,48,48,48,0,0,1);
    renderCreate2DTemplateA1("remilia_left","remilia_a",0,96+48,48,48,48,0,0,1);
    renderCreate2DTemplateA1("remilia_right","remilia_a",48,96+48,-48,48,48,0,0,1);

    stgCreateImageTexture("pl_effect","etama2.png");
    renderCreate2DTemplateA1("pan_ding_dian","pl_effect",0,112,64,64,64,0,0,1);

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