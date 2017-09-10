/**
 * Created by Exbo on 2017/5/14.
 */
var diff=0;
function BossSLZ(){
    this.english_name="Sha Li Zi";
    this.delay=0;
}
BossSLZ.pre_load=function(){
    stgCreateImageTexture("cardbg2_c","cardbg2_c.png");
    stgCreateImageTexture("cardbg2_d","cardbg2_d.png");
    stgCreateImageTexture("enemy1","res/enemy1.png");
    stgCreateImageTexture("black","black.png");
    renderCreate2DTemplateA1("black64","black",0,0,64,64,0,0,0,1);
    renderCreate2DTemplateA1("cardbg2_d","cardbg2_d",-256,-256,1024,1024,0,0,0,1);
    renderCreate2DTemplateA1("slz_option1","enemy1",48*4,0,32,32,32,0,0,1);
    renderCreate2DTemplateA1("slz_option2","enemy1",48*4,32,32,32,32,0,0,1);
    stgCreateImageTexture("laser1","res/laser1.png");
    stgLoadBGM("slz_bgm","music/15-battle-for-the-last.mp3",130,109.5);
   // stgLoadBGM("slz_bgm","se/se_cancel00.wav",130,109.5);

 //   stgLoadBGM("slz_bgm","music/15-battle-for-the-last.mp3",20,10);
};

BossSLZ.prototype.init=function(){
    diff=stg_common_data.difficulty||0;
    var a=new luastg.BossResourceHolder("slz",8,4,[4,0],[6,3],[6,3],[8,0],this);
    stgAddObject(a);
    this.image=a;
    this.current_spell=0;
    this.current_spell_object=0;
    this.current_phase=0;
    a=new UnitAura1(this,80,255,242,0);
    stgAddObject(a);
    a=new BossDynamicAura(this,100);
    stgAddObject(a);
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
        //stgBossAddPhase([new BossSLZ.NonSpell0(this)]);
        stgBossAddPhase([new BossSLZ.NonSpell1(this),new BossSLZ.Spell1(this)]);//红
        stgBossAddPhase([new BossSLZ.NonSpell2(this),new BossSLZ.Spell2(this)]);//妖
        stgBossAddPhase([new BossSLZ.NonSpell3(this),new BossSLZ.Spell3(this)]);//永
        stgBossAddPhase([new BossSLZ.NonSpell4(this),new BossSLZ.Spell4(this)]);//风
        stgBossAddPhase([new BossSLZ.NonSpell5(this),new BossSLZ.Spell5(this)]);//殿
        stgBossAddPhase([new BossSLZ.NonSpell6(this),new BossSLZ.Spell6(this)]);//船
        stgBossAddPhase([new BossSLZ.NonSpell7(this),new BossSLZ.Spell7(this)]);//庙
        stgBossAddPhase([new BossSLZ.NonSpell8(this),new BossSLZ.Spell8(this)]);//城
        stgBossAddPhase([new BossSLZ.Spell9(this)]);//自制
        stgBossAddPhase([new BossSLZ.Spell10(this)]);//绀
    }
    a=new BossSpellCount(this);
    stgAddObject(a);
    stgSetPositionA1(this,stg_frame_w/3,-50);
    luaMoveTo(stg_frame_w/2,80,60,1);
    defaultShowBGM("battle-for-the-last (CAVE)");
    stgPlayBGM("slz_bgm");
};

BossSLZ.prototype.spells=[];
BossSLZ.prototype.phases=[];

BossSLZ.prototype.script=function(){
    stg_default_boss_script();

    if(this.frame>=60){
        if(this.frame==60){
            this.finished=true;
        }else{
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

    }
};


BossSLZ.NonSpell0=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell0.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,120,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    this.a=0;
};
BossSLZ.NonSpell0.prototype.script=function(){

    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    if(this.frame>60){
        if(this.frame%10==0){
            for(var i=0;i<5;i++){
                var a=this.a+i*360/5;
                for(var j=0;j<5;j++){
                    stgCreateShotA1(this.pos[0],this.pos[1],2,a,"sMD",0,i);
                    stg_last.move.speed_angle_acceleration=(j-2)*0.6*PI180;
                    stg_last.script=BossSLZ.NonSpell0.blt_script;
                }
            }
            this.a+=5;
        }
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
};
BossSLZ.NonSpell0.blt_script=function(){
    if(this.frame==80){
        var a=this.move.speed_angle_acceleration*this.frame;
        stg_last.move.speed_angle_acceleration+=stg_rand(-0.6,0.6)*PI180;
        this.move.speed_angle-=2*a;
        this.move.speed_angle+=5*PI180;
    }
    if(this.frame==180){
        this.move.speed_angle_acceleration=0;
    }
};


BossSLZ.NonSpell1=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell1.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
};
BossSLZ.NonSpell1.prototype.script=function(){
    if(this.frame%600==60){
        stgAddObject(new BossSLZ.NonSpell1.Phase(this));
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
};

BossSLZ.NonSpell1.Phase=function(spell){
    this.spell=spell;
    this.a=stg_rand(360);
    this.b=stg_rand(360);
    this.c=0;
    this.d1=diff?24:12;
};
BossSLZ.NonSpell1.Phase.prototype.script=function(){
    if(this.frame>480 || this.spell.remove){
        stgDeleteSelf();return;
    }
    if(this.frame%this.d1==0){
        var color=3;
        var x=this.spell.pos[0];
        var y=this.spell.pos[1];
        stgPlaySE("se_shot0");
        stgCreateShotW2(x,y,3.5-diff,this.a,"lDY",0,color,12-diff*4,3.5-diff,360,0);
        stgCreateShotW2(x,y,2,this.b,"mZY",0,color,8,2,360,0);
        stgCreateShotW2(x,y,1.8,this.c,"sXY",0,color-1,4,1.8,16,0,BossSLZ.NonSpell1.on_create_cross);
        this.a+=23;
        this.b-=18;
        this.c+=360/14;
    }
    if(this.frame==240){
        bossWanderSingle(this.spell.boss,0,60,60,60);
    }

};
BossSLZ.NonSpell1.on_create_cross=function(a){hyzSetCross(1,a);};

BossSLZ.SpellBg1=function(spell){
    this.spell=spell;
    this.base=new StgBase(spell,0,1);
};
BossSLZ.SpellBg1.prototype.init=function(){
    var a={};
    renderCreateSpriteRender(a);
    a.layer=22;
    renderApply2DTemplate(a.render,"cardbg2_d",0);
    a.base=new StgBase(this,0,1);
    a.sid=this.sid;
    renderSetSpriteColor(255,255,255,0,a);
    this.layer1=a;
    stgAddObject(a);
};
BossSLZ.SpellBg1.prototype.script=function(){
    this.layer1.rotate[2]+=0.5*PI180;
    stgSetPositionA1(this.layer1,stg_frame_w/2,stg_frame_h/2);
    if(this.frame<=51){
        renderSetSpriteColor(255,255,255,5*this.frame,this.layer1);
    }

};



BossSLZ.Spell1=function(boss){
    bossDefineSpellA(boss,this,"记忆【筑墙鬼幻想】"+(diff?"(Easy)":""),2200,30*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell1.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(new BossSLZ.SpellBg1(this));
    stgPlaySE("se_cast");
};
BossSLZ.Spell1.prototype.script=function(){

    if(this.frame==60){
        stgAddObject(new BossSLZ.Spell1.Phase(this));
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
    }
};

BossSLZ.Spell1.Phase=function(spell){
    this.spell=spell;
    this.mode=0;
    this.base=new StgBase(spell,0,1);
};
BossSLZ.Spell1.Phase.prototype.script=function(){

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
BossSLZ.Spell1.dyScript=function(){
    if(this.frame<120 && this.frame%(12+diff*12)==1){
        if(this.pos[0]>0 && this.pos[0]<stg_frame_w && this.pos[1]>0 && this.pos[1]<stg_frame_h){
            this.pool.push(stgCreateShotA1(this.pos[0],this.pos[1],0,0,"sXY",30,3));
            stg_last.a=this.move.speed_angle;
        }
    }
};
BossSLZ.Spell1.dyCreate=function(blt,index){
    blt.pool=blt.parent.pool;
    blt.script=BossSLZ.Spell1.dyScript;
};

BossSLZ.NonSpell2=function(boss){
    bossDefineNonSpellA(boss,this,8000,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell2.prototype.init=function(){
    this.invincible=240;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
};
BossSLZ.NonSpell2.prototype.script=function(){
    if(this.frame==60){
        stgAddObject(new BossSLZ.NonSpell2.Phase1(this));
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
};

BossSLZ.NonSpell2.Phase1=function(spell){
    this.spell=spell;
    this.a=1;
    this.ai=3;
    this.s1=30;
    this.s2=30;
    this.b=1;
    this.bi=3;
    this.r=50;
    this.t1=0;
    this.t2=0;
    this.t=0;
    this.count=0;
};

BossSLZ.NonSpell2.Phase1.prototype.script=function(){
    if(this.spell.remove){
        stgDeleteSelf();return;
    }
    if(this.frame==1){
        var p=stg_rand_int(0,1);
        var p1=stg_players[p];
        var p2=stg_players[1-p];
        if(!p2)p2=p1;
        if(!p1)p1=p2;
        //p1=p2;
        this.t1=atan2pr(this.spell.pos,p1.pos);
        this.t2=atan2pr(this.spell.pos,p2.pos);
        bossCast(this.spell.boss,180);
    }
    var r=this.r;
    if(this.frame%14==1 && this.frame<180){
        stgPlaySE("se_shot0");
        var a1=this.t1+this.t;
        var x=this.spell.pos[0]+r*cos(a1*PI180);
        var y=this.spell.pos[1]+r*sin(a1*PI180);
        stgCreateShotW2(x,y,1.5,this.t1,"sXY",12,6,this.a/(1+diff),1.5,this.s1,0);
        if(this.s1<180)this.s1+=8;
        this.a+=this.ai;
        if(this.a>20){
            this.ai=-3;
        }
        this.t+=7;
    }
    if(this.frame%14==8 && this.frame<180){
        stgPlaySE("se_shot0");
        var a2=this.t2-this.t;
        var x=this.spell.pos[0]+r*cos(a2*PI180);
        var y=this.spell.pos[1]+r*sin(a2*PI180);
        stgCreateShotW2(x,y,1.5,this.t2,"sXY",12,5,this.b/(1+diff),1.5,this.s2,0);
        if(this.s2<180)this.s2+=8;
        this.b+=this.bi;
        if(this.b>20){
            this.bi=-3;
        }
        this.t+=7;
    }
    if(this.frame==240){
        bossWanderSingle(this.spell.boss,1,60,60,60);

    }
    if(this.frame==320){
        this.a=1;
        this.ai=3;
        this.s1=30;
        this.s2=30;
        this.b=1;
        this.bi=3;
        this.r=100;
        this.t1=0;
        this.t2=0;
        this.t=0;
        this.frame=0;
        this.count++;
        if(this.count==2){
            stgAddObject(new BossSLZ.NonSpell2.Phase2(this.spell));
            stgDeleteSelf();
        }
    }

};
BossSLZ.NonSpell2.Phase2=function(spell){
    this.spell=spell;
    this.target=stg_rand_int(0,1);
    this.count=0;
    this.ps=[0,0];
};

BossSLZ.NonSpell2.Phase2.prototype.script=function() {
    if (this.spell.remove) {
        stgDeleteSelf();
        return;
    }
    if(this.frame%60<21 && this.count<4 &&this.frame%60>=1){
        var t=this.frame%60;
        if(t==1){
            var p=stg_players[this.count%2?this.target:1-this.target];
            this.ps[0]= p.pos[0];
            this.ps[1]= p.pos[1];
        }
        if(t%3==0)stgPlaySE("se_shot0");
        var x=this.count%2?stg_frame_w/20*t:stg_frame_w-stg_frame_w/20*t;
        var y=this.spell.pos[1];

        stgCreateShotW2(x,y,6-diff*3,atan2pr([x,y], this.ps),"sKWD",7+this.count,this.count,5,6-diff*3,120,0);
    }
    if(this.frame%60==21) {
        this.count++;
        if(this.count<4){
            bossWanderSingle(this.spell.boss,1,20,10,40);
        }else if(this.count==5){
            bossWanderSingle(this.spell.boss,1,40,40,60);
        }else if(this.count==6){
            stgAddObject(new BossSLZ.NonSpell2.Phase1(this.spell));
            stgDeleteSelf();
        }
    }
};

BossSLZ.Spell2=function(boss){
    bossDefineSpellA(boss,this,"记忆【妄执神闪斩】"+(diff?"(Easy)":""),1800,30*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell2.prototype.init=function(){
    this.invincible=300;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
};
BossSLZ.Spell2.prototype.script=function(){
    var t2=this.frame%180;
    var z=stg_frame_w>400?12:18;
    z=z+diff*5;
    if(this.frame%z==0){
        if(t2>90)t2=180-t2;
        t2=t2/90*90;
        stgCreateShotA1(6,6,2.4,t2,"lDY",0,3).slzs2=1;
        stgCreateShotA1(6,6,0.6,t2,"lDY",0,3).slzs2=1;
        stgCreateShotA1(stg_frame_w-6,6,2.4,180-t2,"lDY",0,3).slzs2=1;
        stgCreateShotA1(stg_frame_w-6,6,0.6,180-t2,"lDY",0,3).slzs2=1;
    }


    if(this.frame==60){
        stgAddObject(new BossSLZ.Spell2.Phase(this));
    }
   // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
    }
};

BossSLZ.Spell2.Phase=function(spell){
    this.spell=spell;
    this.base=new StgBase(spell,0,1);
    this.target=stg_rand_int(0,1);
};
BossSLZ.Spell2.Phase.prototype.script=function(){

    if(this.spell.remove){
        stgDeleteSelf();return;
    }

    if(this.frame==60){
        stgAddObject(new BossCharge(this.spell));
        stgAddObject(new BossSLZ.Spell2.SlowEffect(this.spell,60));
    }
    if(this.frame==120){
        var n=_pool.length;
        x=this.spell.pos[0];
        var y=this.spell.pos[1];
        for(var i=0;i<n;i++){
            var a=_pool[i];
            if(a.slzs2){
                var s1=1.5;
                var sa1=0.02;
                if(a.pos[0]<x+40 && a.pos[0]>x-40){
                    stgDeleteObject(a);
                    if(diff==0) {
                        for (var j = 0; j < 1; j++) {
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "mZY", 30, 3);
                            stg_last.move.setAccelerate2(sa1, s1);
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "mZY", 30, 4);
                            stg_last.move.setAccelerate2(sa1, s1);
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "sXY", 30, 3);
                            stg_last.move.setAccelerate2(sa1, s1);
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "sXY", 30, 4);
                            stg_last.move.setAccelerate2(sa1, s1);
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "tDD", 30, 3);
                            stg_last.move.setAccelerate2(sa1, s1);
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "tDD", 30, 4);
                            stg_last.move.setAccelerate2(sa1, s1);
                        }
                    }else{
                        for (var j = 0; j < 1; j++) {
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "mZY", 30, 3);
                            stg_last.move.setAccelerate2(sa1, s1);
                            stgCreateShotA1(a.pos[0] + stg_rand(-10, 10), a.pos[1] + stg_rand(-10, 10), 0, stg_rand(70, 120), "tDD", 30, 4);
                            stg_last.move.setAccelerate2(sa1, s1);
                        }
                    }

                }else if(a.pos[1]<y+70 && a.pos[1]>y-70){
                    stgDeleteObject(a);
                    for(var j=0;j<2-diff;j++) {
                        stgCreateShotA1(a.pos[0]+stg_rand(-10,10),a.pos[1]+stg_rand(-10,10),0,stg_rand(360),"mZY",30,0);
                        stg_last.move.setAccelerate2(sa1,s1);
                        stgCreateShotA1(a.pos[0]+stg_rand(-10,10),a.pos[1]+stg_rand(-10,10),0,stg_rand(360),"mZY",30,2);
                        stg_last.move.setAccelerate2(sa1,s1);
                        stgCreateShotA1(a.pos[0]+stg_rand(-10,10),a.pos[1]+stg_rand(-10,10),0,stg_rand(360),"sXY",30,0);
                        stg_last.move.setAccelerate2(sa1,s1);
                        stgCreateShotA1(a.pos[0]+stg_rand(-10,10),a.pos[1]+stg_rand(-10,10),0,stg_rand(360),"sXY",30,2);
                        stg_last.move.setAccelerate2(sa1,s1);
                        stgCreateShotA1(a.pos[0]+stg_rand(-10,10),a.pos[1]+stg_rand(-10,10),0,stg_rand(360),"tDD",30,0);
                        stg_last.move.setAccelerate2(sa1,s1);
                        stgCreateShotA1(a.pos[0]+stg_rand(-10,10),a.pos[1]+stg_rand(-10,10),0,stg_rand(360),"tDD",30,2);
                        stg_last.move.setAccelerate2(sa1,s1);
                    }
                }
            }
        }
    }
    if(this.frame==160){
        this.target=1-this.target;
        var x=stg_players[this.target].pos[0];//+stg_players[1].pos[0];
        x=x;
        luaMoveTo(x,stg_frame_h/2-30,60,1,this.spell.boss);
    }
    if(this.frame>200){
        this.frame=0;
    }
};
BossSLZ.Spell2.SlowEffect=function(spell,time){
    this.base=new StgBase(spell,0,1);
    this.time=time;
    this.spell=spell;
};

