/**
 * Created by Exbo on 2017/9/15.
 */

//this dummy object shows what should an item be a menu item
var complex_menu_item={
    selectable:true,
    on_select:{},//or function
    highlight:true
};

function PictureMenuItem(resname,color,on_sel){
    this.resname=resname;
    this.rescolor=color;
    this.on_select=on_sel;
    this.script=0;
}

PictureMenuItem.prototype.init=function(){
    th.spriteSet(this,this.resname,this.rescolor,250);
};
PictureMenuItem.prototype._system=function(){
    var x=this.pos[0];
    var y=this.pos[1];
    var sz=[];
    renderGetSpriteSize(sz,this);
    var w=sz[0]/2;
    var h=sz[1]/2;
    var q=this.event_type?stg_system_events:stg_events;
    if(q.click && this.selectable){
        for(var i=0;i<q.click.length;i++){
            if(q.click[i]){
                var cx=q.click[i][0];
                var cy=q.click[i][1];
                if(cx>x-w && cx<x+w && cy>y-h && cy<y+h){
                    if(this.menu){
                        this.menu.selectfunction(this);
                        return;
                    }
                }
            }
        }
    }
};
PictureMenuItem.alpha_script=function(){

};