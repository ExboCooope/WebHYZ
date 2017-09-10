/**
 * Created by Exbo on 2015/10/29.
 */

//请不要在网页中包含此脚本

/*类型说明
aXXX 数组
oXXX 对象
vXXX 数值
sXXX 字符串
nXXX 构造函数
fXXX 函数
mxXXX 数据类型或其数组
$XXX 可选
 */

//Types
//数据类型
var StgObject={
    active:1,//是否有效，这个成员主要是防止随意的往pool中加内容
    removed:0,//是否被删除，被删除的对象会在当帧结束时清理出pool
    pos:[0,0,0],//可选，导出值，当前帧该物体的位置
    rotate:[0,0,0],//可选，当前的旋转
    ignore_move:1,//可选，move将不会更新该物体的实际位置

    move:{//可选，物体参与移动运算
        pos:[0,0,0],//物体的移动的位置
        speed:3, //速度
        speed_angle:3.14159, //速度方向
        speed_angleY:0, //可选，速度沿Y轴方向角度
        max_speed:3, //可选，最大速度
        acceleration:0.05, //可选，加速度
        acceleration_angle:3.14159, //可选，加速度的角度
        speed_angle_acceleration:0.1, //可选，角度旋转
        acceleration_angle_default:1 //可选，加速度始终与速度同向
    },

    pos_offset:[0,0,0],//可选，移动偏移量
    base:{//可选，移动基础
        target:{},//目标对象
        type:stg_const.BASE_MOVE, //可选，移动形式
        auto_remove:1 //可选，当目标销毁时自身销毁
    },
    /*
     如果定义了base，则在move计算出pos和rotate后，按照base进行变换
     如果定义了base.auto_remove，而且该物体在target物体之前，则当target物体消失后，自身会在下一帧消失。
     可以使用这种办法来制作重绘物体，主物体消失后下一帧重绘物体会正确的消除掉画面中主物体的内容，并且随后消失
     */
    layer:50,//可选，物体所在的层数，从0~100的整数，包括0和100
    renders:{ //可选，物体参与绘制
        shader_name:"sprite",
        textures:[
            "tex1"
        ],
        procedures:{
            render_stage:{},
            render_mirror1:{}
        },
        layer:35
    },

    script:[
        function(){}
    ],
    init:[
        function(){}
    ],
    finalize:[
        function(){}
    ]
};

/*
StgShader是处理渲染的方式。shader中定义的几个函数负责将object中的数据渲染出来。
*/
var StgShader={
    vertex:"",  //顶点着色程序
    fragment:"", //片段着色程序
    shader_init:function(){}, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){}, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    draw_frame:function(procedureName){}, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    object_frame:function(object,render,procedureName){}, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    shader_finalize_procedure:function(procedureName){}, //移除procedure时会执行一次，用来释放资源
    procedure_cache:{ //用来存放每次渲染过程的缓存
        procedure1:{},
        procedure2:{}
    }
};
/*
 StgProcedure是单次渲染流程，指定哪一些object参与，渲染的目标是什么，使用的shader是什么
 */

var StgProcedure={
    layers:[1,2,3,4,5],//参与渲染的层号
    render_target:"screen_ui",//绘制的目标
    shader_order:[//使用shader的顺序，影响对每个object的调用顺序和最终绘制时的顺序
        "color",
        "sprite",
        "text"
    ]

};

var StgDisplay=[
    "procedure1","procedure2"
];

var StgRenderTarget={
    content_type:0,
    content:{}
};


//Base Functions
//基本函数
function stgAddObject(oStgObject){}
/*
将oStgObject放入pool中并调用oStgObject.init();
 oStgObject将自动继承宿主的side，并且active会置为1
 */

function stgDeleteObject(oStgObject){}
/*
删除指定的object，在本frame结束时，如果有finalize则调用finalize()
*/


//Level Functions
//关卡函数
function stgRegisterLevel(sLevelName,nLevelMaker){}
/*
 注册一个叫做sLevelName的关卡，开始关卡时，会调用 new nLevelMaker()，并将对象置入pool中
 */

function stgStartLevel($oCommonData){}
/*
使用oCommonData开始游戏。如果不指定，则使用现有的stg_common_data。
 oCommonData中的信息将被深度拷贝至相应的replay的commondata中。
 当游戏的state为STATE_RUNNING时，使用stgStartLevel开始下一关；在MENU中使用时，
 如果stg_in_replay为假，stgStartLevel会清空replay缓存。replay的信息从第一个stgStartLevel开始。

 开始游戏前，请将Player选择的信息、关卡选的的信息、辅助信息等存入oCommonData中
 开始游戏时，pool会被重置
 */

function stgStopLevel(){}
/*
 结束游戏，进入菜单状态，pool会被重置，stg_menu_script中的对象将被执行。
 执行该函数前，可以将信息存入commondata或者改变stg_menu_script的内容
 */

//player functions
//玩家函数

function stgRegisterPlayer(sPlayerName,nPlayerMaker){}
/*
玩家脚本注册一个名叫sPlayerName的玩家在系统中，当游戏以该玩家名开始时，
系统会调用 new nPlayerMaker(oPlayerInformation) 并将结果放入pool中
 oPlayerInformation为系统创建的玩家数据对象，存储在stg_players数组中
 */

function stgGetRandomPlayer(){}
/*
返回一个随机玩家，用于敌人脚本选择玩家。
如果想要遍历所有玩家，直接使用 stg_players
 */


//render functions
function stgCreateTexture(eTextureType,iWidth,iHeight){}

