/**
 * Created by Exbo on 2015/12/1.
 */

function gSampleMultiplayer(oNextObject){
    stg_mp_ip=[192,168,0,100,3010];
    var a1={};
    var a2={};
    var a3={};
    var a4={};
    var rseed=new Date().getTime();
    a1.init=function(){
        stg_mp_common_data=null;
        stg_mp_pn=0;
        mpConnect();
        g_mitem.render.text="连接中";
        console.log("Connecting to "+_ips(stg_mp_ip));
    };
    a1.script=function(){
        if(stg_mp_status==1){
            console.log("Connect accepted. Local id = #"+stg_mp_id);
            stgAddObject(a2);
            stgDeleteSelf();
            g_mitem.render.text="连接成功";
        }
    };
    a2.init=function(){
        mpSendData({join:1});
        console.log("Joining room 1");
        checkKeyChange();
    };
    a2.script=function(){
        g_mitem.render.text="玩家数："+stg_mp_pn;
        if(stg_mp_pn==2){
            console.log("Game now has 2 players. Starting game");
            stgAddObject(a3);
            stgDeleteSelf();
        }
        if(checkKeyChange().length){
            mpClose();
            default_menu_script.menu1.active=1;
            stgDeleteSelf();
        }
    };
    a3.init=function(){
        if(stg_mp_slot==0){
            mpSendData({start:1});
            console.log("Sending rand seed");
            mpSendCommonData({rseed:rseed});
            stg_mp_common_data={rseed:rseed};
        }else{

        }
    };
    a3.script=function(){
        if(stg_mp_common_data){
            console.log("Received rand seed.");
            rseed=stg_mp_common_data.rseed;
            stg_mp_status=2;
            stg_local_player_pos=stg_mp_slot;
            stg_players_number=2;
            stgCreateInput(3);
            console.log("Input created.");
            stgAddObject(oNextObject);
            stgDeleteSelf();
            stg_rand_seed[0]=+rseed;
            g_mitem.render.text="同步成功！"+stg_mp_pn;
            g_mitem.mtext="切换为单人模式";

        }
    };
    stg_mp_disconnect_object={init:function (){
        console.log("disconnected.");
        stg_players_number=1;
        stg_mp_status=0;
        locker.a=60;
        stg_local_player_pos=0;
        stgCreateInput(0);
        g_mitem.mtext="切换为多人模式";
        stgDeleteSelf();
    }};
    stgAddObject(a1);
}