BossSLZ.Spell2.SlowEffect.prototype.init=function() {
    stgPlaySE("se_boon01");
    renderSetObjectSpriteBlend(this.spell.bg.layer1,blend_add);
};
BossSLZ.Spell2.SlowEffect.prototype.finalize=function() {
    renderSetObjectSpriteBlend(this.spell.bg.layer1,0);
};
BossSLZ.Spell2.SlowEffect.prototype.script=function(){
    if(this.frame<=this.time){
        hyzSetSuperPauseTime(1);
    }else{
        stgPlaySE("se_shot0");
        stgDeleteSelf();
        renderSetObjectSpriteBlend(this.spell.bg.layer1,0);
    }
};
BossSLZ.Spell2.dyCreate=function(blt,index){
    blt.pool=blt.parent.pool;
    blt.script=BossSLZ.Spell1.dyScript;
};

BossSLZ.NonSpell3=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell3.prototype.init=function(){
    this.invincible=120;
    if(!stgIsInScreen(this.boss)){
        luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    }else{
        luaMoveTo(this.boss.pos[0],80,60,1,this.boss);
    }
    stgAddObject(new BossSpellInitObject(this));
    this.f=0;
};
BossSLZ.NonSpell3.prototype.script=function(){

    if(this.f>=120 && this.f<=240){
        if(this.f==120){
            this.a=atan2pr(this.pos,stgGetRandomPlayer().pos)-60;
            bossWanderSingle(this.boss,1,90,12,60,70);
        }
        if(this.f%(2+diff*3)==0){
            shotSE();
            var a=this.a;
            this.a+=6+diff*9;
            stgCreateShotW1(this.pos[0],this.pos[1],0.2,a,"sXY",0,1,5,0.8,0,0,BossSLZ.NonSpell3.blt_create);
            stgCreateShotW1(this.pos[0],this.pos[1],0.2,a+2,"sXY",0,1,5,0.8,0,0,BossSLZ.NonSpell3.blt_create);
        }
    }
    if(this.f>=210 && this.f<=330){
        if(this.f==210){
            this.a=atan2pr(this.pos,stgGetRandomPlayer().pos)+60;
            bossWanderSingle(this.boss,1,90,12,60,70);
        }
        if(this.f%(2+diff*3)==0){
            shotSE();
            var a=this.a;
            this.a-=6+diff*9;
            stgCreateShotW1(this.pos[0],this.pos[1],0.2,a,"sXY",0,1,5,0.8,0,6,BossSLZ.NonSpell3.blt_create);
            stgCreateShotW1(this.pos[0],this.pos[1],0.2,a+2,"sXY",0,1,5,0.8,0,6,BossSLZ.NonSpell3.blt_create);
        }
    }
    if(this.f==420){
        for(var i=0;i<=9;i++){
            a=180/9*i;
            stgAddObject(new BossSLZ.NonSpell3.Option(this.boss,this,this.pos[0],this.pos[1],0,0));
            stgEnableMove(stg_last);
            stgSetPositionA1(stg_last,this.pos[0],this.pos[1]);
            stg_last.move.setSpeed(2.3,a);
        }
    }
    if(this.f==530){
        this.f=0;
    }
    this.f++;

    if(stgDefaultFinishSpellCheck(60)){
        stgStopWShot();
        stgDeleteSubShot(this,true);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
};
BossSLZ.NonSpell3.blt_create=function(blt){
    blt.script=BossSLZ.NonSpell3.blt_func;
};
BossSLZ.NonSpell3.blt_func=function(){
    if(this.frame==30){
        this.move.acceleration=-this.move.speed/30;
    }
    if(this.frame==59){
        this.move.acceleration=0;
        this.move.speed=0;
    }
    if(this.frame==90){
        if(stg_rand(1)>0.8+diff){
            stgCreateShotA1(this.pos[0],this.pos[1],0.1,stg_rand(360),"sLD",0,0);
            stg_last.move.setAccelerate2(0.1,3);
            this.fade_remove=12;
        }else{
            this.move.setAccelerate2(0.1,3);
        }
    }
};

BossSLZ.NonSpell3.Option=function(boss,spell,x,y,mode,color){
    this.boss=boss;
    this.spell=spell;
    this.base=new StgBase(spell,0,1);
    this.move=new StgMove();
    this.move.pos[0]=x;
    this.move.pos[1]=y;
    this.c=color||0;
    this.last_slow=-1;
    renderCreateSpriteRender(this);
    this.layer=stg_const.LAYER_ENEMY;
    stgApplyEnemy(this);
    this.life=100;
    this.invincible=30;
    this.mode=mode;
    this.a=90*PI180;
};

BossSLZ.NonSpell3.Option.prototype.script=function(){

    var slow=0;
    if(this.frame>600){
        stgDeleteSelf();
    }
    if(this.life<0){
        stgDeleteSelf();
    }
    if(!stgIsInScreen(this.pos)){
        stgDeleteSelf();
    }
    if(this.spell.remove){
        stgDeleteSelf();
        return;
    }
    for(var i=0;i<stg_players_number;i++){
        var a=stg_players[i];
        if(a.state!=stg_const.PLAYER_DEAD){
            if(a.key[stg_const.KEY_SLOW]){
                slow++;
            }
        }
    }
    slow=slow%2;
    if(slow!=this.last_slow){
        renderApply2DTemplate(this.render,slow?"slz_option2":"slz_option1",this.c);
        this.update=true;
        this.last_slow=slow;
        if(slow){
            this.hitby=0;
            this.hitdef=0;
        }else{
            this.hitby=new StgHitDef();
            this.hitby.setPointA1(0,0,10);
            this.hitdef=new StgHitDef();
            this.hitdef.setPointA1(0,0,8);
        }
        stgPlaySE("se_kira02");
    }
    if(this.mode==0) {
        if (this.frame > 30) {
            if (this.frame % (24+diff*24) == 0) {
                stgPlaySE("se_shot0");
                stgCreateShotW2(this.pos[0], this.pos[1], slow ? 0.5 : 1.5, this.a, "mZY", 0, slow ? 3 : 5, 5, slow ? 0.5 : 1.5, 270, 0);
            }
        }
    }else if(this.mode==1) {
        if (this.frame > 30) {
            if (this.frame % (12+diff*12) == 0) {
                for(var i=0;i<stg_players_number;i++){
                    var p=stg_players[i];
                    if(sqrt2(p.pos,this.pos)<18)return;
                }
               // stgPlaySE("se_shot0");
                stgCreateShotA1(this.pos[0],this.pos[1],0.01,this.move.speed_angle/PI180+70,"sLD",0,0);
                stg_last.move.setAccelerate2(0.05,0.8);
                stgCreateShotA1(this.pos[0],this.pos[1],0.01,this.move.speed_angle/PI180-70,"sLD",0,0);
                stg_last.move.setAccelerate2(0.05,0.8);
            }
        }
    }

};
BossSLZ.Spell3=function(boss){
    bossDefineSpellA(boss,this,"记忆【夜盲之歌】"+(diff?"(Easy)":""),2400,60*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell3.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(new BossSLZ.SpellBg1(this));
    stgPlaySE("se_cast");
};
BossSLZ.Spell3.prototype.script=function(){

    if(this.frame==60){
        stgAddObject(new NightEffect(this,30,120));
    }
    if(this.frame>0){
        if(this.frame%(18+diff*18)==0){
            shotSE();
            stgCreateShotW1(this.pos[0],this.pos[1],1,this.frame*3,"sXY",0,1,6,0.2,0,0);
            stgCreateShotW1(this.pos[0],this.pos[1],1,this.frame*3+120,"sXY",0,1,6,0.2,0,0);
            stgCreateShotW1(this.pos[0],this.pos[1],1,this.frame*3+240,"sXY",0,1,6,0.2,0,0);
        }
    }
    if(this.frame%160==0){
        smallSE();
        var pa=atan2pr(this.pos,stgGetRandomPlayer().pos);
        for(var i=0;i<=6;i++){
            var a=180/6*i-90+pa;
            stgAddObject(new BossSLZ.NonSpell3.Option(this.boss,this,this.pos[0],this.pos[1],1,0));
            stgEnableMove(stg_last);
            stgSetPositionA1(stg_last,this.pos[0],this.pos[1]);
            stg_last.move.setSpeed(2.3,a);
        }
        bossWanderSingle(this.boss,1,80,12,30,60);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
    }
};
BossSLZ.Spell4=function(boss){
    bossDefineSpellA(boss,this,"记忆【无限之柱】"+(diff?"(Easy)":""),3200,60*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell4.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(new BossSLZ.SpellBg1(this));
    stgPlaySE("se_cast");
};
BossSLZ.Spell4.prototype.script=function(){

    if(this.frame%420==60){
        stgAddObject(new BossSLZ.Spell4.Phase(this));
    }
    if(this.frame>60){
        if(this.frame%45==0){
            shotSE();
            stgCreateShotW2(this.pos[0],this.pos[1],4,stg_rand(360),"sZD",0,6,15-diff*10,4,360,0,BossSLZ.Spell4.zdCreate);
        }
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
    }
};

BossSLZ.Spell4.Phase=function(spell){
    this.spell=spell;
    this.mode=0;
    this.base=new StgBase(spell,0,1);
    this.a=stg_frame_w/2-((stg_frame_w/2/32)>>0)*32;
};
BossSLZ.Spell4.Phase.prototype.script=function(){

    if(this.spell.remove){
        stgDeleteSelf();return;
    }
    if(this.frame%12==0){
        var a=new StraightLaser(-64,-300-64,-64,-64,8,16);
        stgAddObject(a);
        stgEnableMove(a);
        a.setWidth(20-diff*15);
        stgSetPositionA1(a,this.a,0);
        a.setTexture("laser1",0,16,0,64,192,256,1);
        a.turnOn(0);
        a.script=BossSLZ.Spell4.laserScript;
        a.move.setSpeed(6,90);
        a.keep=1;
        a.move_rotate=1;
        a=new StraightLaser(-64,-300-64,-64,-64,8,16);
        stgAddObject(a);
        stgEnableMove(a);
        stgSetPositionA1(a,stg_frame_w-this.a,0);
        a.setTexture("laser1",0,16,0,64,192,256,1);
        a.turnOn(0);
        a.setWidth(20-diff*15);
        a.script=BossSLZ.Spell4.laserScript;
        a.move.setSpeed(6,90);
        a.keep=1;
        a.move_rotate=1;
        this.a+=32;
        if(this.a>stg_frame_w){
            stgDeleteSelf();
            bossWanderSingle(this.spell.boss,true,32,5,36);
        }
    }

};
BossSLZ.Spell4.laserScript=function(){
    if(this.pos[1]>stg_frame_h+64 && !this.a){
        this.a=1;
        stgCreateShotW2(this.pos[0],stg_frame_h-3,2,270,"sXY",30,0,5,2,180,0);
    }
    if(this.pos[1]>stg_frame_h+300+64+64){
        stgDeleteSelf();
    }
};
BossSLZ.Spell4.zdCreate=function(bullet){
    bullet.move.setAccelerate2(-0.06,0.001);
    bullet.script=BossSLZ.Spell4.zdScript;
};
BossSLZ.Spell4.zdScript=function(){
    if(this.frame%45==0){
        var a=stgGetRandomPlayer();
        this.move.setSpeed(2,atan2pr(this.pos, a.pos));
        bulletChangeType(this,"sZD",this.color-1);
        this.a=(this.a||0)+1;
    }
    if(this.a==3){
        smallSE();
        this.move.setSpeed(0.8,atan2pr(this.pos, a.pos));
        this.move.acceleration=0;
        this.move.max_speed=0;
        this.script=0;
    }
};

//阿空非符
BossSLZ.NonSpell5=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell5.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    this.f=0;
};
BossSLZ.NonSpell5.prototype.script=function(){
    if(this.f==60){
        this.a1=stg_rand(360);
    }
    if(this.f>=60&& this.f<=180 && this.f%6==0){
        stgCreateShotW2(this.pos[0],this.pos[1],1,this.a1,"mZY",0,4,60-diff*20,1,360,0,BossSLZ.NonSpell5.wshot1);
    }
    if(this.f>=120&& this.f<=240 && this.f%8==0)
    {
        shotSE();
        stgCreateShotW2(this.pos[0],this.pos[1],5,90,"mZY",0,3,60-diff*20,5,360,0,BossSLZ.NonSpell5.wshot2);
    }
    if(this.f==360){
        bossWanderSingle(this.boss,1,15,5,60);
    }
    if(this.f==400){
        this.f=0;
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    this.f++;
    stgClipObject(32,stg_frame_w-32,70,90,this.boss);
};
BossSLZ.NonSpell5.wshot1=function(a,i){
    a.script=BossSLZ.NonSpell5.shotscript1;
};
BossSLZ.NonSpell5.shotscript1=function(){
    if(this.frame==25){
        this.move.setAccelerate2(0.2,8);
        delete this.script;
    }
};
BossSLZ.NonSpell5.wshot2=function(a,i){
    a.script=BossSLZ.NonSpell5.shotscript2;
    a.a=i%2;
};
BossSLZ.NonSpell5.shotscript2=function(){
   // if(this.frame==25) {
   //     this.move.setAccelerate2(0.2, 8);
   // }
    if(this.frame>25){
        this.move.speed_angle+=(this.a?1:-1)*PI180*70/this.frame;
    }
};

BossSLZ.Spell5=function(boss){
    bossDefineSpellA(boss,this,"记忆【人工托卡马克】",2000,45*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell5.prototype.init=function(){
    this.invincible=600;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
};
BossSLZ.Spell5.prototype.script=function(){
    var t2=this.frame%180;
    if(this.frame==60){
        var a=new CircleObject(18,27,0,360,96);
        a.SetColor(255,255,255,200);
        a.SetTexture("bullet",286,128,286,192,0);
        a.layer=stg_const.LAYER_BULLET;
        stgSetPositionA1(a,this.pos[0],this.pos[1]);
        this.tk=a;
        a.script=function(){
            var a=this;
            if(a.frame==1){luaMoveTo(stg_frame_w/2,stg_frame_h/2,60,1)}
            if(a.frame>60 && a.frame<120){a.r0+=3.3;a.r1+=3.3;}
            if(a.frame==120){
                a.SetColor(255,255,255,255);
                a.hitdef=new StgHitDef();
                a.type=stg_const.OBJ_BULLET;
                a.keep=true;
                a.hitdef.setCircleA2(0,0, (a.r0+ a.r1)*0.5,(a.r1- a.r0)*0.45);
            }
            if(a.frame>120 && a.frame<140){
                a.r0-=4-diff*2;a.r1+=4-diff*2;
                a.hitdef.setCircleA2(0,0, (a.r0+ a.r1)*0.5,(a.r1- a.r0)*0.45);
                a.a=0;
                a.b=0;
            }
            if(a.frame>180){
                if(a.frame%(8+diff*4)==0){
                    shotSE();
                    stgCreateShotA1(a.pos[0],a.pos[1],0.7, a.a,"sXY",6,3).layer--;
                    stgCreateShotA1(a.pos[0],a.pos[1],0.7, a.a+120,"sXY",6,3).layer--;
                    stgCreateShotA1(a.pos[0],a.pos[1],0.7, a.a+240,"sXY",6,3).layer--;
                    a.a+=33;
                }
                for(var i=0;i<stg_players_number;i++){
                    var p=stg_players[i];
                    if(p.state==stg_const.PLAYER_NORMAL) {
                        var z = [];
                        sqrt2d(p.pos[0] - a.pos[0], p.pos[1] - a.pos[1], z);
                        if(z[0]<(a.r0+ a.r1)*0.5) {
                            p.pos[0] += 0.7*z[1];
                            p.pos[1] += 0.7*z[2];
                        }else{
                            p.pos[0] -= 0.7*z[1];
                            p.pos[1] -= 0.7*z[2];
                        }
                    }
                }
                if(a.frame>240 && a.frame%(3+diff*3)==0){

                    stgCreateShotR1(a.pos[0],a.pos[1],0.7, a.b,"tDD",6,0,(a.r0+ a.r1)*0.5,stg_rand(177,183)).layer++;
                    a.b+=90.7;
                }
            }
        }
        stgAddObject(a);
        a.base=new StgBase(this,0,1);
    }

    if(this.frame==60){
        //stgAddObject(new BossSLZ.Spell2.Phase(this));
    }
    // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
    }
};


BossSLZ.NonSpell4=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell4.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    this.f=1;
};
BossSLZ.NonSpell4.prototype.script=function(){
    if(this.f%(15+diff*15)==0){
        var a=stg_rand(1);
        var b=stg_rand(360);
        var pos=[this.pos[0]+(stg_rand(1)>0.5?45:-45),this.pos[1]-20];
        if(a>0.5){
            b=atan2pr(pos,stgGetRandomPlayer().pos);
        }
        shotSE();
        stgCreateShotW2(pos[0],pos[1],3.3,b,"sMD",0,stg_rand_int(15),59-diff*18,3.3,360,0);
    }/*else if(this.f%30==15){
        var a=stg_rand(1);
        var b=stg_rand(360);
        var pos=[this.pos[0]+45,this.pos[1]-20];
        if(a>0.5){
            b=atan2pr(pos,stgGetRandomPlayer().pos);
        }
        stgCreateShotW2(pos[0],pos[1],3.3,b,"sMD",0,stg_rand_int(15),49,3.3,360,0);

    }*/
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    if(this.frame>80)this.f++;
    stgClipObject(32,stg_frame_w-32,70,90,this.boss);
};

BossSLZ.NonSpell6=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell6.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    this.f=1;
};
BossSLZ.NonSpell6.prototype.script=function(){
    if(this.f==60){
        var a=stg_rand(360);
        var w=16-diff*8;
        for(var i=0;i<w;i++){
            var l=new ComplexLaser(60,1);
            stgAddObject(l);
            l.target_length=50;
            l.id=i;
            l.width_add=0.1;
            l.setTexture("bullet",286,128,286,192,0);
            // l.setTexture("white",286,128,286,192,0);
            l.texture_width=10;
            stgSetPositionA1(l,this.pos[0],this.pos[1]);
            l.move.setSpeed(3,i/w*360+a);
            l.script=BossSLZ.NonSpell6.laserMovement1;
            l.blend=blend_add;
        }
    }
    if(this.f==70){
        var a=stg_rand(360);
        var w=16-diff*8;
        for(var i=0;i<w;i++){
            var l=new ComplexLaser(60,1);
            stgAddObject(l);
            l.target_length=50;
            l.id=i;
            l.width_add=0.1;
            l.setTexture("bullet",286+64,128,286+64,192,0);
            // l.setTexture("white",286,128,286,192,0);
            l.texture_width=10;
            stgSetPositionA1(l,this.pos[0],this.pos[1]);
            l.move.setSpeed(4,i/w*360+a);
            l.script=BossSLZ.NonSpell6.laserMovement2;
            l.blend=blend_add;
        }
    }
    if(this.f==80){
        var a=stg_rand(360);
        var w=16-diff*8;
        for(var i=0;i<w;i++){
            var l=new ComplexLaser(60,1);
            stgAddObject(l);
            l.target_length=50;
            l.width_add=0.1;
            l.id=i;
            l.setTexture("bullet",286+128,128,286+128,192,0);
            // l.setTexture("white",286,128,286,192,0);
            l.texture_width=10;
            stgSetPositionA1(l,this.pos[0],this.pos[1]);
            l.move.setSpeed(2.8,i/w*360+a);
            l.script=BossSLZ.NonSpell6.laserMovement3;
            l.blend=blend_add;
        }
    }
    if(this.f==200 ||this.f==210 || this.f==220 || this.f==230 || this.f==240 || this.f==250) {
        var a=stg_rand(360);
        shotSE();
        var w=48-diff*24;
        for(var i=0;i<w;i++){
            stgCreateShotA1(this.pos[0],this.pos[1],4,i/w*360+a,"mZY",0,7);
        }
    }



    if(this.f==280 ||this.f==290 || this.f==300 ||this.f==310 || this.f==320 || this.f==330) {
        var a=stg_rand(360);
        var b=1+(((this.f-280)/20)>>0);
        if(b>=4)b=3;
        shotSE();
        var w=27-diff*11;
        for(var i=0;i<w;i++){
            stgCreateShotA1(this.pos[0],this.pos[1],3,i/w*360+a,"mZY",0,b);
            stg_last.script=BossSLZ.NonSpell6["laserMovement"+b];
            stg_last.keep=1;
        }
    }

    if(this.f==420){
        var a=stg_rand(360);
        var w=20-diff*10;
        this.q=a;
        for(var i=0;i<w;i++){
            var l=new ComplexLaser(60,1);
            stgAddObject(l);
            l.target_length=40;
            l.width_add=0.1;
            l.id=i-100;
            l.setTexture("bullet",286,128,286,192,0);
            // l.setTexture("white",286,128,286,192,0);
            l.texture_width=10;
            stgSetPositionA1(l,this.pos[0],this.pos[1]);
            l.move.setSpeed(5,i/w*360+a);
            l.script=BossSLZ.NonSpell6.laserDefault;
            l.blend=blend_add;
        }
    }
    if(this.f==430){
        var a=this.q+120/20;
        var w=20-diff*10;
        for(var i=0;i<w;i++){
            var l=new ComplexLaser(60,1);
            stgAddObject(l);
            l.target_length=35;
            l.width_add=0.1;
            l.id=i-100;
            l.setTexture("bullet",286+64,128,286+64,192,0);
            // l.setTexture("white",286,128,286,192,0);
            l.texture_width=10;
            stgSetPositionA1(l,this.pos[0],this.pos[1]);
            l.move.setSpeed(5,i/w*360+a);
            l.script=BossSLZ.NonSpell6.laserDefault;
            l.blend=blend_add;
        }
    }
    if(this.f==440){
        var a=this.q+240/20;
        var w=20-diff*10;
        for(var i=0;i<w;i++){
            var l=new ComplexLaser(60,1);
            stgAddObject(l);
            l.target_length=30;
            l.width_add=0.1;
            l.id=i-100;
            l.setTexture("bullet",286+128,128,286+128,192,0);
            // l.setTexture("white",286,128,286,192,0);
            l.texture_width=10;
            stgSetPositionA1(l,this.pos[0],this.pos[1]);
            l.move.setSpeed(5,i/w*360+a);
            l.script=BossSLZ.NonSpell6.laserDefault;
            l.blend=blend_add;
        }
    }
    if(this.f==600){
        bossWanderSingle(this.boss,0,32,10,60);
    }
    /*else if(this.f%30==15){
     var a=stg_rand(1);
     var b=stg_rand(360);
     var pos=[this.pos[0]+45,this.pos[1]-20];
     if(a>0.5){
     b=atan2pr(pos,stgGetRandomPlayer().pos);
     }
     stgCreateShotW2(pos[0],pos[1],3.3,b,"sMD",0,stg_rand_int(15),49,3.3,360,0);

     }*/
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    if(this.frame>80)this.f++;
    if(this.f>600){
        this.f=50;
    }
    stgClipObject(32,stg_frame_w-32,70,90,this.boss);
};

BossSLZ.NonSpell6.laserMovement1=function(){
    if(this.parent.remove || this.frame>300+(this.id||0) || this.pos[1]<-50){
        if(this.destroyLaser1){
            this.destroyLaser1();
        }else{
            stgDeleteSelf();
        }
        this.script=0;
        return;
    }
    if(this.frame<60){
        this.move.speed_angle+=5*PI180;
    }else if(this.frame<120){
        this.move.speed_angle-=2.4*PI180;
    }else if(this.frame<140){
        //this.move.speed_angle+=1.6*PI180;
    }else if(this.frame<150){
        this.move.speed_angle+=7*PI180;
    }
};
BossSLZ.NonSpell6.laserMovement2=function(){
    if(this.parent.remove || this.frame>300+(this.id||0) || this.pos[1]<-50){
        if(this.destroyLaser1){
            this.destroyLaser1();
        }else{
            stgDeleteSelf();
        }
        this.script=0;
        return;
    }
    if(this.frame<60){
        this.move.speed_angle-=3*PI180;
    }else if(this.frame<120){
        this.move.speed_angle-=4*PI180;
    }else if(this.frame<140){
        //this.move.speed_angle+=1.6*PI180;
    }else if(this.frame<150){
        this.move.speed_angle-=6*PI180;
    }
};
BossSLZ.NonSpell6.laserMovement3=function(){
    if(this.parent.remove || this.frame>300+(this.id||0) || this.pos[1]<-50){
        if(this.destroyLaser1){
            this.destroyLaser1();
        }else{
            stgDeleteSelf();
        }
        this.script=0;
        return;
    }
    if(this.frame<60){
       // this.move.speed_angle-=3*PI180;
    }else if(this.frame<120){
        this.move.speed_angle-=6*PI180;
    }
};
BossSLZ.NonSpell6.laserDefault=function(){
    if(this.parent.remove || this.frame>300+(this.id||0)){
        this.destroyLaser1();
    }
};

BossSLZ.Spell6=function(boss){
    bossDefineSpellA(boss,this,"记忆【正意的威光】"+(diff?"(Easy)":""),1500,60*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell6.prototype.init=function(){
    this.invincible=300;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
   // renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet",blend_add);
    stgClipObject(60,stg_frame_w-60,70,90,this.boss);
    this.f=240;
};
BossSLZ.Spell6.prototype.script=function(){
    var t2=this.frame%180;


    if(this.f==0){
        BossSLZ.Spell6.newLaser(this,stg_frame_w/5*0,0,90);
        BossSLZ.Spell6.newLaser(this,stg_frame_w/5*5,0,90);
    }
    if(this.f==20){
        BossSLZ.Spell6.newLaser(this,stg_frame_w/5*1,0,90);
        BossSLZ.Spell6.newLaser(this,stg_frame_w/5*4,0,90);
    }
    if(this.f==40){
        BossSLZ.Spell6.newLaser(this,stg_frame_w/5*2,0,90);
        BossSLZ.Spell6.newLaser(this,stg_frame_w/5*3,0,90);
    }

    if(this.f==300){
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*0,0);
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*7,0);
    }
    if(this.f==320){
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*1,0);
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*6,0);
    }
    if(this.f==340){
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*2,0);
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*5,0);
    }
    if(this.f==360){
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*3,0);
        BossSLZ.Spell6.newLaser(this,0,stg_frame_h/7*4,0);
    }
    this.f++;
    if(this.f==600){
        this.f=0;
    }
    if(this.frame%120==0){
        bossWanderSingle(this.boss,0,64,12,45);
    }

    // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
       // renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet");
    }
};

