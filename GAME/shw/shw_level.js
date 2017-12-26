/**
 * Created by Exbo on 2017/6/9.
 */
shw.set_up_frame_object={
    init:function(){
        stgAddObject(hyz.resolution);
      //  stgShowCanvas("frame",0,0,0,0,5);
        stg_display = ["drawMagicCircle","drawBackground","drawFullBGFrame","drawFullFrame",
            "drawCombineFrame","drawUI"];
        hyz.resolution.refresh();
        hyzAddObject(hyz.full_bg_object,3);
        hyzAddObject(hyz.full_screen_object,0);
        stgDeleteSelf();
    }
};


shw.level={};
shw.level.init=function(){
    this.sid=1;
    stgReturnObject(shw.loading);
    stgReturnObject(shw.loading.left_gate);
    stgReturnObject(shw.loading.right_gate);
    hyz.battle_style=1;
   // hyzSetBattleStyle(1,0);
    stgAddObject(shw.set_up_frame_object);
   // stgAddObject(background_controller);
  //  stgAddObject(background_01);
    stgAddObject(new river_background());
    stgAddObject(hyz.magicCircle);
    stg_players[0].sid=1;
    stg_common_data.current_hit=[0,0];
    stg_common_data.current_chain_score=[0,0];
    stg_common_data.current_combo_time=[0,0];
    stg_common_data.current_charge_max=[100,100];
    stg_common_data.current_charge=[0,0];
    stg_common_data.current_spell_level=[6,6];
    stg_common_data.current_boss_level=[6,6];

    ApplyFullTexture(shw.game_frame_bg,"game_frame_bg_img");
    hyzAddObject(shw.game_frame_bg,0);
    this.sid=1;
    this.fps_drawer=new RenderText(300, 464);
    stgAddObject(this.fps_drawer);
    stg_last.render.color="#FFF";
    stg_last.script=function(){
        this.render.text=(_pool.length)+" 物体 "+(((stg_fps)>>0)+" fps");
    };
    this.counter=0;

    var a=th.objCreateDelayObject(30);
    th.spriteSet(a,"th_title",4,250);
   // var b=hyzGetFrameObject(0);
    stgSetPositionA1(a,32+stg_frame_w/2, 16+50);
    //stgSetPositionA1(a,529,32);
    a.sid=0;
    a.script=shw.title_bar_script;
    renderSetSpriteScale(1,0,a);

   // stgAddObject(element_system);

    a=new ElementBase(stg_frame_w+75,390,[255,0,0,255],[0,0,255,255],0.75,0);
    a.sid=0;
    stgAddObject(a);
    a=new ElementBase(stg_frame_w+75,415,[140,102,53,255],[0,255,0,255],0.75,1);
    a.sid=0;
    stgAddObject(a);
    a=new ElementBase(stg_frame_w+75,440,[255,255,0,255],[255,0,255,255],0.75,2);
    a.sid=0;
    stgAddObject(a);


    //shw.practice.showDialog(50,50,200,400,20,"这是一段很长的对话，哈哈哈哈\n或或或或或，爱德华哦啊哈佛私房话","#FFF");

    hyzAddObject(new thc.ScoreDisplay(0,0),0);

  //  stgCreateShotA1(100,100,0,45,"sLD",0,0);

};

shw.title_bar_script=function(){
    if(this.frame<=30){
        renderSetSpriteScale(1,this.frame/30,this);
    }else if(this.frame==120){
        luaMoveTo(530,32,80,1,this);
    }else if(this.frame>120 && this.frame<=200){
        this.rotate[2]=360*(this.frame-120)/80*PI180;
    }
    if(this.frame==200){
        this.script=0;
    }
};

