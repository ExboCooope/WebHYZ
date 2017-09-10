/**
 * Created by Exbo on 2017/9/10.
 */

//basic system

var bios={};
bios.init=function(){
    var a=stgLoadData("bios");
    if(!a){
        a={};
    }

    bios.packages=[];
    bios.pitems=[];
    for(var i in javaStage.packages){
        bios.packages.push(i);
        if(a.package==i){
            bios.current=bios.packages.length-1;
        }
    }

    th.frameSetSize(640,480);
    th.gameSetPlayerCount(1);
    var shadernames=th.frameLoadShaders(default_2d_misc_shader);
    th.frameCreateCanvas("bios_canvas",640,480,0,0,stg_const.TEX_CANVAS2D);
    var pro=stgCreateProcedure1("draw_bios","bios_canvas",0,300,shadernames[0],"#888");
    stg_display=["draw_bios"];
    stg_wait_for_all_texture=1;
    th.frameShowCanvas("bios_canvas",0);
    stgAddObject(bios.logo);
};

bios.startGame=function(scs){
    stgDeleteSubObjects(bios);
    stgDeleteObject(bios);
    stgHideCanvas("bios_canvas");
    javaStage.load(scs,function(){
        stgChangeGameState(stg_const.GAME_MENU);
    })
};

bios.script=function(){

};

bios.logo=new RenderText(320-4.5*32,240-16,"JavaStage",true);
bios.logo.init=function() {
    this.setFont("宋体", 64, "#000", "#FFF");
};
bios.logo.cbase="0123456789ABCDEF";
bios.logo.script=function(){
    if(frame<60){
        var a=bios.logo.cbase;
        var q=((this.frame/60)*16)>>0;
        this.setFont("宋体", 64, "#"+a[q]+a[q]+a[q], "#"+a[15-q]+a[15-q]+a[15-q]);
    }else if(frame==60){
        luaMoveTo(0,-180,30,1);
    }
    if(frame<100){
        if(th.actionKeyDown(stg_system_input,thc.KEY_SHOT)){
            bios.startGame(javaStage.packages[bios.packages[bios.current]]);
            return;
        }
    }
    if(frame==100){
        new RenderText(100,140,"Select Package : ( ↑↓ Z=OK )");
        stg_last.setFont("黑体",24,"#FFF","#000");
        for(var i=0;i<bios.packages.length;i++){
            bios.pitems[i]=new RenderText(140,180+28*i,"");
        }
        bios.select_item(bios.current||0);
    }else if(frame>100){
        if(th.actionKeyDown(stg_system_input,thc.KEY_DOWN)){
            bios.select_item((bios.current+1)%bios.packages.length);
        }else if(th.actionKeyDown(stg_system_input,thc.KEY_UP)){
            bios.select_item((bios.current+bios.packages.length-1)%bios.packages.length);
        }else if(th.actionKeyDown(stg_system_input,thc.KEY_SHOT)){
            bios.startGame(javaStage.packages[bios.packages[bios.current]]);
        }
    }
};

bios.select_item=function(id){
    for(var i=0;i<bios.packages.length;i++){
        if(i==id){
            bios.pitems[i].setText("->"+bios.packages[i]+"<-");
            bios.pitems[i].setFont(0,0,"#F66","#0D0");
        }else{
            bios.pitems[i].setText(bios.packages[i]);
            bios.pitems[i].setFont(0,0,"#FFF","#000");
        }
    }
    bios.current=id;
    stgSaveData("bios",{package:bios.packages[bios.current]});
};