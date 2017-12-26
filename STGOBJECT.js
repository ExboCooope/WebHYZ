/**
 * Created by Exbo on 2017/10/19.
 */

function _stgCoreApplyObject(a,b){
    b.pos= a.pos||[0,0,0];
    b.rotate= a.rotate||[0,0,0];
    b.move= a.move||null;
    b.on_move=a.on_move||null;
    b.after_move= a.after_move||null;
    b.opos= a.opos||null;
    b.base= a.base||null;
    b.look_at= a.look_at||null;
    b.self_rotate= a.self_rotate||null;
    b.orotate= a.orotate||null;
    b.ignore_hit= a.ignore_hit||null;
    b.hitby= a.hitby||null;
    b.hitdef= a.hitdef||null;
    b.invincible= a.invincible||0;
    b.fade_remove= a.fade_remove||null;
    b.keep= a.keep||0;
    b.hit_by_list=a.hit_by_list||null;
    b.hit_list=a.hit_list||null;
    b.clip= a.clip||null;
    b.type= a.type||0;
    b.frame= a.frame||0;
    b.lua= a.lua||0;
    b.side= a.side||0;
    b.sid= a.sid||0;
    b.move_rotate= a.move_rotate||0;
    b.state= a.state||0;
    b.resolve_move= a.resolve_move||0;
 //   b.render= a.render||0;
 //   b.layer= a.layer||0;
}

function StgCore(base){
    _stgCoreApplyObject(base,this);
    this._obj=base;
    base.core=this;
    StgCore.processObj(base);
}

StgCore.setters={};
StgCore.getters={};
StgCore.attrs=["pos","rotate","move","on_move","after_move","opos","base","look_at","self_rotate"
,"orotate","ignore_hit","hitby","hitdef","invincible","fade_remove","keep","hit_by_list","hit_list","clip"
    ,"type","frame","lua","side","move_rotate","state","resolve_move","sid"];

StgCore.createProxy=function(obj,attr){
    if(!StgCore.getters[attr]){
        StgCore.getters[attr]=function(){
            return this.core[attr];
        };
        StgCore.setters[attr]=function(a){
            return this.core[attr]=a;
        }
    }
    obj.__defineGetter__(attr,StgCore.getters[attr]);
    obj.__defineSetter__(attr,StgCore.setters[attr]);
};

StgCore.processObj=function(obj){
    for(var i=0;i<StgCore.attrs.length;i++){
        this.createProxy(obj,StgCore.attrs[i]);
        delete obj[i];
    }
};