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
};
shw.level.script=function(){
    if(stg_players_number==1){
        stg_players[1]=stg_players[0];
    }
    if(this.frame==60){
        stgAddObject(new BossSLZ());
    }
};

stg_level_templates["shw_level"]=shw.level;