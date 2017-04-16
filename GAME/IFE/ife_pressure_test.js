/**
 * Created by Exbo on 2016/4/13.
 */

ife.pressure_test={};

ife.pressure_test.init=function(){
    this.object_count=0;
    stgClearCanvas("ui");
    //子弹的脚本
    this.blt_func = function () {
        //触壁反弹
        if (stg_target.move.pos[0] > stg_frame_w) {
            stg_target.move.pos[0] = stg_frame_w;
            stg_target.move.speed_angle = PI - stg_target.move.speed_angle;
        }
        if (stg_target.move.pos[0] < 0) {
            stg_target.move.pos[0] = 0;
            stg_target.move.speed_angle = PI - stg_target.move.speed_angle;
        }
        if (stg_target.move.pos[1] > stg_frame_h) {
            stg_target.move.pos[1] = stg_frame_h;
            stg_target.move.speed_angle = -stg_target.move.speed_angle;
        }
        if (stg_target.move.pos[1] < 0) {
            stg_target.move.pos[1] = 0;
            stg_target.move.speed_angle = -stg_target.move.speed_angle;
        }
        //如果需要减少子弹，就删除自己
        if (ife.pressure_test.reduce >= 0) {
            stgDeleteSelf();
            ife.pressure_test.reduce--;
            ife.pressure_test.object_count--;
        }

    };

    var ay = new RenderText(10, 570);
    ay.script = function () {
        this.render.text = "物体数：    " + _pool.length + "";
    };
    ay = new RenderText(10, 600);
    ay.script = function () {
        this.render.text = "判定数：    " + _hit_pool.length + "-"+_hit_by_pool.length;
    };

    this.qnt=0;
    this.f2=180;
};

ife.pressure_test.script=function(){
    this.f2--;
    if(stg_fps>=58 || this.f2>0){
        stgCreateShotA1(50,50,3,Math.random()*360,"tDD",0,(stg_rand(1)*8)>>1).script=this.blt_func;
        stgCreateShotA1(50,50,3,Math.random()*360,"mMD",0,(stg_rand(1)*8)>>1).script=this.blt_func;
        stgCreateShotA1(50,50,3,Math.random()*360,"mDD",0,(stg_rand(1)*8)>>1).script=this.blt_func;
        stgCreateShotA1(50,50,3,Math.random()*360,"sXD",0,(stg_rand(1)*8)>>1).script=this.blt_func;
        stgCreateShotA1(50,50,3,Math.random()*360,"tDD",0,(stg_rand(1)*8)>>1).script=this.blt_func;
        this.object_count+=5;
    }else{
       // if(!this.topped) {
       //     this.topped = 1;
       //     this.f = 0;
       // }
        this.reduce=60-stg_fps;
    }
    if(this.topped){
        this.f++;
        this.qnt+=_hit_pool.length;
    }
    if(this.f>200){
        this.qnt=this.qnt/this.f;
        var ay = new RenderText(240, 570);
        ay.render.text = "可渲染子弹：" +(this.qnt>>0) + "个";
        stgAddObject(ay);
        this.script=function(){
            for(var i=0;i<_pool.length;i++){
                if(_pool[i] && _pool[i].type==stg_const.OBJ_BULLET){
                    stgDeleteObject(_pool[i]);
                }
            }
            this.script=null;
        }
    }
};

stg_level_templates.ife_pressure_test=ife.pressure_test;