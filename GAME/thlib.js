/**
 * Created by Exbo on 2017/8/22.
 */

//thlib.js contains functions that is used in module scripts

var th={};//contains function
var thc={};//contains constructors
var tho={};//contains single objects
var ths={};//system object

th.init=function(){
    stgAddObject(ths);
};


//object functions
//create and adds an object, can set a base_object with BASE_COPY AUTO_DELETE
//note that it will not call init() function
th.objCreateObject=function(base_object){
    var a={};
    if(base_object)a.base=new StgBase(base_object,stg_const.BASE_COPY,1);
    stgAddObject(a);
    return a;
};

th.objCreateDelayObject=function(delay,base_object){
    var a={};
    if(base_object)a.base=new StgBase(base_object,stg_const.BASE_COPY,1);
    stgAddObject({script:function(){
        if(this.frame>delay) {
            if (!base_object || (base_object && !base_object.remove)) {
                stgAddObject(a);
            }
            stgDeleteSelf();
        }

    }});
    return a;
};

th.objAddSingle=function(obj){
    if(obj.active && !obj.remove){
        return;
    }
    stgAddObject(obj);
};

//render functions

th.spriteCreate=function(x,y,templatename,color,layer){
    var a={};
    stgAddObject(a);
    stgSetPositionA1(a,x,y);
    th.spriteSet(a,templatename,color,layer);
    return a;
};

//set a object to sprite with resource name and color, can also set layer
//combination of NewHyzSpriteObject and hyzChangeSprite
th.spriteSet=function(obj,templatename,color,layer){
    if(!obj.render)obj.render=new StgRender("sprite_shader");
    renderApply2DTemplate(obj.render,templatename,color||0);
    obj.update=1;
    obj.layer=layer?layer:obj.layer;
};

//adds and return a cut-in object, (0,0) (w,0) (w,h) fade out
th.spriteCutInA1=function(x,y,templatename,color,time){
    stgAddObject(new thc.CutInA1(x,y,templatename,color,time));
    return stg_last;
};
tho.animations={};
//create an animation template
th.spriteAnimationCreate=function(animationname){
    tho.animations[animationname]=[];
};
//set a animation frame
//script accept function(object,current_time,frame_time)
th.spriteAnimationSetFrameA1=function(animationname,frameid,templatename,color,time,nextframeid,script){
    var frame=tho.animations[animationname];
    if(!frame)return;
    var a=frame[frameid];
    if(!a){
        a={};
        frame[frameid]=a;
    }
    a.templatename=templatename;
    if(color===undefined || color===null){
        a.color=undefined;
    }else{
        a.color=color;
    }
    a.next=nextframeid;
    a.script=script;
    a.time=time||1;
};
//apply an animation to a object
th.spriteAnimationApply=function(obj,animationname){
    obj._anims=tho.animations[animationname];
    obj._anim=tho._spriteAnimationStatus();
    obj._system=tho._spriteAnimationFunction;
    var a=obj._anim;
    tho._loadSpriteAnimationStatus(obj,a,0);
    th.spriteSet(obj, a.templatename, a.color);
};

//recommended to use in animation script
th.animationSetNextID=function(obj,nextid){
    obj._anim.next=nextid;
};
th.animationSetCurrent=function(obj,currentid,time){
    var a=obj._anim;
    tho._loadSpriteAnimationStatus(obj,a,currentid);
    a.current=time;
    var b=obj._anims[currentid];
    if(b.script)b.script(a);
    th.spriteSet(this, a.templatename, a.color);
};



//player functions
th.playerRestoreFromData=function(player,data){
    if(data.player){
        if(data.player[player.slot||0]){
            miscApplyAttr(player,stg_common_data.player[player.slot||0]);
        }
    }
};
th.playerUseDefault=function(player){
    _StgDefaultPlayer(player);
};
th.player_data=["life","bomb","power","graze","point_bonus","point","pos","score","hiscore"];
th.playerSaveAttribute=function(player,data){
    if(!data.player){
        data.player=[];
    }
    if(!data.player[player.slot||0]){
        data.player[player.slot||0]={};
    }
    var a=data.player[player.slot||0];
    for(var i=0;i<th.player_data.length;i++){
        a[th.player_data[i]]=player[th.player_data[i]];
    }
};
th.playerSetSpeed=function(player,speedfast,speedslow){
    player.move_speed[0]=speedfast;
    player.move_speed[1]=speedslow;
};
th.playerGetSpeed=function(player){
    return player.move_speed;
};



