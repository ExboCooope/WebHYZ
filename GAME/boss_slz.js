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
    renderCreate2DTemplateA1("cardbg2_d","cardbg2_d",-256,-256,1024,1024,0,0,0,1);
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
    stgBossAddPhase([new BossSLZ.NonSpell1(this),new BossSLZ.Spell1(this)]);
    stgBossAddPhase([new BossSLZ.NonSpell2(this),new BossSLZ.Spell1(this)]);

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

BossSLZ.NonSpell1=function(boss){
    bossDefineNonSpellA(boss,this,5500,30*60);
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
    bossDefineSpellA(boss,this,"记忆【筑墙鬼幻想】",1800,30*60,12500000,0.8);
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

BossSLZ.prototype.spells.push(BossSLZ.NonSpell1);
BossSLZ.prototype.spells.push(BossSLZ.Spell1);
BossSLZ.prototype.phases.push([BossSLZ.NonSpell1,BossSLZ.Spell1]);
