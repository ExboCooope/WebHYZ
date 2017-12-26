/**
 * Created by Exbo on 2015/11/27.
 */

function ButtonHolder(sText,iShow,iSelectable,oOnSelect,iSelectRemove,eventtype){
    this.mtext=sText;
    this.selectable=iSelectable;
    this.on_select=oOnSelect;
    this.select_remove=iSelectRemove;
    this.show=iShow;
    this.render = new StgRender("testShader2");
    miscApplyAttr(this.render,{type:2,x:0,y:0,color:"#A00",text:sText});
    this.layer = 100;
    this.cleaner= new StgObject;
    this.cleaner.render = new StgRender("testShader2");
    miscApplyAttr(this.cleaner.render,{type:0,x:0,y:0,w:200,h:40,color:"#000"});
    this.cleaner.layer = 90;
    this.event_type=eventtype;
    this.cleaner.base={type:stg_const.BASE_COPY,target:this,auto_remove:2};
    this.cleaner.script=function(){
        stg_target.render.w=50+stg_target.base.target.render.text.length*30;
    };
}
ButtonHolder.prototype.init=function(){
    stgAddObject(this.cleaner);
};
ButtonHolder.prototype.script=function(){
    var x=this.pos[0];
    var y=this.pos[1];
    var w=this.render.text.length*30;
    var h=30;
    var q=this.event_type?stg_system_events:stg_events;
    if(q.click){
        for(var i=0;i<q.click.length;i++){
            if(q.click[i]){
                var cx=q.click[i][0];
                var cy=q.click[i][1];
                if(cx>x && cx<x+w && cy>y && cy<y+h){
                    if(this.select_remove){
                        stgDeleteSelf();
                    }
                    stgAddObject(this.on_select);
                }
            }
        }
    }
};


function TextMenuItem(sText,iShow,iSelectable,oOnSelect,iSelectRemove,bEventType){
    this.mtext=sText;
    if(bEventType===undefined)bEventType=1;
    this.event_type=bEventType;
    this.selectable=iSelectable;
    this.on_select=oOnSelect;
    this.select_remove=iSelectRemove;
    this.show=iShow;
    this.render = new StgRender("testShader2");
    miscApplyAttr(this.render,{type:2,x:0,y:0,color:"#A00"});
    this.layer = 100;
    this.cleaner= new StgObject;
    this.cleaner.render = new StgRender("testShader2");
    miscApplyAttr(this.cleaner.render,{type:0,x:0,y:0,w:200,h:40,color:"#000"});
    this.cleaner.layer = 90;
    this.cleaner.base={type:stg_const.BASE_COPY,target:this,auto_remove:2};
    this.cleaner.script=function(){
        stg_target.render.w=50+stg_target.base.target.render.text.length*30;
    };
}


TextMenuItem.prototype._system=function(){
    var x=this.pos[0];
    var y=this.pos[1];
    var w=this.render.text.length*30;
    var h=30;
    var q=this.event_type?stg_system_events:stg_events;
    if(q.click && this.selectable){
        for(var i=0;i<q.click.length;i++){
            if(q.click[i]){
                var cx=q.click[i][0];
                var cy=q.click[i][1];
                if(cx>x && cx<x+w && cy>y && cy<y+h){
                    if(this.menu){
                        this.menu.selectfunction(this);
                        return;
                    }
                }
            }
        }
    }
};
TextMenuItem.sellock=0;
TextMenuItem.backlock=0;


function MenuHolderA1(vaPos,vaAddPos,oReturn,is_submenu){
    this.menu_pool=[];
    this.select_id=0;
    this.menu_pos=vaPos;
    this.menu_add_pos=vaAddPos;
    this.rolldir=0;
    this.rolllock=0;
    this.menu_return=oReturn;
    this.is_sub=is_submenu;
}
MenuHolderA1.prototype.setColor=function(color1,color2){
    if(!color2)color2=color1;
    for(var i=0;i<this.menu_pool.length;i++){
        this.menu_pool[i].render.color=this.menu_pool[i].selectable?color1:color2;
    }
};
MenuHolderA1.prototype.pushItem=function(oMenuItem){
    var i=this.menu_pool.length;
    this.menu_pool.push(oMenuItem);
    var pos=this.menu_pos;
    var posa=this.menu_add_pos;
    if(! oMenuItem.pos) oMenuItem.pos=[];
    oMenuItem.pos[0]=pos[0]+posa[0]*i;
    oMenuItem.pos[1]=pos[1]+posa[1]*i;
    oMenuItem.menu=this;
  //  stgAddObject(oMenuItem.cleaner);
   // stgAddObject(oMenuItem);
};