//binds movements from a standard player texture
th.playerBindTexture=function(texturename){
    renderCreate2DTemplateA1(texturename+"_stand",texturename,0,0,32,48,32,0,0,1);
    renderCreate2DTemplateA1(texturename+"_left",texturename,0,48,32,48,32,0,0,1);
    renderCreate2DTemplateA1(texturename+"_right",texturename,0,96,32,48,32,0,0,1);
};
//use playerBindTexture in pre_load
th.playerAnimation=function(player,texturename){
    player._t=player._t||0;
    player._c=player._c||0;
    player._c1=player._c1||0;
    var key=player.key;
    var current_dir=key[stg_const.KEY_LEFT]-key[stg_const.KEY_RIGHT];
    if(current_dir!=(player.last_anime||0)){
        player._t=0;
        player._c=-1;
        player._c1=0;
    }else{
        player._t++;
    }
    //player.render.scale=1;
    var t=player._t;
    if(t%4==0){
        if(current_dir==0) {
            if (!player._c1) {
                player._c += 1;
                if (player._c == 3) {
                    player._c1 = 1;
                }
            } else {
                player._c -= 1;
                if (player._c == 0) {
                    player._c1 = 0;
                }
            }
            th.spriteSet(player, texturename+"_stand", player._c);
        }else if(current_dir==1){
            if (!player._c1) {
                player._c += 1;
                if (player._c == 4) {
                    player._c1 = 1;
                }
            } else {
                player._c -= 1;
                if (player._c == 2) {
                    player._c1 = 0;
                }
            }
            th.spriteSet(player, texturename+"_left", player._c);
        }else{
            if (!player._c1) {
                player._c += 1;
                if (player._c == 4) {
                    player._c1 = 1;
                }
            } else {
                player._c -= 1;
                if (player._c == 2) {
                    player._c1 = 0;
                }
            }
            th.spriteSet(player, texturename+"_right", player._c);
        }
    }
    player.last_anime=current_dir;
};
//add resource to player bag
th.playerAddResource=function(player,resname,count){
    player.content[resname]=count+(player.content[resname]||0);
};


//check and gain resource,returns resource count actually gained
th.playerCheckResourceA1=function(player,resoucename,maxresource){
    if(player.content[resoucename]){
        var a= player[resoucename];
        player[resoucename]+=player.content[resoucename];
        player.content[resoucename]=0;
        if(maxresource&&(player[resoucename]>maxresource))player[resoucename]=maxresource;
        return  player[resoucename]-a;
    }
    return 0;
};
th.playerCheckResourceA2=function(player,resoucename,maxresource,zrate){
    if(player.content[resoucename]/zrate>=1){
        var a= player[resoucename];
        player[resoucename]+=player.content[resoucename]-player.content[resoucename]%zrate;
        player.content[resoucename]=player.content[resoucename]%zrate;
        if(maxresource&&(player[resoucename]>maxresource))player[resoucename]=maxresource;
        return  player[resoucename]-a;
    }
    return 0;
};

th.playerScriptBombCheck=function(player,spellconstructor,invtime){
    if(player.state==stg_const.PLAYER_NORMAL || player.state==stg_const.PLAYER_HIT) {
        if (th.actionKeyDown(player.key,thc.KEY_SPELL)) {
            if (!player.bombing) {
                if (stgPlayerSpell(player, new spellconstructor(player))) {
                    player.invincible = invtime;
                }
            }
        }
    }
};

//key functions
th.keyShot=function(key){return key[stg_const.KEY_SHOT];};
th.keySlow=function(key){return key[stg_const.KEY_SLOW];};
th.keySpell=function(key){return key[stg_const.KEY_SPELL];};

//script function
th.scriptLoadScript=function(src,name){
    if(stg_textures[name])return;
    name=name||src;
    var a=document.createElement("script");
    a.type="text/javascript";
    a.src=src;
    a.onload=function(){a.ready=1};
    stg_textures[name]=a;
    document.body.appendChild(a);
};

//action control function
th.actionCoolDown=function(varname,delay,condition){
    stg_target[varname]=stg_target[varname]||0;
    if(stg_target[varname]>0){
        stg_target[varname]--;
    }else{
        if(condition){
            stg_target[varname]=delay;
            return true;
        }
    }
    return false;
};

th.actionKeyDown=function(key,keyid){
    return key[keyid]&&(!key[keyid+16]);
};
th.actionKeyUp=function(key,keyid){
    return (!key[keyid])&&(key[keyid+16]);
};
th._current_step="_step";
th.actionStepUse=function(varname){
    th._current_step=varname;
};
th.actionStepSet=function(step,varname){
    varname=varname||th._current_step;
    stg_target[varname]=[step,0];
};

th.actionStepSingle=function(step,varname){
    varname=varname||th._current_step;
    if(stg_target[varname][0]==step && stg_target[varname+"_"]!=step){
        stg_target[varname+"_"]=step;
        return true;
    }
    return false;
};

