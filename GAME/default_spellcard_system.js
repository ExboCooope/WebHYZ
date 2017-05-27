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

function BossDynamicAura(boss,size){
    this.size=size;
    this.boss=boss;
}
BossDynamicAura.prototype.init=function(){
    this.vtx=new HyzPrimitive2DVertexList(4);
    this.screen=WGLA.newBuffer(_gl,4,2,4,WGLConst.DATA_FLOAT);
    var s=this.size;
    this.screen.buffer.set([-s,-s,-s,s,s,s,s,-s]);
    this.screen.uploadData();
    this.tscreen=WGLA.newBuffer(_gl,4,2,4,WGLConst.DATA_FLOAT);
    this.tscreen.buffer.set([0,0,0,1,1,1,1,0]);
    this.tscreen.uploadData();

    this.layer=24;
    this.render=new StgRender("basic_shader");
    this.target=0;
    this.base=new StgBase(this.boss,stg_const.BASE_COPY,1);
};
BossDynamicAura.prototype.on_render=function(gl,target){
    var s=this.size;
 //   target.select(this);
    var w=target.width;
    var h=target.height;
    if(!this.target||this.target.width!=w||this.target.height!=h){
        if(this.target)this.target.release();
        this.target=new WebglRenderTarget(w,h);
        this.vtx.setVertexRaw(0,0,0,0,0,1,1,1,1);
        this.vtx.setVertexRaw(1,0,h,0,1,1,1,1,1);
        this.vtx.setVertexRaw(2,w,h,1,1,1,1,1,1);
        this.vtx.setVertexRaw(3,w,0,1,0,1,1,1,1);
        this.vtx.update(1,1,1);
    }
    this.target.use();
    hyzSetPrimitiveOffset(0,0);
    blend_copy();

    this.vtx.use();
    _webGlUniformInput(hyzPrimitive2DShader,"texture",target);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.finish();
    target.use();
    hyzAuraShader.use();

    var f=this.frame/3;
    var u1=(this.pos[0]-s)/w;
    var u2=(this.pos[0]+s)/w;
    var v1=(this.pos[1]-s)/h;
    var v2=(this.pos[1]+s)/h;
    this.tscreen.buffer.set([u1,v1,u1,v2,u2,v2,u2,v1]);
    this.tscreen.uploadData();
    blend_default();
    _webGlUniformInput(hyzAuraShader,"uWindow",webgl2DMatrix(w,h));
    GlBufferInput(hyzAuraShader,"aPosition",this.screen);
    GlBufferInput(hyzAuraShader,"aTexture",this.tscreen);
    _webGlUniformInput(hyzAuraShader,"uColor",[1,1,1,0.8]);
    _webGlUniformInput(hyzAuraShader,"uT",[f,-f,s]);
    _webGlUniformInput(hyzAuraShader,"uSize",[w,h]);
    _webGlUniformInput(hyzAuraShader,"uPosition",[this.pos[0],this.pos[1]]);
    _webGlUniformInput(hyzAuraShader,"texture",this.target);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.useProgram(hyzPrimitive2DShader.program);

};
BossDynamicAura.prototype.finalize=function(){
    this.screen.clearContent();
    this.tscreen.clearContent();
    this.vtx.clear();
    if(this.target)this.target.release();
};