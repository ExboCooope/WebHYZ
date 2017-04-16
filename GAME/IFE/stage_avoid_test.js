/**
 * Created by Exbo on 2016/5/2.
 */
stgCreateImageTexture("card_bg","cardbg2_d.png");
var stage_avoid_test={
    init:function(){
        stg_common_data.rank=stg_common_data.rank||16;
        //stg_common_data.rank+=5;
        stg_common_data.phases=stg_common_data.phases||[0,1,2,3,4,5,6,7,8,9];
        //stg_common_data.phases=[7];
        stg_common_data.phasefinish=3;
        stg_common_data.countfps=0;
        stg_common_data.countfpsn=0;
        stg_common_data.version="beta 3";
        stgClearCanvas("ui");
        //stg_procedures.drawFrame.background="#222";
        this.cid=-1;

        stg_common_data.resultRank=[];

        var ay = new RenderText(10, 570);
        ay.script = function () {
            this.render.text = avoidname[stg_common_data.cphase]+" Rank：" + (((stg_common_data.rank*10)>>0)/10) + "("+getMaxRank()+")";
        };
        ay = new RenderText(10, 600);
        ay.script = function () {
            this.render.text = "剩余时间：" + stg_common_data.deathRecoverTime+" 残机："+stg_common_data.life;
        };

        var bg=new StgObject();
        bg.render=new StgRender("sprite_shader");
        renderCreate2DTemplateA1("bg_all","card_bg",0,0,512,512,0,0,0,1);
        renderApply2DTemplate(bg.render,"bg_all",0);
        bg.layer=21;
        stgAddObject(bg);
        bg.render.scale[0]=1.5;
        bg.render.scale[1]=1.5;
        stgSetPositionA1(bg,stg_frame_w/2,stg_frame_h/2);

    },
    script:function(){
        if(stg_common_data.phasefinish==1){
            for(var i=0;i<_pool.length;i++){
                if(_pool[i].type==stg_const.OBJ_BULLET){
                    stgDeleteObject(_pool[i]);
                }
            }
            stgStopWShot();
            //发表结果
            stg_common_data.phasefinish=2;
            if(this.cid==stg_common_data.phases.length-1){
                stgAddObject(stage_avoid_finalshowres);
            }else{
                stgAddObject(stage_avoid_showres);
            }
        }else if(stg_common_data.phasefinish==3){
            //stg_common_data.rank-=5;
            if(stg_common_data.rank<0)stg_common_data.rank=0;
            stg_common_data.phasefinish=0;
            this.cid++;
            if(this.cid>=stg_common_data.phases.length){

            }else{
                var p=stg_common_data.phases[this.cid];

                    stg_common_data.cphase=p;
                    stgAddObject(stage_avoid);

            }
            stgClearCanvas("ui");
        }else{
            stg_common_data.countfps+=stg_fps;
            stg_common_data.countfpsn++;
        }
    }
};


function getMaxRank(){
    var mr=0;
    for(var i=0;i<stg_common_data.rankKeepTime.length;i++){
        if(stg_common_data.rankKeepTime[i]>650){
            mr=i;
        }
    }
    return mr;
}
var avoidname=["自机狙1","自机狙2","固定弹","随机弹(正面)","螺旋弹","混线","亲变更","超即死","全方位随机弹","全领域亲变更"];
var stage_avoid={
    init:function(){
        stg_common_data.test_name=avoidname[stg_common_data.cphase];
        stg_common_data.deathRecoverTime=900;
        stg_common_data.life=6;
        stg_common_data.rankKeepTime=[];
        stg_common_data.rebirthTime=240;
        stgAddObject(stage_avoid_dammaku[stg_common_data.cphase]);

    },
    stopFunction:function(){
        stg_common_data.resultRank[stg_common_data.cphase]=getMaxRank();
        stgDeleteSelf();
        stgDeleteObject(stage_avoid_dammaku[stg_common_data.cphase]);
        stg_common_data.phasefinish=1;
    },
    onHitFunction:function(){
        stg_common_data.rebirthTime=180;
        stg_local_player.state=stg_const.PLAYER_NORMAL;
        stgPlaySE("se_dead");
        stg_local_player.invincible=180;
        stg_common_data.rank-=3;
        stg_common_data.life--;
        if(stg_common_data.rank<0)stg_common_data.rank=0;
        if(stg_common_data.life<=0){
            this.stopFunction();
        }
        for(var i=0;i<stg_common_data.rankKeepTime.length;i++){
           if(stg_common_data.rankKeepTime[i]<650) {
               stg_common_data.rankKeepTime[i] = stg_common_data.rankKeepTime[i] / 2;
           }
        }
    },
    script:function(){
        if(stg_local_player.state==stg_const.PLAYER_HIT){
            this.onHitFunction();
        }

        if(stg_common_data.rebirthTime>0){
            stg_common_data.rebirthTime--;

        }else{
            var r=getMaxRank();
            if(stg_common_data.rank<r){
                stg_common_data.deathRecoverTime--;
                if(stg_common_data.deathRecoverTime<=0){
                    this.stopFunction();
                }
                stg_common_data.rank+=0.006;
            }
            stg_common_data.rank+=0.003;

            for(var i=0;i<stg_common_data.rank;i++){
                stg_common_data.rankKeepTime[i]=(stg_common_data.rankKeepTime[i]||0)+1;
            }
        }
    }
};


