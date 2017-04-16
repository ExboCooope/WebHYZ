/**
 * Created by Exbo on 2015/11/24.
 */

var g_pause_menu=new MenuHolderA1([48,240],[0,30],g_pause_menu);
g_pause_menu.a1=new TextMenuItem("继续",1,1,{script:function(){   //stgHideCanvas("pause");
  _stgChangeGameState(stg_const.GAME_RUNNING);
    stgDeleteObject(default_pause_script); stgResumeSE("BGM");
    default_ui_shader.procedure_1.pool[3].alpha=0;
}},1);
g_pause_menu.a2=new TextMenuItem("结束游戏",1,1,{script:function(){
    //stgHideCanvas("pause");
    stgCloseLevel();stgDeleteSelf();
    default_ui_shader.procedure_1.pool[3].alpha=0;
}},1);


g_pause_menu.pushItem(g_pause_menu.a1);
g_pause_menu.pushItem(g_pause_menu.a2);

var default_pause_script={canvas:null,lock:0};
default_pause_script.init=function(){
    MenuHolderA1.sellock=1;
    if(!default_pause_script.canvas){
        default_pause_script.canvas=stgCreateCanvas("pause",640,480,stg_const.TEX_CANVAS2D);
    }
    //stgShowCanvas("pause",0,0,640,480,5);
    stgClearCanvas("pause");
    stgPauseSE("BGM");
   // stgHideCanvas("ui");
   // stgHideCanvas("back");
   // stgHideCanvas("frame");


    var a2 = new StgProcedure("pause", 0, 100);
    a2.shader_order = ["testShader2"];
    stg_procedures["drawPause"] = a2;
    //创建渲染流程
  //  a2 = new StgProcedure("ui", 81, 100);
  //  a2.shader_order = ["testShader2"];
    //stg_procedures["drawUI"] = a2;
    a2 = new StgProcedure("zoom", 0, -1);
    a2.shader_order = ["ui_shader"];
    a2.no_object_frame=1;
    miscApplyAttr(a2,default_ui_shader.procedure_1);
    stg_procedures["drawZoom"] = a2;
    stg_display = ["drawPause","drawZoom"];//,"drawUI"];
    default_ui_shader.procedure_1.pool[3].alpha=1;
    var cobj1=new StgObject;
    cobj1.render=new StgRender("testShader2");
    miscApplyAttr(cobj1.render, {type: 3, x: 32, y: 16, w: 384, h: 448, texture: "frame"});
    cobj1.layer = 0;
    cobj1.pos = [0, 0, 0];
    cobj1.rotate = [0, 0, 0];
    cobj1.t=0;
    cobj1.render.alpha=20;
    cobj1.script=function(){
        if(cobj1.t<15){
            var dx=Math.random()*8-4;
            var dy=Math.random()*8-4;

            miscApplyAttr(cobj1.render, {type: 3,color:"#A00", x: 32+dx, y: 16+dy, w: 384, h: 448, texture: "frame"});
            cobj1.t++;
        }else{
            stgAddObject(g_pause_menu);
            stgDeleteObject(cobj1);
        }
    };
    stgAddObject(cobj1);

    default_pause_script.lock=1;
};
/*
default_pause_script.script=function(){
    if(default_pause_script.lock==1){
        if(stg_system_input[stg_const.KEY_PAUSE]==0){
            default_pause_script.lock=0;
        }
    }
    if(default_pause_script.lock==0 && stg_system_input[stg_const.KEY_PAUSE]){
        default_pause_script.lock=2;
    }
    if(default_pause_script.lock==2 && !stg_system_input[stg_const.KEY_PAUSE]){
        stgHideCanvas("pause");
        //stgShowCanvas("frame",32,16,0,0,1);
        _stgChangeGameState(stg_const.GAME_RUNNING);
        stgDeleteObject(default_pause_script);
    }
};
*/
