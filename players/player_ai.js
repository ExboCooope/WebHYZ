/**
 * Created by Exbo on 2017/5/16.
 */
function BasicAI(player){
    this.player=player;
    this.aware_range=25;
    this.max_range=100;
    this.rangea=1;
    this.acc_range=30;
    this.ground_range=30;
    this.objs=6;
    this.key_down_frame=[1,6];
    this.key_up_frame=[1,6];
    this.key=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
}
BasicAI.prototype.ai_script=function(){

};
BasicAI.prototype.ai_script2=function(){
    this.ai_object.scriptx();
    for(var i=0;i<16;i++){
        this.key[i]=this.ai_object.key[i]>0?1:0;
    }
};

BasicAI.prototype.init=function(){
    this.player.on_ai=this.ai_script;
    this.player.ai_object=this;
    this.player.on_ai_after_move=this.ai_script2;
    this.base=new StgBase(this.player,stg_const.BASE_COPY,1);
    this.temp_hit=new StgHitDef();
};

BasicAI.res=[];

BasicAI.emu=[0,0,0,-1,0,1,1,0,-1,0,0.707,0.707,0.707,-0.707,-0.707,0.707,-0.707,-0.707,0,0];


BasicAI.prototype.keydef=function(okey,target){
    if(okey){
        if(target==0){
           return stg_rand_int(this.key_down_frame[0],this.key_down_frame[1]);
        }else if(target<0){
           return target+1;
        }
    }else{
        if(target==1){
            return -stg_rand_int(this.key_up_frame[0],this.key_up_frame[1]);
        }else if(target>1){
           return  target-1;
        }
    }
    return target;
};

