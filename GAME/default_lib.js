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


TextMenuItem.prototype.script=function(){
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

function MenuHolderA1(vaPos,vaAddPos,oReturn){
    this.menu_pool=[];
    this.select_id=0;
    this.menu_pos=vaPos;
    this.menu_add_pos=vaAddPos;
    this.rolldir=0;
    this.rolllock=0;
    this.menu_return=oReturn;
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
    item.on_select.menu_item=item;
    stgAddObject(item.on_select);
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
        if(k[stg_const.KEY_UP] || k[stg_const.KEY_LEFT]) {
            that.rolldir=-1;
            that.rolllock=60;
            sel--;
            flag0=1;
        }else if(k[stg_const.KEY_DOWN] || k[stg_const.KEY_RIGHT]) {
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
    if(k[stg_const.KEY_SHOT]){
        if(!TextMenuItem.sellock){
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
        }
    }else{
        TextMenuItem.sellock=0;
    }

    if(k[stg_const.KEY_SPELL]){
        if(!TextMenuItem.backlock){

            for(var j in pool){
                stgDeleteObject(pool[j]);
            }
            stgDeleteObject(this);
            TextMenuItem.backlock=1;
            if(that.menu_return)stgAddObject(that.menu_return);
            stgPlaySE("se_cancel");
        }
    }else{
        TextMenuItem.backlock=0;
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


function BossHolder(){

}

BossHolder.prototype.init=function(){

};

BossHolder.prototype.script=function(){

};

function BossLifeBar(boss){
    this.boss=boss;

}

BossLifeBar.prototype.init=function(){

};

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
function renderSetSpriteColor(r,g,b,a,obj) {
    if (!obj)obj = stg_target;
    if (!obj.render)return;
    obj.alpha= a;
    obj.render.color=[r/255.0,g/255.0,b/255.0];
    obj.update=1;
}
function renderCreateSpriteRender(object){
    object=object||stg_target;
    object.render=new StgRender("sprite_shader");
}

function BossBreakCircleSingle(speed1,speed2,speed3){
    speed3=speed3||0.5;
    this.layer=78;
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