BossSLZ.Spell6.newLaser=function(spell,x,y,dir){
    var l=new StraightLaser(0,500,0,0,12,32);
    l.setWidth(32-diff*24);
    l.turnHalfOn(20);
    stgAddObject(l);
    l.setTexture("laser1",0,16,0,64,192,256,1);
    stgSetPositionA1(l,x,y);
    l.rotate[2]=dir*PI180;
    l.blend=blend_add;
    l.spell=spell;
    l.script=BossSLZ.Spell6.laser_script;
};
BossSLZ.Spell6.laser_script=function(){
    if(this.spell.remove){
        stgDeleteSelf();
        return;
    }
    if(this.frame==90){
        this.turnOn(30);
    }
    if(this.frame==210){
        this.turnOff(30);
        var p=[this.pos[0],this.pos[1]];
        var dx=cos(this.rotate[2]);
        var dy=sin(this.rotate[2]);
        var dw=0;
        var dt=stg_rand_int(2,6);
        dx=dx*(1+diff);
        dy=dy*(1+diff);
        p[0]+=4*dx;
        p[1]+=4*dy;
        if(stg_rand(1)>0.5)dt=-dt;
        smallSE();
        while(stgIsInScreen(p) && dw<500){
            if(dt>0){
                stgCreateShotA1(p[0]+stg_rand(-2,2),p[1]+stg_rand(-2,2),0.1,this.rotate[2]/PI180+90,"sLD",30,3);
                stg_last.script=BossSLZ.Spell6.blt_script;
                dt--;
                if(dt==0){
                    dt=-stg_rand_int(5,8);
                }
            }else{
                stgCreateShotA1(p[0]+stg_rand(-2,2),p[1]+stg_rand(-2,2),0.1,this.rotate[2]/PI180-90,"sLD",30,3);
                stg_last.script=BossSLZ.Spell6.blt_script;
                dt++;
                if(dt==0){
                    dt=stg_rand_int(5-diff*3,8-diff*5);
                }
            }
            p[0]+=4*dx;
            p[1]+=4*dy;
            dw+=4;
        }
    }
    if(this.frame==240){
        stgDeleteSelf();

    }
};
BossSLZ.Spell6.blt_script=function(){
    if(this.frame==60){
        this.move.setAccelerate2(0.007,0.5);
        this.script=0;
    }
};

