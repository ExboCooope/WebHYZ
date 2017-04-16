/**
 * Created by Exbo on 2015/12/3.
 */
stageP2={};
stageP2.init=function(){
    this.f=0;
    this.side=stg_const.SIDE_ENEMY;
    stg_procedures["draw3d"].active=1;
    //stg_procedures["drawFrame"].active=0;
    //stgAddObject(background_01);
    stgAddObject(gzz_stage03bg);
    var bltcnt = 0;
    var rst = 0;
    var a1={};
    var bltfunc = function () {
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
        if (rst >= 0) {
            stgDeleteObject(stg_target);
            rst--;
            bltcnt--;
        }
    };
    a1.script = function () {

        if (stg_system_input[0]) {
            stgCreateShotA1(50,50,3,Math.random()*360,"tDD",0,(Math.random()*8)>>1).script=bltfunc;
            bltcnt++;
            stgCreateShotA1(50,50,3,Math.random()*360,"mMD",0,(Math.random()*8)>>1).script=bltfunc;
            bltcnt++;
            stgCreateShotA1(50,50,3,Math.random()*360,"mDD",0,(Math.random()*8)>>1).script=bltfunc;
            bltcnt++;
            stgCreateShotA1(50,50,3,Math.random()*360,"sXD",0,(Math.random()*8)>>1).script=bltfunc;
            bltcnt++;
            stgCreateShotA1(50,50,3,Math.random()*360,"tDD",0,(Math.random()*8)>>1).script=bltfunc;
            bltcnt++;
        }
        if (stg_system_input[2]) {
            rst = 5;
        }

    };
    stgAddObject(a1);
    defaultDrawBackground("backTex");

    var ay = new RenderText(430, 420);
    ay.script = function () {
        this.render.text = "物体数：    " + _pool.length + "";
    };
    ay = new RenderText(430, 440);
    ay.script = function () {
        this.render.text = "判定数：    " + _hit_pool.length + "-"+_hit_by_pool.length;
    };

    stgPlaySE("道中BGM","BGM");
    //stgPlaySE("se_alert",1);
    //stgCreateShotA1(100, 100, 0, 45, "mDD", 0, 0);
};

stageP2.script=function(){
    this.f++;
    if(this.f==1){

        defaultShowBGM("Corridor Of Death");
    }
    if(this.f==30){
       // var a=new EnemyM01(30,-10);
        //a.pos=[100,30,0];
       // stgAddObject(stageP1.wave1);
        //gCreateItem(a.pos,stg_const.ITEM_LIFE,1,0);
    }
};

stg_level_templates.P2=stageP2;