var stage_avoid_showres={
    init:function(){
        this.f=0;
        for(var i=0;i<stg_common_data.phases.length;i++){
            var j=stg_common_data.phases[i];
            var ay = new RenderText(50, 100+i*20);
            ay.render.text =avoidname[j]+ "：" +stg_common_data.resultRank[j] + "";
            ay.render.color="#FFF";
            ay.base={target:this,auto_remove:1};
            stgAddObject(ay);
        }

    },
    script:function(){
        this.f++;
        if(this.f>180){
            stgDeleteSelf();
            stg_common_data.phasefinish=3;
        }
    }
};

var stage_avoid_finalshowres={
    init:function(){
        this.f=0;

        var  his = stgLoadData("avoid_history");
        if (!his || his.version!=stg_common_data.version) his = {version:stg_common_data.version,scores:[],trail:[]};




        var ay = new RenderText(30, 80);
        ay.render.text ="结果发布："+"版本 "+stg_common_data.version;
        ay.render.color="#FFF";
        ay.base={target:this,auto_remove:1};
        var q=0;
        for(var i=0;i<stg_common_data.phases.length;i++){
            var j=stg_common_data.phases[i];
            var ay = new RenderText(50, 100+i*20);
            ay.render.text =avoidname[j]+ "：" +stg_common_data.resultRank[j] + "";
            if(!stg_in_replay) {
                if(stg_common_data.resultRank[j]>(his.scores[j]||0)){
                    his.scores[j]=stg_common_data.resultRank[j];
                    ay.render.text+=" 新高分！";
                }
                his.trail[j]=(his.trail[j]||0)+1;
            }


            ay.render.color="#FFF";
            ay.base={target:this,auto_remove:1};
            q=q+stg_common_data.resultRank[j];
            stgAddObject(ay);
        }
        q=q/stg_common_data.phases.length;
        var eu=avoid_rank_disc[0];
        for(var j=0;j<avoid_rank_disc.length;j++){
            if(q>avoid_rank_disc[j][0]){
                eu=avoid_rank_disc[j];
            }
        }

        if(!stg_in_replay){
            stgSaveData("avoid_history",his);
        }

        var ay = new RenderText(30, 110+i*20);
        ay.render.text ="平均FPS："+(stg_common_data.countfps/stg_common_data.countfpsn>>0);
        ay.render.color="#FFF";
        ay.base={target:this,auto_remove:1};
        i++;
        var ay = new RenderText(30, 110+i*20);
        ay.render.text ="平均分："+q+"  "+eu[1];
        ay.render.color="#FFF";
        ay.base={target:this,auto_remove:1};
        i++;
        var ay = new RenderText(30, 110+i*20);
        ay.render.text =eu[2];
        ay.render.color="#FFF";
        ay.base={target:this,auto_remove:1};
        i++;

    },
    script:function(){
        this.f++;
    }
};

var avoid_rank_disc=[
    [0,"纸(E-)","你TM在逗我"],
    [8,"并(E+)","似乎并不熟悉STG"],
    [12,"强(N)","可以冲击Normal难度"],
    [17,"凶(H)","拥有一定的回避能力"],
    [22,"狂下(L)","恭喜STG已经入门"],
    [24,"狂中(L)","恭喜STG已经入门"],
    [26,"狂上(L)","恭喜STG已经入门"],
    [28,"准神(L+)","L难度的neta估计已如家常便饭"],
    [33,"神(LNN)","努努力应该可以打出来（雾）"],
    [38,"论外(Unkown)","你确定没有作死么"]
];

var stage_avoid_dammaku=[];
stage_avoid_dammaku[0]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 50;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        if(this.f>=1500/(r+20)) {
            this.f=0;
            var a = atan2pr(this.pos, stgGetRandomPlayer().pos);
            var n = (r / 2 + 1)>>0;
            var vm = r / 5;
            var np = (1 + r)>>0;
            var vn=1-(r/60);
            for (var q = (-np/4)>>0; q < (np/4); q++) {
                var aa = 360 / np * q;
                stgCreateShotW1(this.pos[0], this.pos[1], 1, a + aa, "sMD", 0, 15, r / 2 + 1, vm / (n - 1), 0, 0);
            }
        }
    }
};