MenuHolderA1.prototype.pushItems=function(){
    for(var i=0;i<arguments.length;i++){
        this.pushItem(arguments[i]);
    }
};

MenuHolderA1.prototype.init=function(){
    if(this.is_sub){
        this.parent.active=0;
    }
    var that=this;
    var pool=that.menu_pool;

    var sel=that.select_id;
    for(var i=0;i<pool.length;i++) {
        stgAddObject(pool[i].cleaner);
        stgAddObject(pool[i]);
    }
};

MenuHolderA1.prototype.gDeleteMenu=function(){
    var pool=this.menu_pool;
    for(var j in pool){
        stgDeleteObject(pool[j]);
    }
    stgDeleteObject(this);
};

MenuHolderA1.prototype.selectfunction=function(item){
    var pool=this.menu_pool;
    if(item.select_remove){
        for(var j=0;j<pool.length;j++){
            stgDeleteObject(pool[j]);
        }
        stgDeleteObject(this);
    }
    TextMenuItem.sellock=1;

    if(typeof(item.on_select)=="function" ){
        item.on_select(this);
    }else{
        item.on_select.menu_item=item;
        stgAddObject(item.on_select);
    }
    stgPlaySE("se_ok");
};

MenuHolderA1.prototype.script=function(){
    var that=this;
    var pool=that.menu_pool;
    var pos=that.menu_pos;
    var posa=that.menu_add_pos;
    var sel=that.select_id;
    for(var i=0;i<pool.length;i++){
        var a=pool[i];
        var r= a.render;
        a.pos[0]=pos[0]+posa[0]*i;
        a.pos[1]=pos[1]+posa[1]*i;
        a.alpha= a.selectable ? 200:30;
        if(i==sel){
            a.alpha+=55;
            a.render.text="->"+ a.mtext;
        }else{
            a.render.text=a.mtext;
        }
    }

    var k=stg_system_input;
    var flag0=0;
    if(that.rolldir==0){
        if(th.actionKeyDown(k,stg_const.KEY_UP)||th.actionKeyDown(k,stg_const.KEY_LEFT)){//k[stg_const.KEY_UP] || k[stg_const.KEY_LEFT]) {
            that.rolldir=-1;
            that.rolllock=60;
            sel--;
            flag0=1;
        }else if(th.actionKeyDown(k,stg_const.KEY_DOWN)||th.actionKeyDown(k,stg_const.KEY_RIGHT)) {
            that.rolldir=1;
            that.rolllock=60;
            sel++;
            flag0=1;
        }
    }else if(that.rolldir==1){
        if(k[stg_const.KEY_DOWN] || k[stg_const.KEY_RIGHT]) {
            that.rolllock--;
            if(that.rolllock<=0){
                that.rolllock=10;
                sel++;
                flag0=1;
            }

        }else{
            that.rolllock=0;
            that.rolldir=0;
        }
    }else if(that.rolldir==-1){
        if(k[stg_const.KEY_UP] || k[stg_const.KEY_LEFT]) {
            that.rolllock--;
            if(that.rolllock<=0){
                that.rolllock=10;
                sel--;
                flag0=1;
            }
        }else{
            that.rolllock=0;
            that.rolldir=0;
        }
    }
    var pck=0;
    if(flag0)stgPlaySE("se_select");
    sel=(sel+pool.length) %pool.length;
    while(!pool[sel].selectable && pck<pool.length){
        pck++;
        sel=(sel+pool.length+that.rolldir) %pool.length;
    }
    this.select_id=sel;
    //if(k[stg_const.KEY_SHOT]){
       // if(!TextMenuItem.sellock){
    if(th.actionKeyDown(k,stg_const.KEY_SHOT)){
            that.selectfunction(pool[sel]);
            /*
            if(pool[sel].select_remove){
                for(var j in pool){
                    stgDeleteObject(pool[j]);
                }
                stgDeleteObject(this);
            }
            TextMenuItem.sellock=1;
            pool[sel].on_select.menu_item=pool[sel];
            stgAddObject(pool[sel].on_select);
            stgPlaySE("se_ok");
            */
        //}
    }else{
        TextMenuItem.sellock=0;
    }

    if(th.actionKeyDown(k,stg_const.KEY_SPELL)){
        //if(!TextMenuItem.backlock){
            if(that.menu_return==this || !that.menu_return) {
                stgPlaySE("se_cancel");
                return;
            }
            for(var j in pool){
                stgDeleteObject(pool[j]);
            }
            stgDeleteObject(this);
        //    TextMenuItem.backlock=1;
            if(that.menu_return){
                if(this.is_sub){
                    this.parent.active=1;
                }else {
                    stgAddObject(that.menu_return);
                }
            }
            stgPlaySE("se_cancel");
      //  }
    }else{
        TextMenuItem.backlock=0;
    }


};

