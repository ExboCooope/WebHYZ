/**
 * Created by Exbo on 2017/5/14.
 */

function BossSLZ(){
    this.english_name="Sha Li Zi";
    this.delay=0;
}
BossSLZ.pre_load=function(){
    stgCreateImageTexture("cardbg2_c","cardbg2_c.png");
    stgCreateImageTexture("cardbg2_d","cardbg2_d.png");
    stgCreateImageTexture("enemy1","res/enemy1.png");
    renderCreate2DTemplateA1("cardbg2_d","cardbg2_d",-256,-256,1024,1024,0,0,0,1);
    renderCreate2DTemplateA1("slz_option1","enemy1",48*4,0,32,32,32,0,0,1);
    renderCreate2DTemplateA1("slz_option2","enemy1",48*4,32,32,32,32,0,0,1);
};

BossSLZ.prototype.init=function(){
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
    stgBossAddPhase([new BossSLZ.NonSpell5(this)]);
    stgBossAddPhase([new BossSLZ.NonSpell1(this),new BossSLZ.Spell1(this)]);
    stgBossAddPhase([new BossSLZ.NonSpell2(this),new BossSLZ.Spell2(this)]);

    a=new BossSpellCount(this);
    stgAddObject(a);
    stgSetPositionA1(this,stg_frame_w/3,-50);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
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
                        stgDeleteSelf();
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
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
};
BossSLZ.NonSpell0.prototype.script=function(){

    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
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
};
BossSLZ.NonSpell1.Phase.prototype.script=function(){
    if(this.frame>480 || this.spell.remove){
        stgDeleteSelf();return;
    }
    if(this.frame%12==0){
        var color=3;
        var x=this.spell.pos[0];
        var y=this.spell.pos[1];
        stgPlaySE("se_shot0");
        stgCreateShotW2(x,y,3.5,this.a,"lDY",0,color,12,3.5,360,0);
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
    a.layer=21;
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
    bossDefineSpellA(boss,this,"记忆【筑墙鬼幻想】",2200,30*60,12500000,0.8);
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
    if(this.frame<120 && this.frame%12==1){
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
        stgCreateShotW2(x,y,1.5,this.t1,"sXY",12,6,this.a,1.5,this.s1,0);
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
        stgCreateShotW2(x,y,1.5,this.t2,"sXY",12,5,this.b,1.5,this.s2,0);
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

        stgCreateShotW2(x,y,6,atan2pr([x,y], this.ps),"sKWD",7+this.count,this.count,5,6,120,0);
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
    bossDefineSpellA(boss,this,"记忆【妄执神闪斩】",2400,30*60,12500000,0.8);
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
    if(this.frame%12==0){
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
                    for(var j=0;j<1;j++) {
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

                }else if(a.pos[1]<y+70 && a.pos[1]>y-70){
                    stgDeleteObject(a);
                    for(var j=0;j<2;j++) {
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
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
};
BossSLZ.NonSpell3.prototype.script=function(){
    if(this.frame==60){
        stgAddObject(new BossSLZ.NonSpell3.Phase(this));
    }
    if(stgDefaultFinishSpellCheck(60)){
        stgDeleteSubShot(this,true);
    }
    stgClipObject(32,stg_frame_w-32,32,stg_frame_h/2-32,this.boss);
};

BossSLZ.NonSpell3.Phase=function(spell){
    this.spell=spell;
    this.c=0;
};
BossSLZ.NonSpell3.Phase.prototype.script=function(){
    if(this.spell.remove){
        stgDeleteSelf();return;
    }
   if(this.frame>660){
       this.frame=1;
   }

    if(this.frame==10){
       // bossWanderSingle(this.spell.boss,0,60,60,60);
        for(var i=0;i<8;i++){
            var a=360/8/2+i*360/8;
            a=a*PI180;
            var r=48;
            stgAddObject(new BossSLZ.NonSpell3.Option(this.spell.boss,this.spell,r*sin(a),r*cos(a),i%2));
        }
    }
    if(this.frame>220 && this.frame%90==30){
        bossWanderSingle(this.spell.boss,true,32,24,30);
    }
};

BossSLZ.NonSpell3.Option=function(boss,spell,x,y,mode,color){
    this.boss=boss;
    this.spell=spell;
    this.base=new StgBase(boss,stg_const.BASE_MOVE,1);
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
    for(var i=0;i<2;i++){
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
    if(this.frame>120){
        if(this.frame%15==0){
            stgPlaySE("se_shot0");
            stgCreateShotW2(this.pos[0],this.pos[1],slow?2:4,this.a,"sXY",0,slow?3:5,9,slow?2:4,360,0);
        }
        var d=20;
        if(this.frame>=210){
            this.a+=this.mode?d*PI180:-d*PI180;
        }

    }
    if(this.frame>600){
        stgDeleteSelf();
    }
    if(this.life<0){
        stgDeleteSelf();
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
        stgCreateShotW2(this.pos[0],this.pos[1],1,this.a1,"mZY",0,4,60,1,360,0,BossSLZ.NonSpell5.wshot1);
    }
    if(this.f>=120&& this.f<=240 && this.f%8==0){
        stgCreateShotW2(this.pos[0],this.pos[1],5,90,"mZY",0,3,60,5,360,0,BossSLZ.NonSpell5.wshot2);
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


BossSLZ.prototype.spells.push(BossSLZ.NonSpell1);
BossSLZ.prototype.spells.push(BossSLZ.Spell1);
BossSLZ.prototype.phases.push([BossSLZ.NonSpell1,BossSLZ.Spell1]);
