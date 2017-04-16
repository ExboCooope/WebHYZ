/**
 * Created by Exbo on 2016/1/19.
 */

function Enemy01(){
    //StgObject.call(this);
    this.side=stg_const.SIDE_ENEMY;
    this.hitby=new StgHitDef();
    this.hitby.range=10;
    this.life=100;
    stgApplyEnemy(this);
}

Enemy01.prototype.init=function(){
    var a=new EnemyFairyHolder(this,0,128,48,48);
    stgAddObject(a);
    this.f=0;
};

Enemy01.prototype.script=function(){
    if(this.life<=0){
        stgDeleteSelf();
    }else{
        var f=this.f;
        var p=stgGetRandomPlayer();
        if(f==30){
           // var b=stgCreateShotA1(this.pos[0],this.pos[1],2.5,atan2pr(this.pos, p.pos),"lDY",30,0);
           // b.p=stgGetRandomPlayer();
            //b.move.acceleration_angle_default=0;
          //  b.script=EnemyM01.bltfunc;
            stgCreateShotW1(this.pos[0],this.pos[1],2.5,atan2pr(this.pos, p.pos),"lDY",0,0,20,0,360/20,0);
        }
        this.f++;
    }
};

function EnemyM01(x,y){
    //StgObject.call(this);
    this.side=stg_const.SIDE_ENEMY;
    this.hitby=new StgHitDef();
    this.hitby.range=28;
    this.life=800;
    stgApplyEnemy(this);
    this.md=0;
    this.pos=[x,y,0]

}

EnemyM01.prototype.init=function(){
    var a=new EnemyFairyHolder(this,0,224,64,64);
    stgAddObject(a);
    this.f=0;
    this.move=new StgMove();
    this.move.pos[0]=this.pos[0];
    this.move.pos[1]=this.pos[1];
    this.f2=0;
};

EnemyM01.prototype.script=function(){
    if(this.life<=0){
        stgDeleteSelf();
        gCreateItem(this.pos,stg_const.ITEM_SCORE,10,15);
        stgPlaySE("se_enep00");
    }else{
        var f=this.f;

        if(this.md==0){
            this.move.speed=1;
            this.move.speed_angle=PI/2;
            if(this.pos[1]>50){
                this.md=1;
                this.f=0;
            }
        }else if(this.md==1){
            this.move.speed=0;
            if(this.f2==0){
                var p=stgGetRandomPlayer();
                var b=stgCreateShotA1(this.pos[0],this.pos[1],0,0,"lDY",0,0);
                b.script=EnemyM01.bltfunc2;
                b.shoter=this;
                stgPlaySE("se_ch00");
            }
            this.f2=(this.f2+1)%(300);
        }else{
            this.move.speed=1;
            this.move.speed_angle=PI/2;
            if(this.move.pos[1]>450)stgDeleteSelf();
        }
        this.f++;

        if(this.f>1200)this.md=2;
        this.f++;
    }
};

EnemyM01.bltfunc2=function(){
    if(!this.f)this.f=120;
    this.f--;
    this.render.scale[0]=(this.f/40+1);
    this.render.scale[1]=(this.f/40+1);
    this.alpha=255-this.f*2;
    this.update=1;
    if(this.f==0){
        if(this.shoter.remove){
            stgDeleteSelf();
            return;
        }
        this.script=EnemyM01.bltfunc;
        this.move.speed=3;
        this.p=stgGetRandomPlayer();
        this.move.speed_angle=atan2p(this.pos, this.p.pos);
    }
};

stgLoadSE("se_ch00","se/se_ch00.wav").ready=1;
stgLoadSE("se_enep02","se/se_enep02.wav").ready=1;
stgLoadSE("se_enep00","se/se_enep00.wav").ready=1;
stgLoadSE("se_kira00","se/se_kira00.wav").ready=1;