function MenuHolderA2(vaPos,vaAddPos,oReturn,is_submenu,keygroup){
    this.menu_pool=[];
    this.select_id=0;
    this.menu_pos=vaPos;
    this.menu_add_pos=vaAddPos;
    this.rolldir=0;
    this.rolllock=0;
    this.menu_return=oReturn;
    this.is_sub=is_submenu;
    this.key=keygroup||stg_system_input;
}
MenuHolderA2.prototype.setColor=function(color1,color2){
    if(!color2)color2=color1;
    for(var i=0;i<this.menu_pool.length;i++){
        this.menu_pool[i].render.color=this.menu_pool[i].selectable?color1:color2;
    }
};
MenuHolderA2.prototype.pushItem=function(oMenuItem){
    var i=this.menu_pool.length;
    this.menu_pool.push(oMenuItem);
    var pos=this.menu_pos;
    var posa=this.menu_add_pos;
    if(! oMenuItem.pos) oMenuItem.pos=[];
    oMenuItem.pos[0]=pos[0]+posa[0]*i;
    oMenuItem.pos[1]=pos[1]+posa[1]*i;
    oMenuItem.menu=this;
    //  stgAddObject(oMenuItem.cleaner);
    // stgAddObject(oMenuItem);
};

MenuHolderA2.prototype.pushItems=function(){
    for(var i=0;i<arguments.length;i++){
        this.pushItem(arguments[i]);
    }
};

MenuHolderA2.prototype.init=function(){
    if(this.is_sub){
        this.parent.active=0;
    }
    var that=this;
    var pool=that.menu_pool;

    var sel=that.select_id;
    stgAddObjects(pool);
};

MenuHolderA2.prototype.gDeleteMenu=function(){
    var pool=this.menu_pool;
    for(var j in pool){
        stgDeleteObject(pool[j]);
    }
    stgDeleteObject(this);
};

MenuHolderA2.prototype.selectfunction=function(item){
    var pool=this.menu_pool;
    if(item.select_remove){
        for(var j=0;j<pool.length;j++){
            stgDeleteObject(pool[j]);
        }
        stgDeleteObject(this);
    }
    TextMenuItem.sellock=1;

    if(typeof(item.on_select)=="function" ){
        item.on_select(this);
    }else{
        item.on_select.menu_item=item;
        stgAddObject(item.on_select);
    }
    stgPlaySE("se_ok");
};
MenuHolderA2.prototype.changeSelection=function(item){
    var that=this;
    var pool=that.menu_pool;
    var pos=that.menu_pos;
    var posa=that.menu_add_pos;
    for(var i=0;i<pool.length;i++){
        var a=pool[i];
        var r= a.render;
        a.pos[0]=pos[0]+posa[0]*i;
        a.pos[1]=pos[1]+posa[1]*i;
        a.highlight=false;
        if(item==a){
            that.select_id=i;
            a.highlight=true;
        }
    }
};
MenuHolderA2.prototype._system=function(){
    var that=this;
    var pool=that.menu_pool;
    var sel=that.select_id;
   var k=this.key;
    var flag0=0;
    if(that.rolldir==0){
        if(th.actionKeyDown(k,stg_const.KEY_UP)||th.actionKeyDown(k,stg_const.KEY_LEFT)){//k[stg_const.KEY_UP] || k[stg_const.KEY_LEFT]) {
            that.rolldir=-1;
            that.rolllock=60;
            sel--;
            flag0=1;
        }else if(th.actionKeyDown(k,stg_const.KEY_DOWN)||th.actionKeyDown(k,stg_const.KEY_RIGHT)) {
            that.rolldir=1;
            that.rolllock=60;
            sel++;
            flag0=1;
        }
    }else if(that.rolldir==1){
        if(k[stg_const.KEY_DOWN] || k[stg_const.KEY_RIGHT]) {
            that.rolllock--;
            if(that.rolllock<=0){
                that.rolllock=10;
                sel++;
                flag0=1;
            }

        }else{
            that.rolllock=0;
            that.rolldir=0;
        }
    }else if(that.rolldir==-1){
        if(k[stg_const.KEY_UP] || k[stg_const.KEY_LEFT]) {
            that.rolllock--;
            if(that.rolllock<=0){
                that.rolllock=10;
                sel--;
                flag0=1;
            }
        }else{
            that.rolllock=0;
            that.rolldir=0;
        }
    }
    var pck=0;
    if(flag0)stgPlaySE("se_select");
    sel=(sel+pool.length) %pool.length;
    while(!pool[sel].selectable && pck<pool.length){
        pck++;
        sel=(sel+pool.length+that.rolldir) %pool.length;
    }
   if(this.select_id!=sel){
       this.changeSelection(pool[sel]);
   }

    if(th.actionKeyDown(k,stg_const.KEY_SHOT)) {
        that.selectfunction(pool[sel]);
    }
    if(th.actionKeyDown(k,stg_const.KEY_SPELL)){
        if(that.menu_return==this || !that.menu_return) {
            stgPlaySE("se_cancel");
            return;
        }
        stgDeleteObjects(pool);
        stgDeleteObject(this);
        if(that.menu_return){
            if(this.is_sub){
                this.parent.active=1;
            }else {
                stgAddObject(that.menu_return);
            }
        }
        stgPlaySE("se_cancel");
    }
};




