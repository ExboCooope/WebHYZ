/**
 * Created by Exbo on 2016/2/4.
 */
stg.bossSystem={};
stg.bossSystem.pre_load=function(){
    stgCreateImageTexture("boss_ui", "res/boss_ui.png");
    renderCreate2DTemplateA1("boss_spellname_bg","boss_ui",0,0,256,40,0,0,0,1);
    renderCreate2DTemplateA1("boss_indicator","boss_ui",0,64,48,16,0,0,0,1);
    renderCreate2DTemplateA1("boss_spells","boss_ui",72,72,16,16,0,0,0,1);
    renderCreate2DTemplateA1("boss_leaf","pl_effect",64,176,32,32,32,0,0,1);
    stgCreateImageTexture("bossres","res/boss.png");
    renderCreate2DTemplateA1("spell_card_attack","bossres",6*16,0,16,128*7,0,0,0,1);
    stgLoadSE("se_time","se/se_timeout.wav").ready=1;
    stgLoadSE("se_fault","se/se_fault.wav").ready=1;

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
    stgSetPositionA1(this,stg_frame_w-120,300);
    stgSetPositionA1(this.textobj, f.pos[0]+110, f.pos[1]-8);
    luaMoveTo(stg_frame_w-120,this.ypos,60,1,this);

//

};
BossSpellNameObject.prototype.script=function(){
    if(this.frame>60)stgSetPositionA1(this,stg_frame_w-120,this.ypos);
};



function BossLifeCircle(boss,range){
    this.boss=boss;
    this.range=range||60;
    this.base=new StgBase(boss,stg_const.BASE_COPY,1);
}
BossLifeCircle.vtx=181;
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
    var w=target.width;
    var h=target.height;
    //新建或维护一个离屏缓存
    if(!this.target||this.target.width!=w||this.target.height!=h){
        if(this.target)this.target.release();
        this.target=new WebglRenderTarget(w,h);
        this.vtx.setVertexRaw(0,0,0,0,0,1,1,1,1);
        this.vtx.setVertexRaw(1,0,h,0,1,1,1,1,1);
        this.vtx.setVertexRaw(2,w,h,1,1,1,1,1,1);
        this.vtx.setVertexRaw(3,w,0,1,0,1,1,1,1);
        this.vtx.update(1,1,1);
    }
    //将当前屏幕拷贝至离屏缓存
    this.target.use();
    hyzSetPrimitiveOffset(0,0);
    blend_copy();
    this.vtx.use();
    _webGlUniformInput(hyzPrimitive2DShader,"texture",target);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.finish();
    //切换成波纹shader，并准备往屏幕上渲染
    target.use();
    hyzAuraShader.use();
    //计算贴图位置
    var f=this.frame/3;
    var u1=(this.pos[0]-s)/w;
    var u2=(this.pos[0]+s)/w;
    var v1=(this.pos[1]-s)/h;
    var v2=(this.pos[1]+s)/h;
    this.tscreen.buffer.set([u1,v1,u1,v2,u2,v2,u2,v1]);
    this.tscreen.uploadData();
    //叠加渲染
    blend_test1();
    _webGlUniformInput(hyzAuraShader,"uWindow",webgl2DMatrix(w,h));
    GlBufferInput(hyzAuraShader,"aPosition",this.screen);
    GlBufferInput(hyzAuraShader,"aTexture",this.tscreen);
    _webGlUniformInput(hyzAuraShader,"uColor",[1,1,1,1]);
    _webGlUniformInput(hyzAuraShader,"uT",[f,-f,s]);
    _webGlUniformInput(hyzAuraShader,"uSize",[w,h]);
    _webGlUniformInput(hyzAuraShader,"uPosition",[this.pos[0],this.pos[1]]);
    _webGlUniformInput(hyzAuraShader,"texture",this.target);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    //还原
    gl.useProgram(hyzPrimitive2DShader.program);
    blend_default();

};
BossDynamicAura.prototype.finalize=function(){
    this.screen.clearContent();
    this.tscreen.clearContent();
    this.vtx.clear();
    if(this.target)this.target.release();
};