BossSLZ.NonSpell7=function(boss){
    bossDefineNonSpellA(boss,this,10000,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell7.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,100,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    this.f=0;
    this.a2=1;
};
BossSLZ.NonSpell7.prototype.script=function(){
    if(this.f==60){
        shotSE();
        for(var i=0;i<9;i++){
            var a=360/9*i+90;
            stgCreateShotA1(this.pos[0],this.pos[1],3,a,"mDD",0,0);
            stg_last.script=BossSLZ.NonSpell7.shotscript1;
            stg_last.move.setAccelerate2(-3/90);
        }
    }
    if(this.f==75){
        shotSE();
        var b=stg_rand(360);
        for(var i=0;i<9;i++){
            var a=360/9*i+b;
            stgCreateShotA1(this.pos[0],this.pos[1],1,a,"mDD",0,0);
            stg_last.script=BossSLZ.NonSpell7.shotscript1;
            stg_last.move.setAccelerate2(-1/90);
        }
    }
    if(this.f==400){
        bossWanderSingle(this.boss,0,60,20,60,50);
        this.f=40;
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    this.f++;
    stgClipObject(32,stg_frame_w-32,70,90,this.boss);
};
BossSLZ.NonSpell7.wshot1=function(a,i){
    a.script=BossSLZ.NonSpell7.shotscript1;
};
BossSLZ.NonSpell7.shotscript1=function(){
    if(this.frame==89){
        this.move.acceleration=0;
        this.move.speed=0;
    }
    if(this.frame==112){
        smallSE();
        stgCreateShotW2(this.pos[0],this.pos[1],1,90,"tJD",12,2,37-diff*20,1,360,0);
       // stgCreateShotW2(this.pos[0],this.pos[1],1,90+180/36,"tDD",12,2,37,1,360,0);
       // stgDeleteSelf();
    }
    if(this.frame==120){
        smallSE();
       // stgCreateShotW2(this.pos[0],this.pos[1],1,90,"tJD",12,2,37,1,360,0);
        stgCreateShotW2(this.pos[0],this.pos[1],1.05,90+180/36,"tDD",12,2,37-diff*20,1.05,360,0);
        stgDeleteSelf();
    }
};


BossSLZ.Spell7=function(boss){
    bossDefineSpellA(boss,this,"记忆【新升的神灵】"+(diff?"(Easy)":""),3500,60*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell7.prototype.init=function(){
    this.invincible=60;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
    renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet",blend_add);
    this.s=0;
};
BossSLZ.Spell7.prototype.script=function(){
    var t2=this.frame%180;


    if(this.frame>=60){
        if(this.life>2000) {
            if (this.frame % (5+diff*5) == 0) {
                var x = stg_rand(0, stg_frame_w);
                var x0 = stg_frame_w / 2 + sin(this.frame * PI180) * 80;
                if (x > x0 + 35 || x < x0 - 35) {
                    stgCreateShotA1(x, 0, 3, 90, "mZY", 0, stg_rand_int(7)).script = BossSLZ.Spell7.blt_script;
                    //   renderSetSpriteColor(255,255,255,200,stg_last);
                }
            }
            if (this.frame % 400 == 0) {
                this.a = 1;
                shotSE();
            }
            if (this.frame % 400 == 1) {
                this.a = 0;
            }
        }else{
            if(!this.s){
                this.s=1;
                bossCharge(this.boss,30);
                this.a = 1;
                shotSE();
            }else{
                this.a = 0;
            }
            if (this.frame % (1+diff*5) == 0) {
                var x = stg_rand(0, stg_frame_w);
                var x0 = stg_frame_w / 2 + sin(this.frame * PI180) * 80;
                if (x > x0 + 35 || x < x0 - 35) {
                    stgCreateShotA1(x, 0, 3, 90, "mZY", 0, stg_rand_int(7)).script = BossSLZ.Spell7.blt_script;
                    //   renderSetSpriteColor(255,255,255,200,stg_last);
                }
            }
        }

        //stgAddObject(new BossSLZ.Spell2.Phase(this));
    }

    // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
        renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet");
    }
};
BossSLZ.Spell7.blt_script=function(){
    if(!this.a) {
        if(this.parent.a){
            this.a=hyzGetRandomPlayer(this.sid);
            this.layer++;
            bulletChangeType(this, "mZY", this.color);
            renderSetSpriteColor(255,255,255,255,this);
            this.b=0;
        }else {
            for (var i = 0; i < stg_players_number; i++) {
                var p = stg_players[i];
                if (p.state != stg_const.PLAYER_DEAD) {
                    var d = sqrt2(this.pos, p.pos);
                    if (d < 45) {
                        //render01BltParser(this, "mZY");
                        //this.update = 1;
                        smallSE();
                        this.layer++;
                        bulletChangeType(this, "mZY", this.color);
                 //       renderSetSpriteColor(255,255,255,255,this);
                        this.a = p;
                        this.b = 0;
                    }
                }
            }
        }
    }else{
        if(this.move.speed>0)this.move.speed-=0.05;
        if(this.move.speed<=0){
            this.move.speed=0;
            this.b++;
            if(this.b==120){
                this.move.speed_angle=atan2p(this.pos,this.a.pos);
                this.move.acceleration=0.04;
                this.move.max_speed=2.4;
                this.script=0;
            }
        }
    }
};

//正邪非符
BossSLZ.NonSpell8=function(boss){
    bossDefineNonSpellA(boss,this,7500,30*60);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.NonSpell8.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    this.f=0;
    this.a2=1;
};
BossSLZ.NonSpell8.prototype.script=function(){
    if(this.f==60){
        this.a1=stg_rand(360);
        this.a2=-this.a2;
        this.a3=3;
    }
    if(this.f>60&& this.f<=120 && this.f%6==0){
        shotSE();
        stgCreateShotW2(this.pos[0],this.pos[1],this.a3,this.a1,"sFZMD",0,4,30-diff*18,this.a3,360,0,BossSLZ.NonSpell8.wshot1);
        this.a1+= this.a2*1.7;
        this.a3-=0.2;
    }
    if(this.f==120){
        this.a1 -= this.a2*4.2;
        this.a3=2.4;
    }
    if(this.f>120&& this.f<=180 && this.f%6==0){
        shotSE();
        stgCreateShotW2(this.pos[0],this.pos[1],this.a3,this.a1,"sFZMD",0,2,30-diff*18,this.a3,360,0,BossSLZ.NonSpell8.wshot1);
        this.a1 -= this.a2*1.7;
        this.a3-=0.14;
    }
    if(this.f==180){
        bossWanderSingle(this.boss,1,15,5,60);
    }
    if(this.f==200){
        this.f=0;
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    this.f++;
    stgClipObject(32,stg_frame_w-32,70,90,this.boss);
};
BossSLZ.NonSpell8.wshot1=function(a,i){
    a.script=BossSLZ.NonSpell8.shotscript1;
};
BossSLZ.NonSpell8.shotscript1=function(){
    if(this.frame==60){
        smallSE();
        stgCreateShotA1(this.pos[0],this.pos[1],1.5,this.rotate[2]/PI180,"sMD",12,this.color).script=BossSLZ.NonSpell8.shotscript2;
        stg_last.move.setAccelerate2(0.05,3);
        stgDeleteSelf();
    }
};
BossSLZ.NonSpell8.shotscript2=function(){
    if(this.frame==40){
        smallSE();
        stgCreateShotA1(this.pos[0],this.pos[1],3,this.rotate[2]/PI180,"sFZMD",12,this.color);
        stg_last.move.setAccelerate2(-0.05,0.5);
        stgDeleteSelf();
    }
};

BossSLZ.Spell8=function(boss){
    bossDefineSpellA(boss,this,"记忆【天翻地覆】"+(diff?"(Easy)":""),3000,60*60,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell8.prototype.init=function(){
    this.invincible=60;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,stg_frame_h/2,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
};
BossSLZ.Spell8.prototype.script=function() {
    var t2 = this.frame % 180;


    if (this.frame == 60) {

        this.last = 2;
        stgAddObject(new BossSLZ.Spell8.ScreenShooter(this));
        this.a = stg_last;
        stgAddObject(this.a.screen);
        stgSetPositionA1(this.a.screen, stg_frame_w / 2, stg_frame_h / 2);
        //    this.a.screen.self_rotate=1*PI180;
    }
    if (this.frame == 90) {
        stgAddObject(new BossSLZ.Spell8.Phase(this));
    }
    if (this.frame > 60 && this.frame % 240 == 180){
        bossCharge(this.boss, 60);
    }
    if(this.frame>60 && this.frame%240==0){
        var a=stg_rand_int(2);
        if(a==this.last){
            a=(a+1)%3;
        }
        this.last=a;

        stgAddObject(new BossSLZ.Spell8.ScreenChanger(this.a.screen,a));
    }

    // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
        renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet");
    }
};
BossSLZ.Spell8.ScreenChanger=function(screen,mode){
    this.a=screen;
    this.b=mode;
};
BossSLZ.Spell8.ScreenChanger.prototype.init=function(){
    if(this.b==0){
        this.c=this.a.render.scale[0]>0?1:-1;
    }else if(this.b==1){
        this.c=this.a.render.scale[1]>0?1:-1;
    }else if(this.b==2){
        this.c=stg_rand_int(1)?1:-1;
        this.d=this.a.rotate[2];
    }
    stgPlaySE("se_boon01");

};
BossSLZ.Spell8.ScreenChanger.prototype.script=function(){
    if(this.b==0) {
        renderSetSpriteScale(cosd(this.frame * 3)*this.c, this.a.render.scale[1], this.a);
    }else if(this.b==1) {
        renderSetSpriteScale(this.a.render.scale[0],cosd(this.frame * 3)*this.c, this.a);
    }else if(this.b==2){
        this.a.rotate[2]=this.d+this.c*90*(1-cosd(this.frame * 3))*PI180;
    }
    if(this.frame==60)stgDeleteSelf();
};
BossSLZ.Spell8.ScreenShooter=function(spell){
    this.spell=spell;
};
BossSLZ.Spell8.ScreenShooter.prototype.init=function(){
    this.vtx=new HyzPrimitive2DVertexList(4);
    this.layer=73;
    this.render=new StgRender("basic_shader");
    this.target=0;
    this.base=new StgBase(this.spell,stg_const.BASE_COPY,1);
    this.screen={};
    this.screen.layer=74;
    renderCreateSpriteRender(this.screen);
};
BossSLZ.Spell8.ScreenShooter.prototype.on_render=function(gl,target){
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
        stg_textures["ScreenShooter"+this.sid]=this.target;
        renderCreate2DTemplateA1("ScreenShooter"+this.sid,"ScreenShooter"+this.sid,0,0,w,h,0,0,0,1);
        renderApply2DTemplate(this.screen.render,"ScreenShooter"+this.sid,0);
     //   renderApply2DTemplate(this.screen.render,"black64",0);
       // renderApply2DTemplate(this.screen,"black64",0);
    }
    this.target.use();
    hyzSetPrimitiveOffset(0,0);
    blend_copy();

    this.vtx.use();
    _webGlUniformInput(hyzPrimitive2DShader,"texture",target);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.finish();
    target.use();
    //hyzAuraShader.use();
    _webGlUniformInput(hyzPrimitive2DShader,"texture",stg_textures["black"]);
    blend_copy();
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.finish();
    blend_default();

};
BossSLZ.Spell8.ScreenShooter.prototype.finalize=function(){
    this.vtx.clear();
    stg_textures["ScreenShooter"+this.sid]=0;
    if(this.target)this.target.release();
    stgDeleteObject(this.screen);
};
BossSLZ.Spell8.Phase=function(spell){
      this.spell=spell;
    this.base=new StgBase(spell,stg_const.BASE_COPY,1);
};
BossSLZ.Spell8.Phase.prototype.init=function(){
    this.a=0;
    this.b=1;
    this.f=0;
};
BossSLZ.Spell8.Phase.prototype.script=function(){
    if(this.spell.remove)return;
    if(this.f<120){
        if(this.f%5==0){
            stgCreateShotW2(this.pos[0],this.pos[1],1.2,this.a,"sFZMD",0,0,9,1.2,360,0,BossSLZ.Spell8.wshot1);
        }
        this.a+=this.b*(0.4-diff*0.3);
    }
    if(this.frame%135==0){
        this.b=stg_rand(1)>0.5?1:-1;
    }
    if(this.frame>120){
        if(this.frame%90==0 || this.frame%90==24){
            shotSE();
            stgCreateShotW2(this.pos[0],this.pos[1],2.5,atan2pr(this.pos,stgGetRandomPlayer().pos),"mZY",1,0,13,2.5,360,0);
        }
    }
    this.f++;
    if(this.f>=180){
        this.f=0;
    }
};
BossSLZ.Spell8.wshot1=function(a,i){
    a.script=BossSLZ.Spell8.shotscript1;
};
BossSLZ.Spell8.shotscript1=function(){
    if(this.frame==60){
        stgCreateShotA1(this.pos[0],this.pos[1],1.5,this.rotate[2]/PI180,"sMD",12,this.color);
        //stg_last.move.setAccelerate2(0.05,3);
        stgDeleteSelf();
    }
};

BossSLZ.Spell9=function(boss){
    bossDefineSpellA(boss,this,"【弹幕函数图样】"+(diff?"(Easy)":""),6000,60*104,12500000,0.8);
    this.is_time_spell=1;
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell9.prototype.init=function(){
    this.invincible=60*200;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,stg_frame_h/2,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
};



BossSLZ.Spell9.prototype.script=function(){
    var t2=this.frame%180;

    if(this.frame==1){
        //this.frame=4600;
    }
    if(this.frame==60){
        stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func1,3,0));
    }
    if(this.frame==260){
        stgAddObject(new BossSLZ.Spell9.Phase2(this,BossSLZ.Spell9.sample_func2,3,1));
    }
    if(this.frame==460){
        stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func2,3,2));
    }
    if(this.frame==660){
        stgAddObject(new BossSLZ.Spell9.Phase2(this,BossSLZ.Spell9.sample_func1,3,3));
    }
    if(this.frame==800){
        stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.dir_func1,0,2));
    }

    if(this.frame==1100){
        stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func3,3,0));

    }if(this.frame==1300){
        stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func4,3,1));
    }if(this.frame==1500){
        stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func5,3,2));
    }if(this.frame==1700){
        stgAddObject(new BossSLZ.Spell9.Phase2(this,BossSLZ.Spell9.sample_func5,3,2));
    }if(this.frame==1850){
        stgAddObject(new BossSLZ.Spell9.Phase2(this,BossSLZ.Spell9.dir_func1,0,2));
    }

    if(this.frame==2100){
        stgAddObject(new BossSLZ.Spell9.Phase4(this,BossSLZ.Spell9.sample_func7,0,0));
    }if(this.frame==2400){
        stgAddObject(new BossSLZ.Spell9.Phase4(this,BossSLZ.Spell9.sample_func5,3,0));
    }if(this.frame==2700){
        stgAddObject(new BossSLZ.Spell9.Phase4(this,BossSLZ.Spell9.dir_func2,0,0));
    }if(this.frame==3000){
        stgAddObject(new BossSLZ.Spell9.Phase4(this,BossSLZ.Spell9.dir_func2,2,0));
    }if(this.frame==3300){
        stgAddObject(new BossSLZ.Spell9.Phase4(this,BossSLZ.Spell9.sample_func3,3,0));
    }

    if(this.frame==3800) {
        stgAddObject(new BossSLZ.Spell9.Phase3(this, BossSLZ.Spell9.sample_func4, 3, 0));
    }
    if(this.frame==4200) {
        stgAddObject(new BossSLZ.Spell9.Phase3(this, BossSLZ.Spell9.sample_func3, 3, 6));
    }

    if(this.frame>=4800){
        if(this.frame%600==0){
            stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func8,3,0));
        }else if(this.frame%600==100){
            stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func9,3,1));
        }else if(this.frame%600==200){
            stgAddObject(new BossSLZ.Spell9.Phase1(this,BossSLZ.Spell9.sample_func1,3,3));
        }else if(this.frame%600==300){
            stgAddObject(new BossSLZ.Spell9.Phase2(this,BossSLZ.Spell9.sample_func8,3,4));
        }else if(this.frame%600==400){
            stgAddObject(new BossSLZ.Spell9.Phase2(this,BossSLZ.Spell9.sample_func9,3,5));
        }

    }

    if(this.frame==5400){
        stgAddObject(new BossSLZ.Spell9.Phase4(this,BossSLZ.Spell9.sample_func7,0,6));
    }
    if(this.frame==5600) {
        //stgAddObject(new BossSLZ.Spell9.Phase3(this, BossSLZ.Spell9.sample_func4, 3, 7));
    }
    if(this.frame==5800) {
        stgAddObject(new BossSLZ.Spell9.Phase3(this, BossSLZ.Spell9.sample_func3, 3, 8));
    }

    // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(120)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
        //renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet");
    }
};
BossSLZ.Spell9.Phase1=function(spell,func,funcmode,c){
    this.spell=spell;
    this.func=func;
    this.mode=funcmode;
    this.c=c;
};
BossSLZ.Spell9.Phase1.prototype.script=function(){
    if(this.frame>2 || this.spell.remove){
        stgDeleteSelf();
        return;
    }
    if(this.frame==1){
        var x=((stg_frame_w/2/36)>>0)+1;
        var i=0;
        for(var i=-x;i<=x;i++){
            var a=new BossSLZ.Spell9.Sampler2D(this.spell,BossSLZ.Spell9.sample_func1,this.func,[i*36,-stg_frame_h/2],300,0,12,3,this.mode,0,this.c,BossSLZ.Spell9.blt_func);
            stgAddObject(a);
        }
    }
};
BossSLZ.Spell9.Phase2=function(spell,func,funcmode,c){
    this.spell=spell;
    this.func=func;
    this.mode=funcmode;
    this.c=c;
};
BossSLZ.Spell9.Phase2.prototype.script=function(){
    if(this.frame>2 || this.spell.remove){
        stgDeleteSelf();
        return;
    }
    if(this.frame==1){
        var x=stg_rand(360);
        var i=0;
        for(i=0;i<36;i++){
            var a=new BossSLZ.Spell9.Sampler2D(this.spell,BossSLZ.Spell9.sample_func2,this.func,[sind(i*10+x),cosd(i*10+x)],300,0,12,3,this.mode,0,this.c,BossSLZ.Spell9.blt_func);
            stgAddObject(a);
        }
    }
};
BossSLZ.Spell9.Phase3=function(spell,func,funcmode,c){
    this.spell=spell;
    this.func=func;
    this.mode=funcmode;
    this.c=c;
    this.x=stg_rand(360);
};
BossSLZ.Spell9.Phase3.prototype.script=function(){
    if(this.frame>6*18 || this.spell.remove){
        stgDeleteSelf();
        return;
    }
    if(this.frame%6==1){

        var x=this.x;
        this.x+=20;
        var a=new BossSLZ.Spell9.Sampler2D(this.spell,BossSLZ.Spell9.sample_func6,this.func,[x,0],300,1,18,2.4,this.mode,0,this.c,BossSLZ.Spell9.blt_func);
        stgAddObject(a);
        var a=new BossSLZ.Spell9.Sampler2D(this.spell,BossSLZ.Spell9.sample_func6,this.func,[x+180,0],300,1,18,2.4,this.mode,0,this.c,BossSLZ.Spell9.blt_func);
        stgAddObject(a);
    }
};
BossSLZ.Spell9.Phase4=function(spell,func,funcmode,c){
    this.spell=spell;
    this.func=func;
    this.mode=funcmode;
    this.c=c;
    this.x=stg_rand(360);
};
BossSLZ.Spell9.Phase4.prototype.script=function(){
    if(this.frame>2 || this.spell.remove){
        stgDeleteSelf();
        return;
    }
    if(this.frame==1){
        for(var i=0;i<5;i++) {
            var x = this.x+i*360/5;
            var a = new BossSLZ.Spell9.Sampler2D(this.spell, BossSLZ.Spell9.sample_func7, this.func, [x, 0], 300, 2, 5, 2.4, this.mode, 0, this.c+i, BossSLZ.Spell9.blt_func2);
            stgAddObject(a);
            stgSetPositionA1(a,stg_frame_w/2,stg_frame_h/2);
        }
    }
};
BossSLZ.Spell9.sample_func1=function(a,b){
    b[0]=0;
    b[1]=1;
};
BossSLZ.Spell9.sample_func2=function(a,b){
    b[0]=a[0];
    b[1]=a[1];
};
BossSLZ.Spell9.sample_func3=function(a,b){
    b[0]=-a[0];
    b[1]=a[1];
};
BossSLZ.Spell9.sample_func4=function(a,b){
    b[0]=a[0];
    b[1]=-a[1];
};
BossSLZ.Spell9.sample_func5=function(a,b){
    b[0]=sin(a[0]/16);
    b[1]=cos(a[1]/12);
};
BossSLZ.Spell9.sample_func6=function(a,b){
    var r=a[1]*sind(a[1]);
    b[0]=r*sind(a[1]+a[0]);
    b[1]=r*cosd(a[1]+a[0]);
};
BossSLZ.Spell9.sample_func7=function(a,b){
    var r=a[0];
    var f=a[1];
    if(f>=760){
        f=(f-60)%700+60;
    }
    if(f<60){
        r=r;
    }else if(f>=60 && f<80){
        r=r+(f-60)/20*(180-18);
    }else if(f>=80 && f<200){
        r=r+162;
    }else if(f>=200 && f<220){
        r=r+162+(f-200)/20*(180-36);
    }else if(f>=220 && f<340){
        r=r+162+144;
    }else if(f>=340 && f<360){
        r=r+162+144+(f-340)/20*(180-36);
    }else if(f>=360 && f<480){
        r=r+162+288;
    }else if(f>=480 && f<500){
        r=r+162+288+(f-480)/20*(180-36);
    }else if(f>=500 && f<620){
        r=r+162+288+144;
    }else if(f>=620 && f<640){
        r=r+162+288+144+(f-620)/20*(180-36);
    }else if(f>=640 && f<760){
        r=r+162+288+288;
    }
    return r;
    //b[0]=sind(r);
   // b[1]=cosd(r);
};
//y=A*e^x  A=y/(e^x)
BossSLZ.Spell9.sample_func8=function(a,b){
    var r=a[1]*sind(a[1]);
    b[0]=100;
    b[1]=a[1];
};
BossSLZ.Spell9.sample_func9=function(a,b){
    var r=a[1]*sind(a[1]);
    b[0]=-100;
    b[1]=a[1];
};
BossSLZ.Spell9.dir_func1=function(a){
    return stg_rand(360);
};
BossSLZ.Spell9.dir_func2=function(a){
    return a[0]+a[1]*3;
};
BossSLZ.Spell9.blt_func=function(){
    if(this.frame==30){
        this.move.setAccelerate2(0.04,1.7);
    }
};
BossSLZ.Spell9.blt_func2=function(){
    if(this.frame==120){
        this.move.setAccelerate2(0.04,1.7);
    }
};
BossSLZ.Spell9.blt_func3=function(){
    this.move.speed=0;
   // if(this.frame==120){
   //     this.move.setAccelerate2(0.04,1.7);
   // }
};