function defaultDrawBackground(sTexName){
    var a1 = new StgObject;
    a1.render = new StgRender("testShader2");
    miscApplyAttr(a1.render, {color:"#A00",type: 3, x: 0, y: 0, w: 640, h: 480, texture: sTexName});
    a1.layer = 0;
    a1.pos = [0, 0, 0];
    a1.rotate = [0, 0, 0];
    var a1t = 2;
    a1.script = function () {
        if (a1t == 0) {
            stgDeleteObject(stg_target);
        }
        a1t--;
    };
    stgAddObject(a1);
}

function defaultShowBGM(sBGMName){
    var a1=new RenderText(35,445);
    a1.render.text="BGM: "+sBGMName;
    a1.render.alpha=0;
    a1.render.color="#000";
    a1.render.backcolor="#888";
    a1.f=0;
    a1.script=function(){
        if(a1.f<=30){
            a1.render.alpha=255*a1.f/30;
        }else if(a1.f>210){
            a1.render.alpha-=2;
            if(a1.render.alpha<=0){
                stgDeleteSelf();
            }
        }
        a1.f++;
    }
}


function IsPC()
{
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
    }
    return flag;
}

function StgGrazer(player_object){
    this.player=player_object;
}
StgGrazer.prototype.init=function(){
    this.render=new StgRender("sprite_shader");
    var c=this;
    c.self_rotate=0.04;
 //   c.base= {target: this.player,type:stg_const.BASE_MOVE};
    renderCreate2DTemplateA1("pan_ding_dian","pl_effect",0,112,64,64,64,0,0,1);
    renderApply2DTemplate(c.render,"pan_ding_dian",0);
    c.layer=stg_const.LAYER_HINT;
    c.alpha=0;
    c.dds=0;
};

StgGrazer.prototype.script=function(){
    var c=this;
    var b=this.player;
    c.pos[0]= b.pos[0];
    c.pos[1]= b.pos[1];
    c.pos[2]= b.pos[2];
    if(b.state==stg_const.PLAYER_HIT||b.state==stg_const.PLAYER_DEAD){
        if(c.dds==0){
            stgPlaySE("se_dead");
            c.dds=1;
        }
    }else{
        c.dds=0;
    }
    if(b.state==stg_const.PLAYER_DEAD){
        b.alpha=0;
    }else{
        this.alpha=b.slow?(stg_target.alpha+40>255?255:stg_target.alpha+40):(stg_target.alpha-16>0?stg_target.alpha-16:0);
        b.alpha=255;
    }
};

function renderSetSpriteBlend(layer,texturename,blendfunc){
    var shader=stg_shaders["sprite_shader"];
    if(!shader.layer_blend)shader.layer_blend=[];
    if(!shader.layer_blend[layer]){
        shader.layer_blend[layer]={};
    }
    if(!texturename){
        shader.layer_blend[layer]={};
    }else {
        shader.layer_blend[layer][texturename] = blendfunc;
    }
}

function renderSetObjectSpriteBlend(object,blendfunc){
    renderSetSpriteBlend(object.layer,object.render.texture,blendfunc);
}

