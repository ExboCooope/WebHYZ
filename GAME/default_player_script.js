/**
 * Created by Exbo on 2015/11/23.
 */
function Default_Player_Sikieiki(iPosition){
    this.player_pos=iPosition;
    this.side=stg_const.SIDE_PLAYER;
}
stgCreateImageTexture("siki_body","res/pl00.png");
stgCreateImageTexture("pl_effect","etama2.png");
//document.body.appendChild(stg_textures["siki_body"]);

Default_Player_Sikieiki.prototype.init=function(){
    this.side=stg_const.SIDE_PLAYER;
    //stgCreateImageTexture("siki_body","res/pl00.png");
    //stgCreateImageTexture("pl_effect","etama2.png");
    var a=new StgObject();
    this.body=a;



    var b=new StgObject();
    _StgDefaultPlayer(b);
    b.render=new StgRender("sprite_shader");
    renderCreate2DTemplateA1("siki_normal","siki_body",0,0,32,48,32,0,0,1);
    renderApply2DTemplate(b.render,"siki_normal",0);
    renderCreate2DTemplateA1("siki_left","siki_body",0,48,32,48,32,0,0,1);
    renderCreate2DTemplateA1("siki_right","siki_body",0,96,32,48,32,0,0,1);
    renderCreate2DTemplateA1("siki_option","siki_body",64,144,16,16,16,0,0,1);

    renderSetSpriteBlend(stg_const.LAYER_PLAYER_BULLET,"siki_body",blend_test2);

    b.layer=stg_const.LAYER_PLAYER;
    if(stg_common_data.player){
        if(stg_common_data.player[this.player_pos]){
            miscApplyAttr(b,stg_common_data.player[this.player_pos]);
        }
    }

    stg_players[this.player_pos]=b;
    b.hitby=new StgHitDef();
    b.hitby.range=2;
    b.pos=[stg_frame_width/2,stg_frame_height*0.8,0];
    b.rotate=[0,0,0];
    a.base={target:b,type:stg_const.BASE_COPY};

    a.amine=0;
    a.aminef=0;
    a.amines=0;
    a.script=function(){
        a.pos[0]= b.pos[0];
        a.pos[1]= b.pos[1];
        a.pos[2]= b.pos[2];

        var ta= b.key[stg_const.KEY_LEFT]- b.key[stg_const.KEY_RIGHT];

        a.aminef++;
        if(a.aminef==4){
            a.aminef=0;
            a.amines++;
            if( a.amines>7){
                a.amines= (a.amine?4:0);
            }
        }
        if(a.amine!=ta){
            a.amine=ta;
            a.amines=0;
        }
        b.update=1;
        if(a.amine==0) {
            renderApply2DTemplate(b.render, "siki_normal", a.amines);
        }else if(a.amine==-1) {
            renderApply2DTemplate(b.render, "siki_right", a.amines);
        }else if(a.amine==1) {
            renderApply2DTemplate(b.render, "siki_left", a.amines);
        }
    };
    a.pos=[stg_frame_width/2,stg_frame_height*0.8,0];
    stgAddObject(b);
    stgAddObject(a);

    var c=new StgObject();
    c.render=new StgRender("sprite_shader");
    c.self_rotate=0.04;
    c.base= a.base;
    renderCreate2DTemplateA1("pan_ding_dian","pl_effect",0,112,64,64,64,0,0,1);
    renderApply2DTemplate(c.render,"pan_ding_dian",0);
    c.layer=stg_const.LAYER_HINT;
    c.alpha=0;
    var dds=0;
    c.script=function(){
        c.pos[0]= b.pos[0];
        c.pos[1]= b.pos[1];
        c.pos[2]= b.pos[2];
        if(b.state==stg_const.PLAYER_HIT||b.state==stg_const.PLAYER_DEAD){
            if(dds==0){
                stgPlaySE("se_dead");
                dds=1;
            }
        }else{
            dds=0;
        }
        if(b.state==stg_const.PLAYER_DEAD){
            b.alpha=0;
        }else{
            stg_target.alpha=stg_target.base.target.slow?(stg_target.alpha+40>255?255:stg_target.alpha+40):(stg_target.alpha-16>0?stg_target.alpha-16:0);
            b.alpha=255;
        }

        if(b.content){
            if(b.content.point){
                b.score= (b.score+ b.point_bonus* b.content.point)>>0
                b.content.point=0;
            }else if(b.content.bomb){
                if(b.bomb<8){
                    b.bomb=b.bomb+b.content.bomb;
                    if(b.bomb>8)b.bomb=8;
                    b.content.bomb=0;
                }
            }else if(b.content.life){
                if(b.life<8){
                    b.life=b.life+b.content.life;
                    if(b.life>8)b.life=8;
                    b.content.life=0;
                }
                stgPlaySE("se_extend");
            }
        }

    };
    stgAddObject(c);
    b.on_collect=function(){
        stgPlaySE("se_item");
    };
    b.on_graze=function(){
        stgPlaySE("se_graze");
    };
    stgAddObject(new TestShotController(b));
};