BasicAI.prototype.scriptx=function(){
    var vx=0;
    var vy=0;
    var res=BasicAI.res;
    var n=_hit_pool.length;
    var player=this.player;
    var cnt=0;
    this.sid=this.player.sid;
    var pool=[];
    for(var i=0;i<n;i++){
        var a=_hit_pool[i];
        if(a.side==stg_const.SIDE_ENEMY){
            if(hyzIsInOneFrame(a,player)){
                if(aiDist(a.hitdef,this.player.hitby,BasicAI.res)<this.aware_range){
                    if(res[0]<3)res[0]=3;
                    vx+=res[1]*(this.acc_range*this.acc_range/res[0]);
                    vy+=res[2]*(this.acc_range*this.acc_range/res[0]);
                    cnt++;
                    if(res[0]<4) {
                        pool.push(a.hitdef);
                    }
                }
            }
        }
    }
    if(cnt>this.objs){
        this.aware_range=25;//(this.aware_range/2)>>0;
        this.rangea=3;
    }else{
        this.aware_range+=this.rangea;
        this.rangea++;
        if(this.aware_range>this.max_range){
            this.aware_range=this.max_range;
        }
    }
    var x=this.player.pos[0];
    var y=this.player.pos[1];
    var d;
    if((d=stg_clip+this.ground_range-x)>0) {
        d=this.ground_range-d;
        vx += 2 * this.ground_range * this.ground_range / (d + 1);
    }
    if((d=x-stg_frame_w+stg_clip+this.ground_range)>0){
        d=this.ground_range-d;
        vx-=2*this.ground_range*this.ground_range/(d+1);
    }
    if((d=stg_clip+this.ground_range-y)>0){
        d=this.ground_range-d;
        vy+=2*this.ground_range*this.ground_range/(d+1);
    }
    if((d=y-stg_frame_h+stg_clip+this.ground_range)>0){
        d=this.ground_range-d;
        vy-=2*this.ground_range*this.ground_range/(d+1);
    }

/*
    this.key[stg_const.KEY_LEFT]=0;
    this.key[stg_const.KEY_RIGHT]=0;
    this.key[stg_const.KEY_UP]=0;
    this.key[stg_const.KEY_DOWN]=0;*/

    var x1=vx<-2?1:0;
    var x2=vx>2?1:0;
    var y1=vy<-2?1:0;
    var y2=vy>2?1:0;

    var k=this.key;
    var right=stg_const.KEY_RIGHT;
    var left=stg_const.KEY_LEFT;
    var down=stg_const.KEY_DOWN;
    var up=stg_const.KEY_UP;
    k[stg_const.KEY_SLOW]=this.keydef(cnt>=4,k[stg_const.KEY_SLOW]);
    k[left]=this.keydef(x1,k[left]);
    k[right]=this.keydef(x2,k[right]);
    k[up]=this.keydef(y1,k[up]);
    k[down]=this.keydef(y2,k[down]);
   /* k[left]=x1;
    k[right]=x2;
    k[up]=y1;
    k[down]=y2;*/

    this.temp_hit.range=player.hitby.range+0.1;
   // this.temp_hit.rpos[0]=player.hitby.rpos[0];
   // this.temp_hit.rpos[1]=player.hitby.rpos[1];
    var hit=0;
    var th=this.temp_hit;

    a=this;
    x = (k[right]>0?1:0) -  (k[left]>0?1:0);
    y = (k[down]>0?1:0) -  (k[up]>0?1:0);
    var slow = a.key[stg_const.KEY_SLOW]>0?1:0;
    if (x || y) {
        var s = player.move_speed[slow];
        if (x && y) {
            s = s / 1.4142;
        }
        x = x * s;
        y = y * s;
        th.rpos[0] = player.pos[0]+x;
        th.rpos[1] = player.pos[1]+y;
    }else{
        th.rpos[0] = player.pos[0];
        th.rpos[1] = player.pos[1];
    }
    if (th.rpos[0] > stg_frame_w - stg_clip)th.rpos[0] = stg_frame_w - stg_clip;
    if (th.rpos[0] < stg_clip)th.rpos[0] = stg_clip;
    if (th.rpos[1] > stg_frame_h - stg_clip)th.rpos[1] = stg_frame_h - stg_clip;
    if (th.rpos[1] < stg_clip)th.rpos[1] = stg_clip;

    for(var ii=0;ii<pool.length;ii++){
        a=pool[ii];
        if(stgDist(a,th)<=0){
            hit=1;
            break;
        }
    }

    var e=BasicAI.emu;
    var maxdis=-100;
    var mini=0;
    var mind=0;
    var t;
    if(player.state==stg_const.PLAYER_DEAD ||player.state==stg_const.PLAYER_HIT)return;
    if(hit) {
        s=player.move_speed[slow];
      for (var j = 0; j < 9; j++) {
            mind=0;
            hit=0;
            x = e[j * 2]*s;
            y = e[j * 2 + 1]*s;
            th.rpos[0] = player.pos[0] + x;
            th.rpos[1] = player.pos[1] + y;
            if (th.rpos[0] > stg_frame_w - stg_clip)th.rpos[0] = stg_frame_w - stg_clip;
            if (th.rpos[0] < stg_clip)th.rpos[0] = stg_clip;
            if (th.rpos[1] > stg_frame_h - stg_clip)th.rpos[1] = stg_frame_h - stg_clip;
            if (th.rpos[1] < stg_clip)th.rpos[1] = stg_clip;
            for (ii = 0; ii < pool.length; ii++) {
                a = pool[ii];
                t=stgDist(a,th);
                if (t <= 0) {
                    if(t<mind){
                        mind=t;
                    }
                    hit = 1;
                    break;
                }
            }
            if (!hit) {
                this.key[stg_const.KEY_LEFT] = x < 0 ? 1 : 0;
                this.key[stg_const.KEY_RIGHT] = x > 0 ? 1 : 0;
                this.key[stg_const.KEY_UP] = y < 0 ? 1 : 0;
                this.key[stg_const.KEY_DOWN] = y > 0 ? 1 : 0;
                this.key[stg_const.KEY_SLOW] = slow ? 1 : 0;
                break;
            }else{
                if(mind>maxdis){
                    maxdis=mind;
                    mini=j;
                }
            }
        }
    }
    if(hit){
        s=player.move_speed[1-slow];
       for (var j = 0; j < 9; j++) {
            mind=0;
            hit=0;
            x = e[j * 2]*s;
            y = e[j * 2 + 1]*s;
            th.rpos[0] = player.pos[0] + x;
            th.rpos[1] = player.pos[1] + y;
            if (th.rpos[0] > stg_frame_w - stg_clip)th.rpos[0] = stg_frame_w - stg_clip;
            if (th.rpos[0] < stg_clip)th.rpos[0] = stg_clip;
            if (th.rpos[1] > stg_frame_h - stg_clip)th.rpos[1] = stg_frame_h - stg_clip;
            if (th.rpos[1] < stg_clip)th.rpos[1] = stg_clip;
            for (ii = 0; ii < pool.length; ii++) {
                a = pool[ii];
                t=stgDist(a,th);
                if (t <= 0) {
                    if(t<mind){
                        mind=t;
                    }
                    hit = 1;
                    break;
                }
            }
            if (!hit) {
                this.key[stg_const.KEY_LEFT] = x < 0 ? 1 : 0;
                this.key[stg_const.KEY_RIGHT] = x > 0 ? 1 : 0;
                this.key[stg_const.KEY_UP] = y < 0 ? 1 : 0;
                this.key[stg_const.KEY_DOWN] = y > 0 ? 1 : 0;
                this.key[stg_const.KEY_SLOW] = !slow ? 1 : 0;
                break;
            }else{
                if(mind>maxdis){
                    maxdis=mind;
                    mini=j+9;
                }
            }
        }
    }
    if(hit){
        if(mini>9){
            mini-=9;
            this.key[stg_const.KEY_SLOW]=!slow?1:0;
         }else{
            this.key[stg_const.KEY_SLOW]=slow?1:0;
        }
        x = e[mini * 2];
        y = e[mini* 2 + 1];
        this.key[stg_const.KEY_LEFT] = x < 0 ? 1 : 0;
        this.key[stg_const.KEY_RIGHT] = x > 0 ? 1 : 0;
        this.key[stg_const.KEY_UP] = y < 0 ? 1 : 0;
        this.key[stg_const.KEY_DOWN] = y > 0 ? 1 : 0;
        console.log("hit");
    }
};

