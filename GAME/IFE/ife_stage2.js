/**
 * Created by Exbo on 2016/4/13.
 */

ife.stage2={};

ife.stage2.init=function(){

    ife.draw_link_controller.drawlink=0;
    var q=new ButtonHolder("切换显示",1,1,
        {init:function(){
            ife.draw_link_controller.drawlink=!ife.draw_link_controller.drawlink;
            stgDeleteSelf();
        }},0,1);
    q.pos=[360,600];
    //创建目标区域（文件）
    var tgt=new StgObject();
    tgt.layer=90;
    tgt.render=new StgRender("testShader2");
    miscApplyAttr(tgt.render,{type:1,x:ife.dest_x-12,y:ife.dest_y-12,w:24,h:24,color:"#00F"});
    stgAddObject(tgt);
    stgAddObject(q);
    stgAddObject(tracetest2);
    this.wat=2;
};
//每帧执行的脚本
ife.stage2.script=function(){
    if(!this.wat) {
        //判断是否捡到文件
        if (sqrt2x(stg_local_player.pos[0] - ife.dest_x, stg_local_player.pos[1] - ife.dest_y) < 12) {
            for (var i = 0; i < ife.blockers.length; i++) {
                stgDeleteObject(ife.blockers[i]);
            }
            this.wat = 2;
        }
    }else{
        //等待几帧以后建立场地
        this.wat--;
        if(this.wat==0){
            ifeBuildStage2();
        }
    }
    //判断玩家是否中弹，将玩家送回起点
    if(stg_local_player.state==stg_const.PLAYER_HIT){
        stgPlaySE("se_dead");
        //给一秒无敌时间
        stg_local_player.invincible=60;
        ife.route=undefined;
        //防止引擎和Player脚本中有关中弹复活的脚本的执行
        stg_local_player.state=stg_const.PLAYER_NORMAL;
        stg_local_player.pos[0]=ife.start_x;
        stg_local_player.pos[1]=ife.start_y;
    }
};
//建立场地
function ifeBuildStage2(){
    //初始化、删除一些东西
    ife.blockers=[];
    ife.nodes=[];
    ife.route=undefined;
    for(var i=0;i<stg_enemy.length;i++){
        stgDeleteObject(stg_enemy[i]);
    }
    for(var i=0;i<_pool.length;i++){
        if(_pool[i].type==stg_const.OBJ_BULLET){
            stgDeleteObject(_pool[i]);
        }
    }
    //尝试几次建立障碍物
    for(var i=0;i<9;i++){
        var cx=stg_rand(480);
        var w=stg_rand(12,100);
        var cy=stg_rand(520);
        var h=stg_rand(12,100);
        var q=new Blocker(cx-w/2,cy-h/2,w,h);
        stgInstantRefresh();
        gAllIfeLink(700);
        //检查起点和终点是否还是联通的，如果不是，就撤销刚才的障碍物
        if(!ifeTrace(ife.start_x,ife.start_y,ife.dest_x,ife.dest_y)){
            q.instant_cancel();
            if(i==8){
                stgInstantRefresh();
                gAllIfeLink(700);
            }
        }
    }
    stg_local_player.pos[0]=ife.start_x;
    stg_local_player.pos[1]=ife.start_y;

    //尝试往场上玩家可及的地方放几个敌人
    var en=0;
    for(i=0;i<8;i++){
        cx=stg_rand(480);
        cy=stg_rand(430);
        if(ifeTrace(ife.start_x,ife.start_y,cx,cy)){
            var b=new IfeEnemy01(cx,cy);
            stgAddObject(b);
            en++;
            if(en>=4)break;

        }
    }
}

var tracetest2={
    init:function(){
        this.points=[];
        this.pn=0;
        stgAddObject(ife.draw_link_controller);
        stgAddObject(ife.player_ai_holder);
       // ifeSpawnDefaultNodes();
        gAllIfeLink(999);
    },
    script:function(){
        //处理点击事件
        if(stg_events["click"]){
            for(var i=0;i<stg_events.click.length;i++){
                if(stg_events.click[i]){
                    var cx=stg_events.click[i][0];
                    var cy=stg_events.click[i][1];
                    //判断是否点到了敌人
                    var shotflag=0;
                    for(var j=0;j<stg_enemy.length;j++){
                        if(sqrt2x(cx-stg_enemy[j].pos[0],cy-stg_enemy[j].pos[1])<30){
                            shotflag=stg_enemy[j];
                        }
                    }

                    if(shotflag){
                        //如果点到了敌人，则向敌人发射子弹
                        var dir=atan2pr(stg_local_player.pos,shotflag.pos);
                        //发射一颗速度为3，朝向敌人的小玉
                        var blt=stgCreateShotA1(stg_local_player.pos[0],stg_local_player.pos[1],3,dir,"sXY",0,0);
                        blt.side=stg_const.SIDE_PLAYER;//这里将脚本发出的敌人子弹变成玩家的子弹
                        blt.parent=stg_local_player;
                        blt.damage=30;//记住要设置伤害值
                    }else{
                        //判断是否在原地附近点，并设置ai路径
                        if(sqrt2x(stg_local_player.pos[0]-cx,stg_local_player.pos[1]-cy)<8){
                            ife.route=[{x:cx,y:cy}];
                        }else {
                            ife.route = ifeTrace(stg_local_player.pos[0], stg_local_player.pos[1], cx, cy);
                        }
                    }

                }
            }
        }
    }
};
//敌人
function IfeEnemy01(x,y) {
    this.side = stg_const.SIDE_ENEMY;
    //设置受击框
    this.hitby = new StgHitDef();
    this.hitby.range = 15;
    this.life = 25;//血量
    this.pos=[x,y,0];
    stgApplyEnemy(this);
}

IfeEnemy01.prototype.init = function () {
    //应用一个纹理系统
    var a = new EnemyFairyHolder(this, 0, 128, 48, 48);
    stgAddObject(a);
    this.f = 0;
};

IfeEnemy01.prototype.script = function () {
    if (this.life <= 0) {
        stgDeleteSelf();
    } else {
        var f = this.f;
        var p = stgGetRandomPlayer();
        if (f >= 30) {
            //给ai反应时间一点变化
            f=stg_rand(0,20);
            if(sqrt2(this.pos, p.pos)<200) {
                var l = new StgHitDef().setLaserA2(this.pos[0], this.pos[1], 0, p.pos[0], p.pos[1], 0);
                var s = ifeCommonHitCheck(l);
                if (s > 0){
                    stgCreateShotW1(this.pos[0], this.pos[1], 1.5, atan2pr(this.pos, p.pos)-40, "sLD", 0, 0, 5, 0, 20, 0);
                    f=0;//如果发射了子弹，取消时间变化，半秒以后进行下一次判定
                }
            }

        }else{
            f++;
        }
        this.f=f;
    }
};

//注册关卡
stg_level_templates.ife_stage_2=ife.stage2;