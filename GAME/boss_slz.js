/**
 * Created by Exbo on 2017/5/14.
 */

function BossSLZ(){

}

BossSLZ.prototype.init=function(){
    var a=new luastg.BossResourceHolder("slz",8,4,[4,0],[6,3],[6,3],[8,0],this);
    stgAddObject(a);
    this.image=a;
    this.current_spell=0;
    this.current_spell_object=0;
    this.current_phase=0;
    a=new UnitAura1(this,80,255,242,0);
    stgAddObject(a);
    a=new HyzMagicCircle(this);
    stgAddObject(a);
    a=new BossLifeCircle(this);
    stgAddObject(a);
    this.phase=[];
    this.finished=false;
    stgBossClearPhase();
    stgBossAddPhase([new BossSLZ.NonSpell1(this),new BossSLZ.Spell1(this)]);
    stgSetPositionA1(this,stg_frame_w/3,-50);
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
};

BossSLZ.prototype.spells=[];
BossSLZ.prototype.phases=[];




BossSLZ.prototype.script=function(){
    stg_default_boss_script();

    if(this.frame>=60){
        if(this.frame==60)this.finished=true;
        stgBossStartNextSpell();
        if(this.finished){
            stgDeleteSelf();
        }
    }
    //if(this.finished){
//
  //     stgDeleteSelf();
  //  }
};

BossSLZ.NonSpell1=function(boss){
    stgApplyEnemy(this);
    this.keep=true;
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
    this.boss=boss;
    this.base=new StgBase(boss,stg_const.BASE_COPY,0);
    this.life=1700;
    this.max_life=1700;
    this.time=900;
    this.is_spell=false;
};
BossSLZ.NonSpell1.prototype.init=function(){
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(newBossTimeCircle(this));
};
BossSLZ.NonSpell1.prototype.script=function(){
    if(this.frame%60==0){
        bossCast(this.boss,60);
    }
    if(this.frame%60==59){
        var a=stgCreateShotW2(this.pos[0],this.pos[1],2.3,stg_rand(360),"sXD",0,stg_rand_int(0,7),48,3,360,0);
        for(var b=0;b< a.length;b++){
            hyzSetCross(true,a[b]);
        }
    }
    if(this.life<0){
        stgDeleteSelf();
    }
};

BossSLZ.Spell1=function(boss){
    stgApplyEnemy(this);
    this.keep=true;
    this.hitby=new StgHitDef();
    this.hitby.setPointA1(0,0,50);
    this.hitdef=new StgHitDef();
    this.hitdef.setPointA1(0,0,32);
    this.boss=boss;
    this.base=new StgBase(boss,stg_const.BASE_COPY,0);
    this.life=500;
    this.max_life=500;
    this.time=900;
    this.is_spell=true;
    this.shot_resistance=0.8;
};
BossSLZ.Spell1.prototype.init=function(){
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(newBossTimeCircle(this));
    stgAddObject(new BossSpellNameObject(this,this,"测试【符卡名】",25));
};
BossSLZ.Spell1.prototype.script=function(){
    if(this.frame==60){
        bossCast(this.boss,60);
    }
    if(this.life<0){
        stgDeleteSelf();
    }
};


BossSLZ.prototype.spells.push(BossSLZ.NonSpell1);
BossSLZ.prototype.spells.push(BossSLZ.Spell1);

BossSLZ.prototype.phases.push([BossSLZ.NonSpell1,BossSLZ.Spell1]);
