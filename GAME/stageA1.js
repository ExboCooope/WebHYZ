/**
 * Created by Exbo on 2015/11/27.
 */

stageA1={};
stageA1.init=function(){

    stageA1.f=0;
    stageA1.side=stg_const.SIDE_ENEMY;
    var q={};
    q.render=new RenderPrim();
    q.render.setVertexNum(3);
    q.render.mode=stg_const.TRIANGLES;
    q.render.vtx[0]=[100,100];
    q.render.vtx[1]=[100,200];
    q.render.vtx[2]=[200,100];
    q.render.tex=[[0,0],[1,0],[0,1]];
    q.render.texture="3dTex3";
    q.layer=stg_const.LAYER_BULLET;
    stgAddObject(q);
};

stageA1.script=function(){
    var f=stageA1.f;
    stageA1.f++;

};

stg_level_templates.A1=stageA1;