/**
 * Created by Exbo on 2017/6/2.
 */

function Player_Byakuren(slot){
    this.player_pos=slot;
}

stgRegisterPlayer("player_byakuren",Player_Byakuren);

Player_Byakuren.pre_load=function(){
    playerLoadAnimationTh("byakuren","players/lm_player.png");
    stgCreate2DBulletTemplateA1("byAshot","byakuren",0,144,64,16,64,0,0,1,_hit_box_medium,{move_rotate:1});
    stgCreate2DBulletTemplateA1("byBshot","byakuren",0,224,32,32,32,0,0,1,_hit_box_large,{self_rotate:0.1});
    renderCreate2DTemplateA1("byLaser","byakuren",0,178,12,12,0,0,0,1);
    renderCreate2DTemplateA1("byOption","byakuren",0,224,32,32,32,0,0,1);
};
Player_Byakuren.prototype.init=function(){
    this.side=stg_const.SIDE_PLAYER;
    var b=new StgObject();
    _StgDefaultPlayer(b);
    b.hitby=new StgHitDef();
    b.hitby.setPointA1(0,0,0);
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
    b.script=Player_Byakuren.player_script;
    b.shot_f=0;
  //  var d=new esp.GodMagnet(b,0);
 //   stgAddObject(d);
    this.player=b;
    playerAnimationInitTh(b);
    b.lasers=[new Player_Byakuren.Laser(),new Player_Byakuren.Laser(),new Player_Byakuren.Laser()];
    b.lasers[0].remove=1;
    b.lasers[1].remove=1;
    b.lasers[2].remove=1;
};

Player_Byakuren.prototype.script=function(){

};

Player_Byakuren.player_script=function(){
    playerAnimationTh(this,this,"byakuren");
    var shot=this.key[stg_const.KEY_SHOT];
    if(shot && this.state==stg_const.PLAYER_NORMAL){
        if(this.lasers[0].remove){
            stgAddObject(this.lasers[0]);
            stgAddObject(this.lasers[1]);
            stgAddObject(this.lasers[2]);
        }
        for(var i=0;i<3;i++){
            var a=this.lasers[i];
            stgSetRotate(270,a);
            if(a.frame>15 && a.frame<35){
                var r= (a.frame-15)*2.2;
            }else{
                r=20*2.2;
            }
            var t= a.frame*180/60*PI180+i/3*PI2;
            if(a.frame>15){
                stgSetPositionA1(a,this.pos[0]+r*sin(t),this.pos[1]+r*cos(t));
                a.damage=4;
            }else{
                stgSetPositionA1(a,this.pos[0],this.pos[1]);
                a.damage=6;
            }

        }


    }else{
        if(!this.lasers[0].remove){
            stgDeleteObject(this.lasers[0]);
            stgDeleteObject(this.lasers[1]);
            stgDeleteObject(this.lasers[2]);
        }
    }
};

Player_Byakuren.Laser=function(){
    this.damage=6;
    this.penetrate=10000;
    this.keep=1;
    var a={};
    this.sprite=a;
    var b={};
    this.option=b;
    renderCreateSpriteRender(a);
    renderApply2DTemplate(a.render,"byLaser",0);
    a.layer=stg_const.LAYER_PLAYER_BULLET-1;
    this.hitdef=new StgHitDef();
    this.hitdef.setLaserA1(0,0,0,12,0,12,1);
    a.base=new StgBase(this,0,1);
    b.base=new StgBase(this,0,1);
    renderCreateSpriteRender(b);
    b.layer=stg_const.LAYER_PLAYER_BULLET;
    renderApply2DTemplate(b.render,"byOption",3);
    b.self_rotate=-1*PI180;
//    this.move_rotate=-1;
 //   this.angle=270*PI180;
};
Player_Byakuren.Laser.prototype.init=function(){
    this.l=50;
    stgAddObject(this.sprite);
    stgAddObject(this.option);
    renderSetObjectSpriteBlend(this.sprite,blend_add);
    renderSetSpriteColor(255,255,255,128,this.sprite);
    renderSetObjectSpriteBlend(this.option,blend_add);

};
Player_Byakuren.Laser.prototype.script=function(){
    if(this.l<800){
        this.l+=8;
    }
    this.hitdef.setLaserA1(0,0,0,6,0,6,this.l);
    this.penetrate=10000;
    var a=this.sprite;
    renderSetSpriteSize(this.l,24,a);
    stgSetPositionA1(a,this.pos[0]+this.l/2*cos(this.rotate[2]),this.pos[1]+this.l/2*sin(this.rotate[2]));
    stgSetPositionA1(this.option,this.pos[0],this.pos[1]);
    a.rotate[2]=this.rotate[2];
};

Player_Byakuren.Laser.prototype.on_hit=function(){
    if(stg_laser_dl<this.l){
        this.l=stg_laser_dl;
    }
    if(this.frame%2)stgAddObject(new GrazeParticle(this.pos[0]+stg_laser_dl*cos(this.rotate[2]),this.pos[1]+stg_laser_dl*sin(this.rotate[2]),stg_rand(360)));
};