stage_avoid_dammaku[1]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 50;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        if(this.f>=600/(r+20)) {
            this.f=0;
            var a = atan2pr(this.pos, stgGetRandomPlayer().pos);
            var n = (r / 4 + 3)>>0;
            var vm = stg_rand(1,3);
            var np = 6;
            var spreadmax=5+r;
            for (var q = -2; q < 3; q++) {
                var aa = 180 / np * q;
                stgCreateShotW2(this.pos[0], this.pos[1], vm, a + aa, "sXY", 0, 15, n, vm, stg_rand(5,spreadmax),0);
            }
        }
    }
};

stage_avoid_dammaku[2]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 50;
        this.i=0;
        this.cl=0;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        if(this.f>=800/(r+20)) {
            this.i++;
            this.f=0;
            var a =stg_rand(360);
           // var n = (r*3 + 10)>>0;
            var n = (r*5 + 10)>>0;
            var cl=stg_rand(0,15)>>0;
            if(this.i%4==0){
                if(cl==this.cl){
                    this.cl=(this.cl+1)%16;
                }else{
                    this.cl=cl;
                }
            }
           // var vm = (r/6)+1;
            var vm=1.7;
            stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, this.cl, n, vm, 360,0);
        }
    }
};

stage_avoid_dammaku[3]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 50;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        var vm = (r/5)+1;
        if(this.f>=800/(r+20)) {
            this.f=0;
            var a =stg_rand(360);
            // var n = (r*3 + 10)>>0;
            var n = (r*4 + 10)>>0;
             var vm = (r/6)+2;
            //var vm=1.7;
            for(var j=0;j<n;j++){
                stgCreateShotA1(this.pos[0],this.pos[1],stg_rand(2,vm),stg_rand(0,360),"sXY",0,stg_rand(0,15)>>0);
            }
            //stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 15, n, vm, 360,0);
        }
        //stgCreateShotA1(stg_rand(0,stg_frame_w),5,stg_rand(1,vm),90,"sMD",0,15);
    },
    bltFunc:function(){
        stgSetPositionA1(this,this.r*cos(this.a)+this.x,this.r*sin(this.a)+this.y);
        this.a+=0.1;
        this.r+=2;
    }
};


stage_avoid_dammaku[4]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 150;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        var vm = (r/5)+1;
        if(this.f>=1600/(r+40)) {
            this.f=0;
            var a =stg_rand(360);
            // var n = (r*3 + 10)>>0;
            var n = (r*3 + 10)>>0;
            var vm = 0;
            //var vm=1.7;
            var rd=stg_rand(2)>>0;
            var blt=stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 4+rd, n, vm, 360,0);
            for(var j=0;j<blt.length;j++){
                blt[j].script=this.bltFunc;
                blt[j].x=this.pos[0];
                blt[j].y=this.pos[1];
                blt[j].r=4;
                blt[j].ka=rd==0?-0.1:0.1;
                blt[j].ka=blt[j].ka*7;
                blt[j].a=blt[j].move.speed_angle;
            }
            //stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 15, n, vm, 360,0);
        }
        //stgCreateShotA1(stg_rand(0,stg_frame_w),5,stg_rand(1,vm),90,"sMD",0,15);
    },
    bltFunc:function(){
        stgSetPositionA1(this,this.r*cos(this.a)+this.x,this.r*sin(this.a)+this.y);
        this.a+=this.ka/this.r;
        this.r+=1;
    }
};

stage_avoid_dammaku[5]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 80;
        this.r=1;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;

        if(this.f>=3000/(r+30)) {
            this.f=0;
            var a =atan2pr(this.pos, stgGetRandomPlayer().pos)+stg_rand(-5,5);
            // var n = (r*3 + 10)>>0;
            var n = (35+r)>>0;
            var vm = (r/10+3);
            //var vm=1.7;
            var rd=stg_rand(15)>>0;
            stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sMD", 0, rd, n, vm,this.r*60,50*600/(r+40));
            stgCreateShotW2(this.pos[0], this.pos[1], vm, a+180, "sMD", 0, rd, n, vm,this.r*60,50*600/(r+40));
            this.r=-this.r;
        }

    }
};


stage_avoid_dammaku[6]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 150;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        var vm = (r/5)+1;
        if(this.f>=2200/(r+30)) {
            this.f=0;
            var a =stg_rand(360);
            var x=stg_rand(stg_frame_w-20)+10;
            var y=stg_rand(50)+50;
            // var n = (r*3 + 10)>>0;
            var n = (r*3 + 10)>>0;
            var vm = 1+r/20;
            var nn=5;
            //var vm=1.7;
            var rd=stg_rand(14)>>0;
            while(nn>0) {
                var blt = stgCreateShotW2(x, y, vm+nn/8, a, "sZYD", 0, 1 + rd, n, vm+nn/8, 360, 0);
                for (var j = 0; j < blt.length; j++) {
                    blt[j].script = this.bltFunc;
                    blt[j].f = 180 / vm;
                    blt[j].o=1+r/4;
                }
                nn--;
            }
            //stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 15, n, vm, 360,0);
        }
        //stgCreateShotA1(stg_rand(0,stg_frame_w),5,stg_rand(1,vm),90,"sMD",0,15);
    },
    bltFunc:function(){
        this.f--;
        if(this.f<0){
            this.move.speed=this.o;
        }
    }
};

