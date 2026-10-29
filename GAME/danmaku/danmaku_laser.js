/**
 * 直线激光 → 采样点（让弹团和弹链都能"看见"激光）
 *
 * 激光在引擎里是一个长条判定（hitdef.type === 1），直接参与聚类会被当成 1 发大弹
 * ——而且位置正好落在它的**起点**，整条光束在分类里等于不存在。
 * 这里沿轴线等距采样成若干伪子弹：
 *   - 弹团的窗口扫描会顺着激光铺开（"沿激光蔓延"）
 *   - 弹链会把这些等距共线的采样点认成一条多重弹（出来的就是我们想画的那条线）
 *
 * 引擎的激光（STGCORE.js StgHitDef.setLaserA1）：rpos + rdir + ls/le + rs/re
 *   rpos  = 光束起点（场地坐标，= 物体 pos + hitdef.pos）
 *   rdir  = 光束角度（= dir + 物体 rotate[2]）
 *   ls/le = 沿 rdir 的起止长度，可能倒序、也可能是负数（从物体背后伸出）
 *   rs/re = 两端的**半宽**，两端不同 = 锥形激光
 *
 * laser = { id?, x1,y1, x2,y2, width, dir?, speed?, color?, age?, sid? }
 * 采样点：{ x, y, vx, vy, r: width/2, color, age, id, src, sid, __laser, __t, type:"laser" }
 */
var danmakuLaser = {
    cfg: { step: 10, min_len: 20, max_points: 48 },   // 采样间距 / 太短的激光不采样 / 单条激光最多几个点

    /**
     * 引擎激光 hitdef → 线段描述。
     * 激光没展开（state != 2）时没有 hitdef，调用方本来也看不到它；
     * 这里只做几何换算，输出的是"这条光束现在有多长、多宽、指向哪"。
     */
    fromHitDef: function (h, extra) {
        if (!h || h.type !== 1 || !h.rpos) return null;
        var ls = (h.ls === undefined ? 0 : h.ls);
        var le = (h.le === undefined ? 0 : h.le);
        if (le < ls) { var t = ls; ls = le; le = t; }
        var len = le - ls;
        if (!(len > 0)) return null;
        var d = (h.rdir !== undefined) ? h.rdir : ((h.dir || 0) + (h.rd === undefined ? 0 : h.rd));
        var c = Math.cos(d), s = Math.sin(d);
        var w = ((h.rs === undefined ? 0 : h.rs) + (h.re === undefined ? 0 : h.re));
        var out = {
            x1: h.rpos[0] + c * ls, y1: h.rpos[1] + s * ls,
            x2: h.rpos[0] + c * le, y2: h.rpos[1] + s * le,
            width: w > 0 ? w : 2,
            dir: d, speed: (extra && extra.speed !== undefined) ? extra.speed : 1
        };
        if (extra) for (var k in extra) out[k] = extra[k];
        return out;
    },

    sample: function (lasers, cfg0) {
        var cfg = cfg0 || this.cfg, out = [], i, j, L, dx, dy, len, n, k, ux, uy, t, sp, step;
        for (i = 0; i < lasers.length; i++) {
            L = lasers[i];
            dx = L.x2 - L.x1; dy = L.y2 - L.y1;
            len = Math.sqrt(dx * dx + dy * dy);
            if (len < cfg.min_len) continue;
            ux = dx / len; uy = dy / len;
            // 采样间距不小于弹径，免得一发激光自己就塞满候选；点数再封顶
            step = Math.max(cfg.step, (L.width || 0) * 0.5);
            n = Math.round(len / step);
            if (n < 1) n = 1;
            if (n > (cfg.max_points || 48)) n = cfg.max_points || 48;
            // 激光本身没有"弹龄"：采样点都是同一时刻存在于光束上的位置，
            // 给 0 才不会让弹链把发弹点推歪；speed 用 1 只是借它带上"光束方向"。
            sp = L.speed === undefined ? 1 : L.speed;
            for (k = 0; k <= n; k++) {
                j = n ? k / n : 0;
                t = j;
                out.push({
                    x: L.x1 + dx * t, y: L.y1 + dy * t,
                    vx: ux * sp, vy: uy * sp,
                    r: (L.width === undefined ? 6 : L.width) / 2,
                    color: L.color === undefined ? 9 : L.color,
                    age: L.age === undefined ? 0 : L.age,
                    id: "L:" + (L.id === undefined ? i : L.id) + ":" + k,
                    src: L,
                    sid: L.sid || 0,
                    laser: 1,                                // vision() 会把 type 改成 "real"，
                    __laser: (L.id === undefined ? i : L.id), __t: t,
                    type: "laser"
                });
            }
        }
        return out;
    },

    /** 把激光采样点并进弹数组（供窗口扫描 / 弹链使用） */
    expand: function (list, lasers, cfg) {
        var pts = this.sample(lasers, cfg), i;
        for (i = 0; i < pts.length; i++) list.push(pts[i]);
        return list;
    }
};

if (typeof module !== "undefined" && module.exports) module.exports = danmakuLaser;
