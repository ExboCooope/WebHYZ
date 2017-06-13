/**
 * Created by Exbo on 2017/6/8.
 */
var TestSpellCard1=function(boss){
    bossDefineSpellA(boss,this,"立体圆",8000,6000,100000,0.7);
};
TestSpellCard1.prototype.init=function(){
    this.invincible=120;
    luaMoveTo(stg_frame_w/2,80,60,1,this.boss);
    stgAddObject(new BossSpellInitObject(this));
    stgAddObject(new BossSLZ.SpellBg1(this));
    stgPlaySE("se_cast");
};
TestSpellCard1.prototype.script=function(){
    if(this.frame==60){
        for(var a= 0;a<=180;a+=18){
            var r=360/18*sind(a);
            if(r<1)r=1;
            r=r>>0;
            var q=stg_rand(360);
            for(var i=0;i<r;i++){
                var b=i*360/r+q;
                stgCreateShotA1(0,0,0,0,"mMD",0,((a/15)>>0)%8);
                stg_last.on_move=TestSpellCard1.blt_on_move;
                stg_last.a=a;
                stg_last.b=b;
                stg_last.resolve_move=1;
            }
        }
        TestSpellCard1.rotate=stg_rand(360);
        TestSpellCard1.b0=stg_rand(360);
        TestSpellCard1.a0=0;
        TestSpellCard1.r=0;
    }
    if(this.frame>60){
        TestSpellCard1.rotate-=0.5;
        TestSpellCard1.a0+=1.5;
        TestSpellCard1.b0-=0.5;
        if(TestSpellCard1.r<100)TestSpellCard1.r+=2;
    }
    if(this.frame>180){
        this.frame=59;
    }
};
TestSpellCard1.rotate=0;
TestSpellCard1.a0=0;
TestSpellCard1.b0=0;
TestSpellCard1.r=0;
TestSpellCard1.blt_on_move=function(){
    var x=TestSpellCard1.r*sind(this.a)*sind(this.b+TestSpellCard1.a0);
    var y=TestSpellCard1.r*(cosd(this.a)*cosd(TestSpellCard1.rotate)-sind(this.a)*cosd(this.b+TestSpellCard1.a0)*sind(TestSpellCard1.rotate));
    this.pos[0]=x*cosd(TestSpellCard1.b0)-y*sind(TestSpellCard1.b0)+stg_frame_w/2;
    this.pos[1]=y*cosd(TestSpellCard1.b0)+x*sind(TestSpellCard1.b0)+stg_frame_h/2-50;
    if(this.frame>120){
        this.on_move=0;
        this.resolve_move=0;
    }
};