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
        //1. 按回推源点聚类 —— 同时按速度分桶：
        //   同一个 Boss 会从同一个点同时发好几种弹（lDY 圈、mZY 圈、sXY 扇，速度 2.5/2.0/1.8 很接近），
        //   只按源点聚会把它们混成一锅，角度网格和对称阶数就全乱了。速度用相对容差才能把 2.0 和 1.8 分开。
        var clusters=[],k;
        for(i=0;i<list.length;i++){
            var b=list[i],home=null,bd=this.origin_cell*this.origin_cell;
            for(k=0;k<clusters.length;k++){
                var c=clusters[k];
                var dx=c.ox-b.ox,dy=c.oy-b.oy;
                var d=dx*dx+dy*dy;
                var sptol=_dm_max(0.06,c.sp*0.04);
                if(d<bd&&_dm_abs(c.sp-b.sp)<=sptol){bd=d;home=c;}
            }
            if(home){
                home.members.push(b);
                home.n++;
                //源点/速度用成员均值慢慢修正（避免一开始被单发带偏）
                home.ox+= (b.ox-home.ox)/home.n;
                home.oy+= (b.oy-home.oy)/home.n;
                home.sp+= (b.sp-home.sp)/home.n;
            }else{
                clusters.push({ox:b.ox,oy:b.oy,sp:b.sp,n:1,members:[b]});
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

        //---- 按「波」分组：同一帧发射的一批算一波（圈弹/排弹/多重齐射都是一波）----
        //关键改动：判甩弹不再看"数组顺序里相邻两颗的角度差"（记忆里顺序会乱，
        //真机实测同一帧同一组子弹，raw 顺序是有序的、记忆顺序是乱的，于是 raw 判 ring_whip、
        //记忆判 fan）。现在只比较相邻两波的角度集合，顺序无关。
        var volleys=this._volleys(m);
        //对称阶数用整簇里最完整的那一波来估（缺弹会拉低集中度），再统一给每一波算相位；
        //这样各波的相位才在同一把尺子上。用谐波集中度而不是"弹数/角间隙"，
        //因为这一作 12 发一圈实际是 11 个角度（首尾重合），拿 12 当阶数相位会乱。
        var bestV=null;
        for(i=0;i<volleys.length;i++){
            if(!bestV||volleys[i].n>bestV.n)bestV=volleys[i];
        }
        var ord=bestV?this._orderGuess(bestV):0;
        if(ord>=3){
            for(i=0;i<volleys.length;i++)this._volleyPhase(volleys[i],ord);
        }
        var kind="fan",sweep=0,conf=0.6,rot=0,seqCons=0;
        //"圈"的判据：整组跨度够大，或者有 ≥2 波本身就铺得很宽（每波≥90°）。
        //后者是为了扛视野裁剪：一圈 12 发只看见半圈时整组跨度不到 360°，但每波仍有 ~150°。
        var wide=0;
        for(i=0;i<volleys.length;i++){
            if(volleys[i].spread>=1.5)wide++;
        }
        var ringish=(spread>=this.ring_spread)||(wide>=2);
        if(volleys.length<2){
            if(spread<this.angle_multi){
                kind="multi";
            }else if(ringish){
                kind="ring";
                conf=0.7;
            }else{
                kind="fan";
            }
        }else{
            var deltas=[],pos=0,neg=0,sum=0,d;
            for(i=1;i<volleys.length;i++){
                d=this._pairOffset(volleys[i-1],volleys[i]);
                if(d===null)continue;
                deltas.push(d);
                sum+=d;
                if(d>0.02)pos++;else if(d<-0.02)neg++;
            }
            var rotCons=(deltas.length>0)?_dm_max(pos,neg)/deltas.length:0;
            var meanDelta=deltas.length?sum/deltas.length:0;
            //至少三波（两次相邻比较）才敢说"在转"：两波一对比，噪声很容易凑出一个大角度
            var rotating=(deltas.length>=2&&rotCons>=0.6&&_dm_abs(meanDelta)>=0.02);
            if(rotating){
                kind=ringish?"ring_whip":"whip";
                sweep=meanDelta>0?1:-1;
                conf=_dm_min(1,0.55+rotCons*0.4);
            }else if(ringish){
                //多波 + 每波都很宽，但角度不转：就是连续发圈（圈弹），别硬说成圈甩
                kind="ring";
                conf=0.6;
            }else if(spread<this.angle_multi){
                kind="multi";
            }else{
                kind="fan";
            }
            rot=meanDelta;
            seqCons=rotCons;
        }
        var g=this._mk(gid,kind,base);
        g.sweep=sweep;
        g.sweep_mag=rot;
        g.seq_consistency=seqCons;
        g.volleys=volleys.length;
        g.order=ord||0;
        g.deltas=[];   //调试用：相邻两波的旋转量（度）
        for(i=1;i<volleys.length;i++){
            var dt=this._pairOffset(volleys[i-1],volleys[i]);
            if(dt!==null)g.deltas.push(_dm_round(dt*57.3*10)/10);
        }
        g.conf=conf;
        if(kind==="multi"){
            //沿方向看速度是递增还是递减
            var sorted=m.slice().sort(function(a,b){
                return (a.x*_dm_cos(mean)+a.y*_dm_sin(mean))-(b.x*_dm_cos(mean)+b.y*_dm_sin(mean));
            });
            var ramp=1;
            for(i=1;i<sorted.length;i++){
                if(sorted[i].sp<sorted[i-1].sp-0.02){ramp=0;break;}
            }
            g.speed_ramp=ramp?1:-1;   //1=沿方向速度递增,-1=递减
            g.conf=_dm_min(1,0.5+0.1*n);
        }
        out.groups.push(g);
        return out;
    },

    //把同一源点簇按"发射帧"切成若干波，并算每波的角度统计
    //注意顺序：age 大的先发，按"发射顺序"排（先发的在前），旋转量才是时间上的方向
    _volleys:function(m){
        var srt=m.slice().sort(function(a,b){return b.age-a.age;});
        var vols=[],cur=null,i,j;
        for(i=0;i<srt.length;i++){
            var b=srt[i];
            if(cur&&b.age===cur.age){
                cur.members.push(b);
            }else{
                cur={age:b.age,members:[b]};
                vols.push(cur);
            }
        }
        for(i=0;i<vols.length;i++){
            var v=vols[i],n=v.members.length,sx=0,sy=0;
            for(j=0;j<n;j++){sx+=_dm_cos(v.members[j].ang);sy+=_dm_sin(v.members[j].ang);}
            v.mean=_dm_atan2(sy,sx);
            //方向性：圆平均向量的长度。一圈弹≈0，扇形弹≈1（用来判断"是不是绕了一圈"）
            v.res=_dm_sqrt(sx*sx+sy*sy)/_dm_max(1,n);
            v.n=n;
            v.angles=[];
            var hi=-9,lo=9;
            for(j=0;j<n;j++){
                var a=v.members[j].ang;
                v.angles.push(a);
                var da=a-v.mean;
                while(da>_dm_PI)da-=_dm_PI*2;
                while(da<-_dm_PI)da+=_dm_PI*2;
                v.members[j].vrel=da;
                if(da>hi)hi=da;
                if(da<lo)lo=da;
            }
            v.angles.sort(function(p,q){return p-q;});
            v.spread=(n>1)?(hi-lo):0;
            this._volleyPhase(v);
        }
        return vols;
    },

    //"波的方向相位"：对 n 重对称的一圈弹，用 n 次谐波取相位 —— 圈弹整体转多少，相位就转多少，
    //而且**跟看见几发无关**（缺掉几发不影响各发的 n·θ 同相），特别适合视野被裁掉一半的情况。
    //相位天然只有模 2π/n（=角间距）的意义，所以"转 23°"和"转 -7°"是一回事，返回的就是那个慢的。
    //order 由 _orderGuess 估（取整簇里最完整那一波的角间距），传进来就统一用这个 order。
    _volleyPhase:function(v,order){
        var n=v.n,i;
        if(n<3)return null;
        if(!order){
            if(v.spread<=0.5)return null;
            order=this._orderGuess(v);
            if(!order)return null;
        }
        var sx=0,sy=0;
        for(i=0;i<n;i++){
            var a=v.angles[i]*order;
            sx+=_dm_cos(a);
            sy+=_dm_sin(a);
        }
        v.order=order;
        v.phase=_dm_atan2(sy,sx)/order;
        return v.phase;
    },

    //估计这一波的对称阶数。
    //不能直接拿"波里有几发"当阶数：这一作的圈弹是 W2 按 angle_spread/(n-1) 铺满 360°，
    //12 发实际是 11 个互不相同的角度（首尾重合），对称阶数是 11 不是 12。
    //所以改用谐波集中度：对候选阶数 m，C(m)=|Σ e^{i·m·θ}|/n，只有真正的对称阶数才能让所有项同相。
    //取 C 最大的那个（相同分数取小 m）；只看"第一个过线"会被少量子弹的偶然集中骗到。
    _orderGuess:function(v){
        var n=v.n,i,m;
        if(n<3)return 0;
        var bestM=0,bestC=0;
        for(m=3;m<=16;m++){
            var sx=0,sy=0;
            for(i=0;i<n;i++){
                sx+=_dm_cos(v.angles[i]*m);
                sy+=_dm_sin(v.angles[i]*m);
            }
            var c=_dm_sqrt(sx*sx+sy*sy)/n;
            if(c>bestC+0.015){
                bestC=c;bestM=m;
            }else if(c>=bestC-0.015&&m<bestM&&bestC<0.999){
                bestM=m;   //分数接近时取更小的阶数（12 发均匀分布时 3/4/6 也合格，用粗的没问题）
            }
        }
        if(bestC<0.9)return 0;
        return bestM;
    },

    //两波之间的整体旋转量（在 ±角间距/2 内给出绝对值最小的那个解）
    _pairOffset:function(a,b){
        if(a.phase!==undefined&&b.phase!==undefined&&a.order===b.order){
            var dd=b.phase-a.phase;
            var spacing=_dm_PI*2/a.order;
            while(dd>spacing/2)dd-=spacing;
            while(dd<-spacing/2)dd+=spacing;
            return dd;
        }
        var d2=b.mean-a.mean;
        while(d2>_dm_PI)d2-=_dm_PI*2;
        while(d2<-_dm_PI)d2+=_dm_PI*2;
        return d2;
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
