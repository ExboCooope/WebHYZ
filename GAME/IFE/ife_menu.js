/**
 * Created by Exbo on 2016/4/13.
 */

function ifeGenerateMenu(){
    var that=ife;

    that.main_menu=new MenuHolderA1([100,100],[0,50],ife_loader);
    that.setting=new MenuHolderA1([100,100],[0,50],that.main_menu);
    that.game_select_menu=new MenuHolderA1([100,100],[0,50],that.main_menu);
    that.avoid_menu=new MenuHolderA1([100,100],[0,25],that.main_menu);

    that.item_start=new TextMenuItem("选择关卡",1,1,null,1);
    that.item_avoid=new TextMenuItem("弹幕回避能力测试",1,1,null,1);
    that.item_benchmark=new TextMenuItem("性能测试",1,1,null,1);
    that.item_settings=new TextMenuItem("设置",1,1,that.setting,1);
    that.item_help=new TextMenuItem("操作说明",1,1,that.setting,1);
    that.item_playreplay=new TextMenuItem("回放",1,0,null,1);
    that.item_savereplay=new TextMenuItem("保存回放",1,0,null,0);


    for(var i in stg_level_templates){
        if(stg_level_templates.hasOwnProperty(i)) {
            (function () {
                var j = i;
                that["item_level_" + i] = new TextMenuItem(i, 1, 1, {init: function () {
                    ife.startGame(j,"siki");
                }}, 1);
                that.game_select_menu.pushItem(that["item_level_" + i]);
            })();
        }
    }
    that.game_select_back=new TextMenuItem("返回",1,1,that.main_menu,1);
    that.game_select_menu.pushItem(that.game_select_back);

    that.main_menu.pushItems(that.item_start,that.item_avoid,that.item_benchmark,that.item_settings,that.item_help,that.item_playreplay,that.item_savereplay);
    gLoadMenuSystem();

    that.main_menu.setColor("#88F","#880");

    that.item_benchmark.on_select={
        init:function(){ife.startGame("ife_pressure_test","siki");}
    };
   // that.item_avoid.on_select={
   //     init:function(){ife.startGame("stg_avoid_test","siki");}
    //};
    that.item_avoid.on_select=that.avoid_menu;
   // that.item_start.on_select={
   //     init:function(){ife.startGame("ife_stage_1","siki");}
   // };
    that.item_start.on_select=that.game_select_menu;

    that.item_playreplay.on_select={
        init:function(){replayStartLevel(0);}
    };

    that.item_savereplay.on_select={
        init:function(){
            var a=new Date();
            var b= _replay_common_data[0].data[0]+""+ a.toJSON();
            that.item_savereplay.selectable=false;
            downloadFile(b+".rpy",packReplay());
            stgDeleteSelf();
        }
    };



    that.setting_vsync=new TextMenuItem("垂直同步",1,1,{init:function(){
        stg_refresher_type=1-stg_refresher_type;
        that.setting_refresh();
        stgDeleteSelf();
    }},0);
    that.setting_wgl=new TextMenuItem("渲染方式(需刷新)",1,1,{init:function(){
        var p=stgLoadData("render_type");
        if(!p)p=0;
        stgSaveData("render_type",1-p);
        that.setting_refresh();
        stgDeleteSelf();
    }},0);
    that.setting_rs=new TextMenuItem("画布大小",1,1,{init:function(){
        ife.fixed=!ife.fixed;
        that.setting_refresh();
        stgDeleteSelf();
    }},0);
    that.setting_return=new TextMenuItem("返回",1,1,that.main_menu,1);

    that.setting_refresh=function(){
        that.setting_vsync.mtext="垂直同步："+(stg_refresher_type?"关闭":"开启");
        var p=stgLoadData("render_type");
        that.setting_wgl.mtext="渲染方式(需刷新)："+(p?"Canvas2D":"WebGL");
        that.setting_rs.mtext="画布大小："+(ife.fixed?"固定":"全屏");
    };
    that.setting_refresh();
    that.setting.pushItems( that.setting_vsync, that.setting_wgl,that.setting_rs,that.setting_return);
    that.setting.setColor("#88F","#880");

    that.avoid_menu_item=[];
    that.avoid_levels=[];
    that.avoid_menu_start=new TextMenuItem("开始测试",1,1,null,0);
    that.avoid_menu_start.on_select={
        init:function(){
            var c={phases:[]};
            for(var j=0;j<avoidname.length;j++){
                if(that.avoid_levels[j]){
                    c.phases.push(j)
                }
            }
            c.rank=that.avoid_rank.r;
            if(c.phases.length==0){
                stgDeleteSelf();
            }else{
                ife.startGame("stg_avoid_test","siki",c);
            }
        }
    };
    that.avoid_menu.pushItem(that.avoid_menu_start);

    for(i=0;i<avoidname.length;i++){

        that.avoid_menu_item[i]=new TextMenuItem("  "+avoidname[i],1,1,{i:i,init:function(){
            that.avoid_levels[this.i]=!that.avoid_levels[this.i];
            that.avoid_refresh();
            stgDeleteSelf();
        }},0);
        that.avoid_menu.pushItem(that.avoid_menu_item[i]);

    }
    that.avoid_menu.pushItem(new TextMenuItem("全选",1,1,{init:function(){
        for(var i=0;i<avoidname.length;i++) {
            that.avoid_levels[i] = true;
        }
        stgDeleteSelf();
        that.avoid_refresh();
    }},0));
    that.avoid_history=new TextMenuItem("历史成绩",1,1,{init:function(){
        stgDeleteSelf();
    }},0);
    that.avoid_rank=new TextMenuItem("初始Rank",1,1,{init:function(){
        that.avoid_rank.r=(that.avoid_rank.r+4)%24;
        stgDeleteSelf();
        that.avoid_refresh();
    }},0);
    that.avoid_rank.r=16;

    that.avoid_menu.pushItem(that.avoid_rank);
    that.avoid_menu.pushItem(that.avoid_history);
    that.avoid_menu.pushItem(new TextMenuItem("返回",1,1,that.main_menu,1));
    that.avoid_refresh=function(){
        var  his = stgLoadData("avoid_history");
        var q=0;
        var a=0;
        for(var j=0;j<avoidname.length;j++){
            that.avoid_menu_item[j].mtext="  "+avoidname[j]+" "+(that.avoid_levels[j]?"√":"×");
            if(his){
                that.avoid_menu_item[j].mtext+=his.scores[j]?" "+his.scores[j]:"";
                q+=his.scores[j]||0;
                a+=his.trail[j]?1:0;
            }

        }

        q=q/a;
        var eu=avoid_rank_disc[0];
        for(var j=0;j<avoid_rank_disc.length;j++){
            if(q>avoid_rank_disc[j][0]){
                eu=avoid_rank_disc[j];
            }
        }
        if(a){
            that.avoid_history.mtext="历史成绩 "+Math.floor(q*10)/10+" "+eu[1];
        }else{
            that.avoid_history.mtext="还没有历史成绩哦~";
        }

        that.avoid_rank.mtext="初始Rank "+that.avoid_rank.r;
    };
    that.avoid_refresh();
    that.item_help.on_select={
        init:function(){
            that.helpcontext=[];
            that.helpcontext.push(new RenderText(100,100,"操作说明："));
            that.helpcontext.push(new RenderText(100,120,"鼠标点击移动"));
            that.helpcontext.push(new RenderText(100,140,"方向键 直接控制"));
            that.helpcontext.push(new RenderText(100,160,"左Shift 低速"));
            that.helpcontext.push(new RenderText(100,180,"Z 射击/确认"));
            that.helpcontext.push(new RenderText(100,200,"X 切换Link显示/取消/返回上一级菜单"));
            that.helpcontext.push(new RenderText(100,220,"ESC 暂停"));
            that.helpcontext.push(new RenderText(100,240,"标题界面按R可以重置按键"));
            var q=new ButtonHolder("返回",1,1,
                {init:function(){
                    for(var i=0;i<that.helpcontext.length;i++){
                        stgDeleteObject(that.helpcontext[i]);
                    }
                    stgAddObject(that.main_menu);
                    stgDeleteObject(that.item_help.on_select);
                }},0,1);
            q.pos=[100,280];
            stgAddObject(q);
            that.helpcontext.push(q);

        },
        script:function(){
            if(stg_system_input[stg_const.KEY_SPELL]){
                stgDeleteSelf();
                for(var i=0;i<that.helpcontext.length;i++){
                    stgDeleteObject(that.helpcontext[i]);
                }
                stgAddObject(that.main_menu);
            }
        }

    }




}



