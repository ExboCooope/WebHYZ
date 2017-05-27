/**
 * Created by Exbo on 2016/2/4.
 */
stg.bossSystem={};
stg.bossSystem.pre_load=function(){
    stgCreateImageTexture("boss_ui", "res/boss_ui.png");
    renderCreate2DTemplateA1("boss_spellname_bg","boss_ui",0,0,256,40,0,0,0,1);
    stgCreateImageTexture("bossres","res/boss.png");
    renderCreate2DTemplateA1("spell_card_attack","bossres")
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



function BossLifeCircle(boss,range){
    this.boss=boss;
    this.range=range||60;
    this.base=new StgBase(boss,stg_const.BASE_COPY,1);
}
BossLifeCircle.vtx=97;
BossLifeCircle.prototype.init=function(){
    this.render=new StgRender("basic_shader");
    this.outline=new HyzPrimitive2DVertexList(BossLifeCircle.vtx);
    this.inline=new HyzPrimitive2DVertexList(BossLifeCircle.vtx);
    this.outline.setTextureName("white");
    this.inline.setTextureName("white");
    this.lifebar=new HyzPrimitive2DVertexList(BossLifeCircle.vtx*2);
    this.inline.setTextureName("white");

    var out=this.range+2;
    var inr=this.range-2;
    for(var i=0;i<this.outline.ptx;i++){
        var angle=1.5*PI-i/(this.outline.ptx-1)*PI2;
        var s=sin(angle);
        var c=cos(angle);

        this.outline.setVertex(i,out*c,out*s,0,0,200,0,0,200);
        this.inline.setVertex(i,inr*c,inr*s,0,0,200,0,0,200);
        this.lifebar.setVertex(i*2,out*c,out*s,0,0,200,150,150,200);
        this.lifebar.setVertex(i*2+1,inr*c,inr*s,0,0,200,150,150,200);
    }
    this.layer=stg_const.LAYER_ENEMY-1;
    this.outline.update(1,1,1);
    this.inline.update(1,1,1);
    this.lifebar.update(1,1,1);
};
BossLifeCircle.prototype.on_render=function(gl){

    hyzSetPrimitiveOffset(this.pos[0],this.pos[1]);
 //   blend_add();

    var boss=this.boss;
    var phase=boss.current_phase_object;
    if(phase){
        var hp_total=0;
        var i=0;
        for(i=phase.length-1;i>=0;i--){
            var spell=phase[i];
            hp_total+=spell.max_life;
        }
        var hp_current=0;
        this.lifebar.use();
        var n=this.lifebar.ptx/2-1;
        var first=0;
        for(i=phase.length-1;i>=0;i--){
            spell=phase[i];
            var a=(hp_current/hp_total*n+0.5)>>0;
            if(spell.life>0)hp_current+=spell.life;
            var b=(hp_current/hp_total*n+0.5)>>0;
            if(spell.life<=0)break;
            if(spell.is_spell){
                this.lifebar.setColorI(250,200,200,255,a*2,b*2,1);
                gl.drawArrays(gl.TRIANGLE_STRIP,a*2,(b-a+1)*2);
            }else{
                this.lifebar.setColorI(200,200,200,255,a*2,b*2,1);
                gl.drawArrays(gl.TRIANGLE_STRIP,a*2,(b-a+1)*2);
            }
            if(first){
                this.lifebar.setColorI(200,0,0,255,a*2,a*2+1,1);
                gl.drawArrays(gl.LINES,a*2,2);
            }
            first=1;
            if(spell.life<spell.max_life)break;
        }
    }
    this.outline.use();
    gl.drawArrays(gl.LINE_STRIP,0,this.outline.ptx);
    this.inline.use();
    gl.drawArrays(gl.LINE_STRIP,0,this.inline.ptx);

    hyzSetPrimitiveOffset(0,0);
    blend_default();
};
BossLifeCircle.prototype.script=function(){

};
BossLifeCircle.prototype.finalize=function(){
    this.outline.clear();
};

var stg_default_boss_script=function(){
    var boss=stg_target;
    if(boss.finished)return;
    boss.current_phase_object=boss.phase[boss.current_phase];
    boss.current_spell_object=boss.current_phase_object[boss.current_spell];
    while(boss.current_spell_object.remove){
        boss.finished=true;
        boss.current_spell++;
        if(boss.current_spell>=boss.current_phase_object.length){
            boss.current_spell=0;
            boss.current_phase++;
            if(boss.current_phase>=boss.phase.length){
                boss.current_spell_object=0;
                return;
            }
        }
        boss.current_phase_object=boss.phase[boss.current_phase];
        boss.current_spell_object=boss.current_phase_object[boss.current_spell];
    }
};

function stgBossClearPhase(boss){
    boss=boss||stg_target;
    boss.phase=[];
}
function stgBossAddPhase(arraySpellObject,boss){
    boss=boss||stg_target;
    boss.phase.push(arraySpellObject);
}
function stgBossStartNextSpell(boss){
    boss=boss||stg_target;
    if(!boss.finished)return;
    if(boss.current_spell_object){
        stgAddObject(boss.current_spell_object);
        boss.finished=false;
    }else{

    }
}