BossSLZ.Spell9.polar1=function(input,res){
    var d=atan2(input[1],input[0]);
    res[0]=cos(d+PI/2);
    res[1]=sin(d+PI/2);
};
BossSLZ.Spell9.tmp=[0,0];
BossSLZ.Spell9.tmp2=[0,0];
BossSLZ.Spell9.Sampler2D=function(spell,func1,func2,pos,time,samplemode,sampletime,speed,outputmode,para,color,bltfunc){
    this.spell=spell;
    this.t=time;
    this.m=samplemode;
    //0:根据1的方向+para走，子弹朝向2
    this.i=sampletime*(1+diff*2);
    //this.d=sampledist;
    this.f1=func1;
    this.f2=func2;
    this.s=speed;
    this.o=outputmode;
    this.w=sampletime*speed;
    this.p=pos;
    this.para=para;
    this.color=color;
    this.b=bltfunc;
    stgEnableMove(this);
    this.move.speed=speed;
    if(samplemode==0){
        stgSetPositionA1(this,pos[0]+stg_frame_w/2,pos[1]+stg_frame_h/2);
    }else if(samplemode==1){
        var a=BossSLZ.Spell9.tmp;
        func1(pos,a);
        stgSetPositionA1(this,a[0],a[1]);
        this.resolve_move=1;
    }

};

