/**
 * 弹型分解（避弹算法 第 2 层）
 *
 * 用《STG弹幕分类与泛用技巧》的体系给记忆里的弹幕分型：
 *   固定弹/自机狙 —— 看每一发的射线是否指向自机（用自机位置历史 + 弹龄回推瞄准点）
 *   多重弹        —— 同一发弹源、同方向、一列（速度递增/递减/等速）
 *   复数弹        —— 同一发弹源、同速度、角度铺开（满 = 圈弹/排弹）
 *   甩弹          —— 复数弹里角度和"弹龄"强相关（后发的角度更大/更小）
 *   圈弹/圈甩     —— 角度跨度接近 360°
 *   单源弹        —— 组内所有射线回推到同一个源点
 *   交叉弹/对称弹 —— 两组反向扫射 / 关于中线镜像
 *
 * 判定全部是近似 + 置信度，算法输入是普通数组（tracks），不依赖引擎，方便单测。
 */
//Math 的方法在加载时就取出来（和 STGCORE.js 的 var sin=Math.sin 同一套写法）：
//vm/headless 环境里全局 Math 的绑定偶尔会丢，运行期再取 Math.xxx 会变成 undefined.xxx。
var _dm_sin=Math.sin,_dm_cos=Math.cos,_dm_sqrt=Math.sqrt,_dm_atan2=Math.atan2,
    _dm_abs=Math.abs,_dm_max=Math.max,_dm_min=Math.min,_dm_floor=Math.floor,
    _dm_round=Math.round,_dm_PI=Math.PI;