var ai_close_point=[];

function aiDist(p1,p2,res){
    if(p1.type==0 && p2.type==0){
        sqrt2d(p2.rpos[0]-p1.rpos[0],p2.rpos[1]-p1.rpos[1],res);
        res[0]-=p1.range+p2.range;
        ai_close_point[0]=p2.rpos[0];
        ai_close_point[1]=p2.rpos[1];
        return res[0];
    }else if(p1.type==0 && p2.type==1){
        var kdx=p1.rpos[0]-p2.rpos[0];
        var kdy=p1.rpos[1]-p2.rpos[1];
        var sinr=p2.sdir;
        var cosr=p2.cdir;
        var dl=kdx*cosr+kdy*sinr;
        var dd=kdy*cosr-kdx*sinr;
        if(dl<=p2.ls){
            ai_close_point[0]=p2.rpos[0]+p2.ls*cosr;
            ai_close_point[1]=p2.rpos[1]+p2.ls*sinr;
            sqrt2d(ai_close_point[0]-p1.rpos[0],ai_close_point[1]-p1.rpos[1],res);
            res[0]=res[0]-p1.range-p2.rs;
            return res[0];
        }else if(dl>=p2.le){
            ai_close_point[0]=p2.rpos[0]+p2.le*cosr;
            ai_close_point[1]=p2.rpos[1]+p2.le*sinr;
            sqrt2d(ai_close_point[0]-p1.rpos[0],ai_close_point[1]-p1.rpos[1],res);
            res[0]=res[0]-p1.range-p2.re;
            return res[0];
        }else {
            ai_close_point[0] = p2.rpos[0] + dl * cosr;
            ai_close_point[1] = p2.rpos[1] + dl * sinr;
            var rate = (dl - p2.ls) / (p2.le - p2.ls);
            res[0] = (dd < 0 ? -dd : dd) - p1.range - rate * p2.rs - (1 - rate) * p2.re;
            res[1] = dd >= 0 ? -sinr : sinr;
            res[2] = dd >= 0 ? cosr : -cosr;
            return res[0];
        }
    }else if(p1.type==1 && p2.type==0){
        aiDist(p2,p1,res);
        ai_close_point[0]=p2.rpos[0];
        ai_close_point[1]=p2.rpos[1];
        res[1]=-res[1];
        res[2]=-res[2];
        return res[0];
    }else if(p1.type==1 && p2.type==1){
        return 100;
    }else if(p1.type==0 && p2.type==2){
        sqrt2d(p2.rpos[0]-p1.rpos[0],p2.rpos[1]-p1.rpos[1],res);
        kdx=p1.rpos[0]-p2.rpos[0];
        kdy=p1.rpos[1]-p2.rpos[1];
        sinr=p2.sdir;
        cosr=p2.cdir;
        dl=kdx*cosr+kdy*sinr;
        dd=kdy*cosr-kdx*sinr;
        var a=(p2.rs+p1.range)*(p2.rs+p1.range);
        var b=(p2.re+p1.range)*(p2.re+p1.range);
        dl=dl*dl;
        dd=dd*dd;
        var dt=a*dl+b*dd-a*b;
        var rr=dl+dd-a-b;
        rate=(rr+sqrt(rr*rr+4*dt))/2;
        res[0]=rate>=0?sqrt(rate):-sqrt(-rate);
        return res[0];
    }else if(p1.type==2){
        aiDist(p2,p1,res);
        ai_close_point[0]=p2.rpos[0];
        ai_close_point[1]=p2.rpos[1];
        res[1]=-res[1];
        res[2]=-res[2];
        return res[0];
    }
    return 100;
}
