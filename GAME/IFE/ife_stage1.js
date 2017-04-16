/**
 * Created by Exbo on 2016/4/13.
 */

ife.stage1={};

ife.stage1.init=function(){
  // new Blocker(100,100,100,20);
  //  stgInstantRefresh();
    //ifeBuildStage1();
    var q=new ButtonHolder("切换显示",1,1,
        {init:function(){
            ife.draw_link_controller.drawlink=!ife.draw_link_controller.drawlink;
            stgDeleteSelf();
        }},0,1);
    q.pos=[360,600];
    var tgt=new StgObject();
    tgt.layer=90;
    tgt.render=new StgRender("testShader2");
    miscApplyAttr(tgt.render,{type:1,x:ife.dest_x-12,y:ife.dest_y-12,w:24,h:24,color:"#00F"});
    stgAddObject(tgt);
    stgAddObject(q);
    stgAddObject(tracetest);
    this.wat=2;
};

ife.stage1.script=function(){
    if(!this.wat) {
        if (sqrt2x(stg_local_player.pos[0] - ife.dest_x, stg_local_player.pos[1] - ife.dest_y) < 12) {
            for (var i = 0; i < ife.blockers.length; i++) {
                stgDeleteObject(ife.blockers[i]);
            }
            this.wat = 2;
        }
    }else{
        this.wat--;
        if(this.wat==0){
            ifeBuildStage1();
        }
    }
};

function ifeBuildStage1(){
    ife.blockers=[];
    ife.nodes=[];
    ife.route=undefined;
    for(var i=0;i<9;i++){
        var cx=stg_rand(480);
        var w=stg_rand(12,240);
        var cy=stg_rand(520);
        var h=stg_rand(12,240);
        var q=new Blocker(cx-w/2,cy-h/2,w,h);
        stgInstantRefresh();
        gAllIfeLink(700);
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
}

var tracetest={
    init:function(){
        this.points=[];
        this.pn=0;
        stgAddObject(ife.draw_link_controller);
        stgAddObject(ife.player_ai_holder);
       // ifeSpawnDefaultNodes();
        gAllIfeLink(999);
    },
    script:function(){
        if(stg_events["click"]){
            for(var i=0;i<stg_events.click.length;i++){
                if(stg_events.click[i]){
                    var cx=stg_events.click[i][0];
                    var cy=stg_events.click[i][1];
                    if(sqrt2x(stg_local_player.pos[0]-cx,stg_local_player.pos[1]-cy)<4){
                        ife.route=[{x:cx,y:cy}];
                    }else {
                        ife.route = ifeTrace(stg_local_player.pos[0], stg_local_player.pos[1], cx, cy);
                    }/*
                    if(this.pn==0) {
                        this.points = [cx, cy];
                        this.pn++;
                        console.log(cx,cy);
                    }else{
                        this.pn=0;
                        //var t=new StgHitDef().setLaserA2(this.points[0],this.points[1],0,cx,cy,0);
                        ifeTrace(this.points[0],this.points[1],cx,cy);
                        console.log(cx,cy);
                        //var mind=999;
                        //for(var j=0;j<_hit_by_pool.length;j++){
                          //  var t2=_hit_by_pool[j];
                          //  if(t2.side==stg_const.SIDE_TERRAIN){
                          //      var d=stgDist(t,t2.hitby);
                          //      if(d<mind)mind=d;
                         //   }
                      //  }
                      //  console.log(d);

                    }*/
                }
            }
        }
    }
};



stg_level_templates.ife_stage_1=ife.stage1;