var danmakuPattern={
    origin_cell:22,     // 发弹源聚类容差（像素）
    angle_multi:0.05,   // 同向判定（弧度，约 2.9°）
    corr_whip:0.65,     // 甩弹：角度与弹龄的相关系数门限
    ring_spread:5.5,    // 圈弹：角度跨度门限（弧度，约 315°）
    aim_tol:0.09,       // 狙：基础角度容差（弧度）
    stable_speed:0.08,  // 稳定弹：速度相对离散度门限
    min_group:2,

    NAMES:{
        multi:"多重弹",fan:"复数弹",ring:"圈弹",whip:"甩弹",
        ring_whip:"圈甩",multi_fan:"复数多重",single:"单发",static:"静止弹"
    },

    //tracks: danmakuCore.tracks；ctx:{player:{x,y,r}, frame}
    analyze:function(tracks,ctx){
        var i,j,t;
        var player=(ctx&&ctx.player)?ctx.player:{x:0,y:0,r:0};
        var frame=(ctx&&ctx.frame)||0;
        var list=[],statics=[];
        for(i=0;i<tracks.length;i++){
            t=tracks[i];
            if(t.lost>1)continue;
            var sp=_dm_sqrt(t.vx*t.vx+t.vy*t.vy);
            if(sp<0.08){
                statics.push(t);
                continue;
            }
            var age=t.age;
            if(t.src&&t.src.frame!==undefined)age=t.src.frame;
            if(age<0)age=0;
            list.push({
                t:t,x:t.x,y:t.y,vx:t.vx,vy:t.vy,r:t.r||4,
                sp:sp,ang:_dm_atan2(t.vy,t.vx),age:age,
                ox:t.x-t.vx*age,oy:t.y-t.vy*age
            });
        }

        //1. 按回推源点聚类
        var clusters=[],k;
        for(i=0;i<list.length;i++){
            var b=list[i],home=null,bd=this.origin_cell*this.origin_cell;
            for(k=0;k<clusters.length;k++){
                var c=clusters[k];
                var dx=c.ox-b.ox,dy=c.oy-b.oy;
                var d=dx*dx+dy*dy;
                if(d<bd){bd=d;home=c;}
            }
            if(home){
                home.members.push(b);
                home.n++;
                //源点用成员均值慢慢修正（避免一开始被单发带偏）
                home.ox+= (b.ox-home.ox)/home.n;
                home.oy+= (b.oy-home.oy)/home.n;
            }else{
                clusters.push({ox:b.ox,oy:b.oy,n:1,members:[b]});
            }
        }

        //2. 组内分型
        var groups=[],singles=[];
        var gid=0;
        for(k=0;k<clusters.length;k++){
            var g=this._classify(clusters[k],player,frame,++gid);
            if(g.groups.length){
                for(j=0;j<g.groups.length;j++)groups.push(g.groups[j]);
            }
            for(j=0;j<g.singles.length;j++)singles.push(g.singles[j]);
        }
        //静止弹单独成组（激光停摆、墙）
        if(statics.length){
            groups.push({
                id:++gid,kind:"static",label:this.NAMES.static,
                origin:[statics[0].x,statics[0].y],n:statics.length,
                spread:0,sweep:0,speed:0,stable:true,aimed:false,
                bullets:statics,conf:0.5
            });
        }

        //3. 交叉弹/对称弹：两组反向扫射且源点不太远
        var crosses=[];
        for(i=0;i<groups.length;i++){
            for(j=i+1;j<groups.length;j++){
                var a=groups[i],b=groups[j];
                if(a.kind!=="whip"&&a.kind!=="fan"&&a.kind!=="ring_whip")continue;
                if(b.kind!=="whip"&&b.kind!=="fan"&&b.kind!=="ring_whip")continue;
                if(!a.sweep||!b.sweep||a.sweep===b.sweep)continue;
                var ddx=a.origin[0]-b.origin[0],ddy=a.origin[1]-b.origin[1];
                if(ddx*ddx+ddy*ddy<260*260){
                    crosses.push({a:a.id,b:b.id});
                    a.cross=b.id;
                    b.cross=a.id;
                }
            }
        }

        var aimed=0;
        for(i=0;i<groups.length;i++)if(groups[i].aimed)aimed++;
        return {groups:groups,singles:singles,cross:crosses,statics:statics.length,
                aimed_groups:aimed,bullets:list.length};
    },

    //一个源点簇 → 1~2 个弹型组
    _classify:function(cluster,player,frame,gid){
        var m=cluster.members,n=m.length,self=this;
        var i,j;
        if(n<this.min_group){
            return {groups:[],singles:m};
        }
        //角度（相对平均方向，处理跨 ±PI）
        var sx=0,sy=0;
        for(i=0;i<n;i++){sx+=_dm_cos(m[i].ang);sy+=_dm_sin(m[i].ang);}
        var mean=_dm_atan2(sy,sx);
        for(i=0;i<n;i++){
            var da=m[i].ang-mean;
            while(da>_dm_PI)da-=_dm_PI*2;
            while(da<-_dm_PI)da+=_dm_PI*2;
            m[i].rel=da;
        }
        var rels=m.map(function(a){return a.rel;});
        var spread=_dm_max.apply(null,rels)-_dm_min.apply(null,rels);

        //速度离散度 → 稳定弹
        var spsum=0;
        for(i=0;i<n;i++)spsum+=m[i].sp;
        var spmean=spsum/n,spvar=0;
        for(i=0;i<n;i++)spvar+=(m[i].sp-spmean)*(m[i].sp-spmean);
        var spdev=spmean?_dm_sqrt(spvar/n)/spmean:0;

        //狙：射线是否指向自机的历史位置
        var aimedCnt=0,aimErrSum=0;
        for(i=0;i<n;i++){
            var aim=self._aimError(m[i],player,frame);
            m[i].aimErr=aim.d;
            m[i].aimFrame=aim.frame;
            if(aim.hit){aimedCnt++;aimErrSum+=_dm_abs(aim.d);}
        }
        var aimed=aimedCnt>=_dm_max(1,_dm_round(n*0.6));

        var out={groups:[],singles:[]};
        var base={
            origin:[cluster.ox,cluster.oy],n:n,spread:spread,speed:spmean,
            stable:spdev<this.stable_speed,aimed:aimed,
            aim_ratio:n?aimedCnt/n:0,aim_err:n?aimErrSum/_dm_max(1,aimedCnt):0,
            bullets:m.map(function(a){return a.t;})
        };

        if(spread<this.angle_multi){
            //同向一列：多重弹
            var g=this._mk(gid,"multi",base);
            var sorted=m.slice().sort(function(a,b){
                return (a.x*_dm_cos(mean)+a.y*_dm_sin(mean))-(b.x*_dm_cos(mean)+b.y*_dm_sin(mean));
            });
            var ramp=1;
            for(i=1;i<sorted.length;i++){
                if(sorted[i].sp<sorted[i-1].sp-0.02){ramp=0;break;}
            }
            g.speed_ramp=ramp?1:-1;   //1=沿方向速度递增,-1=递减
            g.conf=_dm_min(1,0.5+0.1*n);
            out.groups.push(g);
        }else{
            // 角度铺开：复数弹 / 甩弹 / 圈弹
            // 甩弹判据：按弹龄（先发→后发）排好，看相邻两发角度差是不是一直朝同一个方向。
            // 用"增量一致性"而不是相关系数：圈甩绕满 360°，相对角度会在 ±PI 处折断，
            // 相关系数会被这个断点破坏（实测 ring_whip 只有 0.6 的相关性）。
            var srt=m.slice().sort(function(a,b){return b.age-a.age;});  //先发的在前
            var sum=0,pos=0,neg=0,cum=0,ages=[],rels2=[];
            var ageMax=srt[0].age,ageMin=srt[0].age;
            for(i=0;i<srt.length;i++){
                if(srt[i].age>ageMax)ageMax=srt[i].age;
                if(srt[i].age<ageMin)ageMin=srt[i].age;
            }
            for(i=1;i<srt.length;i++){
                var d=srt[i].ang-srt[i-1].ang;
                while(d>_dm_PI)d-=_dm_PI*2;
                while(d<-_dm_PI)d+=_dm_PI*2;
                sum+=d;
                if(d>0.004)pos++;else if(d<-0.004)neg++;
                cum+=d;
                rels2.push(cum);
                ages.push(srt[i].age);
            }
            var consistency=(srt.length>1)?_dm_max(pos,neg)/_dm_max(1,pos+neg):0;
            var seq=((ageMax-ageMin)>=2);   //同一批齐射（弹龄相同）不算"依次发射"
            var corr=this._corr(rels2,ages);
            var kind="fan",sweep=0,conf=0.6;
            if(this._isSweep(consistency,sum,seq)){
                kind="whip";
                sweep=sum>0?1:-1;
                conf=_dm_min(1,0.55+consistency*0.4);
            }
            if(spread>=this.ring_spread){
                kind=(kind==="whip")?"ring_whip":"ring";
                conf=_dm_max(conf,0.7);
            }
            var g2=this._mk(gid,kind,base);
            g2.corr=corr;
            g2.sweep=sweep;
            g2.sweep_mag=sum;
            g2.seq_consistency=consistency;
            g2.conf=conf;
            out.groups.push(g2);
        }
        return out;
    },

    // 增量一致性 → 是否甩弹
    _isSweep:function(consistency,sum,seq){
        if(!seq)return false;
        if(consistency<0.7)return false;
        if(_dm_abs(sum)<0.06)return false;
        return true;
    },

    _mk:function(gid,kind,base){
        var g={id:gid,kind:kind,label:this.NAMES[kind]||kind,
               origin:base.origin,n:base.n,spread:base.spread,
               speed:base.speed,stable:base.stable,aimed:base.aimed,
               aim_ratio:base.aim_ratio,aim_err:base.aim_err,
               bullets:base.bullets,sweep:0,corr:0,conf:0.6,cross:0};
        return g;
    },

    //射线是否经过自机的某个历史位置；返回角度误差与对应帧
    _aimError:function(b,player,frame){
        var best={d:9,hit:false,frame:frame};
        var travel=b.age|0;
        for(var k=0;k<=6;k++){
            var f=frame-travel+k;
            var p=danmakuCore.trailAt(f);
            if(!p)continue;
            var dx=p[0]-b.x,dy=p[1]-b.y;
            var d=_dm_sqrt(dx*dx+dy*dy);
            if(d<1)continue;
            //子弹还要往前飞 d/b.sp 帧，这时自机是否还在那条射线上？
            var ang=_dm_atan2(dy,dx);
            var err=ang-b.ang;
            while(err>_dm_PI)err-=_dm_PI*2;
            while(err<-_dm_PI)err+=_dm_PI*2;
            var tol=this.aim_tol+_dm_atan2((b.r||0)+(player.r||0)+2,d);
            if(_dm_abs(err)<tol){
                if(_dm_abs(err)<_dm_abs(best.d)){
                    best={d:err,hit:true,frame:f};
                }
            }else if(!best.hit&&_dm_abs(err)<_dm_abs(best.d)){
                best={d:err,hit:false,frame:f};
            }
        }
        return best;
    },

    _corr:function(a,b){
        var n=a.length,i;
        if(n<3)return 0;
        var ma=0,mb=0;
        for(i=0;i<n;i++){ma+=a[i];mb+=b[i];}
        ma/=n;mb/=n;
        var va=0,vb=0,cab=0;
        for(i=0;i<n;i++){
            var da=a[i]-ma,db=b[i]-mb;
            va+=da*da;vb+=db*db;cab+=da*db;
        }
        if(va<1e-9||vb<1e-9)return 0;
        return cab/_dm_sqrt(va*vb);
    }
};
