/**
 * Created by Exbo on 2016/4/13.
 */
var ife_pause_menu=new MenuHolderA1([48,240],[0,30],ife_pause_menu);
ife_pause_menu.a1=new TextMenuItem("继续",1,1,{script:function(){   //stgHideCanvas("pause");
    _stgChangeGameState(stg_const.GAME_RUNNING);
    stgDeleteObject(ife.pause_script); stgResumeSE("BGM");
    //default_ui_shader.procedure_1.pool[3].alpha=0;
    stgHideCanvas("pause");
}},1);
ife_pause_menu.a2=new TextMenuItem("结束游戏",1,1,{script:function(){
    stgCloseLevel();
    stgDeleteSelf();
    stgHideCanvas("pause");
    //default_ui_shader.procedure_1.pool[3].alpha=0;
}},1);

ife_pause_menu.pushItem(ife_pause_menu.a1);
ife_pause_menu.pushItem(ife_pause_menu.a2);

ife.pause_script={canvas:null,lock:0};
ife.pause_script.init=function(){
    MenuHolderA1.sellock=1;
    if(!this.canvas){
        this.canvas=stgCreateCanvas("pause",480,640,stg_const.TEX_CANVAS2D);
    }
    stgAddObject(ife.resolution);
    stgShowCanvas("pause",0,0,0,0,3);
    stgClearCanvas("pause");
    ife.resolution.scale=0;//refresh
   // stgPauseSE("BGM");
    // stgHideCanvas("ui");
    // stgHideCanvas("back");
    // stgHideCanvas("frame");


    var a2 = new StgProcedure("pause", 0, 100);
    a2.o_width=480;
    a2.o_height=640;
    a2.shader_order = ["testShader2"];
    stg_procedures["drawPause"] = a2;
    stg_display = ["drawPause"];//,"drawUI"];

    var cobj1=new StgObject;
    cobj1.render=new StgRender("testShader2");
    miscApplyAttr(cobj1.render, {type: 3, x: 0, y: 0, w: 480, h: 550, texture: "frame"});
    cobj1.layer = 0;
    cobj1.pos = [0, 0, 0];
    cobj1.rotate = [0, 0, 0];
    cobj1.t=0;
    cobj1.render.alpha=20;
    cobj1.script=function(){
        if(cobj1.t<15){
            var dx=Math.random()*8-4;
            var dy=Math.random()*8-4;

            miscApplyAttr(cobj1.render, {type: 3,color:"#A00", x: 0+dx, y: 0+dy, w: 480, h: 550, texture: "frame"});
            cobj1.t++;
        }else{
            stgAddObject(ife_pause_menu);
            stgDeleteObject(cobj1);
        }
    };
    stgAddObject(cobj1);
    this.lock=1;
};