function renderSetSpriteScale(x,y,obj){
    obj=obj||stg_target;
    if(!obj.render)return;
    obj.render.scale[0]=x;
    obj.render.scale[1]=y;
    obj.update=1;
}
function renderSetSpriteSize(x,y,obj){
    obj=obj||stg_target;
    if(!obj.render)return;
    var w=obj.render.uvt[2];
    var h=obj.render.uvt[3];
    if(w<0)w=-w;
    if(h<0)h=-h;
    obj.render.scale[0]=x/w;
    obj.render.scale[1]=y/h;
    obj.update=1;
}

function renderGetSpriteSize(aSize,obj){
    obj=obj||stg_target;
    if(!obj.render)return;
    var w=obj.render.uvt[2]*obj.render.scale[0];
    var h=obj.render.uvt[3]*obj.render.scale[1];
    if(w<0)w=-w;
    if(h<0)h=-h;
    aSize[0]=w;
    aSize[1]=h;
}

function renderSetSpriteColor(r,g,b,a,obj) {
    if (!obj)obj = stg_target;
    if (!obj.render)return;
    obj.alpha= a;
    obj.render.color=[r/255.0,g/255.0,b/255.0];
    obj.update=1;
}
function renderSetSpriteColorRaw(r,g,b,a,obj) {
    if (!obj)obj = stg_target;
    if (!obj.render)return;
    obj.alpha= (a*255)>>0;
    obj.render.color=[r,g,b];
    obj.update=1;
}
function renderCreateSpriteRender(object){
    object=object||stg_target;
    object.render=new StgRender("sprite_shader");
}
function renderCreatePrimitiveRender(object){
    object=object||stg_target;
    object.render=new StgRender("basic_shader");

}

function BossBreakCircleSingle(speed1,speed2,speed3){
    speed3=speed3||0.5;
    this.layer=72;
    renderObjectApply2DTemplate(this,"bcircle",0);
    this.cspeed=speed1;
    this.cspeed3=speed3;
    this.crange=0;
    this._speed=speed2;
    renderSetSpriteScale(0,0,this);
    renderSetObjectSpriteBlend(this,blend_xor1);
}
BossBreakCircleSingle.prototype.script=function(){
    this.crange+=this.cspeed;
    if(this.cspeed<this._speed)this.cspeed+=this.cspeed3;
    var scale=this.crange/128;
    var r=this.crange;
    if(r<stg_frame_h+stg_frame_w) {
        renderSetSpriteScale(scale,scale);
    }else{
        this.finish=1;
        this.script=0;
    }
};

function BreakCircleEffect(countertime){
    this.ct=countertime>>0;
    this.arra=[];
    this.arra[0]=new BossBreakCircleSingle(0,8,1);
    this.arra[1]=new BossBreakCircleSingle(0,6);
    this.arra[2]=new BossBreakCircleSingle(0,6);
    this.arra[3]=new BossBreakCircleSingle(0,6);
    this.arra[4]=new BossBreakCircleSingle(0,6);
    this.arra[5]=new BossBreakCircleSingle(0,8,1);
}
BreakCircleEffect.prototype.script=function(){
    if(this.frame==1){

        stgAddObject(this.arra[0]);
        stgSetPositionA1(this.arra[0],this.pos[0],this.pos[1]);
    }

    if(this.frame==1){
        stgAddObject(this.arra[1]);
        stgSetPositionA1(this.arra[1],this.pos[0]+40,this.pos[1]);
        stgAddObject(this.arra[2]);
        stgSetPositionA1(this.arra[2],this.pos[0],this.pos[1]+40);
        stgAddObject(this.arra[3]);
        stgSetPositionA1(this.arra[3],this.pos[0]-40,this.pos[1]);
        stgAddObject(this.arra[4]);
        stgSetPositionA1(this.arra[4],this.pos[0],this.pos[1]-40);
    }
    if(this.frame==this.ct){
        stgAddObject(this.arra[5]);
        stgSetPositionA1(this.arra[5],this.pos[0],this.pos[1]);
    }
    var cnt=0;
    for(var i=1;i<5;i++){
        if(this.arra[i].finish){
            cnt+=1;
        }
    }
    if(cnt==4){
        stgDeleteObject(this.arra[1]);
        stgDeleteObject(this.arra[2]);
        stgDeleteObject(this.arra[3]);
        stgDeleteObject(this.arra[4]);
    }
    if(this.arra[5].finish){
        stgDeleteObject(this.arra[0]);
        stgDeleteObject(this.arra[5]);
        stgDeleteSelf();
    }
};