stage_avoid_dammaku[7]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 150;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        var vm = (r/5)+1;
        if(this.f>=800/(r+10)) {
            this.f=0;
            for(var cnt=0;cnt<2;cnt++) {
                var a = stg_rand(PI2);
                var rr = 200 - r;
                var x = rr * cos(a) + stg_local_player.pos[0];
                var y = rr * sin(a) + stg_local_player.pos[1];
                if (x < 0)x = 0;
                if (x > stg_frame_w)x = stg_frame_w;
                if (y < 0)y = 0;
                if (y > stg_frame_h)y = stg_frame_h;
                a = atan2(stg_local_player.pos[1] - y, stg_local_player.pos[0] - x) / PI180;

                // var n = (r*3 + 10)>>0;
                // var n = (r*3 + 10)>>0;
                var vm = 1 + r / 20;
                var nn = 5;
                //var vm=1.7;
                var rd = stg_rand(14) >> 0;
                var blt = stgCreateShotW2(x, y, vm, a, "sZYD", 0, 1 + rd, 3, vm + 1, 0, 0);
            }
            //stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 15, n, vm, 360,0);
        }
        //stgCreateShotA1(stg_rand(0,stg_frame_w),5,stg_rand(1,vm),90,"sMD",0,15);
    },
    bltFunc:function(){
        this.f--;
        if(this.f<0){
            this.move.speed=this.o;
        }
    }
};

stage_avoid_dammaku[8]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 150;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        var vm = (r/5)+1;
        if(this.f>=400/(r+20)) {
            this.f=0;
            var a =stg_rand(PI2);
            var rr=200-r;
            var x=rr*cos(a)+stg_local_player.pos[0];
            var y=rr*sin(a)+stg_local_player.pos[1];
            if(x<0)x=0;
            if(x>stg_frame_w)x=stg_frame_w;
            if(y<0)y=0;
            if(y>stg_frame_h)y=stg_frame_h;
            a=stg_rand(360);
             var n = (r/4 + 3)>>0;
            // var n = (r*3 + 10)>>0;
            var vm = stg_rand(0.5,1+r/20);
            var nn=5;
            //var vm=1.7;
            var rd=stg_rand(14)>>0;
            var blt = stgCreateShotW2(x, y, vm, a, "sZYD", 0, 1 + rd, n, vm, 360, 0);

            //stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 15, n, vm, 360,0);
        }
        //stgCreateShotA1(stg_rand(0,stg_frame_w),5,stg_rand(1,vm),90,"sMD",0,15);
    },

};
stage_avoid_dammaku[9]={
    init:function(){
        this.f=0;
        this.pos=[0,0,0];
        this.pos[0] = stg_frame_w / 2;
        this.pos[1] = 150;
    },
    script:function(){
        this.f++;
        var r=stg_common_data.rank;
        var vm = (r/5)+1;
        if(this.f>=3000/(r+20)) {

            this.f=0;
            var am =stg_rand(PI2);
            var rr=240-r;
            var n = (r * 1 + 5) >> 0;
            // var n = (r*3 + 10)>>0;
            var vm = 0.5 + r / 25;
            var nn = 5;
            for(var cmp=0;cmp<3;cmp++) {
                var x = rr * cos(am) + stg_local_player.pos[0];
                var y = rr * sin(am) + stg_local_player.pos[1];
                am=am+PI*2/3
                if (x < 0)x = 0;
                if (x > stg_frame_w)x = stg_frame_w;
                if (y < 0)y = 0;
                if (y > stg_frame_h)y = stg_frame_h;
                var a = stg_rand(360);

                //var vm=1.7;
                var rd = stg_rand(14) >> 0;
                nn=5;
                while (nn > 0) {
                    var blt = stgCreateShotW2(x, y, vm + nn / 16, a, "sZYD", 0, 1 + rd, n, vm + nn / 16, 360, 0);
                    nn--;
                }
            }
            //stgCreateShotW2(this.pos[0], this.pos[1], vm, a, "sXY", 0, 15, n, vm, 360,0);
        }
        //stgCreateShotA1(stg_rand(0,stg_frame_w),5,stg_rand(1,vm),90,"sMD",0,15);
    },
};

stg_level_templates.stg_avoid_test=stage_avoid_test;