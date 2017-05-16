/**
 * Created by Exbo on 2017/5/15.
 */
var esp={};
esp.pre_load=function(){
    stgCreate2DBulletTemplateA1("pLD1","bullet",0,336,32,32,32,0,PIUP,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("pLD2","bullet",0,336+32,32,32,32,0,PIUP,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("pJG","bullet",256,64,32,32,32,0,PIUP,1,_hit_box_large,{move_rotate:1});
    stgCreate2DBulletTemplateA1("pJD","bullet",256,32,32,32,32,0,PIUP,1,_hit_box_large,{move_rotate:1});
    //renderSetSpriteBlend(stg_const.LAYER_PLAYER_BULLET,"bullet",blend_add);
};
esp.GodMagnet=function(base,color){
    this.player=base;
    this.base=new StgBase(base,stg_const.BASE_COPY,1);
    this.c=color;
    this.powerlevel=1;
};
esp.GodMagnet.prototype.init=function(){
    renderSetSpriteBlend(stg_const.LAYER_PLAYER_BULLET,"bullet",blend_add);
};
esp.GodMagnet.bullet_script_1=function(){
    var f=(1-this.frame/12)*2;
    if(f>0){
        renderSetSpriteScale(f,f,this);
    }else{
        stgDeleteSelf();
    }
};
esp.GodMagnet.bullet_script_2=function(){
    var a=this.frame;
    var f=1;
    if(a<40){
        f=sin(a/30*PI)+1.5;
    }else{
        f=sin(40/30*PI)+1.5;
    }
    renderSetSpriteScale(f,2,this);

};
esp.GodMagnet.prototype.script=function(){
    if(this.player.key[stg_const.KEY_SHOT] && this.player.state==stg_const.PLAYER_NORMAL){
        var l=this.powerlevel;
        var c=this.color;
        this.shot_f=this.shot_f||0;
        if(this.shot_f==0) {
            if (l == 1) {
                stgCreateShotP1(this.pos[0], this.pos[1], 12, 270, "pJG", 0, c, 3, 100);
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0], this.pos[1] - 16, 6, 90 + 45, "pLD1", 0, c, 3, 2);
                stg_last.script = esp.GodMagnet.bullet_script_1;
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0], this.pos[1] - 16, 6, 90 - 45, "pLD1", 0, c, 3, 2);
                stg_last.script = esp.GodMagnet.bullet_script_1;
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0], this.pos[1], 8, 270, "pLD1", 0, c, 3, 1);
                stg_last.script = esp.GodMagnet.bullet_script_2;
                renderSetSpriteColor(255,255,255,120,stg_last);
            } else if (l == 2) {
                stgCreateShotP1(this.pos[0], this.pos[1], 12, 270, "pJG", 0, c, 3, 100);
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0], this.pos[1] - 16, 6, 90 + 45, "pLD1", 0, c, 3, 2);
                stg_last.script = esp.GodMagnet.bullet_script_1;
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0], this.pos[1] - 16, 6, 90 - 45, "pLD1", 0, c, 3, 2);
                stg_last.script = esp.GodMagnet.bullet_script_1;
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0]-5, this.pos[1], 8, 270, "pLD1", 0, c, 3, 1);
                stg_last.script = esp.GodMagnet.bullet_script_2;
                renderSetSpriteColor(255,255,255,120,stg_last);
                stgCreateShotP1(this.pos[0]+5, this.pos[1], 8, 270, "pLD1", 0, c, 3, 1);
                stg_last.script = esp.GodMagnet.bullet_script_2;
                renderSetSpriteColor(255,255,255,120,stg_last);

            } else if (l == 3) {

            } else if (l == 4) {

            } else if (l == 5) {

            }
        }
        this.shot_f=(this.shot_f+1)%3;
    }else{
        if(this.shot_f){
            this.shot_f=(this.shot_f+1)%3;
        }
    }

};