BossSLZ.Spell9.Sampler2D.prototype.on_move=function(){
    var a=BossSLZ.Spell9.tmp;
    if(this.m==0){
        this.p[0]=this.pos[0]-stg_frame_w/2;
        this.p[1]=this.pos[1]-stg_frame_h/2;
        this.f1(this.p,a);
        this.move.speed_angle=atan2(a[1],a[0])+this.para;
    }else if(this.m==1){
        //对pos【1】的变化求导
        this.f1(this.p,a);
        this.p[1]+=1;
        this.f1(this.p,BossSLZ.Spell9.tmp2);
        a[0]-=BossSLZ.Spell9.tmp2[0];
        a[1]-=BossSLZ.Spell9.tmp2[1];
        var d=sqrt(a[0]*a[0]+a[1]*a[1]);
        if(d>this.s){
            this.p[1]+=this.s/d-1;
        }else{
            //this.p[1]+=1;//this.s/d-0.01;
        }

        this.f1(this.p,this.pos);

        this.pos[0]+=stg_frame_w/2;
        this.pos[1]+=stg_frame_h/2;
    }else if(this.m==2){
        this.p[1]+=1;
        this.move.speed_angle=this.f1(this.p)*PI180;
    }
};

BossSLZ.Spell9.Sampler2D.prototype.init=function(){
    renderCreateSpriteRender(this);
    this.layer=stg_const.LAYER_BULLET+1;
    bulletChangeType(this,"mDD",this.color);
    renderSetSpriteColor(255,255,255,100,this);
};
BossSLZ.Spell9.Sampler2D.prototype.script=function(){
    if(this.frame>this.t || this.spell.remove){
        stgDeleteSelf();
        return;
    }
    if(this.frame%this.i==0){
        var angle=0;
        if(this.o==0){
            BossSLZ.Spell9.tmp[0]=this.pos[0]-stg_frame_w/2;
            BossSLZ.Spell9.tmp[1]=this.pos[1]-stg_frame_h/2;
            angle=this.f2(BossSLZ.Spell9.tmp);
        }else if(this.o==1){
            this.f2(this.p,BossSLZ.Spell9.tmp);
            angle=atan2(BossSLZ.Spell9.tmp[1],BossSLZ.Spell9.tmp[0])/PI180;
        }else if(this.o==2){
            BossSLZ.Spell9.tmp[0]=this.p[0];
            BossSLZ.Spell9.tmp[1]=this.frame;
            angle=this.f2(BossSLZ.Spell9.tmp);
        }else if(this.o==3){
            BossSLZ.Spell9.tmp[0]=this.pos[0]-stg_frame_w/2;
            BossSLZ.Spell9.tmp[1]=this.pos[1]-stg_frame_h/2;
            this.f2(BossSLZ.Spell9.tmp,BossSLZ.Spell9.tmp2);
            angle=atan2(BossSLZ.Spell9.tmp2[1],BossSLZ.Spell9.tmp2[0])/PI180;
        }
        if(this.pos[0]>0 && this.pos[0]<stg_frame_w && this.pos[1]>0 && this.pos[1]<stg_frame_h ) {
            shotSE();
            stgCreateShotA1(this.pos[0], this.pos[1], 0.1, angle, "sMD", 15, this.color).script = this.b;
        }
    }
};



