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
    stgReturnObject(shw.loading);
    stgReturnObject(shw.loading.left_gate);
    stgReturnObject(shw.loading.right_gate);
    hyz.battle_style=1;
   // hyzSetBattleStyle(1,0);
    stgAddObject(shw.set_up_frame_object);
    stgAddObject(background_controller);
    stgAddObject(background_01);
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

};
shw.level.script=function(){
    if(stg_players_number==1){
        stg_players[1]=stg_players[0];
    }
    if(this.frame==30){
        if(stg_common_data.ai){
            stgAddObject(new BasicAI(stg_players[1]));
        }
    }
    if(this.frame==60){
        this.boss=new BossSLZ();
        stgAddObject(this.boss);
    }
    if(this.frame>=60){
        if(this.boss.remove){
            this.counter++;
            if(this.counter>stg_common_data.spell_practice?60:240){
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


stg_level_templates["shw_level"]=shw.level;