function BossIndicator(boss){
    this.boss=boss;
    this.base=new StgBase(boss,stg_const.BASE_COPY,1);
}
BossIndicator.prototype.init=function(){
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,"boss_indicator",0);
    this.layer=210;
};
BossIndicator.prototype.script=function(){
    var a=hyzGetFrameObject(this.boss.sid);
    this.pos[0]+= a.pos[0];
    this.pos[1]= a.pos[1]+stg_frame_h+8;
    this.sid=a.sid;
};

function BossNameObject(boss){
    this.boss=boss;
    this.base=new StgBase(boss,0,1);
}
BossNameObject.prototype.init=function() {
    this.text=new RenderText(0,0,"");
    this.text.sid=0;
    this.text.base=new StgBase(this.boss,0,1);
    stgAddObject(this.text);
    stg_last.render.font="6px 黑体";
    stg_last.render.color="#6D8";
    stg_last.render.textAlign="left";
};
BossNameObject.prototype.script=function(){
    var a=hyzGetFrameObject(this.boss.sid);
    this.text.pos[0]= a.pos[0]+4;
    this.text.pos[1]= a.pos[1]+3;
    this.text.render.text=this.boss.english_name;
};

function BossSpellCount(boss){
    this.boss=boss;
}
BossSpellCount.prototype.init=function(){
    var boss=this.boss;
    var phase=boss.phase;
    var pool=[];
    for(var i=0;i<phase.length;i++){
        for(var j=0;j<phase[i].length;j++){
            var a=phase[i][j];
            if(a.is_spell){
                pool.push(a);
            }
        }
    }
    j=0;
    var y=20;
    var x=8;
    for(i=pool.length-1;i>=0;i--){
        stgAddObject(new BossSpellSingleStar(boss,pool[i],x,y))
        x+=10;
        j++;
        if(j>=8){
            j-=10;
            y+=10;
            x=12;
        }
    }
};
function BossSpellSingleStar(boss,spell,x,y){
    this.boss=boss;
    this.spell=spell;
    this.x=x;
    this.y=y;
    this.flash=0;
    this.base=new StgBase(boss,stg_const.BASE_NONE,1);
}
BossSpellSingleStar.prototype.init=function(){
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,"boss_spells",0);
    renderSetSpriteColor(0,255,0,255,this);
    renderSetSpriteScale(0.5,0.5,this);
    this.layer=78;
    stgSetPositionA1(this,this.x,this.y);
};
BossSpellSingleStar.prototype.script=function(){
    if(this.spell.remove){
        stgDeleteSelf();
    }else if(this.spell.active && !this.flash){
        this.flash=1;
        renderSetSpriteColor(128,128,255,200,this);
        renderSetSpriteScale(0.7,0.7,this);
    }
};

function BossTime(boss,spell,y){
    this.boss=boss;
    this.spell=spell;
    this.y=y;
    this.base=new StgBase(spell,stg_const.BASE_NONE,1);
    this.max_time=this.spell.time;

}
BossTime.prototype.init=function(){
    this.text=new RenderText(0,0,"");
    this.text.base=new StgBase(this,stg_const.BASE_NONE,1);
    stgAddObject(this.text);
    stg_last.render.font="8px 黑体";
    stg_last.render.color="#EEE";
    stg_last.render.backcolor="#111";
    stg_last.render.textAlign="right";
    stg_last.render.bold=true;
};
BossTime.prototype.script=function(){
    var f=hyzGetFrameObject(this.sid);
    stgSetPositionA1(this.text,stg_frame_w/2+f.pos[0]+12,this.y+ f.pos[1]);
    var t=this.spell.frame;
    var x=(this.max_time-t);
    if(x==60 || x==120 || x==180 || x==240 || x==300){
        stgPlaySE("se_time");
    }
    var a=(this.max_time-t)/60;
    if(a<0)a=0;
    var s=""+(a>>0)+"."+(((a-(a>>0))*10)>>0)+(((a*100)>>0)%10);
    this.text.render.text=s;
};

