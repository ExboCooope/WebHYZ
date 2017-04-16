/**
 * Created by Exbo on 2015/11/9.
 */
stg_shaders.sample2d={
    shader_init:function(){}, //shader初始化程序，在这里获得shader的入口地址等
    shader_finalize:function(){}, //shader的结束程序，负责释放资源
    post_frame:function(procedureName){
        if(!stg_shaders.sample2d.procedure_cache[procedureName]){
            stg_shaders.sample2d.procedure_cache[procedureName]=[];
        }
    }, //每次渲染开始前，会调用，用来初始化该次渲染的数据，存入procedure_cache中
    draw_frame:function(procedureName){}, //每次渲染结束时会调用，如果将物体聚类的话，可以在这里统一绘制
    object_frame:function(object,render,procedureName){

    }, //对每个参与该procedure和shader的物体会调用一次，负责绘制或将物体渲染信息缓存起来
    shader_finalize_procedure:function(procedureName){
        stg_shaders.sample2d.procedure_cache[procedureName]=null;
    }, //移除procedure时会执行一次，用来释放资源
    procedure_cache:{ //用来存放每次渲染过程的缓存
    }

};