/**
 * Created by Exbo on 2016/1/21.
 */

stg_const.ITEM_SCORE={tex:"item1",color:0,content:"point"};
stg_const.ITEM_POWER={tex:"item1",color:3,content:"power"};
stg_const.ITEM_BLT={tex:"item1",color:2,content:"point_bonus"};
stg_const.ITEM_BOMB={tex:"item0",color:1,content:"bomb"};
stg_const.ITEM_LIFE={tex:"item0",color:0,content:"life"};

function deleteShotToItem(shot){
    stgDeleteObject(shot);
    gCreateItem(shot.pos,stg_const.ITEM_BLT,1,0);
}

function deleteAllShot(ignore_resistance){
    for(var i in _pool){
        var k=_pool[i];
        if(k.type==stg_const.OBJ_BULLET){
            if(ignore_resistance || !k.keep){
                deleteShotToItem(k);
            }
        }
    }
}

function gCreateItem(pos,type,count,range){
    for(var i=0;i<count;i++) {
        var a=new StgObject();
        a.type=stg_const.OBJ_ITEM;
        a.move=new StgMove();
        a.move.pos[0]=pos[0];
        a.move.pos[1]=pos[1];
        a.render = new StgRender("sprite_shader");
        renderApply2DTemplate(a.render,type.tex,type.color);
        a.content={};
        a.content[type.content]=1;
        a.f=stg_rand(0,range);
        a.move.speed=2;
        a.move.speed_angle=stg_rand(0,PI*2);
        stgAddObject(a);
        a.script=item_script_0;
        a.hitdef=new StgHitDef();
        a.hitdef.range=4;
        a.layer=stg_const.LAYER_ITEM;
    }
}


function item_script_0(){
    var a=stg_target;
    if(a.f>0){
        a.f--;
    }else{
        a.script=item_script_1;
        a.move.speed=0;
        a.move.speed_angle=PI/2;
        a.move.acceleration=0.1;
        a.move.max_speed=2;
        a.move.acceleration_angle=PI/2;
    }
}

function item_script_1(){
    var a=stg_target;
    if(a.attracter){
        if(a.attracter.state==stg_const.PLAYER_DEAD){
            delete a.attracter;
            a.move.speed=0;
            a.move.speed_angle=PI/2;
            a.move.acceleration=0.1;
            a.move.max_speed=2;
            a.move.acceleration_angle=PI/2;
        }else {
            a.move.speed = 6;
            a.move.acceleration=0;
            a.move.speed_angle = atan2p(a.pos, a.attracter.pos);
        }
    }else{
        var kp=null;
        var kd=800;
        for(var i=0;i<stg_players_number;i++){

            var p=stg_players[i];
            if(p.state!=stg_const.PLAYER_DEAD){
                var t=sqrt2(p.pos, a.pos);
                if(t< p.item_attract_range){
                    kp=p;
                    kd=0;
                }
                if(stg_players[i].pos[1]<130){
                    if(t<kd){
                        kd=t;
                        kp=p;
                    }
                }
            }

        }
        a.attracter=kp;
    }
}