function stgBossSetNextSpellDelay(delay,boss){
    boss=boss||stg_target;
    boss.delay=delay;
}

function stgBossPlayerSpellOrMiss(boss){
    boss=boss||stg_target;
    for(var i=0;i<stg_players_number;i++){
        var p=stg_players[i];
        if(hyzIsInOneFrame(p,boss)){
            if(p.bombing || p.state==stg_const.PLAYER_HIT || p.state==stg_const.PLAYER_DEAD){
                return true;
            }
        }
    }
    return false;
}

function stgBossStartSpellHistory(boss,spell){
    var his = stgLoadData("history");
    if (!his) {
        his = {};
    }
    var s = boss.name + "-" + spell.name + (stg_common_data.level_name || "");
    if (!his[s])his[s] = [0, 0];
    if (!stg_in_replay)his[s][0] += 1;
    stgSaveData("history", his);
    spell.history=his[s];
}

function stgBossFinishSpellHistory(boss,spell,is_get){
    spell.get=is_get;
    if(!stg_in_replay) {
        var his = stgLoadData("history");
        if (!his) {
            his = {};
        }
        var s = boss.name + "-" + spell.name + (stg_common_data.level_name || "");
        if (!his[s])his[s] = [0, 0];
        if (is_get)his[s][1] += 1;
        stgSaveData("history", his);
    }
}

function BossScoreHistory(boss,spell,y){
    this.boss=boss;
    this.spell=spell;
    this.y=y;
    this.base=new StgBase(spell,stg_const.BASE_NONE,1);
    this.max_time=this.spell.time;
}
BossScoreHistory.prototype.init=function(){
    this.text=new RenderText(0,0,"");
    this.text.base=new StgBase(this,stg_const.BASE_NONE,1);
    stgAddObject(this.text);
    stg_last.render.font="4px Fixedsys";
    stg_last.render.color="#EEE";
    stg_last.render.backcolor="#111";
    stg_last.render.textAlign="right";
    stg_last.render.bold=true;
};
BossScoreHistory.prototype.script=function(){
    var f=hyzGetFrameObject(this.sid);
    stgSetPositionA1(this.text,stg_frame_w+f.pos[0]-5,this.y+ f.pos[1]);
    var t=this.spell.score;
    var s1=t<=0?"Failed ":""+t;
    var s2=" History ";
    var h=this.spell.history;
    var s3=h?(h[1]>99?"Master":""+h[1]+"/"+h[0]):"Unkown";
    this.text.render.text=s1+s2+s3;
};


function stgDefaultFinishSpellCheck(time){
    var spell=stg_target;
    if(spell.is_spell && stgBossPlayerSpellOrMiss()){
        spell.score=0;
    }
    if(spell.life<0){
        stgDeleteSelf();
        stgBossSetNextSpellDelay(time,spell.boss);
        if(spell.is_spell) {
            stgBossFinishSpellHistory(spell.boss, spell, spell.score > 0);
        }
        return true;
    }
    if(spell.frame>=spell.time){
        stgBossSetNextSpellDelay(time,spell.boss);
        if(spell.is_spell) {
            if(spell.is_time_spell){

            }else{
                stgPlaySE("se_fault");
            }
            stgBossFinishSpellHistory(spell.boss,spell,spell.is_time_spell);
        }
        spell.life=0;
        stgDeleteSelf();
        return true;
    }
    return false;
}

