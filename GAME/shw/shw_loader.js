/**
 * Created by Exbo on 2017/1/2.
 */

var shw={};
shw.shell={};
shw.shell.init=function(){
    stgLoadModuleObject(shw.loading);
    th.gameSetPlayerCount(1);
    stg_wait_for_all_texture=1;
};
shw.shell.script=function(){
    if(this.frame>1){
        stgAddObject(shw_loader);
        stg_menu_script=shw_loader;
        stgDeleteSelf();
    }
};




var shw_loader={
    loaded:0
};

shw_loader.init=function(){
    th.gameSetPlayerCount(1);
    if(stg_common_data.restart){
        stgAddObject(shw.last_start_up);
        stg_display = ["drawBackground","drawCombineFrame","drawUI"];
        stgAddObject(hyz.full_bg_object);
        stgAddObject(hyz.full_screen_object);
        stgAddObject(hyz.resolution);
        return;
    }
    stgPlayBGM();
    //stgPauseSE("BGM");
    stg_in_replay=0;
    if(!this.loaded){
        //初始化环境
        this.loaded=1;
        //stg_refresher_type=1;
        stgLoadKeyMap();//初始化按键表
        bullet00Assignment();//初始化子弹文理绑定
        //载入音效
        stgLoadSE("se_alert","se/se_alert.wav").ready=1;
        stgLoadSE("se_graze","se/se_graze.wav",0.5).ready=1;
        stgLoadSE("se_select","se/se_select00.wav").ready=1;
        stgLoadSE("se_dead","se/se_pldead00.wav").ready=1;
        stgLoadSE("se_ok","se/se_ok00.wav",0.3).ready=1;
        stgLoadSE("se_cancel","se/se_cancel00.wav",0.3).ready=1;
        stgLoadSE("se_extend","se/se_extend.wav").ready=1;
        stgLoadSE("se_cast","se/se_cat00.wav",0.3).ready=1;
        stgLoadSE("se_boss_cast","se/se_ch02.wav").ready=1;
        stgLoadSE("se_enemy_dead","se/se_enep00.wav").ready=1;
        stgLoadSE("se_shot0","se/se_tan00.wav",0.3).ready=1;
        stgLoadSE("se_shot1","se/se_tan01.wav",0.3).ready=1;
        stgLoadSE("se_shot2","se/se_tan02.wav",0.3).ready=1;
        stgLoadSE("se_boon01","se/se_boon01.wav").ready=1;
        stgLoadSE("se_kira02","se/se_kira02.wav").ready=1;
        stgLoadSE("se_laser","se/se_laser00.wav").ready=1;

        stgLoadModule("enemy_system");
        stgLoadModuleObject(esp);
        //stgLoadModuleObject(shw.loading);
        stgLoadModuleObject(BossSLZ);
        stgLoadModuleObject(BossESC);
        stgLoadModule("boss_system");
        for(var pn in stg_player_templates){
            stgLoadModuleObject(stg_player_templates[pn]);
        }
        stgLoadModuleObject(th);

        loadHyzFont();
        loadItemSystem();
        //横向场地
        stg_height=480;
        stg_width=640;

        stg_frame_w=384;
        stg_frame_h=448;

        var p=stgLoadData("render_type");
        p=0;
        stgCreateCanvas("frame",stg_width/*608*/,stg_height,stg_const.TEX_CANVAS3D);
        stgCreateCanvas("frame_bg",stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);
    //    stgCreateCanvas("frame_left",stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);
        stgCreateCanvas("frame_full",stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);
        stgCreateCanvas("frame_full_bg",stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);

    //    stgCreateCanvas("frame_right",stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);

        stg_main_canvas=stgCreateCanvas("ui",stg_width,stg_height,stg_const.TEX_CANVAS2D);
        stgCreateCanvas("back",stg_width,stg_height,stg_const.TEX_CANVAS2D);
        stgCreateCanvas("pause",stg_width,stg_height,stg_const.TEX_CANVAS2D);
        stgCreateCanvas("magic_circle",256,256,stg_const.TEX_CANVAS3D_TARGET);

        //激活鼠标事件捕捉
        stgEnableMouse();

        //显示canvas
        stgShowCanvas("back", 0, 0, 0, 0, 0);
        stgShowCanvas("frame", 0, 0, 0, 0, 5);
        stgShowCanvas("ui", 0, 0, 0, 0, 20);
        //载入渲染器
        stgAddShader("lua_shader",luaShader);
        shw.refresh_mode=stgLoadData("refresh")||0;
        if(shw.refresh_mode){
            stg_refresher_type=shw.refresh_mode-1;
        }
        shw.setting_sync.mtext="垂直同步："+["自动","开启","关闭"][shw.refresh_mode];

        shw.sprite_mode=1-shw.sprite_mode;
        shw.sprite_mode=stgLoadData("spritemode")||0;
        shw.setting_sprite.mtext="渲染方式（需重启）："+(!shw.sprite_mode?"点精灵":"四边形");

        if(shw.sprite_mode){
            stgAddShader("sprite_shader",hyzSpriteShader);
        }else{
            stgAddShader("sprite_shader",hyzSpriteShaderV2);
        }
       // stgAddShader("sprite_shader",hyzSpriteShader);
     //   stgAddShader("point_shader",hyzSpriteShader);
        stgAddShader("basic_shader",hyzPrimitive2DShader);
        stgAddShader("testShader2", default_2d_misc_shader);
        stgAddShader("3d_shader", default_3d_shader);

        stgCreateImageTexture("remilia_boss","players/remilia_boss.png");
        renderCreate2DTemplateA1("remilia_boss_image","remilia_boss",0,0,64,80,64,0,0,1);

        stgCreateImageTexture("3dTex1","bg/grass2.png");
        stgCreateImageTexture("3dTex2","bg/wall.png");
        stgCreateImageTexture("3dTex3","bg/floor.png");
        stgCreateImageTexture("laser1","laser.png");
        stgCreateImageTexture("life","LifeGauge.png");
        stgCreateImageTexture("particle","particles.png");
        stgCreateImageTexture("slz","slz.png");
        stgCreateImageTexture("mcircle","eff_magic_circle.png");
        stgCreateImageTexture("white","white.png");
        renderCreate2DTemplateA1("white","white",0,0,1,1,0,0,0,1);

        renderCreate2DTemplateA1("mcircle","mcircle",0,0,256,256,0,0,0,1);
        renderCreate2DTemplateA2("particle","particle",0,0,32,32,4,4,0,1);
        renderCreate2DTemplateA1("magic_circle","magic_circle",0,0,256,256,0,0,0,1);


        renderCreate2DTemplateA1("ene_boom","pl_effect",192,176,64,64,64,0,0,1);
        renderCreate2DTemplateA1("bounce_0","pl_effect",192,240,16,16,16,0,0,1);
        renderCreate2DTemplateA1("bounce_1","pl_effect",64,240,16,16,16,0,0,1);


        stgCreateProcedure1("drawBackground","back",0,19,"testShader2","#DDD");
    //    stgCreateProcedure2("drawLeftFrame","frame_left",20,80,["sprite_shader","basic_shader"],"#000");
     //   stgCreateProcedure2("drawRightFrame","frame_right",20,80,["sprite_shader","basic_shader"],"#000");

        stgCreateProcedure2("drawFullFrame","frame_full",20,80,["sprite_shader","basic_shader","laser_shader"],"#000");

        stgCreateProcedure2("drawCombineFrame","frame",201,300,["sprite_shader","basic_shader"],"#000");
    //    stgCreateProcedure1("drawBGFrame","frame_bg",101,200,"3d_shader","#FFF");
       // stgCreateProcedure1("drawFullBGFrame","frame_full_bg",101,200,"3d_shader","#FFF");
        stgCreateProcedure1("drawFullBGFrame","frame_full_bg",101,200,"lua_shader","#000");

        stgCreateProcedure1("drawUI","ui",81,100,"testShader2","#000");

        stgCreateProcedure1("drawMagicCircle","magic_circle",0,0,"sprite_shader","#000");
        stg_procedures["drawMagicCircle"].transparent=1;
        stg_procedures["drawMagicCircle"].sid=0;

        //stg_procedures["drawRightFrame"].transparent=1;
       // stg_procedures["drawLeftFrame"].transparent=1;
      //  stg_procedures["drawRightFrame"].sid=2;
      //  stg_procedures["drawLeftFrame"].sid=1;
        stg_procedures["drawFullFrame"].sid=3;


        stg_procedures["drawCombineFrame"].transparent=1;
       // stg_procedures["drawCombineFrame"].sid=3;
        stg_procedures["drawUI"].transparent=1;
        //创建绘制流程
        for(var i in stg_player_templates){
            if(stg_player_templates[i].pre_load){
                stg_player_templates[i].pre_load();
            }
        }

        //设置只有一个玩家

        //设置随机种子
        stg_rand_seed[0]=new Date().getTime();
        //等待资源下载完成
        //stg_wait_for_all_texture=1;
        stgAddObject(shw.loading);

        //初始化菜单
       // ifeGenerateMenu();
        //设置暂停脚本
        stg_pause_script=hyz.pause_script;
        stg_system_script=hyz_system_script;


        stgSetPositionA1(hyz.full_bg_object,0,0);
        hyz.full_bg_object.layer=20;
        hyz.full_bg_object.sid=3;
        ApplyFullTexture(hyz.full_bg_object,"frame_full_bg");

        stgSetPositionA1(hyz.full_screen_object,/*36*/32,16);
        hyz.full_screen_object.layer=220;
        ApplyFullTexture(hyz.full_screen_object,"frame_full");

        th.scriptLoadScript("GAME/element_system.js");

/*
        stgCreateCanvas("frame_right_smear",stg_frame_w,stg_frame_h,stg_const.TEX_CANVAS3D_TARGET);
        stgCreateProcedure1("drawRightFrameSmear","frame_right_smear",10,80,"sprite_shader","#000");
        stg_procedures["drawRightFrameSmear"].sid=2;
      //  stg_procedures["drawRightFrameSmear"].transparent=1;
        stg_procedures["drawRightFrameSmear"].smear=1;
        stgSetPositionA1(hyz.right_screen_object_2,320,0);
        hyz.right_screen_object_2.layer=201;
        ApplyFullTexture(hyz.right_screen_object_2,"frame_right_smear");

*/      stg_procedures["drawBGFrame"]={};

        shw.build_phase();
        gLoadMenuSystem();
/*
        hyz.item_start.on_select={
            init:function(){
                //stgStartLevel("shw_level",["remilia"],{});
                shw.startGame("shw_level");
            }
        }
*/
        hyz.item_start.on_select=shw.mode_select_menu;
        stgCreateImageTexture("game_frame_bg_img","GAME/shw/frame_bg.png");
        stgSetPositionA1(shw.game_frame_bg,0,0);
        shw.game_frame_bg.layer=201;


    }
    stg_display = ["drawBackground","drawCombineFrame","drawUI"];
    stgAddObject(hyz.resolution);
    stgAddObject(hyz.main_menu);
    stgDeleteSelf();
    hyz.main_menu.setColor("#88F","#880");
  //  stgAddObject(hyz.set_up_frame_object);
    if(stg_common_data.menu_state==1){//游戏结束返回的情况
        hyz.item_playreplay.selectable=1;
        hyz.item_savereplay.selectable=1;
        hyz.main_menu.setColor("#88F","#880");
      //  stgHideCanvas("frame");
    }
    stgClearCanvas("ui");
/*
    var test={};
    test.render=new StgRender("point_shader");
    renderApply2DTemplate(test,"remilia_boss_image",0);
    test.layer=280;
    stgSetPositionA1(test,100,100);
    stgAddObject(test);
    test.self_rotate=0.05;

    test={};
    test.render=new StgRender("sprite_shader");
    renderApply2DTemplate(test,"remilia_boss_image",0);
    test.layer=280;
    stgSetPositionA1(test,200,100);
    stgAddObject(test);
    test.self_rotate=0.05;*/

    var hint=new RenderText(12,460,"默认操作：Z 确认、射击   X 取消、雷   Shift 低速  方向键 移动");
    stgAddObject(hint);
    stg_last.render.font="20px 黑体";
    stg_last.render.color="#000";




    renderCreate2DTemplateA2("test_animation","test_animation",0,0,14,14,18,6,0,1);
    th.spriteAnimationCreate("test_animation");
    th.spriteAnimationSetFrameA1("test_animation",0,"test_animation",20,20,1);
    th.spriteAnimationSetFrameA1("test_animation",1,"test_animation",21,20,2);
    th.spriteAnimationSetFrameA1("test_animation",2,"test_animation",22,20,0);
    /*
    var a=th.objCreateObject();
    a.layer=250;
    th.spriteAnimationApply(a,"test_animation");
    stgAddObject(a);
    renderSetSpriteColor(255,0,0,255,a);
    stgSetPositionA1(a,100,10);

    var b=th.objCreateObject();
    th.spriteSet(b,"test_animation",20,250);
    renderSetSpriteColor(0,255,0,255,b);
    stgSetPositionA1(b,120,10);
    */
};

