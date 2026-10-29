/**
 * 弹 / 判定的形状归一 —— 给聚类用的"矩形估算" + 弹种键
 *
 * 引擎的判定形状一共有四种（见 STGCORE.js StgHitDef）：{ type, pos/rpos, range, rs, re, dir, rdir }
 *   type 0 圆    ：range = 半径
 *   type 1 激光  ：rs/re = 两端的半宽，ls/le = 沿 dir 的起止长度（由 danmaku_laser.js 处理）
 *   type 2 椭圆  ：rs = dir 垂直方向的半轴，re = 沿 dir 方向的半轴（见 STGCORE.js stgDist type 2）
 *   type 3 环    ：range = 外半径，rs = 内半径（甜甜圈，判定是一条中径 = (rs+re)/2 的细环）
 *
 * 聚类只需要一个矩形包络：
 *   - 退化成圆（|rx-ry| ≤ tol）→ 用半径 r，hx = hy = r
 *   - 真椭圆 → 旋转椭圆的轴对齐包围盒：
 *       hx = sqrt(rx²cos²θ + ry²sin²θ)
 *       hy = sqrt(rx²sin²θ + ry²cos²θ)
 *
 * 支持字段（两种写法都认）：
 *   {type, range, rs, re, rdir/dir, rd}   ← 引擎 hitdef
 *   {rx, ry, rot} / {rx} / {radius} / {r} ← 归一化后的弹
 * 输出：{ kind:"circle"|"ellipse"|"ring", hx, hy, r?, rx?, ry?, rot?, inner?, key }
 *   key 用来区分弹种：圆弹是 "c60"，椭圆是 "e200x40@45"，环是 "g120"；聚类时不同 key 不并组。
 */
var danmakuShape = {
    tol: 0.5,                     // 长短轴差小于它就算圆

    /** 引擎 hitdef → 形状；激光返回 null（要交给 danmaku_laser 采样，不是一个点） */
    fromHitDef: function (h) {
        if (!h) return null;
        if (h.type === 1) return null;
        if (h.type === 2) {
            var rot = (h.rdir !== undefined) ? h.rdir
                : ((h.dir || 0) + (h.rd === undefined ? 0 : h.rd));
            // stgDist(type 2)：沿 dir 的半轴是 re，垂直方向是 rs
            return this.parse({ rx: (h.re === undefined ? h.rs : h.re), ry: (h.rs === undefined ? h.re : h.rs), rot: rot });
        }
        if (h.type === 3) {
            var rmax = (h.range === undefined ? (h.re === undefined ? h.rs : h.re) : h.range);
            var rmin = (h.rs === undefined ? 0 : h.rs);
            if (!(rmax > 0)) return null;
            return { kind: "ring", r: rmax, hx: rmax, hy: rmax, inner: rmin,
                key: "g" + Math.round(rmax * 10) };
        }
        var r = (h.type === 0) ? h.range : (h.re || h.rs || 0);
        if (!(r > 0)) return null;
        return this.parse({ r: r });
    },

    parse: function (b) {
        var rx = (b.rx !== undefined) ? b.rx :
            (b.radius !== undefined) ? b.radius :
                (b.r !== undefined) ? b.r : 4;
        var ry = (b.ry !== undefined) ? b.ry : rx;
        var rot = b.rot || 0;
        if (Math.abs(rx - ry) <= this.tol) {
            var r = (rx + ry) * 0.5;
            return { kind: "circle", r: r, hx: r, hy: r,
                key: "c" + Math.round(r * 10) };
        }
        var c = Math.cos(rot), s = Math.sin(rot);
        var hx = Math.sqrt(rx * rx * c * c + ry * ry * s * s);
        var hy = Math.sqrt(rx * rx * s * s + ry * ry * c * c);
        return { kind: "ellipse", rx: rx, ry: ry, rot: rot, hx: hx, hy: hy,
            r: Math.max(rx, ry),
            key: "e" + Math.round(rx * 10) + "x" + Math.round(ry * 10) +
                "@" + Math.round(rot * 180 / Math.PI) };
    },

    /** 给一发弹补上 {hx,hy,skey}，供窗口扫描/聚类使用 */
    apply: function (b) {
        var s = this.parse(b);
        b.hx = s.hx; b.hy = s.hy; b.skey = s.key;
        if (s.kind === "circle") b.r = s.r;
        return b;
    },

    /** 引擎 hitdef 直接补到记录上；激光/退化返回 null 由调用方兜底 */
    applyHitDef: function (h, rec) {
        var s = this.fromHitDef(h);
        if (!s) return null;
        rec.hx = s.hx; rec.hy = s.hy; rec.skey = s.key; rec.r = s.r;
        return s;
    }
};

if (typeof module !== "undefined" && module.exports) module.exports = danmakuShape;
