/**
 * Created by Exbo on 2017/9/9.
 */


var javaStage={};

javaStage.group=function(){
    var a=[];
    for(var i=0;i<arguments.length;i++){
        for(var j=0;j<arguments[i].length;j++){
            a.push(arguments[i][j]);
        }
    }
    return a;
};

javaStage.core_scripts=[
    "STGCORE",
    "STGDISPLAY",
    "STGGLOBAL",
    "STGCONTROLLER",
    "STGMATH",
    "STGBULLET",
    "STGREPLAY",
    "STGMULTIPLAYER",
    "lstg_api"];
javaStage.webgl_scripts=[
    "WebGL/shaders",
    "WebGL/rendertarget",
    "WebGL/EMatrix",
    "WebGL/EMesh",
    "WebGL/OldGL"];
javaStage.default_scripts=[
    "GAME/default_lib",
    "GAME/default_bullets",
    "GAME/default_graphics",
    "GAME/default_system_script",
    "GAME/default_spellcard_system",
    "GAME/default_multiplayer_script",
    "GAME/default_ui",
    "GAME/default_3d_shader",
    "GAME/default_player_select_page",
    "GAME/default_player_script",
    "GAME/default_item_script",
    "GAME/thlib"];


javaStage.hyz_core=[
    "GAME/hyz/hyz_loader",
    "GAME/hyz/hyz_shaders",
    "GAME/hyz/hyz_system",
    "GAME/hyz/hyz_level",
    "GAME/hyz/hyz_ui"
];
javaStage.shw_core=[
    "GAME/shw/shw_loader",
    "GAME/shw/shw_level",
    "GAME/shw/shw_loading",
    "GAME/shw/shw_menu"
];
javaStage.shw_pack=[
    "GAME/shw/shw_package"
];

javaStage.packages={};

javaStage.packages["SHW Demo Version 0.1"]=javaStage.group(
    javaStage.hyz_core,
    javaStage.shw_core,
    javaStage.shw_pack
);
javaStage.packages["弹幕回避能力测试1.0"]=[
    "GAME/IFE/ife_loader",
    "GAME/IFE/ife_menu",
    "GAME/IFE/ife_pause",
    "GAME/IFE/ife_system_script",
    "GAME/IFE/ife_pressure_test",
    "GAME/IFE/ife_blocker",
    "GAME/IFE/ife_stage1",
    "GAME/IFE/ife_stage2",
    "GAME/IFE/ife_pathfinding",
    "GAME/IFE/stage_avoid_test",
    "GAME/IFE/ife_package"
];



javaStage.load=function(scripts,on_ready) {
    var g=scripts;
    var ls=function(id) {
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = g[id]+".js";
        a.onload = function () {
            if(g[id+1]){
                ls(id+1);
            }else{
                on_ready();
            }
        };
        document.body.appendChild(a);
    };
    ls(0);
};