stgCreateImageTexture("test_animation","res/ascii.png");


shw_loader.script=function(){
    //
};

shw.game_frame_bg={};


function ApplyFullTexture(obj,name){
    obj.render=new StgRender("sprite_shader");
    renderApplyFullTexture(obj.render,name);
}

hyz.item_playreplay.on_select={
    init:function(){
        shw.game_start_up.level=0;
        stgAddObject(shw.game_start_up);
    }
};

shw.startGame=function(level){
    shw.game_start_up.level=level;
    stgAddObject(shw.game_start_up);
}

shw.last_start_up=0;

shw.game_start_up={};
shw.game_start_up.init=function(){
    shw.last_start_up=this;
    shw.loading.finish=false;




    stgAddObject(shw.loading);
};
shw.game_start_up.script=function(){
    if(shw.loading.finish){
        stgDeleteSelf();
        stgFreezeObject(shw.loading);
        stgFreezeObject(shw.loading.left_gate);
        stgFreezeObject(shw.loading.right_gate);
        if(this.level) {
            stgStartLevel(this.level, this.players||["remilia"], this.commondata||{});
        }else{
            replayStartLevel(0);
        }
    }
};

function BGLeaf(x,y){
    this.x=x;
    this.y=y;
}
BGLeaf.prototype.init=function(){
    th.spriteSet(this,"boss_leaf",0,21);
    renderSetObjectSpriteBlend(this,blend_add);
    stgEnableMove(this);
    stgSetPositionA1(this,this.x,this.y);
    this.rotate[2]=stg_rand(PI2);
    this.self_rotate=stg_rand(-1.5,1.5)*PI180;
    this.move.setSpeed(stg_rand(1,4),stg_rand(95,170));
    this.scales=[stg_rand(0.8,3),stg_rand(0.3,1.0)];
    renderSetSpriteScale(this.scales[0],this.scales[1],this);
    renderSetSpriteColor(255,200,100,150,this);
};
BGLeaf.prototype.script=function(){
    if(this.pos[0]<-20||this.pos[1]>stg_frame_h+20){
        stgDeleteSelf();
        return;
    }
    if(this.frame%8==0){
        this.move.speed_angle_acceleration+=stg_rand(-1,1)*PI180;
        this.move.speed_angle_acceleration=clip2(-1*PI180,1*PI180,this.move.speed_angle_acceleration);
    }
    this.move.speed_angle=clip2(95*PI180,170*PI180,this.move.speed_angle);
    renderSetSpriteScale(0.4+0.3*sind(this.scales[0]*this.frame),this.scales[1]);
};
BGLeaf.create=function(){
    if(stg_target.frame%48==0) {
        for (var i = 0; i < 8; i++) {
            stgAddObject(new BGLeaf(stg_frame_w + stg_rand(40), stg_rand(80)));
        }
    }
};