function stgPlayerSpell(player,spellobject){
    if(player.bomb<0){
        return false;
    }
    player.bomb--;
    if(player.state==stg_const.PLAYER_HIT){
        player.state=stg_const.PLAYER_NORMAL;
    }
    if(!player.current_spell){
        player.current_spell=[];
    }
    player.current_spell.push(spellobject);
    var t=stg_target;
    stg_target=player;
    stgAddObject(spellobject);
    stg_target=t;
    return true;
}

function playerSpellRefresh(player){
    if(player.current_spell){
        var j=0;
        for(var i=0;i<player.current_spell.length;i++){
            var s=player.current_spell[i];
            if(s.remove){
                //player.current_spell[i]=0;
            }else{
                player.current_spell[j]=player.current_spell[i];
                j++;
            }
        }
        for(;j<i;j++){
            player.current_spell.pop();
        }
    }
    player.bombing=player.current_spell?player.current_spell.length:0;
}

function applyParticle(obj,i){
    var a=obj;
    renderCreateSpriteRender(a);
    renderApply2DTemplate3(a.render,"particle",i);
    a.layer=stg_const.LAYER_HINT-1;
    renderSetObjectSpriteBlend(a,blend_add);
    return a;
}

function GrazeParticle(x,y,dir){
    this.x=x;
    this.y=y;
    this.dir=dir;
}
GrazeParticle.prototype.init=function(){
    stgEnableMove(this);
    stgSetPositionA1(this,this.x,this.y);
    this.move.speed=3;
    this.move.speed_angle=this.dir;
    applyParticle(this,2);
    stgSetRotate(stg_rand(0,360),this);
    renderSetSpriteColor(255,255,255,300,this);
    this.self_rotate=stg_rand(-3,3)*PI180;
};
GrazeParticle.prototype.script=function(){
    var f=(30-this.frame)/30;
    if(f<=0){
        stgDeleteSelf();
    }else {
        renderSetSpriteScale(f, f, this);
    }
};

function UnitAura1(boss,size,r,g,b){
    this.base=new StgBase(boss,stg_const.BASE_COPY,1);
    var a=this;
    renderCreateSpriteRender(a);
    renderApply2DTemplate3(a.render,"particle",0);
    a.layer=stg_const.LAYER_ENEMY-1;
    renderSetObjectSpriteBlend(a,blend_add);
    renderSetSpriteColor(r,g,b,255,this);
    var f=size/32;
    renderSetSpriteScale(f,f,this);
}

function bossCast(boss,time){
    var a={boss:boss,time:time,script:bossCast.script,init:bossCast.init};
    stgAddObject(a);
}

bossCast.init=function(){
    stgPlaySE("se_boss_cast");
};
bossCast.script=function(){
    if(this.frame<this.time){
        this.boss.cast=1;
    }else{
        this.boss.cast=0;
        stgDeleteSelf();
    }
};

function bossCharge(boss,time){
    stgAddObject(new BossCharge(boss,time));
}

function newBossTimeCircle(spell){
    var a=new CircleObject(50,56,-90,270,96);
    a.SetColor(255,255,255,255);
    a.SetTexture("bossres",16,0,31,1280,1);
    a.base=new StgBase(spell,stg_const.BASE_COPY,1);
    a.spell=spell;
    a.layer=stg_const.LAYER_ENEMY+1;
    a.blend=blend_add;
    a.script=newBossTimeCircle.script;
    a.init=newBossTimeCircle.init;
    return a;
}
newBossTimeCircle.init=function(){
    this.max_time=this.spell.time;
};

newBossTimeCircle.script=function(){
    var f=this.spell.frame;
    var z=(f*2)%128;
    var r=(this.max_time-f)/this.max_time*300;
    if(r<0)r=0;
    this.r0=r;
    this.r1=r*1.1;
    var d=r*0.1;
    r=r*2.1*PI;
    r=r/d*16;
    this.SetTexture("bossres",16,z,32,r+z,1);

};

