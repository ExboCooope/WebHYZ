/**
 * Created by Exbo on 2015/11/21.
 */
function stgCreateShotA1(x,y,speed,angle,bulletname,delay,color){
    color=color||0;
    delay=delay||0;
    var a=new StgBullet();
    a.move.pos[0]=x;
    a.move.pos[1]=y;
    a.move.speed=speed;
    a.move.speed_angle=angle*PI180;
    a.invincible=delay;
    a.layer=stg_const.LAYER_BULLET;
    if(stg_target.side==stg_const.SIDE_PLAYER){
        a.layer=stg_const.LAYER_PLAYER;
    }
    a.color=color;
    stg_bullet_parser(a,bulletname);
    stgAddObject(a);
    return a;
}
function stgApplyShot(object,bulletname,color) {
    var a=object;
    StgBullet.call(a);
    a.layer=stg_const.LAYER_BULLET;
    a.color=color;
    stg_bullet_parser(a,bulletname);
    return a;
}

function stgCreateShotA2(x,y,speed,angle,bulletname,delay,color,acc,maxspeed){
    var a=stgCreateShotA1(x,y,speed,angle,bulletname,delay,color);
    a.move.max_speed=maxspeed;
    a.move.acceleration=acc;
    return a;
}

stgCreateShotW1.stop=false;

function stgStopWShot(){
    stgCreateShotW1.stop=true;
    stgAddObject({
        script:function(){
            if(!this.a){
                this.a=1;
            }else if(this.a==1){
                this.a=2;

            }else{
                stgCreateShotW1.stop=false;
                stgDeleteSelf();
            }
        }
    })
}

function stgCreateShotW1(x,y,speed,angle,bulletname,delay,color,n,speed_add,angle_add,delay_add){
    var blt=[];
    var time=0;
    var ShowW1Controller={
        f:0,
        script:function(){
            if(stgCreateShotW1.stop){
                stgDeleteSelf();
                return;
            }
            while(this.f>=time) {
                blt.push(stgCreateShotA1(x,y,speed,angle,bulletname,delay,color));
                speed+=speed_add;
                angle+=angle_add;
                time+=delay_add;
                n--;
                if(n<=0){
                    if(delay_add)stgDeleteSelf();
                    return;
                }
            }
            this.f++;
        }
    }

    if(delay_add==0){
        ShowW1Controller.script();
    }else{
        stgAddObject(ShowW1Controller);
    }
    return blt;
}


function stgCreateShotW2(x,y,speed,angle_center,bulletname,delay,color,n,speed_max,angle_spread,delay_total){
    var blt=[];
    var time=0;
    var angle_add=angle_spread/(n-1);
    var angle=angle_center-(angle_spread)/2;
    var speed_add=(speed_max-speed)/(n-1);
    var delay_add=delay_total/(n-1);
    if(n<=1){
        angle_add=0;angle=angle_center;
        speed_add=0;
        delay_add=0;
    }
    var ShowW1Controller={
        f:0,
        script:function(){
            if(stgCreateShotW1.stop){
                stgDeleteSelf();
                return;
            }
            while(this.f>=time) {
                blt.push(stgCreateShotA1(x,y,speed,angle,bulletname,delay,color));
                speed+=speed_add;
                angle+=angle_add;
                time+=delay_add;
                n--;
                if(n<=0){
                    if(delay_add)stgDeleteSelf();
                    return;
                }
            }
            this.f++;
        }
    }

    if(delay_add==0){
        ShowW1Controller.script();
    }else{
        stgAddObject(ShowW1Controller);
    }
    return blt;
}

function stgCreateShotR1(x,y,speed,angle,bulletname,delay,color,range,angle_add){
    return stgCreateShotA1(x+range*cos(angle*PI180),y+range*sin(angle*PI180),speed,angle+angle_add,bulletname,delay,color);
}

function StgBullet(){
    this.type=stg_const.OBJ_BULLET;
    this.move=new StgMove();
    this.damage=1;
    this.penetrate=1;
    this.invincible=0;
}
