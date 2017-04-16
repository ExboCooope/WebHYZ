/**
 * Created by Exbo on 2015/12/1.
 */

var stg_mp_ip=[];
var stg_mp_id=-1;
var stg_mp_slot=-1;
var stg_mp_pn=0;
var stg_mp_status=0;

var _mp_enabled=(!!WebSocket);
var _mp_socket=null;
var stg_mp_local_ping;
var stg_mp_remote_ping;
var stg_mp_common_data=null;

var stg_mp_disconnect_object=null;

function _ips(ip){
    return ""+ip[0]+"."+ip[1]+"."+ip[2]+"."+ip[3]+":"+ip[4];
}

function mpConnect(){
    if(_mp_socket)_mp_socket.close();
    _mp_socket=new WebSocket("ws://"+_ips(stg_mp_ip));
    stg_mp_status=0;
    stg_mp_common_data=null;
    _mp_socket.onopen = function (){
        _mp_socket.send("JAVASTAGE");

    };
    _mp_socket.onmessage=function(e){
        var r= JSON.parse(e.data);
       // console.log("Socket In:",r);
        if(!(r.sid===undefined)){
            stg_mp_id=r.sid;
            stg_mp_status=1;
        }else if(r.ipta){
            _receiveAllInput(r.sync, r.code);
        }else if(r.ipt){
            _receiveInput(r.slt, r.sync, r.code);
        }else if(r.pin){
            var t=new Date().getTime();
            stg_mp_local_ping=t-_mp_socket.t;
            _mp_socket.send(JSON.stringify({pina:1,pint:stg_mp_local_ping}));
        }else if(r.rpin){
            stg_mp_remote_ping= r.rpin;
        }else if(r.cdat){

            stg_mp_common_data=r.cdat;
        }else if(r.jin){
            console.log("#"+r.pid+" joined slot "+r.slt);
            if(r.pid==stg_mp_id)stg_mp_slot= r.slt;
            if(r.slt+1>stg_mp_pn)stg_mp_pn=r.slt+1;
        }
    }
    _mp_socket.onclose=function(){
        stgAddObject(stg_mp_disconnect_object);
    }
}

function mpSendCommonData(data){
    //console.log("Socket Out:",{cdat:data});
    if(_mp_socket)_mp_socket.send(JSON.stringify({cdat:data}));
}

function mpSendData(data){
    //console.log("Socket Out:",data);
    if(_mp_socket)_mp_socket.send(JSON.stringify(data));
}

function mpPing(){
    if(_mp_socket){
        _mp_socket.t=new Date().getTime();
        _mp_socket.send(JSON.stringify({pin:1}));
    }
}

function mpClose(){
    if(_mp_socket){
        _mp_socket.close();
        _mp_socket=null;
        stg_mp_status=0;
    }

}