EnemyM01.bltfunc=function(){
    if(!this.f)this.f=900;
    if(!this.p){
        stgDeleteSelf();
        return;
    }
    var p=this.p;
    var a=atan2p(this.pos, p.pos);
    var k=1/(this.move.speed*1.3+0.1);
    if(k>1)k=1;
   // k=1;
    var d=sArrowRotateTo(this.move.speed_angle,a);
    var v=d>0?0.04*k:-0.04*k;
    if(v>d && d>0)v=d;
    if(v<d && d<0)v=d;
    this.keep=1;


    if(d>PI/2 || d<-PI/2){
        this.move.speed-=0.03;
        if(this.move.speed<0)this.move.speed=0;
        if(this.move.speed<1)this.move.speed_angle+=v;

    }else{
        if(this.pos[1]<250){
            if(this.f%12==0){
                stgCreateShotA2(this.pos[0],this.pos[1],0,(this.move.speed_angle+0.3)/PI180,"sZD",15,0,0.1,2.2);
                stgCreateShotA2(this.pos[0],this.pos[1],0,(this.move.speed_angle-0.3)/PI180,"sZD",15,0,0.1,2.2);
            }
        }
        this.move.speed+=0.03;
        if(this.move.speed>3.8)this.move.speed=3.8;
        this.move.speed_angle+=v;
    }
    this.f--;
    if(this.f==0 || this.pos[0]<0 || this.pos[0]>384){
        stgDeleteSelf();
        stgPlaySE("se_enep02");
        stgCreateShotW1(this.pos[0],this.pos[1],1.7,stg_rand(0,360),"sXY",0,0,16,0,360/16,0);
    }
    return;
};




function EnemyS01(x,y,type){
    //StgObject.call(this);
    this.side=stg_const.SIDE_ENEMY;
    this.hitby=new StgHitDef();
    this.hitby.range=15;
    this.life=120;
    stgApplyEnemy(this);
    this.pos=[x,y,0];
    this.t=type;
}

EnemyS01.prototype.init=function(){
    var a=new EnemyFairyHolder(this,0,128,48,48);
    stgAddObject(a);
    this.f=0;
    this.md=0;
    this.f2=0;
    this.move=new StgMove();
    this.move.pos[0]=this.pos[0];
    this.move.pos[1]=this.pos[1];
};

EnemyS01.prototype.script=function(){
    if(this.life<=0){
        stgDeleteSelf();
        gCreateItem(this.pos,stg_const.ITEM_SCORE,3,10);
        stgPlaySE("se_enep00");
    }else{

        if(this.md==0){
            this.move.speed=0.5;
            if(this.f%60==0){
                this.move.speed_angle=stg_rand(1,PI-1);
            }
            if(this.move.pos[0]<10)this.move.pos[0]=10;
            if(this.move.pos[0]>374)this.move.pos[0]=374;
            if(this.pos[1]>200 || this.life!=120){
                this.md=1;
            }
        }else if(this.md==1){
            if(this.f2==0){
                this.move.speed=0;
                var p=stgGetRandomPlayer();
                this.move.speed_angle=atan2p(this.pos, p.pos);
                if(this.t){
                    stgCreateShotW1(this.pos[0],this.pos[1],2.3,atan2pr(this.pos, p.pos)+40,"sLD",0,3,5,0,-20,3);
                }else{
                    stgCreateShotW1(this.pos[0],this.pos[1],2.7,atan2pr(this.pos, p.pos),"sLD",0,2,2,0,0,12);
                }
                stgPlaySE("se_kira00");
            }

            if(this.f2>(this.t?24:12)){
                this.move.speed=0.5;
            }
            this.f2=(this.f2+1)%(this.t?90:60);
        }else{
            this.move.speed=0.5;
            this.move.speed_angle=PI/2;
            if(this.move.pos[1]>450)stgDeleteSelf();
        }
        this.f++;

        if(this.f>1200)this.md=2;
    }
};












