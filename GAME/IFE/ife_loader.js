/**
 * Created by Exbo on 2016/4/13.
 */

var ife={};

var ife_loader={
    loaded:0
};
ife_loader.init=function(){
    stgPauseSE(null,"BGM");
    stg_in_replay=0;
    if(!this.loaded){
        //初始化环境
        this.loaded=1;
        //stg_refresher_type=1;
        stgLoadKeyMap();//初始化按键表
        bullet00Assignment();//初始化子弹文理绑定
        //载入音效
        stgLoadSE("se_alert","se/se_alert.wav").ready=1;
        stgLoadSE("se_graze","se/se_graze.wav").ready=1;
        stgLoadSE("se_select","se/se_select00.wav").ready=1;
        stgLoadSE("se_dead","se/se_pldead00.wav").ready=1;
        stgLoadSE("se_ok","se/se_ok00.wav").ready=1;
        stgLoadSE("se_cancel","se/se_cancel00.wav").ready=1;
        stgLoadSE("se_extend","se/se_extend.wav").ready=1;

        //纵向场地
        stg_height=640;
        stg_width=480;

        stg_frame_w=480;
        stg_frame_h=550;

        if(IsPC())stg_refresher_type=0;
        var p=stgLoadData("render_type");
        //p=1;
        stgCreateCanvas("frame",stg_frame_w,stg_frame_h,p?stg_const.TEX_CANVAS2D:stg_const.TEX_CANVAS3D);
        stg_main_canvas=stgCreateCanvas("ui",stg_width,stg_height,stg_const.TEX_CANVAS2D);
        stgCreateCanvas("back",stg_width,stg_height,stg_const.TEX_CANVAS2D);
        stgCreateCanvas("pause",stg_width,stg_height,stg_const.TEX_CANVAS2D);

        //激活鼠标事件捕捉
        stgEnableMouse();

        //显示canvas
        stgShowCanvas("back", 0, 0, 0, 0, 0);
        stgShowCanvas("frame", 0, 0, 0, 0, 1);
        stgShowCanvas("ui", 0, 0, 0, 0, 20);

        //载入渲染器
        stgAddShader("sprite_shader",ifeSpriteShader);
        stgAddShader("testShader2", default_2d_misc_shader);

        //创建渲染流程
        var p1=new StgProcedure("back",0,19);//层数为0~19的对象将渲染到back上
        p1.shader_order=["testShader2"];//使用default_2d_misc_shader渲染
        stg_procedures["drawBackground"] = p1;
        p1.background="#DDD";

        var p2=new StgProcedure("frame",20,80);
        p2.shader_order=["sprite_shader"];
        stg_procedures["drawFrame"] = p2;
        p2.background="#FFF";

        var p3=new StgProcedure("ui",81,100);
        p3.shader_order=["testShader2"];
        stg_procedures["drawUI"] = p3;

        //创建绘制流程
        stg_display = ["drawBackground","drawFrame","drawUI"];

        //设置只有一个玩家
        stg_players_number=1;
        stg_local_player_pos=0;

        //创建输入设备
        stgCreateInput(0)//延迟为0
        //设置随机种子
        stg_rand_seed[0]=new Date().getTime();
        //等待资源下载完成
        stg_wait_for_all_texture=1;

        //初始化菜单
        ifeGenerateMenu();

        //设置暂停脚本
        stg_pause_script=ife.pause_script;
        stg_system_script=ife_system_script;




    }


    ife.logo=new RenderText(20,580);
    if(IsPC() && !window.chrome){
        ife.logo.render.text="JavaSTaGe v0.3.0 建议使用Chrome浏览器";
    }else{
        ife.logo.render.text="JavaSTaGe v0.3.0 内部版本  Exbo 2016/4/15";
    }
    ife.logo.render.color="#000";
    stgAddObject(ife.resolution);
    stgAddObject(ife.main_menu);
    if(stg_common_data.menu_state==1){//游戏结束返回的情况
        ife.item_playreplay.selectable=1;
        ife.item_savereplay.selectable=1;
        ife.main_menu.setColor("#88F","#880");
    }
    stgClearCanvas("ui");
    //stgDeleteSelf();
    ife.avoid_refresh();
};
ife_loader.script=function(){
    if(ife.main_menu.active) {
        var t = checkKeyChange();
        if (t.length) {
            if (t[0] == 82) {
                stgResetKeyMap();
            }
        }
    }
};


ife.startGame=function(level,player,commondata){
    stgStartLevel(level,[player],commondata||{});
};

