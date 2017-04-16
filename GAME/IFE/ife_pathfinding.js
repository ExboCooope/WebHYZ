/**
 * Created by Exbo on 2016/4/14.
 */

ife.nodes=[];

function IfeNode(x,y){
    this.hd=new StgHitDef().setPointA1(x,y,0);
    this.self_range=ifeCommonHitCheck(this.hd);
    //if(this.self_range>0) {
        ife.nodes.push(this);
   // }
    this.links=[];
    this.x=x;
    this.y=y;
}


IfeNode.prototype.addNodeLinks=function(max_dist){
    var l=ife.nodes.length;
    var node2=this;
    if(node2.self_range<=0)return this;
    for(var i=0;i<l;i++){
        var node1=ife.nodes[i];
        if(node1.self_range<=0 || node1==this)continue;
            var d=sqrt2x(node1.x-node2.x,node1.y-node2.y);
            if(d>max_dist)continue;
            gIfeLink(node1,node2,d);
    }
    return this;
};

IfeNode.prototype.removeNodeLinks=function(){
    for(var i=0;i<this.links.length;i++){
        this.links[i][0].removeNodeLinkS(this);
    }
    this.links=[];
    return this;
};

IfeNode.prototype.removeNodeLinkS=function(node){
    for(var i=0;i<this.links.length;i++){
        if(this.links[i][0]==node){
            this.links.splice(i,1);
        }
    }
    return this;
};


function gIfeLink(node1,node2,d){
    var l=new StgHitDef().setLaserA2(node1.x,node1.y,0,node2.x,node2.y,0);
    var s=ifeCommonHitCheck(l);
    if(s<0)return;

    node1.links.push([node2,s,d,l.rdir,node1]);
    node2.links.push([node1,s,d,l.rdir,node2]);
}

function gAllIfeLink(max_dist){
    var l=ife.nodes.length;
    for(var i=0;i<l;i++){
        var node1=ife.nodes[i];
        node1.self_range=ifeCommonHitCheck(node1.hd);
        node1.links=[];
    }
    for(i=0;i<l;i++){
        node1=ife.nodes[i];
        if(node1.self_range<=0)continue;
        for(var j=i+1;j<l;j++){
            var node2=ife.nodes[j];
            if(node2.self_range<=0)continue;
            var d=sqrt2x(node1.x-node2.x,node1.y-node2.y);
            if(d>max_dist)continue;
            gIfeLink(node1,node2,d);
        }
    }
}

function ifeSpawnDefaultNodes(){
    for(var i=20;i<=480-20;i+=40){
        for(var j=20;j<530;j+=40){
            new IfeNode(i,j);
        }
    }
    new IfeNode(ife.start_x,ife.start_y);
    new IfeNode(ife.dest_x,ife.dest_y);
}

ifeTrace.phase=1;
function ifeTrace(x1,y1,x2,y2){
    var p=ifeTrace.phase;
    ifeTrace.phase++;
    var s= new IfeNode(x1,y1).addNodeLinks(999);
    var e=new IfeNode(x2,y2).addNodeLinks(999);
    if(e.self_range<1.95){
        rt= null;
    }else {
        var rt = ifeNodeConnectCheck(s, e, p);
    }
    s.removeNodeLinks();
    e.removeNodeLinks();

    ife.nodes.pop();
    ife.nodes.pop();


    return rt;
}

function ifeNodeConnectCheck(node1,node2,p){
    //var pool=[node1];
    var open=[];
    var open2=[];
    var head=node1;
    head.dst=0;
   // var t;

  //  t=head;
    while(head!=node2) {
        head.phase=p;
        for (var i = 0; i < head.links.length; i++) {
            var q = head.links[i];
            if (q[1] >= 1.8 && q[0].phase != p) {
                q[5] = head.dst +q[2];
                open.push(q);
            }
        }
        var mind=999;
        var mini=null;
        open2=[];
        for(i=0;i<open.length;i++){
            q=open[i];
            if (q[0].phase == p){
                delete open[i];
            }else{
                open2.push(q);
            }
            if(q[5]<mind){
                mind=q[5];
                mini=q;
            }
        }
        if(!mini){
            return null;
        }else{
            mini[0].back=mini[4];
            mini[0].dst=mind;
            head=mini[0];
        }
        open=open2;
    }

    var rtl=[];
    while(head!=node1){
        rtl.push(head);
        head=head.back;
    }
    rtl.push(head);
   /* var rt2=[];
    while(head=rtl.pop()){
        rt2.push(head);
    }*/

    return rtl;
}


ife.draw_link_controller={
    init:function(){
       // this.drawlink=1;
        this.render=new StgRender("testShader2");
        this.layer=81;
        this.render.type=4;
        this.loc=0;
        this.render.script=function(context){
            context.clearRect(0,0,480,640);
            if(ife.draw_link_controller.drawlink) {
                context.strokeStyle = "#3F3";

                for(var i=0;i<ife.nodes.length;i++){
                    var node1=ife.nodes[i];
                    for(var j=0;j<node1.links.length;j++){
                        var node2=node1.links[j][0];
                        context.strokeStyle = node1.links[j][1]>3?"#3F3":"#F33";

                            context.beginPath();
                            context.moveTo(node1.x, node1.y);
                            context.lineTo(node2.x, node2.y);
                            context.stroke();
                            context.closePath();


                    }
                }
                if(ife.route){
                    node1=ife.route[0];
                    if(node1) {
                        for (i = 1; i < ife.route.length; i++) {
                            node2 = ife.route[i];

                            context.strokeStyle = "#33F";
                            context.beginPath();
                            context.moveTo(node1.x, node1.y);
                            context.lineTo(node2.x, node2.y);
                            context.stroke();
                            context.closePath();
                            node1 = node2;

                        }
                        context.strokeStyle = "#FF3";
                        context.beginPath();
                        context.moveTo(stg_local_player.pos[0], stg_local_player.pos[1]);
                        context.lineTo(node1.x, node1.y);
                        context.stroke();
                        context.closePath();
                    }
                }

            }
        }
    },
    script:function(){
        if(stg_system_input[stg_const.KEY_SPELL]==1){
            if(!this.loc) {
                this.drawlink = !this.drawlink;
                this.loc=1;
            }
        }else{
            this.loc=0;
        }
    }
};

ife.max_dist=130;

ife.player_ai_holder={
    init:function(){

    },
    script:function(){
        if(stg_local_player.key[3]||stg_local_player.key[4]||stg_local_player.key[5]||stg_local_player.key[6]){
            delete ife.route;
        }
        if(ife.route) {
            var tnode = ife.route[ife.route.length-1];
            if(tnode) {
                var s = stg_local_player.move_speed[stg_local_player.key[stg_const.KEY_SLOW]];
                if (!stgMovePositionA2(stg_local_player, tnode.x, tnode.y,s)) {
                    ife.route.pop();
                }
            }else{
                delete ife.route;
            }
        }
    }

};