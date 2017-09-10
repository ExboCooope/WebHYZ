/**
 * Created by Exbo on 2017/8/22.
 */

//template of player constructor

//constructor accept a player object that currently in the pool
function Player_Reimu(oPlayer){
    this.player=oPlayer;
    //oPlayer should have a <int> .slot attribute
    this.slot=oPlayer.slot||0;
    //set this handler to player side
    this.side=stg_const.SIDE_PLAYER;
}

//register player
stgRegisterPlayer("reimu_V2",Player_Reimu);


//constructor is a module, use pre_load to load resources
Player_Reimu.pre_load=function(){
    stgCreateImageTexture("reimu_body","res/pl00.png");
    stgCreateImageTexture("pl_effect","etama2.png");

    //bind animation
    th.playerBindTexture("reimu_body");

    //bind bullets
    stgCreate2DBulletTemplateA1("reimu_shot1","reimu_body",0,144,16,16,16,0,0,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("reimu_shot2","reimu_body",192,144,64,16,0,0,0,1,_hit_box_large,{move_rotate:1,alpha:150});
    stgCreate2DBulletTemplateA1("reimu_shot3","reimu_body",0,144+32,64,16,0,0,0,1,_hit_box_large,{move_rotate:1,alpha:150});

    stgCreate2DBulletTemplateA1("reimu_aura1","reimu_body",0,256-64,64,64,0,0,0,1,_hit_box_huge,{alpha:150});



    //version 2
    this.version=2;
};

Player_Reimu.prototype.init=function(){
    var player=this.player;
    //in case player is not set up, use default data
    th.playerUseDefault(player);
    //set default position
    var n=stg_players_number;
    stgSetPositionA1(player,stg_frame_w/(n+1)*(this.slot+1),stg_frame_h*0.75);


    //when player is added to field, player handler should restore player state from commondata
    th.playerRestoreFromData(player,stg_common_data);

    //todo add your special setup from commondata here


    //you may need a default grazer
    this.grazer=new StgGrazer(player);
    stgAddObject(this.grazer);

    //you may bind a script to the player object
    player.script=Player_Reimu.player_script;
    player.on_death=Player_Reimu.on_death;
    player.on_graze=Player_Reimu.on_graze;

    //set player hitbox
    player.hitby=new StgHitDef();
    player.hitby.setPointA1(0,0,1);

    //add player to field
    stgAddObject(player);
};
//host death_script
Player_Reimu.on_death=function(){
    var a=new BreakCircleEffect(45);
    stgAddObject(a);
    stgSetPositionA1(a,this.pos[0],this.pos[1]);
};
Player_Reimu.on_graze=function(){
    stgPlaySE("se_graze");
    th.playerAddResource(this,"graze",1);
    var a=new GrazeParticle(this.pos[0],this.pos[1],stg_rand(0,360));
    stgAddObject(a);
};


//host player_script
Player_Reimu.player_script=function(){
    //each frame resources are added to the player.content
    //send content to player itself
    if(th.playerCheckResourceA1(this,"bomb",8)){
        //todo play some SE or place a banner here
    }
    var q=this.graze;
    th.playerCheckResourceA1(this,"graze");//擦弹
    q=this.graze-q;
    th.playerAddResource(this,"point_bonus",q);
    th.playerCheckResourceA2(this,"point_bonus",500000,10);//最大得点
    th.playerCheckResourceA1(this,"life",8);
    //todo check other resources here

    //use default animation
    //you can use different texture here (i.e. two players swap)
    th.playerAnimation(this,"reimu_body");

    //player cast spell check
    th.playerScriptBombCheck(this,Player_Reimu_Spell,400);

    //apply notice
    if(this.state==stg_const.PLAYER_NORMAL || this.state==stg_const.PLAYER_REBIRTH ){
        spriteUseInviEffect();
    }

    //get key object
    var key=this.key;
    var x=this.pos[0];
    var y=this.pos[1];
    var shot_flag=key[stg_const.KEY_SHOT]&&(this.state==stg_const.PLAYER_NORMAL);
    if(th.actionCoolDown("timer1",3,shot_flag)){
        stgCreateShotP1(x-8,y,8,270,"reimu_shot1",0,0,8,1);
        stgCreateShotP1(x+8,y,8,270,"reimu_shot1",0,0,8,1);
    }

};

//constructor of player reimu's spell
function Player_Reimu_Spell(player){
    this.base=new StgBase(player,thc.BASE_COPY);
}
Player_Reimu_Spell.prototype.createBall=function(id,r,g,b){
    stgCreateShotP1(this.pos[0],this.pos[1],0,0,"reimu_aura1",0,0,3,100);
    renderSetSpriteColor(r,g,b,255,stg_last);
    stg_last.script=Player_Reimu_Spell.light_ball_script;
    stg_last.a=id/8*360;
    stg_last.id=id;
    stg_last.player=this.parent;
};
Player_Reimu_Spell.prototype.init=function(){
    this.createBall(0,255,0,0);
    this.createBall(1,255,0,0);
    this.createBall(2,255,0,0);
    this.createBall(3,255,0,0);
    this.createBall(4,255,0,0);
    this.createBall(5,255,0,0);
    this.createBall(6,255,0,0);
    this.createBall(7,255,0,0);
    stgPlaySE("se_cast");
};
Player_Reimu_Spell.prototype.script=function(){
    if(frame>360){
        stgDeleteSelf();
    }
};

Player_Reimu_Spell.light_ball_onhit=function(a){
    if(a.type==stg_const.OBJ_BULLET){
        if(!a.keep){
            deleteShotToItem(a);
        }
    }
};
Player_Reimu_Spell.light_ball_script=function(){
    this.penetrate=100;
    this.keep=1;
    if(frame==1){
        this.hitby=new StgHitDef();
        this.hitby.setPointA1(0,0,64);
        this.hitdef.setPointA1(0,0,64);
        renderSetSpriteScale(2,2,this);
        this.on_hit_by=Player_Reimu_Spell.light_ball_onhit;
    }
    if(frame<180){
        var r=sqrt(frame/180)*160;
        var a=this.a+frame*4;
        var x=this.player.pos[0]+r*sind(a);
        var y=this.player.pos[1]+r*cosd(a);
        this.pos[0]=x;
        this.pos[1]=y;
        this.resolve_move=1;
    }
    if(this.frame==180){
        var p=_hit_by_pool;
        var flag=0;
        var mindis=9999;
        for(var i=0;i< p.length;i++){
            var t=_hit_by_pool[i];
            if(t.side==stg_const.SIDE_ENEMY){
                flag=1;
                var d=sqrt2(this.pos, t.pos);
                if(d<mindis){
                    mindis=d;
                    flag=t;
                }

            }
        }
        if(flag){
            luaSmoothBezierMoveTo(10*this.move.speed, flag.pos,60+this.id*12);
        }
    }else if(this.frame==238+this.id*12){
        this.damage=240;
    }else if(this.frame==239+this.id*12){
        stgDeleteSelf();
    }
    //deleteAllShot();
};