BossSLZ.Spell10=function(boss){
    bossDefineSpellA(boss,this,"记忆【纯净的弹幕地狱】"+(diff?"(Easy)":""),6000,60*120,12500000,0.8);
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
};
BossSLZ.Spell10.prototype.init=function(){
    this.invincible=60;
    this.bg=new BossSLZ.SpellBg1(this);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(this.bg);
    stgPlaySE("se_cast");
    this.f=0;
    this.a=90;
    //renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet",blend_add);
};
BossSLZ.Spell10.prototype.script=function(){
    var t2=this.frame%180;


    if(this.f==0){
        if(this.frame>30*60 || this.life<5000){
            stgDeleteSubShot(this,false);
            bossCast(this.boss,30);
            bossCharge(this.boss,30);
            this.f=1;this.a=30;
        }
    }else if(this.f==1){
        if(this.frame>60*60 || this.life<3500){
            stgDeleteSubShot(this,false);
            bossCast(this.boss,30);
            bossCharge(this.boss,30);
            this.f=2;this.a=30;
        }
    }else if(this.f==2){
        if(this.frame>90*60 || this.life<1500){
            bossCharge(this.boss,30);
            this.f=3;
        }
    }
    if(this.a>0){
        this.a--;
    }else{
        if(this.f==0){
            BossSLZ.Spell10.td();
        }else if(this.f==1){
            BossSLZ.Spell10.td();
            BossSLZ.Spell10.ld();
        }else if(this.f==2){
            BossSLZ.Spell10.td();
            BossSLZ.Spell10.ld();
            BossSLZ.Spell10.fd();
        }else{
            BossSLZ.Spell10.td();
            BossSLZ.Spell10.ld();
            BossSLZ.Spell10.fd();
            BossSLZ.Spell10.hd();
        }
    }


    // stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
    if(stgDefaultFinishSpellCheck(0)){
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,32);
        gCreateItem(this.pos,stg_const.ITEM_POWER,10,32);
        stgDeleteSubShot(this,this.get);
        //renderSetSpriteBlend(stg_const.LAYER_BULLET,"bullet");
    }
};
BossSLZ.Spell10.td=function(){
    if(stg_target.frame%32==0){
        shotSE();
        stgCreateShotW2(stg_target.pos[0],stg_target.pos[1],4,atan2pr(stg_target.pos,stgGetRandomPlayer().pos),"mMD",6,7,25,4,360,0);
    }
};
BossSLZ.Spell10.ld=function(){
    if(stg_target.frame%60==0){
        var x=stg_rand(stg_frame_w/6)+stg_frame_w/3*2;
        var y=stg_rand(stg_frame_h/6)+stg_frame_h/4;
        var a0=atan2(stg_frame_h-y,stg_frame_w/2-x)/PI180;
        var w=30-diff*14;
        for(var i=0;i<w;i++){
            stgCreateShotR1(x,y,2,360*i/w+a0,"sXY",6,2,80,0);
        }
        x=stg_frame_w/3-stg_rand(stg_frame_w/6);
        y=stg_rand(stg_frame_h/6)+stg_frame_h/4;
        a0=atan2(stg_frame_h-y,stg_frame_w/2-x)/PI180;
        for(var i=0;i<w;i++){
            stgCreateShotR1(x,y,2,360*i/w+a0,"sXY",6,2,80,0);
        }
    }
};
BossSLZ.Spell10.fd=function(){
    if(stg_target.frame%39==0){
        var x=stg_rand(stg_frame_w/6)+stg_frame_w/3*2;
        var y=stg_rand(stg_frame_h/6)+stg_frame_h/4;
        var a0=atan2pr([x,y],stgGetRandomPlayer().pos)+360/32;
        var w=16-diff*4;
        for(var i=0;i<w;i++){
            stgCreateShotR1(x,y,1.4+diff,360*i/w+a0,"sXY",6,4,80,0);
        }
        x=stg_frame_w/3-stg_rand(stg_frame_w/6);
        y=stg_rand(stg_frame_h/6)+stg_frame_h/4;
        a0=atan2pr([x,y],stgGetRandomPlayer().pos)+360/32;
        for(var i=0;i<w;i++){
            stgCreateShotR1(x,y,1.4+diff,360*i/w+a0,"sXY",6,4,80,0);
        }
    }
};
BossSLZ.Spell10.hd=function(){
    if(stg_target.frame%18==0){
        var a0=stg_rand(360);
        for(var i=0;i<16;i++){
            stgCreateShotR1(stg_target.pos[0]+stg_rand(-20,20),stg_target.pos[1]+stg_rand(-20,20),1.4,360*i/16+a0,"sXY",6,0,40,0);
        }
    }
};