stg_player_templates.siki=Default_Player_Sikieiki;

function plshot01onhit(a){
    stg_target.move.speed=0;
}
function TestShotController(base){
    this.b=base;


}
TestShotController.prototype.init=function(){
    this.shotf=0;
    var base=this.b;
    this.options=[new TestOption(base,0,0),new TestOption(base,0,0),new TestOption(base,0,0),new TestOption(base,0,0)];
    stgAddObject(this.options[0]);
    stgAddObject(this.options[1]);
    stgAddObject(this.options[2]);
    stgAddObject(this.options[3]);
    this.optionformat=-1;
};
TestShotController.prototype.script=function(){
    var key_shot=this.b.key[stg_const.KEY_SHOT];
    if(this.b.no_shot)key_shot=0;
    var key_slow=this.b.key[stg_const.KEY_SLOW];
    var key_bomb=this.b.key[stg_const.KEY_SPELL];
    var blt;
    if(this.shotf==0){
        if(key_shot){
            blt=stgCreateShotA1(this.b.pos[0]-8,this.b.pos[1],12,270,"plMainShot2",0,0);
            blt.damage=6;
            blt.on_hit=plshot01onhit;
            blt=stgCreateShotA1(this.b.pos[0]+8,this.b.pos[1],12,270,"plMainShot2",0,0);
            blt.damage=6;
            blt.on_hit=plshot01onhit;
        }
        this.shotf=3;
    }else{
        this.shotf--;
    }

    if(key_slow!=this.optionformat) {
        var p=this.options;
        if (key_slow) {
            p[0].moveTo(-24,-12);
            p[1].moveTo(24,-12);
            p[2].moveTo(-8,-28);
            p[3].moveTo(8,-28);
        } else {
            p[0].moveTo(-48,0);
            p[1].moveTo(48,0);
            p[2].moveTo(-24,0);
            p[3].moveTo(24,0);
            this.options=[p[1],p[2],p[3],p[0]];
        }

        this.optionformat=key_slow;
    }

    if(key_bomb) {
        hyzSetSuperPauseTime(60);
    }


};

function TestOption(base,x,y){
    this.b=base;
    this.layer=stg_const.LAYER_PLAYER;
    this.base={target:base,type:stg_const.BASE_MOVE};
    this.self_rotate=0.05;
    this.move=new StgMove();
    this.move.pos[0]=x;
    this.move.pos[1]=y;
    this.iftgt=[x,y];
    this.iflft=0;
    this.ifops=[x,y];
    this.ifmft=1;
    this.shotf=0;
    this.render=new StgRender("sprite_shader");

    renderApply2DTemplate(this.render,"siki_option",1);

}

TestOption.prototype.moveTo=function(x,y){
    this.iftgt[0]=x;
    this.iftgt[1]=y;
    this.ifmft=12;
    this.iflft=12;
    this.ifops[0]=this.move.pos[0];
    this.ifops[1]=this.move.pos[1];

};

TestOption.prototype.script=function(){
    var key_shot=this.b.key[stg_const.KEY_SHOT];
    var key_slow=this.b.key[stg_const.KEY_SLOW];
    var b=this.b;
    if(b.state==stg_const.PLAYER_DEAD){
        this.alpha=0;
        this.move.pos[0]=this.iftgt[0];
        this.move.pos[1]=this.iftgt[1];
        this.iflft=0;
        this.ifops[0]=this.iftgt[0];
        this.ifops[1]=this.iftgt[1];

        this.ifmft=1;
    }else{
        this.alpha=255;
        this.move.pos[0]=(this.iflft*this.ifops[0]+(this.ifmft-this.iflft)*this.iftgt[0])/this.ifmft;
        this.move.pos[1]=(this.iflft*this.ifops[1]+(this.ifmft-this.iflft)*this.iftgt[1])/this.ifmft;
        if(this.iflft>0)this.iflft--;
    }
    var blt;
    if(b.no_shot)key_shot=0;
    if(this.shotf==0){
        if(key_shot){
           var dr=270;
            var flg=0;
            //blt.on_hit=plshot01onhit;
            if(!key_slow){
                var rang=300;
                for(var i in _hit_by_pool){
                    var t=_hit_by_pool[i];
                    if(t.side==stg_const.SIDE_ENEMY && t.sid==this.sid) {
                        var s;
                        if ((s = sqrt2(b.pos, t.hitby.rpos)) < rang) {
                            rang = s;
                            dr = atan2pr(this.pos, t.hitby.rpos);
                            flg=1;
                        }
                    }
                }
            }
            blt=stgCreateShotA1(this.pos[0]-4,this.pos[1],12,dr,"plMainShot3",0,0);
            blt.damage=3;
            //blt.on_hit=plshot01onhit;
            blt=stgCreateShotA1(this.pos[0]+4,this.pos[1],12,dr,"plMainShot3",0,0);
            blt.damage=3;

        }
        this.shotf=3;
    }else{
        this.shotf--;
    }
};