th.actionStep=function(step,varname){
    varname=varname||th._current_step;
    if(stg_target[varname][0]==step){
        stg_target[varname][1]++;
        return stg_target[varname][1];
    }else{
        return 0;
    }
};
th.actionStepTime=function(step,varname){
    varname=varname||th._current_step;
    return stg_target[varname][1]==step;
};
th.actionStepTimeAfter=function(time,varname){
    varname=varname||th._current_step;
    return stg_target[varname][1]>=time;
};
th.actionStepNext=function(varname){
    varname=varname||th._current_step;
    stg_target[varname][0]++;
    stg_target[varname][1]=0;
};

//frame display function
th.frameCreateCanvas=function(name,width,height,x,y,mode){
    var a=stgCreateCanvas(name,width,height,mode);
    if(mode==stg_const.TEX_CANVAS2D||mode==stg_const.TEX_CANVAS3D) {
        ths.canvas[name] = {obj: a, pos: [x, y], s: [width, height]};
        th.objAddSingle(ths);
    }
    return a;
};

th.frameLoadShaders=function(shader_misc,shader_2d,shader_prim_2d,shader_3d){
    stgAddShader("testShader2",shader_misc);
    stgAddShader("sprite_shader",shader_2d);
    stgAddShader("basic_shader",shader_prim_2d);
    stgAddShader("3d_shader", shader_3d);
    return ["testShader2","sprite_shader","basic_shader","3d_shader"];
};

th.frameSetSize=function(width,height,frame_width,frame_height){
    stg_width=width;
    stg_frame_width=width;
    stg_height=height;
    stg_frame_height=height;
    if(frame_width){
        stg_frame_w=frame_width;
        stg_frame_h=frame_height;
    }
};

th.frameShowCanvas=function(name,layer){
    var a=ths.canvas[name];
    stgShowCanvas(name, a.pos[0], a.pos[1], a.s[0], a.s[1],layer);
};

//game function
th.gameSetPlayerCount=function(playercount,local_players,delay){
    stg_players_number=playercount;
    if(playercount==1){
        stg_local_player_pos=0;
        stg_local_player_slot=[0];
    }else{
        if(local_players.length==1){
            stg_local_player_pos=local_players[0];
        }else{
            stg_local_player_pos=0;
        }
        stg_local_player_slot=local_players;
    }
    for(var i=0;i<playercount;i++){
        stg_players[i]={};
        stgApplyPlayer(stg_players[i]);
    }
    stgCreateInput(delay||0);
};

//tho
tho._spriteAnimationStatus=function(){
    var a={current:0,next:0,id:0};
    return a;
};

tho._loadSpriteAnimationStatus=function(obj,status,id){
    var b=obj._anims[id];
    miscApplyAttr(status,b);
};

tho._spriteAnimationFunction=function(){
    var a=this._anim;
    var b=this._anims;
    var c=b[a.id];
    a.current++;
    if(a.current>=a.time){
        a.current=0;
        a.id=a.next;
        c=b[a.id];
        if(c.script){
            c.script(this, a.current, a.time);
        }
        tho._loadSpriteAnimationStatus(this,a, a.id);
        th.spriteSet(this, a.templatename, a.color);
    }else{
        if(c.script){
            c.script(this, a.current, a.time);
        }
    }
};


//thc

thc.Dialog=function(x,y,w,h,fonth,lines){
    var a=this;
    a.layer=90;
    a.render=new StgRender("testShader2");
    miscApplyAttr(a.render,{type:1,x:x,y:y,w:w,h:h,alpha:128,color:"#000"});
    this.fonth=fonth;
    var dy=h-fonth*lines;
    dy=dy/(lines+1);
    this.dy=dy;
    this.lines=lines;
    this.w=(w-dy-dy)/fonth*2;
    this.texts=[];
    for(var i=0;i<lines;i++){
        a=new RenderText(x,y+i*(fonth+dy),"");
        a.setFont("宋体",fonth,"#000","#888");
        this.texts.push(a);
    }
};

thc.Dialog.prototype.setText=function(id,text,color0,color1){
    this.texts[id].setText(text);
    if(color0){
        this.texts[id].render.color=color0;
    }
    if(color1){
        this.texts[id].render.backcolor=color1;
    }
};
thc.Dialog.prototype.setTexts=function(text,color0,color1){
    var rt=strEnter(text,this.w);
    for(var i=0;i<rt.length;i++){
        this.setText(i,rt[i],color0,color1);
    }
};

thc.Dialog.prototype.finalize=function(){
    stgDeleteObjects(this.texts);
};

