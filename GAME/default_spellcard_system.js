/**
 * Created by Exbo on 2016/2/4.
 */
stg.bossSystem={};
stg.bossSystem.pre_load=function(){
    stgCreateImageTexture("boss_ui", "res/boss_ui.png");
    renderCreate2DTemplateA1("boss_spellname_bg","boss_ui",0,0,256,40,0,0,0,1);
};

stgRegisterModule("boss_system",stg.bossSystem);


function BossSpellCardUI(boss,spell){
    this.boss=boss;
    this.spell=spell;
}

function BossSpellNameObject(sui,spell,name,ypos){
    this.ui=sui;
    this.spell=spell;
    this.name=name;
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,"boss_spellname_bg",0);
    this.base=new StgBase(sui,stg_const.BASE_NONE,1);
    this.ypos=ypos;
    this.textobj=new RenderText(0,0,name);

    this.textobj.render.textAlign="right";
    this.textobj.sid=0;
    this.textobj.base=new StgBase(this,stg_const.BASE_MOVE,1,0);
    this.textobj.move=new StgMove();
    this.layer=75;
}

BossSpellNameObject.prototype.init=function(){
    stgAddObject(this.textobj);
    stg_last.render.font="12px 思源宋体";
    stg_last.render.color="#FFF";
    stg_last.render.backcolor="#000";
   // stg_last.render.bold=true;
    var f=hyzGetFrameObject(this.ui.sid);
    stgSetPositionA1(this,stg_frame_w-128,300);
    stgSetPositionA1(this.textobj, f.pos[0]+110, f.pos[1]-8);
    luaMoveTo(stg_frame_w-128,this.ypos,60,1,this);

//    stgSetPositionA1(this,stg_frame_w-128,this.ypos);

};
