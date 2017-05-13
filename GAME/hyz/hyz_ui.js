/**
 * Created by Exbo on 2017/5/13.
 */
function HyzUI(player,default_sid){
    this.playerid=player;
    this.sid=default_sid;
    this.save_sid=default_sid;
}
HyzUI.prototype.init=function (){
    renderCreate2DTemplateA1("lifes","life",0,128,32,32,32,0,0,1);
    renderCreate2DTemplateA1("spells","life",0,160,32,32,32,0,0,1);
    this.spells=[];
    for(var i=0;i<8;i++){
        this.spells.push(new HyzUISpellObject(this.playerid,i,this));
        if(this.sid==1){
            stgSetPositionA1(this.spells[i],10,-18*i-15);
        }else{
            stgSetPositionA1(this.spells[i],-10,-18*i-15);
        }
        stgAddObject(this.spells[i]);
    }
};
HyzUI.prototype.on_move=function(){
    this.sid=this.save_sid;
    stgSetPositionA1(this,this.sid==1?0:stg_frame_w,stg_frame_h);
};

function HyzUISpellObject(player,id,ui){
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,"spells",5);
    renderSetSpriteScale(0.5,0.5,this);
    this.layer=79;
    this.playerid=player;
    this.id=id;
    this.ui=ui;
    this.move=new StgMove();
    this.base=new StgBase(ui,stg_const.BASE_MOVE,1);
    this.alpha=0;
    this.ignore_super_pause=1;
}
HyzUISpellObject.prototype.script=function(){
    var player=stg_players[this.playerid];
    if(player.bomb>=this.id+1){
        var flag=0;
        for(var i= 0;i<stg_players_number;i++){
            var pl2=stg_players[i];
            if(hyzIsInOneFrame(this,pl2)){
                var dx=pl2.pos[0]-this.pos[0];
                var dy=pl2.pos[1]-this.pos[1];
                if(dx<50 && dx>-50 && dy<50 && dy>-50){
                    if(this.alpha>50){
                        this.alpha-=16;
                        this.update=1;
                    }
                    flag=1;
                }
            }
        }
        if(!flag){
            if(this.alpha<255){
                this.alpha=255;
                this.update=1;
            }
        }
    }else{
        if(this.alpha!=0){
            this.alpha=0;
            this.update=1;
        }
    }
};

