/**
 * Created by Exbo on 2017/5/14.
 */
var diff=0;
function BossESC(){
    this.english_name="ESC";
    this.delay=0;
}
BossESC.pre_load=function(){
    stgCreateImageTexture("cardbg2_c","cardbg2_c.png");
    stgCreateImageTexture("cardbg2_d","cardbg2_d.png");
    stgCreateImageTexture("esc_dnh","GAME/ESC/boss_reimu-w.png");
    stgCreateImageTexture("black","black.png");
    renderCreate2DTemplateA1("black64","black",0,0,64,64,0,0,0,1);
    renderCreate2DTemplateA1("cardbg2_d","cardbg2_d",-256,-256,1024,1024,0,0,0,1);
    stgCreateImageTexture("laser1","res/laser1.png");
    stgLoadBGM("esc_bgm","music/1.mp3",130,109.5);
};

BossESC.prototype.init=function(){
    diff=stg_common_data.difficulty||0;
   // var a=new luastg.BossResourceHolder("slz",8,4,[4,0],[6,3],[6,3],[8,0],this);
    var a=new DNHBossHolder(this,"esc_dnh");
    stgAddObject(a);
    this.image=a;
    this.current_spell=0;
    this.current_spell_object=0;
    this.current_phase=0;
    a=new UnitAura1(this,100,255,255,255);
    stgAddObject(a);
    this.aura1=a;
    a=new BossDynamicAura(this,100);
    stgAddObject(a);
    this.aura2=a;
    a=new HyzMagicCircle(this);
    stgAddObject(a);
    a=new BossLifeCircle(this);
    stgAddObject(a);
    a=new BossIndicator(this);
    stgAddObject(a);
    a=new BossNameObject(this);
    stgAddObject(a);
    this.phase=[];
    this.finished=false;
    stgBossClearPhase();
   // stgBossAddPhase([new BossSLZ.NonSpell3(this),new BossSLZ.Spell3(this)]);//永
    if(stg_common_data.spell_practice){
        var i=stg_common_data.phase;
        var p=BossSLZ.phases[i];
        var q=[];
        for(var j=0;j< p.length;j++){
            q.push(new p[j](this));
        }
        stgBossAddPhase(q);
    }else{
      //  stgBossAddPhase([new BossESC.Spell1(this)]);
        stgBossAddPhase([new BossESC.NonSpell1(this),new BossESC.Spell1(this)]);//红
    }
    a=new BossSpellCount(this);
    stgAddObject(a);
    stgSetPositionA1(this,stg_frame_w/3,-50);
    luaMoveTo(stg_frame_w/2,80,60,1);

    this.dialogflag=0;
    th.actionStepSet(0,"dlg");
};
BossESC.prototype.script=function(){
    stg_default_boss_script();
    th.actionStepUse("dlg");
    if(!this.dialogflag){
        if(frame==60){
            th.actionStepSet(1);
        }
        this.dialog_script();
    }
    if(th.actionStepSingle(4)){
        this.finished=true;
    }else if(th.actionStep(4)){
        if(this.finished){
            if(this.delay<=0){
                stgBossStartNextSpell();
                if(this.finished){
                    if(stg_common_data.spell_practice){
                        this.clip=0;
                        luaMoveTo(0,-100,60,1);
                        this.script=0;
                        stgDeleteObject(this,60);
                    }else{
                        var a=new BreakCircleEffect(45);
                        stgAddObject(a);
                        stgSetPositionA1(a,this.pos[0],this.pos[1]);
                        stgDeleteSelf();

                    }
                }
            }else{
                this.delay--;
            }
        }
    }

};

