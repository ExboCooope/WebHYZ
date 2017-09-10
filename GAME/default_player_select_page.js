/**
 * Created by Exbo on 2017/8/21.
 */

var player_select_page={};
player_select_page.next=0;
player_select_page.last=0;

player_select_page.init=function(){
    var x=stg_frame_width/4;
    var y=40;
    var player_select_text=new RenderText(0,0,"请选择玩家：");
    stgSetPositionA1(stg_last,x,y);
    player_select_text.setFont("黑体",32,"#000");
    this.items=[];
    if(stg_players_number<=1){
        x+=32;
    }else{
        x+=32*stg_players_number;
    }
    y+=36;
    for(var i in stg_player_templates){
        var name_obj=new RenderText(0,0,i);
        name_obj.txt=i;
        stgSetPositionA1(stg_last,x,y);
        name_obj.setFont("黑体",24,"#000");
        this.items.push(name_obj);
        y+=28;
    }
    for(var j=0;j<(stg_players_number||1);j++){
        stgAddObject(new Player_select_single(j));
    }
};

player_select_page.script=function(){
    var ok=true;

    for(var i=0;i<stg_players_number;i++){
        if(!stg_common_data["player"+i]){
            ok=false;
        }else{
            var a=stg_common_data["player"+i];
            a.name=this.items[a.id].txt;
        }
    }
    if(stg_common_data.ready){
        if(!this.last_ok && stg_system_input[stg_const.KEY_SHOT]) {
            stgDeleteSubObjects(this);
            stgPlaySE("se_ok");
            stgAddObject(this.next);
        }
    }
    if(ok){
        stg_common_data.ready=1;
    }else{
        stg_common_data.ready=0;
    }
    this.last_ok=stg_system_input[stg_const.KEY_SHOT];
};

player_select_page.finalize=function(){
};


function Player_select_single(id){
    this.id=id;
    this.key=stg_players[id].key;
    this.pool=player_select_page.items;
    this.current_id=stgLoadData("player"+id)||0;
    this.text=new RenderText(0,0,(id+1)+"P>");
    stgSetPositionA1(stg_last,this.pool[this.current_id].pos[0]-32*(id+1),this.pool[this.current_id].pos[1]);
    this.text.setFont("黑体",24,Player_select_single.colors[id]);
    this.keylock=1;
    this.oklock=0;
    this.movelock=0;
}
Player_select_single.colors=["#F00","#00F"];
Player_select_single.prototype.script=function(){
    var key=stg_players[this.id].key;
    if(this.keylock){
        if(!key[stg_const.KEY_SHOT]){
            this.keylock=0;
        }
    }else{
        if(key[stg_const.KEY_SHOT]){
            stg_common_data["player"+this.id]={id:this.current_id};
            if(!this.oklock)stgPlaySE("se_ok");
            this.oklock=1;
        }
    }

    if(this.oklock==1){
        if(key[stg_const.KEY_SPELL]){
            this.oklock=0;
            this.keylock=1;
            stg_common_data["player"+this.id]=0;
            stgPlaySE("se_cancel");
        }
    }else{
        var p=key[stg_const.KEY_DOWN]+key[stg_const.KEY_RIGHT]-key[stg_const.KEY_UP]-key[stg_const.KEY_LEFT];
        if(this.movelock){
            this.movelock--;
            if(!p){
                this.movelock=0;
            }
        }else{
            if(p){
                this.current_id=(this.current_id+this.pool.length+p)%this.pool.length;
                stgSetPositionA1(this.text,this.pool[this.current_id].pos[0]-32*(this.id+1),this.pool[this.current_id].pos[1]);
                this.movelock=24;
            }
        }
    }
};