function gLoadMenuSystem(){
    // stg_players_number=1;
    var a;
    var ks2;
    var g_keysetter_reset={script:function(){
        g_keysetter.active=1;
        tf2();
        stgDeleteSelf();
    }};
    var tf2=function(){

        for(var i in g_ks){
            g_keysetter.menu_pool[i].mtext=" " + g_ks[i]+" "+temp_key[i].toString();
        }
    };
    var tf3=function(){

        for(var i in g_ks){
            g_keysetter.menu_pool[i].mtext=" " + g_ks[i];
        }
    };
    var g_keysetter2_reset={init:function(){
        g_keysetter2.active=0;
        stg_target.menu_item.render.text="[???]";
        checkKeyChange();
    },script:function(){
        var k=checkKeyChange();
        if(k.length){
            temp_key[stg_target.menu_item.kid][stg_target.menu_item.kc]=k[0];
            var ta=stg_target.parent.select_id;
            stg_target.parent.gDeleteMenu();
            ks2(stg_target.menu_item.kid);
            stgAddObject(g_keysetter2);
            g_keysetter2.select_id=ta;
            stgDeleteSelf();
            TextMenuItem.sellock=1;
            TextMenuItem.backlock=1;
        }
    }};
    var g_keysetter2_add={init:function(){
        g_keysetter2.active=0;
        stg_target.menu_item.render.text="[???]";
        checkKeyChange();
    },script:function(){
        var k=checkKeyChange();
        if(k.length){
            temp_key[stg_target.menu_item.kid][stg_target.menu_item.kc]=k[0];
            g_keysetter2.gDeleteMenu();
            var ta=g_keysetter2.select_id;
            ks2(stg_target.menu_item.kid);
            stgAddObject(g_keysetter2);
            g_keysetter2.select_id=ta;
            stgDeleteSelf();
            TextMenuItem.sellock=1;
            TextMenuItem.backlock=1;
        }
    }};

    g_keysetter=new MenuHolderA1([40,40],[0,30],ife.main_menu);

    ife.key_setter=new TextMenuItem("键位设置(触屏勿动)",1,1,{init:function(){temp_key=clone(_key_map[0]);stgDeleteSelf();stgAddObject(g_keysetter)}},1);
    ife.main_menu.pushItem( ife.key_setter);

   var tf=function() {
        for (var i in g_ks) {
            a = new TextMenuItem(" " + g_ks[i], 1, 1, {kid: i, script: function () {

                ks2=function(thisid) {
                    tf3();
                    g_keysetter2 = new MenuHolderA1([300, 40], [0, 30], g_keysetter_reset);

                    for (var j in temp_key[thisid]) {
                        var b = new TextMenuItem("[" + temp_key[thisid][j] + "]", 1, 1, g_keysetter2_reset, 0);
                        b.kid = thisid;
                        b.kc = j;
                        b.kt = b;
                        g_keysetter2.pushItem(b);
                    }
                    b = new TextMenuItem("[+]", 1, 1, g_keysetter2_reset, 0);
                    b.kid = thisid;
                    b.kc = temp_key[thisid].length;
                    b.kt = b;
                    g_keysetter2.pushItem(b);
                    var b = new TextMenuItem("Remove", 1, 1, {kid: thisid,script: function () {
                        if (temp_key[stg_target.kid].length > 1) {
                            delete temp_key[stg_target.kid][temp_key[stg_target.kid].length - 1];
                            temp_key[stg_target.kid].length=temp_key[stg_target.kid].length-1;
                            g_keysetter2.gDeleteMenu();
                            var ta=g_keysetter2.select_id-1;
                            ks2(stg_target.kid);
                            stgAddObject(g_keysetter2);
                            g_keysetter2.select_id=ta;

                        }else{
                            stgAddObject(g_keysetter2);
                        }
                        stgDeleteSelf();
                    }}, 1);
                    g_keysetter2.pushItem(b);
                    stgAddObject(g_keysetter2);
                };
                ks2(stg_target.kid);
                g_keysetter.active=0;
                stgDeleteSelf();
            }}, 0);
            g_keysetter.pushItem(a);
        }
        a = new TextMenuItem("Back", 1, 1,ife.main_menu, 1);
        g_keysetter.pushItem(a);
        a = new TextMenuItem("Save", 1, 1,{script:function(){stgDeleteSelf();_key_map[0]=clone(temp_key);stgSaveKeyMap();}}, 0);
        g_keysetter.pushItem(a);
        tf2();
    };
    tf();




}

var temp_key=_key_map[0];

var g_keysetter={};
var g_keysetter2={};
var g_ks=["Shot","Slow","Bomb","Up","Down","Left","Right","Pause","Ctrl","User1","User2"];