BossESC.prototype.dialog_script=function(){
    th.actionStepUse("dlg");
    if(th.actionStep(1)){
        if(th.actionStepSingle(1)){
            this.dialog=new thc.Dialog(48,368,354,48,16,2);
            stgAddObject(this.dialog);
        }else if(th.actionStepTime(60)){
            this.dialog.setText(0,"生日快乐ESC！","#F00");
        }else if(th.actionStepTime(120) || th.actionKeyDown(stg_players[0].key,thc.KEY_SHOT)){
            th.actionStepNext();
        }
    }else if(th.actionStepSingle(2)){
        this.dialog.setText(1,"顺便按住","#F00");
    }else if(th.actionStep(2)){
        if(th.actionStepTime(120) || th.actionKeyDown(stg_players[0].key,thc.KEY_SHOT)){
            th.actionStepNext();
        }
    }else if(th.actionStepSingle(3)){
        this.dialog.setText(0,"顺便按住","#F00");
        this.dialog.setText(1,"呜啊啊啊","#000");
        defaultShowBGM("きくお - ラストバトル");
        stgPlayBGM("esc_bgm");
    }else if(th.actionStep(3)){
        if(th.actionStepTime(120) || th.actionKeyDown(stg_players[0].key,thc.KEY_SHOT)){
            stgDeleteObject(this.dialog);
            th.actionStepNext();
        }
    }
};

