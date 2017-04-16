/**
 * Created by Exbo on 2015/11/19.
 * 和输入有关的函数
 */
var _key_pool=[];
var _key_map=[stg_const.KEY_MAP,stg_const.KEY_MAP2];
var _key_snapshot=[[],[]];
var stg_full_screen_key=70;
var _o_width;
var _o_height;
var _last_full_screen;
var stg_main_canvas=null;


var stg_events={};
var stg_system_events={};
var _stg_events={};

function _stgCommitEvent(eventslot,playerid,content,system){
    if(system==undefined)system=3;

    if(system%2){
        if(!stg_events[eventslot])stg_events[eventslot]=[];
        stg_events[eventslot][playerid]=content;
    }
    if(system>>1){
        if(!stg_system_events[eventslot])stg_system_events[eventslot]=[];
        stg_system_events[eventslot][playerid]=content;
    }
}
function _stgCommitEventFunction(eventslot,playerid,content){
    if(!_stg_events[eventslot])_stg_events[eventslot]=[];
    _stg_events[eventslot][playerid]=content;
}

function _keyDownEvent(event){
    _key_pool[event.keyCode]=1;
    if(event.keyCode==stg_full_screen_key){
        document.body.webkitRequestFullScreen();
    }
}
function _clickEvent(event){
    var x=(event.layerX/this.width*stg_width)>>0;
    var y=(event.layerY/this.height*stg_height)>>0;
    _stgCommitEventFunction("click",stg_local_player_pos,[x,y]);
}
function stgEnableMouse(){
    if(stg_main_canvas){
        stg_main_canvas.onclick=_clickEvent;
    }
}
function stgDisableMouse(){
    if(stg_main_canvas){
        stg_main_canvas.onclick=null;
    }
}
function _keyUpEvent(event){
    _key_pool[event.keyCode]=0;
}

document.body.onkeydown=_keyDownEvent;
document.body.onkeyup=_keyUpEvent;

function snapshotInput(){
    _gamepad();
    for(var plr=0;plr<2;plr++) {
        for (var i = 0; i < 16; i++) {
            _key_snapshot[plr][i] = 0;
            if (_key_map[plr][i])
                for (var j = 0; j < _key_map[plr][i].length; j++) {
                    if (_key_pool[_key_map[plr][i][j]])_key_snapshot[plr][i] = 1;
                }
        }
    }
}

var _gamepad_sector=window.localStorage.getItem("gamepad");
if(!_gamepad_sector){
    _gamepad_sector={
        header:1000,
        pads:{}
    };
}else{
    _gamepad_sector=JSON.parse(_gamepad_sector);
    console.log("Gamepads Loaded.");
}
function _savegamepad(){
    window.localStorage.setItem("gamepad",JSON.stringify(_gamepad_sector));
    console.log("New Gamepad Saved.");
}

function stgSaveData(area,data){
    window.localStorage.setItem(area,JSON.stringify(data));
}
function stgLoadData(area){
   return JSON.parse(window.localStorage.getItem(area));
}

function _gamepad(){
    if(!navigator.getGamepads)return;
    var j;
    var a=navigator.getGamepads();
    if(!a)return;
    for(var i=0;i< a.length;i++){
        if(a[i]){
            var t=_gamepad_sector.pads[a[i].id];
            var t2=a[i].buttons.length;
            var t3=a[i].axes.length
            if(!t){
                t=_gamepad_sector.header;
                _gamepad_sector.pads[a[i].id]=_gamepad_sector.header;
                _gamepad_sector.header+=t3*2+t2;
                _savegamepad();
            }else{
                for(j=0;j<t2;j++){
                    _key_pool[t+j]= a[i].buttons[j].value;
                }
                for(j=0;j<t3;j++){
                    _key_pool[t+j+t2]= ((a[i].axes[j]>0.5)?1:0);
                }
                for(j=0;j<t3;j++){
                    _key_pool[t+j+t2+t3]= ((a[i].axes[j]<-0.5)?1:0);
                }
            }
        }
    }
}
var _last_key=[];
function checkKeyChange(){
    var k=[];
    for(var i=0;i<_key_pool.length;i++){
        if(_key_pool[i]===undefined){

        }else{
            if(_key_pool[i]!=_last_key[i]){
                if(_key_pool[i]==1) {
                    k.push(i);
                }
                _last_key[i]=_key_pool[i];
            }
        }
    }
    return k;
}

