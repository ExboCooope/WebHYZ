/**
 * Created by Exbo on 2017/9/12.
 */

shw.practice={};
shw.practice.init=function(){};
shw.practice.script=function(){};
shw.practice.showTitle=function(text){
    var a=new RenderText(stg_frame_w/2-text.length*12,stg_frame_h/3,text);
    a.setFont("黑体",24,"#66F","#000");
};

shw.practice.showDialog=function(x,y,w,h,fsize,text,color){
    var padding=2;
    var pool=[];
    var a={};
    a.layer=90;
    a.render=new StgRender("testShader2");
    miscApplyAttr(a.render,{type:1,x:x,y:y,w:w,h:h,alpha:128,color:"#000"});
    x=x+padding;
    y=y+padding;
    w=w-padding*2;
    w=w/fsize*2;
    w=w>>0;
    if(w<2)w=2;
    stgAddObject(a);
    pool.push(a);
    var q=strEnter(text,w);
    for(var i=0;i< q.length;i++){
        a=new RenderText(x,y+i*fsize,q[i]);
        a.setFont("宋体",fsize,color,"#000");
        pool.push(a);
    }
    return pool;
};



shw.zjj={};
shw.zjj.init=function(){
    this.state=0;
};

shw.nextState=function(){
    stg_target.state++;
    stg_target.frame=0;
};

shw.zjj.script=function(){
    if(this.state==0){
        shw.practice.showTitle("弹型解说：自机狙");
        if(frame>120){
            shw.nextState();
        }
    }else if(this.state==1){
        stgDeleteObject()
    }
};



shw.Enemy01=function(x,y){
    this.side=stg_const.SIDE_ENEMY;
    this.life=100;
    stgApplyEnemy(this);
};

shw.Enemy01.prototype.init=function(){
    var a=new EnemyFairyHolder(this,0,128,48,48);
    stgAddObject(a);
    this.f=0;
};

shw.Enemy01.prototype.script=function(){
    if(this.life<=0){
        stgDeleteSelf();
    }
};


