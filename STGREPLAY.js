/**
 * Created by Exbo on 2015/11/25.
 */

var _replay_common_data=[];
var stg_replay_end=0;
var _replay_event_pool=[];
var _replay_event_pool_header=0;
function replayClear(){
    _replay_common_data=[];
    _replay_pool=[];
    _replay_header=0;
    _replay_event_pool=[];
    _replay_event_pool_header=0;
}

function replayNewLevel(){
    stg_replay_end=0;
    _replay_common_data.push({data:clone(_start_level),header:_replay_header,playern:_start_level[1].length});
}
function replayFinishLevel(oData){
    _replay_common_data[_replay_common_data.length-1].statistic=clone(oData);
}

var _play_replay=0;
var _replay_watchers;
function replayStartLevel(iLevel){
    _play_replay=1;
    stg_in_replay=1;
    _replay_header=_replay_common_data[iLevel].header;
    _replay_watchers=stg_players_number;
    stgStartLevel(_replay_common_data[iLevel].data[0],_replay_common_data[iLevel].data[1],_replay_common_data[iLevel].data[2]);
}

function downloadFile(fileName, content){
    var aLink = document.createElement('a');
    var blob = new Blob(content);
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
    document.body.appendChild(aLink);
    aLink.innerText="点击此处下载Replay ： "+fileName;
    aLink.style.zIndex=30;
    aLink.onclick=function(){
        document.body.removeChild(aLink);
    }
}

function packReplay(){
    var s=JSON.stringify([_replay_common_data,_replay_event_pool]);
    var q= s.length;
    var dq=((q/4>>0)+1)*4-q;
    var k=_packReplayPool();
    var b=new Int8Array(dq);
    var v=new Int32Array([q]);
    var rt=[v,s,b,k];
    return rt;
}

function _unpackReplay(data){
    var v=new Int32Array(data,0,1);
    var q=v[0];
    var dq=((q/4>>0)+1)*4-q;
    var k1=new Uint8Array(data);
    var s="";
    for(var i=0;i<q;i++){
        s=s+String.fromCharCode(k1[4+i]);
    }
    var tmp=JSON.parse(s);
    _replay_common_data=tmp[0];
    _replay_event_pool=tmp[1];
    v=new Int32Array(data,4+q+dq,1);
    var q2=v[0];
    v=new Int16Array(data,8+q+dq);
    var k=_unpackReplayPool(v,q2,_replay_common_data[0].playern);
}

function upload(file) {
    //支持chrome IE10
    if (window.FileReader) {
        //var file = input.files[0];
        if(!file)return;
        var filename = file.name.split(".")[0];
        var reader = new FileReader();
        reader.onload = function() {
            _unpackReplay(this.result);
            console.log("Replay loaded.")
            if(stg_replay_onload)stg_replay_onload();
        };
        reader.readAsArrayBuffer(file);
    }
}

function replay_test(){
    stg_players_number=2;
    _replay_common_data={abc:123,dfg:{d:1},playern:2};
    _replay_pool=[[1,2],[3,4],[5,6]];
    downloadFile("test.txt",packReplay());
}

(function(){
    function dragOver(e){
        e.stopPropagation();
        e.preventDefault();
        e.target.className = (e.type == "dragover" ? "hover" : "");
    }
    function FileSelectHandler(e) {
        dragOver(e);

        var files = e.target.files || e.dataTransfer.files;
        upload(files[0]);

    }
    document.body.addEventListener("dragover", dragOver, false);
    document.body.addEventListener("dragleave", dragOver, false);
    document.body.addEventListener("drop", FileSelectHandler, false);
})();