BossSLZ.spells=[];
BossSLZ.phases=[];
BossSLZ.spells.push(BossSLZ.Spell1);
BossSLZ.spells.push(BossSLZ.Spell2);
BossSLZ.spells.push(BossSLZ.Spell3);
BossSLZ.spells.push(BossSLZ.Spell4);
BossSLZ.spells.push(BossSLZ.Spell5);
BossSLZ.spells.push(BossSLZ.Spell6);
BossSLZ.spells.push(BossSLZ.Spell7);
BossSLZ.spells.push(BossSLZ.Spell8);
BossSLZ.spells.push(BossSLZ.Spell9);
BossSLZ.spells.push(BossSLZ.Spell10);
BossSLZ.phases.push([BossSLZ.NonSpell1,BossSLZ.Spell1]);
BossSLZ.phases.push([BossSLZ.NonSpell2,BossSLZ.Spell2]);
BossSLZ.phases.push([BossSLZ.NonSpell3,BossSLZ.Spell3]);
BossSLZ.phases.push([BossSLZ.NonSpell4,BossSLZ.Spell4]);
BossSLZ.phases.push([BossSLZ.NonSpell5,BossSLZ.Spell5]);
BossSLZ.phases.push([BossSLZ.NonSpell6,BossSLZ.Spell6]);
BossSLZ.phases.push([BossSLZ.NonSpell7,BossSLZ.Spell7]);
BossSLZ.phases.push([BossSLZ.NonSpell8,BossSLZ.Spell8]);
BossSLZ.phases.push([BossSLZ.Spell9]);
BossSLZ.phases.push([BossSLZ.Spell10]);


function NightEffect(boss,size1,size2){
    this.size1=size1;
    this.size2=size2;
    this.boss=boss;
    this.base=new StgBase(boss,0,1);
}
NightEffect.PlayerHolder=function(eff,player,x,y){
    this.base=new StgBase(eff,0,1);
    this.player=player;
    this.x=x;
    this.y=y;
};
NightEffect.PlayerHolder.prototype.init=function(){
    stgSetPositionA1(this,this.player.pos[0],this.player.pos[1]);
    luaMoveTo(this.x,this.y,60,1,this);
};

NightEffect.prototype.init=function(){
    this.vtx=new HyzPrimitive2DVertexList(4);
    this.vtx2=new HyzPrimitive2DVertexList(4);
    this.screen=WGLA.newBuffer(_gl,4,2,4,WGLConst.DATA_FLOAT);
    var s=this.size2;
    this.screen.buffer.set([-s,-s,-s,s,s,s,s,-s]);
    this.screen.uploadData();
    this.tscreen=WGLA.newBuffer(_gl,4,2,4,WGLConst.DATA_FLOAT);
    this.tscreen.buffer.set([0,0,0,1,1,1,1,0]);
    this.tscreen.uploadData();

    this.layer=74;
    this.render=new StgRender("basic_shader");
    this.target=0;
    this.ph=[];
    for(var i=0;i<stg_players_number;i++){
        this.ph[i]=new NightEffect.PlayerHolder(this,stg_players[i],stg_frame_w/stg_players_number/2+stg_frame_w/stg_players_number*i,stg_frame_h/2);
        stgAddObject(this.ph[i]);
    }
};
NightEffect.prototype.on_render=function(gl,target){
    var s=this.size2;
    var w=target.width;
    var w0=target.width;
    var h=target.height;
    var h0=target.height;
    var e=32;
    var e2=64;
    w=w+e2;
    h=h+e2;
    //新建或维护一个离屏缓存
    if(!this.target||this.target.width!=w||this.target.height!=h){
        if(this.target)this.target.release();
        this.target=new WebglRenderTarget(w,h,1);
        this.vtx.setVertexRaw(0,e,e,0,0,1,1,1,1);
        this.vtx.setVertexRaw(1,e,e+h0,0,1,1,1,1,1);
        this.vtx.setVertexRaw(2,e+w0,e+h0,1,1,1,1,1,1);
        this.vtx.setVertexRaw(3,e+w0,e,1,0,1,1,1,1);
        this.vtx.update(1,1,1);
        this.vtx2.setVertexRaw(0,0,0,0,0,1,1,1,1);
        this.vtx2.setVertexRaw(1,0,0+h0,0,1,1,1,1,1);
        this.vtx2.setVertexRaw(2,0+w0,0+h0,1,1,1,1,1,1);
        this.vtx2.setVertexRaw(3,0+w0,0,1,0,1,1,1,1);
        this.vtx2.update(1,1,1);
        this.target.use();
        gl.clearColor(1,1,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    //将当前屏幕拷贝至离屏缓存
    this.target.use();
    _webGlUniformInput(hyzPrimitive2DShader, "uWindow", webgl2DMatrix(w, h));
    gl.viewport(0,0,w,h);
    hyzSetPrimitiveOffset(0,0);
    blend_copy();
    this.vtx.use();
    _webGlUniformInput(hyzPrimitive2DShader,"texture",target);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
    gl.finish();

    target.use();

    //画遮盖
    var c=(60-this.frame)/60*255;
    if(c<0)c=0;
    this.vtx2.setColor(4*c,4*c,4*c,255-c);
    this.vtx2.use();
    gl.viewport(0,0,w0,h0);
    _webGlUniformInput(hyzPrimitive2DShader,"texture",stg_textures["white"]);
    blend_default();
    _webGlUniformInput(hyzPrimitive2DShader, "uWindow", webgl2DMatrix(w0, h0));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);


//切换成黑幕shader，并准备往屏幕上渲染
    hyzCircleBlendShader.use();
    for(var i=0;i<stg_players_number;i++){
        var p=stg_players[i];
        //s=s*0.7;
        var u1 = (p.pos[0]+e - s) / w;
        var u2 = (p.pos[0]+e + s) / w;
        var v1 = (p.pos[1]+e - s) / h;
        var v2 = (p.pos[1]+e + s) / h;
        var s=this.size2;
        this.screen.buffer.set([-s,-s,-s,s,s,s,s,-s]);
        this.screen.uploadData();
        this.tscreen.buffer.set([u1, v1, u1, v2, u2, v2, u2, v1]);
        this.tscreen.uploadData();
        //叠加渲染
        blend_test1();
        _webGlUniformInput(hyzCircleBlendShader, "uWindow", webgl2DMatrix(w0, h0));
        GlBufferInput(hyzCircleBlendShader, "aPosition", this.screen);
        GlBufferInput(hyzCircleBlendShader, "aTexture", this.tscreen);
        _webGlUniformInput(hyzCircleBlendShader, "uColor", [0, 0, 0, 0]);
        _webGlUniformInput(hyzCircleBlendShader, "uSize", [this.size1, this.size2]);
        _webGlUniformInput(hyzCircleBlendShader, "uPosition", [this.ph[i].pos[0],this.ph[i].pos[1]]);
        _webGlUniformInput(hyzCircleBlendShader, "texture", this.target);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        //还原

    }
    gl.useProgram(hyzPrimitive2DShader.program);
    blend_default();

};
BossDynamicAura.prototype.finalize=function(){
    this.screen.clearContent();
    this.tscreen.clearContent();
    this.vtx.clear();
    if(this.target)this.target.release();
};
