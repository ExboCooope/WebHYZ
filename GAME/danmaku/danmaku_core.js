/**
 * 弹幕感知与记忆（避弹算法 第 1 层）
 *
 * 目标：把引擎每一帧的「真值弹幕表」变成「人眼看到的样子」：
 *   1. 视野过滤 —— 只有落在视野半径（可选扇形）里的子弹才算"看见"，还可以加反应延迟；
 *   2. 记忆合并 —— 每发子弹给一个稳定 id，跨帧用「匀速预测 + 最近邻」关联；
 *      离开视野的子弹不立刻消失，而是留在记忆里按速度外推（丢帧越久越不可信），
 *      超过 lost_max 帧才忘掉；
 *   3. 位置历史 —— 记录自机最近若干帧的位置（狙的瞄准点要用）。
 *
 * 这一层不碰引擎全局：update() 的入参是普通数组，方便单测。
 * 引擎侧适配在 danmaku_ai.js 的 danmakuAI.gather() 里。
 *
 * 真值元素 raw[i] 需要：{x,y,vx,vy,r,type,sid,src}
 *   src 可选，指向引擎对象（分类时会用 src.frame 拿精确弹龄）。
 */
//Math 的方法在加载时就取出来（和 STGCORE.js 的 var sin=Math.sin 同一套写法）：
//vm/headless 环境里全局 Math 的绑定偶尔会丢，运行期再取 Math.xxx 会变成 undefined.xxx。
var _dm_sin=Math.sin,_dm_cos=Math.cos,_dm_sqrt=Math.sqrt,_dm_atan2=Math.atan2,
    _dm_abs=Math.abs,_dm_max=Math.max,_dm_min=Math.min,_dm_floor=Math.floor,
    _dm_round=Math.round,_dm_PI=Math.PI;

