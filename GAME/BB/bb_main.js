/**
 * Created by Exbo on 2017/9/11.
 */
var bb={};
stgCreateImageTexture("white","white.png");
renderCreate2DTemplateA1("white_16","white",0,0,16,16,0,0,0,1);
bb.loader={};
bb.loader.init=function(){
    if(!bb.loaded){
        th.gameSetPlayerCount(1);
        th.frameSetSize(640,480,384,448);
        bb.main_menu=new MenuHolderA1([300,100],[0,100]);
        var shadernames=th.frameLoadShaders(default_2d_misc_shader,hyzSpriteShader,hyzPrimitive2DShader);
        th.frameCreateCanvas("ui",640,480,0,0,thc.TEX_CANVAS2D);
        th.frameCreateCanvas("frame",640,480,0,0,thc.TEX_CANVAS3D);
        th.frameShowCanvas("ui",5);
        th.frameShowCanvas("frame",2);
        var pro=stgCreateProcedure1("draw_ui","ui",0,300,shadernames[0],"#888");
        pro.transparent=1;
        stgCreateProcedure1("draw_frame","frame",0,300,[shadernames[1],shadernames[2]],"#888");
        stg_display=["draw_frame","draw_ui"];
        stg_wait_for_all_texture=1;
        bb.loaded=true;
    }
};