thc.CutInA1=function(x,y,templatename,color,time){
    this.ignore_super_pause=1;
    time=time||60;
    if(time<40)time=40;
    renderCreateSpriteRender(this);
    renderApply2DTemplate(this.render,templatename,color);
    this.pos=[x,y,0];
    this.time=time;
};
thc.CutInA1.prototype.init=function(){
    this.layer=76;
    renderSetSpriteScale(0.04,0.04,this);
};
thc.CutInA1.prototype.script=function(){
    if(this.frame<=10){
        renderSetSpriteScale(0.4*this.frame/10,0.04,this);
    }else if(this.frame<=20){
        renderSetSpriteScale(0.4,0.4*(this.frame-10)/10,this);
    }else if(this.frame>this.time-20){
        renderSetSpriteColor(255,255,255,255*(1-(this.frame-this.time+20)/20));
        if(this.frame>this.time){
            stgDeleteSelf();
        }
    }
};
thc.ScoreDisplay=function(mode,id){
    this.mode=mode;
    this.i=id;

};
thc.ScoreDisplay.prototype.init=function(){
    var x=440;
    this.hiscore=th.spriteCreate(460,54,"th_ui",0,250);
    this.hvs=[];

    this.score=th.spriteCreate(460,78,"th_ui",1,250);
    this.vs=[];
    this.life=th.spriteCreate(470,140,"th_ui",2,250);
    this.spell=th.spriteCreate(470,170,"th_ui",3,250);
    this.point=th.spriteCreate(470,200,"th_ui",5,250);
    this.ps=[];
    this.graze=th.spriteCreate(470,220,"th_ui",6,250);
    this.gs=[];


};
thc.ScoreDisplay.prototype.script=function(){
    if(this.mode==0)
    {
        var sum0=0;
        var sum1=0;
        var sum2=0;
        var sum3=0;
        var i=0;
        for(i=0;i<stg_players_number;i++){
            sum0+=stg_players[i].hiscore||0;
            sum1+=stg_players[i].score||0;
            sum2+=stg_players[i].point_bonus||0;
            sum3+=stg_players[i].graze||0;
        }
        this.setNumber(620,54,this.hvs,sum0,"th_num_1");
        this.setNumber(620,78,this.vs,sum1,"th_num_2");
        this.setNumber(620,200,this.ps,sum2,"th_num_4");
        this.setNumber(620,220,this.gs,sum3,"th_num_1");
    }
};
thc.ScoreDisplay.prototype.setNumber=function(x,y,arr,number,res){
    var i=0;
    do{
        var p=number%1000;
        if(number>1000){
            p=p+1000;
        }
        var s=""+p;
        var l= s.length;
        while(l>(number>1000?1:0)){
            if(!arr[i]){
                arr[i]=th.spriteCreate(x-i*8,y,res,((+s[l-1])+9)%10,250);
                arr[i].c=+s[l-1];
            }else{
                if(arr[i].c!=+s[l-1]){
                    th.spriteSet(arr[i],res,((+s[l-1])+9)%10,250);
                    arr[i].c=+s[l-1];
                }
            }
            l--;
            i++;
        }
        if(number>1000){
            if(!arr[i]){
                arr[i]=th.spriteCreate(x-i*8,y,res,10,250);
            }
            i++;
        }
        number=Math.floor(number/1000);
    }while(number);
    while(arr[i]){
        stgDeleteObject(arr[i]);
        arr[i]=0;
        i++;
    }
};

(function(){
    for(var i in stg_const){
        thc[i]=stg_const[i];
    }
})();

//static resources
th.pre_load=function(){
    stgCreateImageTexture("th_res","res/thres.png");
    //绑定难度纹理
    renderCreate2DTemplateA1("th_title","th_res",0,0,128,16,0,16,0,1);
    //绑定UI
    renderCreate2DTemplateA1("th_ui","th_res",128,0,64,16,0,16,0,1);
    renderCreate2DTemplateA1("th_num_1","th_res",192,0,12,16,14,0,0,1);
    renderCreate2DTemplateA1("th_num_2","th_res",192,16,12,16,14,0,0,1);
    renderCreate2DTemplateA1("th_num_3","th_res",192,64,12,16,14,0,0,1);
    renderCreate2DTemplateA1("th_num_4","th_res",192,80,12,16,14,0,0,1);

};

//ths

ths.canvas={};

ths.init=function(){
    this.delay_pool=[];
};

ths.script=function(){
    //resize canvas
    var w=document.body.clientWidth;
    var h=document.body.clientHeight;
    var q=w/stg_width>h/stg_height?h/stg_height:w/stg_width;
    if(q!=this.scale || w!=this.w || h!=this.h || this.invalidate){
        this.scale=q;
        this.w=w;
        this.h=h;
        this.invalidate=0;
        for(var n in ths.canvas) {
            stgResizeCanvas(n, (w - q * stg_width) / 2, (h - q * stg_height) / 2, ths.canvas[n].pos[0],ths.canvas[n].pos[1], ths.canvas[n].s[0], ths.canvas[n].s[1], q);
        }
        var z=document.getElementById("1");
        z.style.top=(h-40)+"px";
        z.style.left=((w-q*480)/2)+"px";
        z.style.opacity="0";
    }
};

