/**
 * Created by Exbo on 2015/11/27.
 */

var default_system_script={};
default_system_script.init=function(){
    zoomerSetFrameAlpha(1);
    stg_procedures["drawFrame"].active=1;
    var p=stg_target;
    p.fps_drawer=new RenderText(560, 460);
    p.game_diffi_drawer=new RenderText(500,10);
    p.game_diffi_drawer.textAlign="center";
    p.high_score_title=new RenderText(430,40);
    p.high_score_title.render.text="最高分";
   // p.high_score_drawer=new RenderText(620,40);
    //p.high_score_drawer.textAlign="right";
    p.score_title=new RenderText(430,60);
    p.score_title.render.text="得分";
   // p.score_drawer=new RenderText(620,60);
    //p.score_drawer.textAlign="right";
    p.life_drawer=new RenderText(430,80);
    p.life_drawer.render.text="生命 ";
    p.bomb_drawer=new RenderText(430,100);
    p.bomb_drawer.render.text="符卡 ";



};


default_system_script.script=function(){
    var p=stg_target;
    p.fps_drawer.render.text="" + (stg_fps >> 0) + " FPS";
    p.game_diffi_drawer.render.text=""+(stg_common_data.difficulty||"Normal");
    p.high_score_title.render.text="最高分 "+stg_local_player.hiscore+"";
    p.score_title.render.text="得分 "+stg_local_player.score+"";
   // p.score_drawer.render.x=620-p.score_drawer.render.text.length*16+16;

    var ls="生命 ";
    for (var k=0;k<stg_local_player.life;k++){
       ls+="♥";
    }

    p.life_drawer.render.text=ls;

    ls="符卡 ";
    for (var k=0;k<stg_local_player.bomb;k++){
        ls+="♦";
    }
    p.bomb_drawer.render.text=ls;
    if(stg_replay_end==1){
        stgCloseLevel();
        stg_in_replay=0;
        stg_replay_end=0;
    }
};