var danmakuCore={
    frame:0,
    next_id:1,
    tracks:[],      // 记忆中的弹幕（含刚丢失的）
    trail:[],       // 自机位置历史，下标=帧号
    trail_max:240,

    //视野参数
    view:{
        radius:300,     // 视野半径（像素）
        cone:0,         // 视野张角（弧度），0=整圆；默认朝上（-PI/2）
        reaction:0,     // 反应延迟：子弹出现后多少帧才"看见"
        max_bullets:800 // 一帧最多跟踪多少发（按离自机距离取最近的）
    },
    gate:18,            // 帧间关联门限（像素）
    lost_max:14,        // 丢失多少帧后遗忘
    speed_smooth:0.35,  // 速度平滑系数（0=完全不信观测，1=完全用观测）
    seen:0,             // 上一帧"看见"了几发
    unknown:0,          // 上一帧"记忆中"（视野外）有几发

    reset:function(){
        this.frame=0;
        this.next_id=1;
        this.tracks=[];
        this.trail=[];
        this.seen=0;
        this.unknown=0;
    },

    pushTrail:function(x,y){
        this.trail[this.frame]=[x,y];
        var cut=this.frame-this.trail_max;
        if(cut>=0)delete this.trail[cut];
    },

    trailAt:function(f){
        if(f<0)f=0;
        var p=this.trail[f|0];
        if(p)return p;
        // 帧号越界就取最近的一个
        for(var i=f|0;i>=0;i--){if(this.trail[i])return this.trail[i];}
        return null;
    },

    //raw: 候选真值；player: {x,y}；返回 tracks（引用）
    update:function(raw,player,cfg){
        var view=this.view,i,t;
        if(cfg){
            for(var k in cfg)view[k]=cfg[k];
        }
        this.frame++;
        if(player)this.pushTrail(player.x,player.y);

        //1. 先按视野筛真值（半径 + 可选扇形 + 反应延迟）
        var vis=[],px=player?player.x:0,py=player?player.y:0;
        var cone=view.cone, half=cone/2, facing=-_dm_PI/2;
        for(i=0;i<raw.length;i++){
            var a=raw[i];
            if(!a)continue;
            var dx=a.x-px,dy=a.y-py;
            var d2=dx*dx+dy*dy;
            if(d2>view.radius*view.radius)continue;
            if(cone>0 && cone<6.283){
                var ang=_dm_atan2(dy,dx);
                var da=ang-facing;
                while(da>_dm_PI)da-=_dm_PI*2;
                while(da<-_dm_PI)da+=_dm_PI*2;
                if(da>half||da<-half)continue;
            }
            if(view.reaction>0){
                var age=(a.src&&a.src.frame!==undefined)?a.src.frame:a.age;
                if(age!==undefined&&age<view.reaction)continue;
            }
            vis.push(a);
        }
        //太多的话只留最近的
        if(vis.length>view.max_bullets){
            vis.sort(function(a,b){
                var ax=a.x-px,ay=a.y-py,bx=b.x-px,by=b.y-py;
                return (ax*ax+ay*ay)-(bx*bx+by*by);
            });
            vis.length=view.max_bullets;
        }

        //2. 记忆外推一帧
        for(i=0;i<this.tracks.length;i++){
            t=this.tracks[i];
            t.x+=t.vx;
            t.y+=t.vy;
            t.age++;
            t.lost++;
        }

        //3. 空间哈希：把预测位置装桶，用来找最近邻
        var cell=this.gate*2;
        var grid={};
        for(i=0;i<this.tracks.length;i++){
            t=this.tracks[i];
            var gx=_dm_floor(t.x/cell),gy=_dm_floor(t.y/cell);
            var key=gx+":"+gy;
            (grid[key]||(grid[key]=[])).push(t);
        }

        //4. 关联：每个"看见的"子弹找最近的记忆
        var used={},matched=0;
        for(i=0;i<vis.length;i++){
            var b=vis[i];
            var cx=_dm_floor(b.x/cell),cy=_dm_floor(b.y/cell);
            var best=null,bestd=this.gate*this.gate;
            for(var ox=-1;ox<=1;ox++){
                for(var oy=-1;oy<=1;oy++){
                    var arr=grid[(cx+ox)+":"+(cy+oy)];
                    if(!arr)continue;
                    for(var j=0;j<arr.length;j++){
                        t=arr[j];
                        if(used[t.id])continue;
                        var ddx=t.x-b.x,ddy=t.y-b.y;
                        var d=ddx*ddx+ddy*ddy;
                        if(t.r!==undefined&&b.r!==undefined&&_dm_abs(t.r-b.r)>b.r*0.9+4)continue;
                        if(d<bestd){bestd=d;best=t;}
                    }
                }
            }
            if(best){
                used[best.id]=1;
                matched++;
                var sm=this.speed_smooth;
                best.vx+= (b.vx-best.vx)*sm;
                best.vy+= (b.vy-best.vy)*sm;
                best.x=b.x;
                best.y=b.y;
                best.r=b.r;
                best.lost=0;
                best.seen++;
                best.src=b.src||best.src;
                best.sid=b.sid;
            }else{
                var nt={
                    id:this.next_id++,
                    x:b.x,y:b.y,vx:b.vx||0,vy:b.vy||0,
                    r:b.r||4,type:b.type,
                    sid:b.sid,src:b.src||null,
                    age:0,lost:0,seen:1,first:this.frame
                };
                this.tracks.push(nt);
            }
        }

        //5. 清理：丢失太久的忘掉
        var keep=[];
        for(i=0;i<this.tracks.length;i++){
            t=this.tracks[i];
            if(t.lost>this.lost_max)continue;
            keep.push(t);
        }
        this.tracks=keep;

        var s=0,u=0;
        for(i=0;i<this.tracks.length;i++){
            if(this.tracks[i].lost===0)s++;else u++;
        }
        this.seen=s;
        this.unknown=u;
        return this.tracks;
    },

    //当前视野内的 track（给规划用）
    visible:function(){
        var r=[];
        for(var i=0;i<this.tracks.length;i++){
            if(this.tracks[i].lost<=1)r.push(this.tracks[i]);
        }
        return r;
    },

    //把 track 集合里最靠近 player 的一发距离算出来（评价用）
    minClearance:function(x,y,radius){
        var m=1e9;
        for(var i=0;i<this.tracks.length;i++){
            var t=this.tracks[i];
            if(t.lost>1)continue;
            var dx=t.x-x,dy=t.y-y;
            var d=_dm_sqrt(dx*dx+dy*dy)-t.r-(radius||0);
            if(d<m)m=d;
        }
        return m;
    }
};