function BossSpellInitObject(spell){
    this.spell=spell;
    this.boss=spell.boss;
    this.base=new StgBase(spell,0,1);
}
BossSpellInitObject.prototype.init=function(){
    stgAddObject(newBossTimeCircle(this.spell));
    stgAddObject(new BossTime(this.boss,this.spell,10));
    this.boss.clip=null;
    if(this.spell.is_spell){
        stgAddObject(new BossSpellNameObject(this.spell,this.spell,this.spell.name,16));
    }
};
BossSpellInitObject.prototype.script=function(){
    if(this.frame==60){
        if(this.spell.is_spell) {
            stgBossStartSpellHistory(this.boss, this.spell);
            stgAddObject(new BossScoreHistory(this.boss, this.spell, 22));
        }
        stgDeleteSelf();
    }
};

function bossDefineNonSpellA(boss,spell,life,time){
    stgApplyEnemy(spell);
    spell.life=life;
    spell.max_life=life;
    spell.time=time;
    spell.is_spell=false;
    spell.keep=true;
    spell.boss=boss;
    spell.base=new StgBase(boss,stg_const.BASE_COPY,0);
}


function bossDefineSpellA(boss,spell,name,life,time,score,resistance){
    stgApplyEnemy(spell);
    spell.name=name;
    spell.life=life;
    spell.max_life=life;
    spell.time=time;
    spell.score=score;
    spell.shot_resistance=resistance||0.8;
    spell.is_spell=true;
    spell.keep=true;
    spell.boss=boss;
    spell.base=new StgBase(boss,stg_const.BASE_COPY,0);
}

function bossWanderSingle(boss,toward_player,x_range,y_range,time,min_x,min_y){
    min_x=min_x||0;
    min_y=min_y||0;
    x_range=stg_rand(min_x,x_range);
    if(toward_player){
        var p=hyzGetRandomPlayer(boss.sid);
        if(!p){
            x_range=stg_rand(1)>0.5?x_range:-x_range;
        }else{
            if(p.pos[0]<boss.pos[0]){
                x_range=-x_range;
            }else{
                x_range=x_range;
            }
        }

    }else{
        x_range=stg_rand(1)>0.5?x_range:-x_range;
    }
    y_range=stg_rand(min_y,y_range);
    y_range=stg_rand(1)>0.5?y_range:-y_range;
    var dx=16;
    if(boss.clip){
        dx=boss.clip[0];
    }
    if(x_range+boss.pos[0]<dx){
        x_range=-x_range;
    }
    if(x_range+boss.pos[0]>stg_frame_w-dx){
        x_range=-x_range;
    }
    luaMoveTo(x_range+boss.pos[0],y_range+boss.pos[1],time,1,boss);
}

function BossChargeLeaf(boss){
    this.boss=boss;
}
BossChargeLeaf.prototype.init=function(){
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,"boss_leaf",0);
    this.layer=stg_const.LAYER_ENEMY+1;
    renderSetObjectSpriteBlend(this,blend_add);
    this.angle=stg_rand(PI2);
    var l=stg_rand(60,100);
    stgEnableMove(this);
    stgSetPositionA1(this,l*cos(this.angle)+this.boss.pos[0],l*sin(this.angle)+this.boss.pos[1]);
    this.move.speed=2;
    this.move.speed_angle=this.angle+PI;
    this.k=stg_rand(PI2);
    this.r=stg_rand(PI2);
};
BossChargeLeaf.prototype.script=function(){
    var a=255;
    if(a>255)a=255;
    renderSetSpriteColor(100,100,100,a);
    var s=80*(60-this.frame)/60;
    renderSetSpriteSize(s*sin(this.k),s*sin(this.r));
    this.k+=3*PI180;
    this.r+=2.2*PI180;
    this.rotate[2]+=0.5*PI180;
    if(this.frame>=60){
        stgDeleteSelf();
    }
};
function BossCharge(boss,time){
    this.boss=boss;
    this.time=time||60;
}

BossCharge.prototype.script=function(){
    if(this.frame==1){
        stgPlaySE("se_boss_cast");
    }
    if(this.frame<this.time){
        stgAddObject(new BossChargeLeaf(this.boss));
    }else{
        stgDeleteSelf();
    }
};