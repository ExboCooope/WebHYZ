/**
 * Created by Exbo on 2017/6/9.
 */
shw.set_up_frame_object={
    init:function(){
        stgAddObject(hyz.resolution);
      //  stgShowCanvas("frame",0,0,0,0,5);
        stg_display = ["drawMagicCircle","drawBackground","drawFullBGFrame","drawFullFrame",
            "drawCombineFrame","drawUI"];
        hyz.resolution.refresh();
        hyzAddObject(hyz.full_bg_object,3);
        hyzAddObject(hyz.full_screen_object,0);
        stgDeleteSelf();
    }
};


shw.level={};
shw.level.init=function(){
    this.sid=1;
    stgReturnObject(shw.loading);
    stgReturnObject(shw.loading.left_gate);
    stgReturnObject(shw.loading.right_gate);
    hyz.battle_style=1;
   // hyzSetBattleStyle(1,0);
    stgAddObject(shw.set_up_frame_object);
   // stgAddObject(background_controller);
  //  stgAddObject(background_01);
    if(stg_common_data.pressure_test){
       // stgAddObject(shw.pureSpriteTest);
       // stgDeleteSelf();

    }else{
        stgAddObject(new river_background());
        stgAddObject(hyz.magicCircle);

    }
    stg_players[0].sid=1;
    stg_common_data.current_hit=[0,0];
    stg_common_data.current_chain_score=[0,0];
    stg_common_data.current_combo_time=[0,0];
    stg_common_data.current_charge_max=[100,100];
    stg_common_data.current_charge=[0,0];
    stg_common_data.current_spell_level=[6,6];
    stg_common_data.current_boss_level=[6,6];

    ApplyFullTexture(shw.game_frame_bg,"game_frame_bg_img");
    hyzAddObject(shw.game_frame_bg,0);
    this.sid=1;
    this.fps_drawer=new RenderText(300, 464);
    stgAddObject(this.fps_drawer);
    stg_last.render.color="#FFF";
    stg_last.script=function(){
        this.render.text=(_pool.length)+" 物体 "+(((stg_fps)>>0)+" fps");
    };
    this.counter=0;

    var a=th.objCreateDelayObject(30);
    th.spriteSet(a,"th_title",4,250);
   // var b=hyzGetFrameObject(0);
    stgSetPositionA1(a,32+stg_frame_w/2, 16+50);
    //stgSetPositionA1(a,529,32);
    a.sid=0;
    a.script=shw.title_bar_script;
    renderSetSpriteScale(1,0,a);

   // stgAddObject(element_system);

    a=new ElementBase(stg_frame_w+75,390,[255,0,0,255],[0,0,255,255],0.75,0);
    a.sid=0;
    stgAddObject(a);
    a=new ElementBase(stg_frame_w+75,415,[140,102,53,255],[0,255,0,255],0.75,1);
    a.sid=0;
    stgAddObject(a);
    a=new ElementBase(stg_frame_w+75,440,[255,255,0,255],[255,0,255,255],0.75,2);
    a.sid=0;
    stgAddObject(a);


    //shw.practice.showDialog(50,50,200,400,20,"这是一段很长的对话，哈哈哈哈\n或或或或或，爱德华哦啊哈佛私房话","#FFF");

    hyzAddObject(new thc.ScoreDisplay(0,0),0);

  //  stgCreateShotA1(100,100,0,45,"sLD",0,0);

};

shw.title_bar_script=function(){
    if(this.frame<=30){
        renderSetSpriteScale(1,this.frame/30,this);
    }else if(this.frame==120){
        luaMoveTo(530,32,80,1,this);
    }else if(this.frame>120 && this.frame<=200){
        this.rotate[2]=360*(this.frame-120)/80*PI180;
    }
    if(this.frame==200){
        this.script=0;
    }
};

shw.level.script=function(){


    BGLeaf.create();
   // return;
    if(stg_players_number==1){
        stg_players[1]=stg_players[0];
    }

    if(this.frame==30){
        if(stg_common_data.ai){
            stgAddObject(new BasicAI(stg_players[1]));
        }
    }

    if(this.frame==60){
        if(stg_common_data.pressure_test){
            stgAddObject(shw.pureSpriteTest);
            stgDeleteSelf();
            return;
        }
        this.boss=new BossSLZ();
       // this.boss=new BossESC();
        stgAddObject(this.boss);
    }
    if(this.frame>=60){
        if(this.boss.remove){
            this.counter++;
            if(this.counter>(stg_common_data.spell_practice?60:240)){
                stgCloseLevel();
            }
        }
/*
        this.side=stg_const.SIDE_ENEMY;
        var l=new ComplexLaser(60);
        stgAddObject(l);
        l.target_length=30;
        l.width_add=0.1;
        l.setTexture("bullet",286,128,286,192,0);
       // l.setTexture("white",286,128,286,192,0);
        l.texture_width=10;
        stgSetPositionA1(l,stg_frame_w/2,stg_frame_h/2);
        l.move.setSpeed(3,this.frame*3);
        l.move.speed_angle_acceleration=-0.03;
      //  l.texture_width=200;
        this.l=l;
      //  l.script=shw.hello_laser_script;*/
    }
    if(this.frame==120){
      //  this.l.move.setSpeed(0);
      //  this.l.stop=0;
        /*
       var p= this.l.objlist;
        for(var i=7;i<9;i++){
            p[i].laser_active=0;
        }
        for(var i=30;i<32;i++){
            p[i].laser_active=0;
        }*/
    }
};

