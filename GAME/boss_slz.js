/**
 * Created by Exbo on 2017/5/14.
 */

function BossSLZ(){

}

BossSLZ.prototype.init=function(){
    var a=new luastg.BossResourceHolder("slz",8,4,[4,0],[6,3],[6,3],[8,0],this);
    stgAddObject(a);
    this.image=a;
    this.current_spell_id=-1;
    this.current_spell_object=0;
    a=new UnitAura1(this,80,255,242,0);
    stgAddObject(a);
    a=new HyzMagicCircle(this);
    stgAddObject(a);
};

BossSLZ.prototype.spells=[];

BossSLZ.prototype.script=function(){
    if(!this.current_spell_object || this.current_spell_object.remove){
        this.current_spell_id++;
        if(this.current_spell_id>=this.spells.length){
            if(this.finish){
                this.finish();
            }else{
                stgDeleteSelf();
            }
        }else{
            var a=new this.spells[this.current_spell_id](this);
            stgAddObject(a);
            this.current_spell_object=a;
        }
    }else{

    }
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
    this.life=700;
    this.time=900;
};
BossSLZ.NonSpell1.prototype.init=function(){
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(newBossTimeCircle(this));
};
BossSLZ.NonSpell1.prototype.script=function(){
    if(this.frame==60){
        bossCast(this.boss,60);
    }
    if(this.life<0){
        stgDeleteSelf();
    }
};
BossSLZ.prototype.spells.push(BossSLZ.NonSpell1);