function EnemyBreakParticle(x,y,dir){
    this.x=x;
    this.y=y;
    this.dir=dir;
}
EnemyBreakParticle.prototype.init=function(){
    applyParticle(this,11);
    stgSetRotate(this.dir,this);
    renderSetSpriteColor(255,255,255,300,this);
    renderSetSpriteScale(0.4,0.1,this);
    this.self_rotate=stg_rand(-3,3)*PI180;
};
EnemyBreakParticle.prototype.script=function(){
    var f=(this.frame)/12;
    if(f>1){
        f=(24-(this.frame-12))/24;
        if(f<=0) {
            stgDeleteSelf();
        }else{
            renderSetSpriteColor(255,255,255,300*f)
        }
    }else {
        renderSetSpriteScale(4*f,1*f, this);
    }
};

function stgIsParent(parent,object){
    while(object.parent && object.parent!=object){
        object=object.parent;
        if(object==parent)return true;
    }
}
function stgIsInScreen(pos){
    if(pos.pos)pos=pos.pos;
    return pos[0]>0 && pos[0]<stg_frame_w && pos[1]>0 && pos[1]<stg_frame_h;
}

function stgDeleteSubShot(parent,toitem){
    for(var i=0;i<_pool.length;i++){
        var a=_pool[i];
        if(!a.remove && a.type==stg_const.OBJ_BULLET){
            if(stgIsParent(parent,a)){
                if(toitem) {
                    deleteShotToItem(a);
                }else{
                    stgDeleteObject(a);
                }
            }
        }
    }
}

function stgDeleteSubObjects(parent){
    for(var i=0;i<_pool.length;i++){
        var a=_pool[i];
        if(!a.remove){
            if(stgIsParent(parent,a)){
                stgDeleteObject(a);
            }
        }
    }
}

function stgClipObject(xmin,xmax,ymin,ymax,obj){
    if(!obj.clip){
        obj.clip=[0,0,0,0];
    }
    obj.clip[0]=xmin;
    obj.clip[1]=ymin;
    obj.clip[2]=stg_frame_w-xmax;
    obj.clip[3]=stg_frame_h-ymax;


    /*
    obj=obj||stg_target;
    var x=obj.pos[0];
    var y=obj.pos[1];
    x=x<xmin?xmin:(x>xmax?xmax:x);
    y=y<ymin?ymin:(y>ymax?ymax:y);
    if(!obj.base || !obj.base.mode){
        stgSetPositionA1(obj,x,y);
    }else{
        obj.pos[0]=x;
        obj.pos[1]=y;
    }*/
}