shw.hello_laser_script=function(){
    var p= this.objlist;
    if(this.frame==50) {
        this.move.setSpeed(0);
        this.stop=1;
        for (var i = 0; i <= p.length; i++) {
            var a=i== p.length?this.tail:p[i];
            luaMoveTo(a.pos[0]+sind(i*12)*50, a.pos[1],30,1,a);
        }
    }
    if(this.frame==110){
        this.move.setSpeed(3);
        this.stop=0;
    }
};

shw.pureSpriteTest={};
shw.pureSpriteTest.target=9000;   //目标物体数（自动铺满，不再依赖按键）
shw.pureSpriteTest.chunk=600;    //每帧创建多少个（分帧铺，避免一帧内 9000 次构造造成大卡顿）
shw.pureSpriteTest.collide=1;    //1=开启碰撞检测；0=复现原来的空转（_hit_by_pool 为空，_stgMainLoop_Hit 直接返回）
shw.pureSpriteTest.neutralize=1; //1=中弹只计数，不结算（不扣命、不进 PLAYER_HIT、不触发擦弹/符卡反击）
shw.pureSpriteTest.colorVariants=8;//配色变体数：模板的 iColorX 步长决定图集里同一行有几列配色
shw.pureSpriteTest.animate=0;    //1=极端情况：每帧每颗弹幕的配色与尺寸都在变（打掉「静态批」假设）
shw.pureSpriteTest.hits=0;       //累计「判定命中」次数
shw.pureSpriteTest.grazes=0;
shw.pureSpriteTest.init=function(){
    //关键：pureSpriteTest 是从 shw.level（SIDE_PLAYER）派生出来的，不显式改成 SIDE_ENEMY 的话，
    //stgCreateShotA1 会把这些子弹当成「自机子弹」（layer 进 LAYER_PLAYER_BULLET），
    //而 stg_hit_check[SIDE_PLAYER][SIDE_PLAYER]=0 —— 就算打开 hitby，判定也会被整条跳过。
    this.side=stg_const.SIDE_ENEMY;
    for(var i=0;i<stg_players_number;i++){
        if(stg_players[i]._zzhitby===undefined)stg_players[i]._zzhitby=stg_players[i].hitby;
        if(shw.pureSpriteTest.collide){
            //把自机 hitby 恢复回来 -> _hit_by_pool 非空 -> _stgMainLoop_Hit 才会走到
            //stgEnginePlayerHit，对 _hit_pool 里所有子弹逐发跑 stgDist
            if(!stg_players[i].hitby)stg_players[i].hitby=stg_players[i]._zzhitby;
        }else{
            stg_players[i].hitby=0;
        }
    }
    this.rst=-1;
    this.bltcnt=0;
    this.created=0;
    this.hits=0;
    this.grazes=0;
    if(shw.pureSpriteTest.neutralize)this.installHitCounter();
};
shw.pureSpriteTest.script=function(){
    //分帧铺到目标数量
    var cv=shw.pureSpriteTest.colorVariants;   //配色变体数（1=全部用第 0 列）
    var ps=shw.pureSpriteTest;
    var n=0;
    var b;
    while(n<ps.chunk && this.created<ps.target){
        //记住模板名：animate 模式下要重新套模板来换配色
        b=stgCreateShotA1(50,50,3,stg_rand(360),"tDD",0,cv>1?stg_rand_int(0,cv-1):0);b._tmpl="tDD";b._ph=(n&15);b.script=ps.bltscript;
        b=stgCreateShotA1(50,50,3,stg_rand(360),"mMD",0,cv>1?stg_rand_int(0,cv-1):0);b._tmpl="mMD";b._ph=(n&15)+1;b.script=ps.bltscript;
        b=stgCreateShotA1(50,50,3,stg_rand(360),"mDD",0,cv>1?stg_rand_int(0,cv-1):0);b._tmpl="mDD";b._ph=(n&15)+2;b.script=ps.bltscript;
        b=stgCreateShotA1(50,50,3,stg_rand(360),"sXD",0,cv>1?stg_rand_int(0,cv-1):0);b._tmpl="sXD";b._ph=(n&15)+3;b.script=ps.bltscript;
        this.created+=4;
        this.bltcnt+=4;
        n+=4;
    }
    if(stg_players[0].key[stg_const.KEY_CTRL]){
        shw.pureSpriteTest.rst=4;
    }
};
//切换配色变体数并重建全部测试弹：用于「同一批物体」的对齐 A/B
shw.pureSpriteTest.setColorVariants=function(n){
    shw.pureSpriteTest.colorVariants=n;
    var ps=shw.pureSpriteTest,del=0;
    for(var i=0;i<_pool.length;i++){
        var o=_pool[i];
        if(o&&o.active&&o.script===ps.bltscript){stgDeleteObject(o);del++;}
    }
    ps.created=0;ps.bltcnt=0;ps.hits=0;ps.grazes=0;
    return del;
};
//替换「自机中弹的逻辑」：保留完整的碰撞检测（逐发 stgDist，这才是被测的开销），
//只把中弹的后果去掉 —— 不扣命、不进 PLAYER_HIT、不触发擦弹与符卡反击回调。
shw.pureSpriteTest.installHitCounter=function(){
    if(shw.pureSpriteTest._hitPatched)return;
    shw.pureSpriteTest._hitPatched=1;
    shw.pureSpriteTest._origPlayerHit=stgEnginePlayerHit;
    //擦弹回调换成纯计数：检测照跑，但不生成擦弹特效/不播音效（否则会不断新增物体，污染基准）
    shw.pureSpriteTest._grazeCounter=function(){shw.pureSpriteTest.grazes++;};
    stgEnginePlayerHit=function(core,s){
        var ps=shw.pureSpriteTest;
        //只在性能测试关卡里生效；一旦切到别的关卡就退回引擎原逻辑，避免把「不中弹」泄漏出去
        if(!ps.neutralize||!ps.active)return ps._origPlayerHit(core,s);
        var a=core._obj||core;
        var og=a.on_graze,ohb=a.on_hit_by,st0=a.state,inv=a.invincible;
        var n0=a.hit_by_list?a.hit_by_list.length:0;
        a.on_graze=ps._grazeCounter;a.on_hit_by=null;
        try{
            return ps._origPlayerHit(core,s);
        }finally{
            var n=a.hit_by_list?a.hit_by_list.length:0;
            if(n>n0){
                ps.hits+=n-n0;
                for(var i=n0;i<n;i++){
                    var b=a.hit_by_list[i];
                    if(b&&b.hit_list)b.hit_list.length=0;
                }
                a.hit_by_list.length=n0;   //不计入结算，也就别让它无限增长
            }
            a.on_graze=og;a.on_hit_by=ohb;
            a.state=st0;a.invincible=inv;  //撤销 PLAYER_HIT / 无敌计时
        }
    };
};
shw.pureSpriteTest.removeHitCounter=function(){
    if(!shw.pureSpriteTest._hitPatched)return;
    stgEnginePlayerHit=shw.pureSpriteTest._origPlayerHit;
    shw.pureSpriteTest._hitPatched=0;
};
//切换「每帧变色变尺寸」的极端模式（同一批物体直接生效，不需要重建）
shw.pureSpriteTest.setAnimate=function(v){
    shw.pureSpriteTest.animate=v?1:0;
    return shw.pureSpriteTest.animate;
};
shw.pureSpriteTest.bltscript=function(){
    var ps=shw.pureSpriteTest;
    if(ps.animate){
        //极端情况：这颗子弹本帧同时换配色与尺寸
        var o=stg_target;                       //子弹脚本里 stg_target 就是本颗子弹（base 对象）
        o._ph=(o._ph+1)&15;
        var sc=1+0.5*Math.sin(o._ph*0.4);
        _renderApply2DTemplate(o.render,BULLET[o._tmpl],o._ph&7);  //配色：重算 render.uvt
        o.render.scale[0]=sc;                                       //尺寸：每帧变
        o.render.scale[1]=sc;
        o.update=1;      //让 object_frame 重算 aUVT/aRec/aColor，并让 parser 重写 DMA 缓冲
    }
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
    if (shw.pureSpriteTest.rst >= 0) {
        stgDeleteObject(stg_target);
        shw.pureSpriteTest.rst--;
        shw.pureSpriteTest.bltcnt--;
        shw.pureSpriteTest.created--;
    }
};


stg_level_templates["shw_level"]=shw.level;