var _key_latency=2;
var _key_latency_pool=[];
var _key_bottom=0;//将获取的输入位置
var _key_sync_pool=[];
var _key_sync_ready=[];
var _key_sync_id_head=3;//将发送的sync号
var _key_sync_id_bottom=0;//将获取的sync号
var _event_latency_pool=[];

function stgCreateInput(iInputDelay){
    _stg_no_input=false;
    _key_latency=iInputDelay;
    _key_latency_pool=[];
    _key_sync_pool=[];
    _key_sync_ready=[];
    _key_sync_id_head=_key_latency;
    _key_bottom=0;
    for(var i=0;i<=_key_latency*3+1;i++){
        _key_latency_pool[i]=[];
        _event_latency_pool[i]=null;
        for(var j=0;j<stg_players_number;j++){
            _key_latency_pool[i][j]=0;
        }
        _key_sync_pool[i]=i;
        _key_sync_ready[i]=0;
    }
    for(var i=0;i<=_key_latency-1;i++) {
        _key_sync_ready[i]=5;
    }
    for(var i=0;i<_key_latency-1;i++){
        _key_sync_ready[i]=stg_players_number;
    }
}

var stg_local_player_slot=[0,1];

function  _stgMainLoop_SendInput(){
    snapshotInput();
   // if(!stg_in_replay){
    for(var i=0;i<stg_local_player_slot.length;i++) {
        var plr=stg_local_player_slot[i];
        var t = _packInput(_key_snapshot[i]);
        var te = _stg_events;
        _stg_events = {};
        var th = _key_sync_pool[_key_sync_id_head];
        _sendInput(_key_sync_id_head, t,plr);
        _receiveInput(plr, th, t, te);

    }
    _key_sync_id_head++;
    _key_sync_id_head = _key_sync_id_head % _key_latency_pool.length;
    _key_sync_pool[_key_sync_id_head] = th + 1;
        //_key_sync_ready[_key_sync_id_head]-=stg_players_number;
  //  }else{

   // }
}

function _stgMainLoop_GetInput(){
    var flag=0;
    _stg_save_input=(stg_game_state==stg_const.GAME_RUNNING)?1:0;
    if(stg_ignore_input)_stg_save_input=0;

    if(!stg_in_replay){
        var t=0;
        if(_key_sync_ready[_key_bottom]>=stg_players_number){
            _key_sync_ready[_key_bottom]=0;

            stg_events=_event_latency_pool[_key_bottom];
            stg_system_events=_event_latency_pool[_key_bottom];
            _event_latency_pool[_key_bottom]=null;

            if(_stg_save_input){
                _replay_pool[_replay_header]=[];
            }
            for (var i = 0; i < stg_players_number; i++) {
                if(!stg_players[i])stg_players[i]={};
                stg_players[i].key=_unpackInput(_key_latency_pool[_key_bottom][i]);
                t=t|_key_latency_pool[_key_bottom][i];

                if(_stg_save_input){
                    _replay_pool[_replay_header][i]=_key_latency_pool[_key_bottom][i];
                }
            }
            if(stg_players_number==0){
                stg_system_input=_key_snapshot;
            }else {
                stg_system_input = _unpackInput(t);
            }
            var th=_key_sync_pool[(_key_bottom-1+_key_latency_pool.length)%_key_latency_pool.length];
            _key_sync_pool[_key_bottom]=th+1;
            _key_bottom=(_key_bottom+1)%_key_latency_pool.length;

            flag=1;
            if(_stg_save_input) {
                for (var ev in stg_events) {
                    if (stg_events.hasOwnProperty(ev)) {
                        for (var evi = 0; evi < stg_events[ev].length; evi++) {
                            if (stg_events[ev][evi]) {
                                _replay_event_pool.push([_replay_header, ev, evi, stg_events[ev][evi]]);
                            }
                        }
                    }
                }
            }

            if(_stg_save_input){
               _replay_header++;
            }
        }else{

        }
    }else {
        var t=0;
        if(_key_sync_ready[_key_bottom]>=_replay_watchers){
            _key_sync_ready[_key_bottom]=0;
            stg_system_events=_event_latency_pool[_key_bottom];
            _event_latency_pool[_key_bottom]=null;
            for (var i = 0; i < _replay_watchers; i++) {
                t=t|_key_latency_pool[_key_bottom][i];
            }
            if(_replay_watchers==0){
                stg_system_input=_key_snapshot;
            }else {
                stg_system_input = _unpackInput(t);
            }
            var th=_key_sync_pool[(_key_bottom-1+_key_latency_pool.length)%_key_latency_pool.length];
            _key_sync_pool[_key_bottom]=th+1;
            _key_bottom=(_key_bottom+1)%_key_latency_pool.length;
            flag=1;
            if(_stg_save_input) {
                for (var k = 0; k < stg_players_number; k++) {
                    if (!stg_players[k])stg_players[k] = {};
                    stg_players[k].key = _unpackInput(_replay_pool[_replay_header][k]);
                }

                stg_events={};
                var evt=_replay_event_pool[_replay_event_pool_header];
                while(evt && evt[0]==_replay_header){
                    _stgCommitEvent(evt[1],evt[2],evt[3],1);
                    _replay_event_pool_header++;
                    evt=_replay_event_pool[_replay_event_pool_header];
                }


                _replay_header++;
                if (_replay_header >= _replay_pool.length) {
                    stg_replay_end = 1;
                    stg_in_replay = 0;
                    stg_players_number=_replay_watchers;
                }
            }else{

            }
        }else{

        }

    }

    return flag;
}

