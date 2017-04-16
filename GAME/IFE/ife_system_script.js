/**
 * Created by Exbo on 2016/4/13.
 */
/**
 * Created by Exbo on 2015/11/27.
 */

var ife_system_script={};
ife_system_script.init=function(){
    stg_procedures["drawFrame"].active=1;
    var p=stg_target;
    p.fps_drawer=new RenderText(400, 560);

    var q=new ButtonHolder("暂停菜单",1,1,
        {init:function(){
            _stgChangeGameState(stg_const.GAME_PAUSED);
            stgDeleteSelf();
        }},0,1);
    q.pos=[240,600];
    stgAddObject(q);
    stgAddObject(ife.resolution);

    /*
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
*/


};


ife_system_script.script=function(){
    var p=stg_target;
    p.fps_drawer.render.text="" + (stg_fps >> 0) + " FPS";
    //p.game_diffi_drawer.render.text=""+(stg_common_data.difficulty||"Normal");
    //p.high_score_title.render.text="最高分 "+stg_local_player.hiscore+"";
   // p.score_title.render.text="得分 "+stg_local_player.score+"";
    // p.score_drawer.render.x=620-p.score_drawer.render.text.length*16+16;
/*
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
    }*/

    if(stg_replay_end==1){
        stgCloseLevel();
        stg_in_replay=0;
        stg_replay_end=0;
    }
};

ife.resolution={
    script:function(){
        if(ife.fixed==1){
            var w=document.body.clientWidth;
            var h=document.body.clientHeight-40;
            var q=1;
        }else{
            var w=document.body.clientWidth;
            var h=document.body.clientHeight-40;
            var q=w/480>h/640?h/640:w/480;
        }

        if(q!=this.scale || w!=this.w || h!=this.h){
            this.scale=q;
            this.w=w;
            this.h=h;

            stgResizeCanvas("frame",(w-q*480)/2,(h-q*640)/2,0,0,480,stg_frame_h,q);
            stgResizeCanvas("ui",(w-q*480)/2,(h-q*640)/2,0,0,480,640,q);
            stgResizeCanvas("back",(w-q*480)/2,(h-q*640)/2,0,0,480,640,q);
            stgResizeCanvas("pause",(w-q*480)/2,(h-q*640)/2,0,0,480,640,q);

            var z=document.getElementById("1");
            z.style.top=h+"px";
            z.style.left=((w-q*480)/2)+"px";

        }

    }
};