function StraightLaser(l1,l2,head,tail,width,texwidth){
    this._width=width;
    this._texwidth=texwidth;
    this.w=width;
    this.l1=l1;
    this.l2=l2;
    this.head=head;
    this.tail=tail;
    this._invalid=1;
    this.layer=stg_const.LAYER_BULLET-1;
    this.state=0;//0 off 1 half-on 2 on
    this.nextstate=0;
    this.nextframe=0;
    this.framecount=0;
    this.alpha=0;
    this._alpha=0;
    this.type=stg_const.OBJ_BULLET;
    this.slaser=1;
}
StraightLaser.prototype.setWidth=function(w){
    this.w=w;
};
StraightLaser.prototype.init=function(){
    this.vtx=new HyzPrimitive2DVertexList(8);
    this.vtx.setColor(255,255,255,255);
    this.render=new StgRender("basic_shader");
};
StraightLaser.prototype.turnOn=function(time){
    stgPlaySE("se_laser");
    this.nextstate=2;
    this.nextframe=time;
    this.framecount=0;
};
StraightLaser.prototype.turnHalfOn=function(time){
    this.nextstate=1;
    this.nextframe=time;
    this.framecount=0;
};
StraightLaser.prototype.turnOff=function(time){
    this.nextstate=0;
    this.nextframe=time;
    this.framecount=0;
};
StraightLaser.prototype.setTexture=function(textureName,tu1,tu2,tv1,tv2,tv3,tv4,mode){
    var v=this.vtx;
    if(textureName){
        v.setTextureName(textureName);
        this.render.texture=textureName;
    }
    if(!mode) {
        v.setTextureI(0,tu1,tv1,0);
        v.setTextureI(0,tu2,tv1,1);
        v.setTextureI(0,tu1,tv2,2);
        v.setTextureI(0,tu2,tv2,3);
        v.setTextureI(0,tu1,tv3,4);
        v.setTextureI(0,tu2,tv3,5);
        v.setTextureI(0,tu1,tv4,6);
        v.setTextureI(0,tu2,tv4,7);
    }else{
        v.setTextureI(0,tv1,tu1,0);
        v.setTextureI(0,tv1,tu2,1);
        v.setTextureI(0,tv2,tu1,2);
        v.setTextureI(0,tv2,tu2,3);
        v.setTextureI(0,tv3,tu1,4);
        v.setTextureI(0,tv3,tu2,5);
        v.setTextureI(0,tv4,tu1,6);
        v.setTextureI(0,tv4,tu2,7);
    }
    v.update(0,1,0);

};
StraightLaser.prototype._system=function(){
    var x=this.pos[0];
    var y=this.pos[1];
    var r=this.rotate[2];
    var s=sin(r);
    var c=cos(r);
    var w=this.w;
    var a=this.alpha;

    if(this.state!=this.nextstate){
        this.framecount++;

        if(this.framecount>=this.nextframe){
            this.framecount=0;
            this.state=this.nextstate;
        }

    }

    if(this.state==0){
        if(this.nextstate==1) {
            w = this.framecount / this.nextframe * w / 2;
            a = this.framecount / this.nextframe * 128;
        }else if(this.nextstate==2){
            w = this.framecount / this.nextframe * w;
            a = this.framecount / this.nextframe * 256;
        }else{
            w=0;
            a=0;
        }
    }else if(this.state==1){
        if(this.nextstate==0) {
            w = (1-this.framecount / this.nextframe) * w / 2;
            a = (1-this.framecount / this.nextframe) * 128;
        }else if(this.nextstate==2){
            w = this.framecount / this.nextframe * w /2 + w/2;
            a = this.framecount / this.nextframe * 128+128;
        }else{
            w=w/2;
            a=128;
        }
    }else if(this.state==2){
        if(this.nextstate==0) {
            w = (1-this.framecount / this.nextframe) * w;
            a = (1-this.framecount / this.nextframe) * 256;
        }else if(this.nextstate==1){
            w = (1-this.framecount / this.nextframe) * w /2 + w/2;
            a = (1-this.framecount / this.nextframe) * 128+ 128;
        }else{
            w=w;
            a=256;
        }
    }

    var tw=this._width?w*(this._texwidth/this._width):0;
    tw=tw/2;

    var v=this.vtx;
    var l=this.l1-this.tail;
    v.setPositionI(x+l*c-tw*s,y+l*s+tw*c,0);
    v.setPositionI(x+l*c+tw*s,y+l*s-tw*c,1);
    l=this.l1;
    v.setPositionI(x+l*c-tw*s,y+l*s+tw*c,2);
    v.setPositionI(x+l*c+tw*s,y+l*s-tw*c,3);
    l=this.l2;
    v.setPositionI(x+l*c-tw*s,y+l*s+tw*c,4);
    v.setPositionI(x+l*c+tw*s,y+l*s-tw*c,5);
    l=this.l2+this.head;
    v.setPositionI(x+l*c-tw*s,y+l*s+tw*c,6);
    v.setPositionI(x+l*c+tw*s,y+l*s-tw*c,7);
    v.update(1,0,0);
    this.alpha=a;
    if(a!=this._alpha){
        this._alpha=a;
        v.setColor(255,255,255,a);
    }
    if(this.state==2 && this.nextstate==2){
        if(!this.hitdef){
            this.hitdef=new StgHitDef();
        }
        var l1=this.l2;
        var l2=this.l1;
        if(l1<l2){
            l1=this.l1;
            l2=this.l2;
        }
        this.hitdef.setLaserA1(0,0,0,w/2,l2,w/2,l1);
    }else{
        if(!this.aihitdef){
            this.aihitdef={type:stg_const.OBJ_ENEMY,hitdef:new StgHitDef(),side:this.side,sid:this.sid};
        }

        if(this.nextstate==2){
            var l1=this.l2;
            var l2=this.l1;
            if(l1<l2){
                l1=this.l1;
                l2=this.l2;
            }
            this.aihitdef.hitdef.setLaserA1(0,0,0,w/2,l2,w/2,l1);
            this.aihitdef.hitdef.update(this);
            aiAddWarning(this.aihitdef);
        }
        delete this.hitdef;
    }
};
StraightLaser.prototype.on_render=function(gl){
    if(!this.alpha)return;
    if(this.blend){
        this.blend();
    }
    this.vtx.use();
    hyzSetPrimitiveOffset(0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,8);
    if(this.blend){
        blend_default();
    }
};
StraightLaser.prototype.finalize=function(){
    this.vtx.clear();
};
function shotSE(){
    stgPlaySE("se_shot0");
}
function smallSE(){
    stgPlaySE("se_kira02");
}