function stgSaveKeyMap(){
    window.localStorage.setItem("keymap",JSON.stringify(_key_map));
}
function stgLoadKeyMap(){
    var t=window.localStorage.getItem("keymap");
    //t=0;
    if(!t || t.length!=2){
        _key_map=[clone(stg_const.KEY_MAP),clone(stg_const.KEY_MAP2)];
    }else{
        _key_map=JSON.parse(t);
    }
}

function stgResetKeyMap(){
    _key_map=clone(stg_const.KEY_MAP);
}

function _sendInput(iSync,iInput,iSlot){
    if(stg_mp_status!=2)return;
    var th=_key_sync_pool[iSync];
   // console.log("Sending input sync ="+th);
    mpSendData({ipt:1,code:iInput,slt:iSlot,sync:th});
}

function _receiveInput(iPlayerSlot,iSync,iInput,oEvent){
    var i;
    var j;
    i=_key_bottom;
    j=0;
    while(j<_key_latency_pool.length){
        if(_key_sync_pool[i]==iSync){
           // console.log("Recv : ",iSync," slot ",iPlayerSlot," ",_key_sync_ready[i]+1);
            _key_sync_ready[i]++;
            _key_latency_pool[i][iPlayerSlot]=iInput;
            if(oEvent){
                _event_latency_pool[i]=oEvent;
            }
            break;
        }
        i++;
        i=i%_key_latency_pool.length;
        j++;
    }
    if(j==_key_latency_pool.length){
      //  console.log(_key_sync_ready,_key_sync_pool,iSync,_key_bottom,_key_sync_id_head);
    }
}

function _receiveAllInput(iSync,iInput){
    var i;
    var j;
    i=_key_bottom;
    j=0;
    while(j<_key_latency_pool.length){
        if(_key_sync_pool[i]==iSync){
            _key_sync_ready[i]=_key_latency_pool.length;
            _key_latency_pool[i]=iInput;
            break;
        }
        i++;
        i=i%_key_latency_pool.length;
        j++;
    }
}

function _packInput(vaInput){
    var t=0;
    for(var i=15;i>=0;i--){
        t=(t<<1)+(vaInput[i]||0);
    }
    return t;
}

function _unpackInput(t){
    var ipt=[];
    for(var i=0;i<16;i++){
        ipt[i]=(t%2);
        t=t>>1;
    }
    return ipt;
}

var _replay_pool=[];
var _replay_header=0;

function _packReplayPool(){
    var d=new ArrayBuffer(stg_players_number*_replay_pool.length*2+4)
    var a=new Int16Array(d);
    for(var i=0;i<_replay_pool.length;i++){
        a.set(_replay_pool[i],i*stg_players_number+2);
    }
    var c=new Int32Array(d,0,1);
    c[0]=_replay_pool.length;
    return d;
}

function _unpackReplayPool(d,r0,pb){
    var a=new Int16Array(d);
    for(var i=0;i<r0;i++){
        _replay_pool[i]=[];
        for(var j=0;j<pb;j++){
            _replay_pool[i].push(a[i*pb+j]);
        }
    }
    return d;
}