BossESC.NonSpell1=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossESC.NonSpell1.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    th.actionStepSet(0,"phase");
    this.a=stg_rand(360);
    this.ax=3;
};
BossESC.NonSpell1.prototype.script=function(){
    th.actionStepUse("phase");
    var f=0;
    if(frame==60){
        th.actionStepSet(1);
    }
    if(th.actionStepSingle(1)){
        this.a=stg_rand(360);
        this.ax=this.ax||3;
    }else if(f=th.actionStep(1)){
        if(f%100<50){
            if(f%100==1){
                this.b=stg_rand(-6,6)*PI180;
                this.c=stg_rand(-6,6)*PI180;
            }
            if(f%6==0){
                var w1=8;
                for(var i=0;i<w1;i++){
                    stgCreateShotA1(this.pos[0],this.pos[1],1,this.a+i*360/w1,"sZD",0,7);
                    stg_last.script=BossESC.NonSpell1.blt_script;
                    stg_last.a1=this.b;
                    stg_last.a2=this.c;
                    stgCreateShotA1(this.pos[0],this.pos[1],1.6,this.a+i*360/w1,"sZD",0,15);
                    stg_last.script=BossESC.NonSpell1.blt_script;
                    stg_last.a1=this.b;
                    stg_last.a2=this.c;

                }
                stgPlaySE("se_shot0");
                this.a+=this.ax;
            }
        }
        if(f%100==60){
            bossWanderSingle(this.boss,0,18,18,30,12,12);
            this.ax=-this.ax;
            this.a=stg_rand(360);
            stgCreateShotW2(this.pos[0],this.pos[1],3,stg_rand(360),"sZD",4,0,24,4,360,0);
            stgPlaySE("se_shot0");
        }
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
};

BossESC.NonSpell1.blt_script=function(){
    if(frame==60){
        this.move.speed_angle_acceleration=this.a1;
        stgPlaySE("se_kira02");
    }
    if(frame==80){
        this.move.speed_angle_acceleration=0;
    }
    if(frame==140){
        this.move.speed_angle_acceleration=this.a2;
        stgPlaySE("se_kira02");
    }
    if(frame==160){
        this.move.speed_angle_acceleration=0;
    }
};


BossESC.Spell1=function(boss){
    bossDefineSpellA(boss,this,"超绝【破碎虚空】"+(diff?"(Easy)":""),2200,30*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossESC.Spell1.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(new BossSLZ.SpellBg1(this));
    stgPlaySE("se_cast");
    th.actionStepSet(0,"phase");
};
BossESC.Spell1.prototype.script=function(){
    th.actionStepUse("phase");
    var f;
    if(f=th.actionStep(0)){
        var a=this.boss.aura1;
        var b=this.boss.aura2;
        if(f>60 && f<120){
            var r=(f-60)/30;
            renderSetSpriteSize((f-60)*50+100,(f-60)*50+100,a);
            renderSetSpriteColorRaw(1-r,1-r,1-r,2,a);
            renderSetObjectSpriteBlend(a,blend_default);
        }
        if(f==120){
            b.changeSize(600);
            b.layer=stg_const.LAYER_BULLET-2;
        }
        if(f>120 && f<180){
            r=(f-120)/60;
            renderSetSpriteColorRaw(0,0,0,2-r*2,a);
        }
        if(f==180){
            r=(f-120)/60;
            renderSetSpriteSize(5,5,a);
            renderSetSpriteColorRaw(1,1,1,1,a);
            renderSetObjectSpriteBlend(a,blend_add);
        }
        if(f>180 && f<210){
            r=(f-180)/30;
            renderSetSpriteSize(100*r,100*r,a);
        }
        if(f==210){
            th.actionStepNext();
        }
    }
    if(th.actionStepSingle(1)){
        this.a=stg_rand(360);
        this.ax=this.ax||3;
    }else if(f=th.actionStep(1)){
        if(f%100<50){
            if(f%100==1){
                this.b=stg_rand(-6,6)*PI180;
                this.c=stg_rand(-6,6)*PI180;
            }
            if(f%6==0){
                var w1=8;
                for(var i=0;i<w1;i++){
                    stgCreateShotA1(this.pos[0],this.pos[1],1,this.a+i*360/w1,"sZD",0,7);
                    stg_last.script=BossESC.NonSpell1.blt_script;
                    stg_last.a1=this.b;
                    stg_last.a2=this.c;
                    stgCreateShotA1(this.pos[0],this.pos[1],1.6,this.a+i*360/w1,"sZD",0,15);
                    stg_last.script=BossESC.NonSpell1.blt_script;
                    stg_last.a1=this.b;
                    stg_last.a2=this.c;

                }
                stgPlaySE("se_shot0");
                this.a+=this.ax;
            }
        }
        if(f%100==60){
            bossWanderSingle(this.boss,0,18,18,30,12,12);
            this.ax=-this.ax;
            this.a=stg_rand(360);
            stgCreateShotW2(this.pos[0],this.pos[1],3,stg_rand(360),"sZD",4,0,24,4,360,0);
            stgPlaySE("se_shot0");
        }
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
    }
};

BossESC.Spell1.prototype.finalize=function(){
    var a=this.boss.aura1;
    renderSetSpriteSize(100,100,a);
    renderSetSpriteColorRaw(1,1,1,1,a);
    renderSetObjectSpriteBlend(a,blend_add);
    var b=this.boss.aura2;
    b.layer=24;
    b.changeSize(100);
};

BossESC.Spell1.Phase=function(spell){
    this.spell=spell;
    this.mode=0;
    this.base=new StgBase(spell,0,1);
};
BossESC.Spell1.Phase.prototype.script=function(){

    if(this.frame>122 || this.spell.remove){
        stgDeleteSelf();return;
    }
    if(this.frame==2){
        stgPlaySE("se_shot0");
        this.pool=[];
        var spell=this.spell;
        stgCreateShotW2(spell.pos[0],spell.pos[1],4,90,"lDY",0,3,8,4,160,0,BossSLZ.Spell1.dyCreate);
        bossWanderSingle(this.spell.boss,0,60,60,60);
    }
    if(this.frame==120){
        stgAddObject(new BossSLZ.Spell1.Phase(this.spell));
        stg_last.mode=(this.mode+1)%4;
    }
    if(this.frame==122){
        var p=hyzGetRandomPlayer(this.sid);
        if(!p)p={pos:[stg_frame_w/2,stg_frame_h-32]};
        var angle=p?atan2p(this.spell.pos, p.pos):90;
        for(var i=0;i<this.pool.length;i++){
            var a=this.pool[i];
            a.move.acceleration=0.02;
            a.move.max_speed=1;
            if(this.mode==0){
                a.move.speed_angle=angle;
            }else if(this.mode==1){
                a.move.speed_angle=stg_rand(360);
            }else if(this.mode==2){
                a.move.speed_angle=atan2p(a.pos, p.pos);
            }else if(this.mode==3) {
                a.move.speed_angle= a.a;
            }
        }
    }
};