/**
 * Created by Exbo on 2017/11/15.
 */
//载入纹理
const tank="tank";
stgCreateImageTexture(tank,"GAME/TankWar/tank.png");
//常量
const tank_1p="tank_1p";
const tank_2p="tank_2p";
const tank_destroy="tank_d";
const tank_bullet="tkb";
const tank_bullet2="tkbp";
renderCreate2DTemplateA1(tank_1p,tank,0,0,32,32,32,0,0,1);
renderCreate2DTemplateA1(tank_2p,tank,32*4,0,32,32,32,0,0,1);
stgCreate2DBulletTemplateA1(tank_bullet,tank,0,7*32,32,32,32,0,PIUP,1,_hit_box_small,{move_rotate:1});
stgCreate2DBulletTemplateA1(tank_bullet2,tank,0,7*32,32,32,32,0,PIUP,1,_hit_box_large,{move_rotate:1});
renderCreate2DTemplateA1(tank_destroy,tank,32*10,0,32,32,32,0,0,1);


//player
function Player_Tank(oPlayer){
    this.player=oPlayer;
    this.slot=oPlayer.slot||0;
    this.side=stg_const.SIDE_PLAYER;
}
stgRegisterPlayer("tank",Player_Tank);
Player_Tank.version=2;
Player_Tank.prototype.init=function(){
    var player=this.player;
    //in case player is not set up, use default data
    th.playerUseDefault(player);
    //set default position
    var n=stg_players_number;
    stgSetPositionA1(player,stg_frame_w/(n+1)*(this.slot+1),stg_frame_h*0.75);
    th.playerRestoreFromData(player,stg_common_data);

    player.script=Player_Tank.player_script;
    player.hitby=new StgHitDef();
    player.hitby.setPointA1(0,0,1);
    th.playerSetSpeed(player,3,3);
    player.last_p=[player.pos[0],player.pos[1]];
    stgAddObject(player);
    th.spriteSet(player,tank_1p,3,50);//用向右的那个
    player.rotate[2]=-PIUP;
    player.on_death=function(){
        var a=new Player_Tank.DestroyEffect(player);
        stgAddObject(a);
    };
};
Player_Tank.player_script=function(){

    var x=this.pos[0];
    var y=this.pos[1];
    if(x==this.last_p[0] && y==this.last_p[1]){

    }else{
        this.rotate[2]=atan2p(this.last_p,this.pos);
        this.last_p[0]=x;
        this.last_p[1]=y;
    }

    //无敌提示
    if(this.state==stg_const.PLAYER_NORMAL || this.state==stg_const.PLAYER_REBIRTH ){
        spriteUseInviEffect();
    }
    var key=this.key;
    var shot_flag=th.keyShot(key);//th.actionKeyDown(key,thc.KEY_SHOT);
    if(th.actionCoolDown("timer1",8,shot_flag)){
        stgCreateShotP1(x,y,6,this.rotate[2]/PI180,tank_bullet2,0,0,32,1);
        renderSetSpriteScale(2,2,stg_last);
    }
    if(th.actionKeyUp(key,thc.KEY_SHOT)){
        this["timer1"]=0;
    }
};
Player_Tank.DestroyEffect=function(player){
    th.spriteSet(this,tank_destroy,0,60);
    stgSetPositionA1(this,player.pos[0],player.pos[1]);
};
Player_Tank.DestroyEffect.prototype.script=function(){
    if(frame==20){
        th.spriteSet(this,tank_destroy,1,60);
    }
    if(frame==40){
        th.spriteSet(this,tank_destroy,2,60);
    }
    if(frame==60){
        th.spriteSet(this,tank_destroy,1,60);
    }
    if(frame>60){
        renderSetSpriteColorRaw(1,1,1,1-(frame-60)/40);
    }
    if(frame>=100){
        stgDeleteSelf();
    }
};
