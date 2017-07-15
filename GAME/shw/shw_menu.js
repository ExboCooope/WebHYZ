/**
 * Created by Exbo on 2017/7/9.
 */
shw.setting_menu=new MenuHolderA1([150,60],[0,20],hyz.main_menu);
shw.refresh_mode=0;

hyz.main_menu.pushItem(new TextMenuItem("设置",1,1,shw.setting_menu,1));

shw.setting_sync=new TextMenuItem("垂直同步：",1,1,null,0);
shw.setting_sync.on_select={
    init:function(){
        stgDeleteSelf();
        shw.refresh_mode=(shw.refresh_mode+1)%3;
        if(shw.refresh_mode){
            stg_refresher_type=shw.refresh_mode-1;
        }
        stgSaveData("refresh",shw.refresh_mode);
        shw.setting_sync.mtext="垂直同步："+["自动","关闭","开启"][shw.refresh_mode];
    }
};
shw.sprite_mode=0;
shw.setting_sprite=new TextMenuItem("渲染方式：",1,1,null,0);
shw.setting_sprite.on_select={
    init:function(){
        stgDeleteSelf();
        shw.sprite_mode=1-shw.sprite_mode;
        stgSaveData("spritemode",shw.sprite_mode);
        shw.setting_sprite.mtext="渲染方式（需重启）："+(!shw.sprite_mode?"点精灵":"四边形");
    }
};
shw.setting_menu.pushItems(shw.setting_sync,shw.setting_sprite);


shw.mode_select_menu=new MenuHolderA1([150,60],[10,20],hyz.main_menu);

shw.phase_select_menu=new MenuHolderA1([360,60],[0,20],shw.mode_select_menu,1);

(function(){
    for(var i=0;i<BossSLZ.phases.length;i++){
        var item=new TextMenuItem("第"+(i+1)+"身",1,1,null,0);
        var onsel={
            i:i,
            init:function(){
                stg_players_number=1;
                stg_local_player_pos=0;
                stg_local_player_slot=[0];
                stgCreateInput(0);
                shw.game_start_up.players=["remilia"];
                shw.game_start_up.commondata={spell_practice:1,phase:this.i};
                shw.startGame("shw_level");
            }
        };
        item.on_select=onsel;
        shw.phase_select_menu.pushItem(item);
    }
})();



shw.mode_single_item=new TextMenuItem("单人游戏",1,1,null,0);
shw.mode_easy_item=new TextMenuItem("简单游戏",1,1,null,0);
shw.mode_ai_item=new TextMenuItem("双人游戏（AI）",1,1,null,0);
shw.mode_double_item=new TextMenuItem("双人游戏",1,1,null,0);
shw.mode_practice_item=new TextMenuItem("练习模式",1,1,shw.phase_select_menu,0);
shw.mode_pressure=new TextMenuItem("性能测试",1,1,null,0);

shw.mode_single_item.on_select={
    init:function(){
        stg_players_number=1;
        stg_local_player_pos=0;
        stg_local_player_slot=[0];
        stgCreateInput(0);
        shw.game_start_up.players=["remilia"];
        shw.game_start_up.commondata={};
        shw.startGame("shw_level");
    }
};
shw.mode_easy_item.on_select={
    init:function(){
        stg_players_number=1;
        stg_local_player_pos=0;
        stg_local_player_slot=[0];
        stgCreateInput(0);
        shw.game_start_up.players=["remilia"];
        shw.game_start_up.commondata={difficulty:1};
        shw.startGame("shw_level");
    }
};
shw.mode_pressure.on_select={
    init:function(){
        stg_players_number=1;
        stg_local_player_pos=0;
        stg_local_player_slot=[0];
        stgCreateInput(0);
        shw.game_start_up.players=["remilia"];
        shw.game_start_up.commondata={pressure_test:1};
        shw.startGame("shw_level");
    }
};
shw.mode_ai_item.on_select={
    init:function(){
        stg_players_number=2;
        stg_local_player_pos=0;
        stg_local_player_slot=[0,1];
        stgCreateInput(0);
        shw.game_start_up.players=["remilia","reimu"];
        shw.game_start_up.commondata={ai:1};
        shw.startGame("shw_level");
    }
};
shw.mode_double_item.on_select={
    init:function(){
        stg_players_number=2;
        stg_local_player_pos=0;
        stg_local_player_slot=[0,1];
        stgCreateInput(0);
        shw.game_start_up.players=["remilia","reimu"];
        shw.game_start_up.commondata={};
        shw.startGame("shw_level");
    }
};

shw.mode_select_menu.pushItems(shw.mode_single_item,shw.mode_easy_item,shw.mode_ai_item,shw.mode_double_item,shw.mode_practice_item,shw.mode_pressure);