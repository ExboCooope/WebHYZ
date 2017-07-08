/**
 * Created by Exbo on 2015/10/29.
 */
var _pool=[];

var _hit_pool=[];
var _hit_by_pool=[];

//2017.1.1
var _hit_pool1=[];
var _hit_pool2=[];
var _hit_by_pool1=[];
var _hit_by_pool2=[];

//2017.7.7
var _next_hit_pool=[];
var _next_hitby_pool=[];


var stg_game_state=0;
var _stg_next_game_state=undefined;

var stg_textures={};
var stg_procedures={};
var stg_shaders={};
var stg_display=[];

var stg_wait_for_all_texture=1;
var stg_refresher_type=0;

var stg_super_pause_time;
var _stg_super_pause_time=0;

var stg_bullet_parser=null;

// stg_target 在执行每个脚本的时候，都指向脚本所在对象自身
var stg_target=null;
var stg_last=null;

// 所有的玩家数据对象
var stg_players=[{}];
var stg_players_number=stg_players.length;

// stg_target 在执行player脚本的时候，指向该player的输入
var stg_player_input=null;
// 在执行player脚本的时候，指向该player的数据
var stg_current_player=null;
// 指向本地的玩家
var stg_local_player=null;
var stg_local_player_pos=0;

var stg_player_templates={};
var stg_level_templates={};

var stg_enemy=[];

//是否在播放replay
var stg_in_replay=0;

//stg_ignore_input用于忽略输入。在脚本中设置时，下一帧起效。用于Loading等长度不固定而与输入无关的情况
var _stg_save_input=0;
var stg_ignore_input=0;

// 系统的输入，在非replay时，系统输入为所有玩家输入之和；在replay时，系统输入为用户输入
var stg_system_input=[];

// stg_pause_script 指向一个对象，在暂停时，stg_pause_script.init\stg_pause_script.script将被执行
var stg_pause_script=null;

// 指向游戏启动、结束时的script对象
var stg_menu_script=null;

// Level开始时会自动装载的对象
var stg_system_script=null;

// stg_common_data 储存了用于在游戏过程中传递的信息，将被保存到replay中。不要在其中放入函数
var stg_common_data={
    players:[],
    local_player:0,
    level_name:"",
    rand_seed:0
};

var stg_super_pause_time=0;


var stg_const={
    PLAYER_NORMAL:0,  //玩家正常的状态
    PLAYER_HIT:1,     //玩家被子弹击中，可以使用决死的状态
    PLAYER_DEAD:2,    //玩家死亡的状态
    PLAYER_REBIRTH:3,  //玩家重生的状态

    GAME_MENU:100,   //游戏处在菜单中
    GAME_PAUSED:101, //游戏暂停中
    GAME_RUNNING:102, //游戏运行中

    SIDE_PLAYER:0,  //同玩家一伙，将影响其发出子弹的side，子弹只会命中与其不同的玩家
    SIDE_ENEMY:1,   //同敌人一伙
    SIDE_TERRAIN:2,  //第三方

    TARGET_ENEMY:{
        side:1
    },
    TARGET_PLAYER:{
        side:0
    },

    BASE_MOVE:1,
    BASE_ROTATE:2,
    BASE_MOVE_ROTATE:3,
    BASE_ROTATE_MOVE:4,
    BASE_ROTATE_MOVE_ROTATE:5,
    BASE_COPY:6,
    BASE_FOLLOW:7,
    BASE_NONE:0,

    TEX_IMG:1, //img标签的纹理，支持使用
    TEX_CANVAS2D:2, //canvas2d的纹理，支持写入和使用
    TEX_CANVAS3D:3, //指canvas3d屏幕，支持写入
    TEX_CANVAS3D_TARGET:4, //webgl的rendertarget，支持写入和使用
    TEX_NONE:0, //非纹理，不支持纹理使用，但是可以用来存储信息
    TEX_AUDIO:5,

    KEY_SHOT:0,
    KEY_SLOW:1,
    KEY_SPELL:2,
    KEY_UP:3,
    KEY_DOWN:4,
    KEY_LEFT:5,
    KEY_RIGHT:6,
    KEY_PAUSE:7,
    KEY_CTRL:8,
    KEY_USER1:9,
    KEY_USER2:10,
    KEY_MAP:[
        [90],[16],[88],[38],[40],[37],[39],[27],[17],[67],[86],[],[],[],[],[],[]
    ],

    KEY_MAP2:[
        [90],[16],[88],[38],[40],[37],[39],[27],[17],[67],[86],[],[],[],[],[],[]
    ],

    OBJ_NONE:0,
    OBJ_PLAYER:1,
    OBJ_ENEMY:2,
    OBJ_BULLET:3,
    OBJ_ITEM:4,

    LAYER_MIN_FRAME:20,
    LAYER_SPELL_BG:22,
    LAYER_ENEMY:30,
    LAYER_PLAYER:40,
    LAYER_ITEM:50,
    LAYER_BULLET:60,
    LAYER_PLAYER_BULLET:27,
    LAYER_HINT:70,
    LAYER_MAX_FRAME:80



};