shw.level.script=function(){


    BGLeaf.create();
   // return;
    if(stg_players_number==1){
        stg_players[1]=stg_players[0];
    }

    if(this.frame==30){
        if(stg_common_data.ai){
            stgAddObject(new BasicAI(stg_players[1]));
        }
    }

    if(this.frame==60){
        if(stg_common_data.pressure_test){
            stgAddObject(shw.pureSpriteTest);
            stgDeleteSelf();
            return;
        }
        this.boss=new BossSLZ();
       // this.boss=new BossESC();
        stgAddObject(this.boss);
    }
    if(this.frame>=60){
        if(this.boss.remove){
            this.counter++;
            if(this.counter>(stg_common_data.spell_practice?60:240)){
                stgCloseLevel();
            }
        }
/*
        this.side=stg_const.SIDE_ENEMY;
        var l=new ComplexLaser(60);
        stgAddObject(l);
        l.target_length=30;
        l.width_add=0.1;
        l.setTexture("bullet",286,128,286,192,0);
       // l.setTexture("white",286,128,286,192,0);
        l.texture_width=10;
        stgSetPositionA1(l,stg_frame_w/2,stg_frame_h/2);
        l.move.setSpeed(3,this.frame*3);
        l.move.speed_angle_acceleration=-0.03;
      //  l.texture_width=200;
        this.l=l;
      //  l.script=shw.hello_laser_script;*/
    }
    if(this.frame==120){
      //  this.l.move.setSpeed(0);
      //  this.l.stop=0;
        /*
       var p= this.l.objlist;
        for(var i=7;i<9;i++){
            p[i].laser_active=0;
        }
        for(var i=30;i<32;i++){
            p[i].laser_active=0;
        }*/
    }
};

shw.hello_laser_script=function(){
    var p= this.objlist;
    if(this.frame==50) {
        this.move.setSpeed(0);
        this.stop=1;
        for (var i = 0; i <= p.length; i++) {
            var a=i== p.length?this.tail:p[i];
            luaMoveTo(a.pos[0]+sind(i*12)*50, a.pos[1],30,1,a);
        }
    }
    if(this.frame==110){
        this.move.setSpeed(3);
        this.stop=0;
    }
};

shw.pureSpriteTest={};
shw.pureSpriteTest.init=function(){
    for(var i=0;i<stg_players_number;i++){
        stg_players[i]._zzhitby=stg_players[i].hitby;
        stg_players[i].hitby=0;
    }
    this.rst=0;
    this.bltcnt=0;
};
shw.pureSpriteTest.script=function(){
    if(stg_players[0].key[stg_const.KEY_SHOT]){
        stgCreateShotA1(50,50,3,stg_rand(360),"tDD",0,stg_rand_int(0,7)).script=shw.pureSpriteTest.bltscript;
        stgCreateShotA1(50,50,3,stg_rand(360),"mMD",0,stg_rand_int(0,7)).script=shw.pureSpriteTest.bltscript;
        stgCreateShotA1(50,50,3,stg_rand(360),"mDD",0,stg_rand_int(0,7)).script=shw.pureSpriteTest.bltscript;
        stgCreateShotA1(50,50,3,stg_rand(360),"sXD",0,stg_rand_int(0,7)).script=shw.pureSpriteTest.bltscript;
        shw.pureSpriteTest.bltcnt+=4;
    }
    if(stg_players[0].key[stg_const.KEY_CTRL]){
        shw.pureSpriteTest.rst=4;
    }
};
shw.pureSpriteTest.bltscript=function(){
    if (stg_target.move.pos[0] > stg_frame_w) {
        stg_target.move.pos[0] = stg_frame_w;
        stg_target.move.speed_angle = PI - stg_target.move.speed_angle;
    }
    if (stg_target.move.pos[0] < 0) {
        stg_target.move.pos[0] = 0;
        stg_target.move.speed_angle = PI - stg_target.move.speed_angle;
    }
    if (stg_target.move.pos[1] > stg_frame_h) {
        stg_target.move.pos[1] = stg_frame_h;
        stg_target.move.speed_angle = -stg_target.move.speed_angle;
    }
    if (stg_target.move.pos[1] < 0) {
        stg_target.move.pos[1] = 0;
        stg_target.move.speed_angle = -stg_target.move.speed_angle;
    }
    if (shw.pureSpriteTest.rst >= 0) {
        stgDeleteObject(stg_target);
        shw.pureSpriteTest.rst--;
        shw.pureSpriteTest.bltcnt--;
    }
};


stg_level_templates["shw_level"]=shw.level;