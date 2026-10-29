/**
 * 稳定弹（弹团）识别器 —— 算法原型
 *
 * 判据（ESC 文章「稳定弹」）：一组子弹彼此**相对位置不变**。
 * 在单帧里表现为：速度几乎相同 + 空间上抱成一坨（不是一列）。
 *
 *   1. 先按速度分组（|Δv| 与 角度差 都在容差内）
 *   2. 组内做空间单链聚类，门限 = 3 × 弹径，**且弹种必须一致**
 *      —— 半径不同的弹贴在一起不是"相对位置不变"（大玉 42px 的窗口会把旁边
 *      一圈小玉全吞进来，聚出来的是"贴脸的一堆弹"，不是弹团）
 *   3. 剔除「细长」的簇（沿运动方向排成一列的其实是多重弹/弹链，不是弹团）
 *      —— 用 PCA 主轴比 (λ1/λ2)^{1/2}，大于 max_ratio 就不算团
 *   4. 保留 n ≥ min_n 的团
 *
 * 输出：{ members, n, x, y, r, ratio, vx, vy }
 */
var danmakuStable = {
    cfg: {
        dv: 0.15,                 // 速度差容差
        dang: 3 * Math.PI / 180,  // 速度方向差容差
        gap: 3.0,                 // 空间聚类门限 = gap × 弹径
        min_n: 4,                 // 至少几发才算一团
        max_ratio: 6,             // 主轴比超过它就当弹链，不当弹团
        max_clumps: 6             // 一帧最多报几个团（性能上限）
    },

    /** 弹种键：形状归一后的 skey（无则退回半径）——不同键的弹不许并组 */
    _typeKey: function (b) {
        if (b.skey !== undefined) return b.skey;
        return "r" + (b.r === undefined ? 4 : b.r);
    },

    detect: function (list, cfg0) {
        var cfg = cfg0 || this.cfg, i, j, b, out = [], vel = [], cl, k, c, key, tk;
        // 1) 按速度分组
        for (i = 0; i < list.length; i++) {
            b = list[i];
            var home = null, bd = 1e9;
            for (k = 0; k < vel.length; k++) {
                c = vel[k];
                var dv = Math.sqrt((c.vx - b.vx) * (c.vx - b.vx) + (c.vy - b.vy) * (c.vy - b.vy));
                var da = Math.abs(Math.atan2(c.vy, c.vx) - Math.atan2(b.vy, b.vx));
                da = Math.abs(((da + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
                if (dv <= cfg.dv && da <= cfg.dang && dv < bd) { bd = dv; home = c; }
            }
            if (home) { home.members.push(b); home.n++; }
            else vel.push({ vx: b.vx, vy: b.vy, members: [b], n: 1 });
        }
        // 2) 每个速度组内做单链聚类（同弹种才连边）
        var self = this;
        for (k = 0; k < vel.length; k++) {
            var ms = vel[k].members, clusters = [], used = {};
            for (i = 0; i < ms.length; i++) {
                if (used[i]) continue;
                var stack = [i], group = [];
                used[i] = 1;
                while (stack.length) {
                    var cur = ms[stack.pop()];
                    group.push(cur);
                    tk = self._typeKey(cur);
                    for (j = 0; j < ms.length; j++) {
                        if (used[j]) continue;
                        if (self._typeKey(ms[j]) !== tk) continue;
                        var lim = cfg.gap * Math.max(cur.r || 4, ms[j].r || 4);
                        var ddx = cur.x - ms[j].x, ddy = cur.y - ms[j].y;
                        if (ddx * ddx + ddy * ddy <= lim * lim) { used[j] = 1; stack.push(j); }
                    }
                }
                clusters.push(group);
            }
            for (i = 0; i < clusters.length; i++) out.push(clusters[i]);
        }
        // 3) 统计 + 过滤
        var res = [];
        for (i = 0; i < out.length; i++) {
            var g = out[i];
            if (g.length < cfg.min_n) continue;
            var sc = this._shape(g);
            if (sc.ratio > cfg.max_ratio) continue;     // 细长 = 弹链，不是弹团
            res.push(sc);
        }
        res.sort(function (a, b) { return b.n - a.n; });
        this.truncated = 0;
        if (res.length > cfg.max_clumps) { res = res.slice(0, cfg.max_clumps); this.truncated = 1; }
        return res;
    },

    _shape: function (g) {
        var n = g.length, i, mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0, th, l1, l2, R = 0;
        for (i = 0; i < n; i++) { mx += g[i].x; my += g[i].y; }
        mx /= n; my /= n;
        for (i = 0; i < n; i++) {
            var dx = g[i].x - mx, dy = g[i].y - my;
            sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d > R) R = d;
        }
        var tr = (sxx + syy) / n, det = (sxx * syy - sxy * sxy) / (n * n);
        var disc = Math.max(0, tr * tr / 4 - det);
        l1 = tr / 2 + Math.sqrt(disc); l2 = tr / 2 - Math.sqrt(disc);
        var ratio = l2 > 1e-9 ? Math.sqrt(l1 / l2) : 999;
        return { members: g, n: n, x: mx, y: my, r: R, skey: this._typeKey(g[0]),
            ratio: ratio, vx: g[0].vx, vy: g[0].vy };
    }
};

/* 识别器包装：把弹团追加成 type:"group" */
var danmakuStableRecognizer = {
    name: "stable",
    interval: 1,
    requires: [],
    init: function () { return { n: 0 }; },
    step: function (ctx, model) {
        var res = danmakuStable.detect(ctx.real, danmakuStable.cfg), i, j, k, c, gb, p, pl = [], prev = ctx.history.groups || {}, ov, best, bOv, drift;
        for (k in prev) if (prev[k] && prev[k].source === "stable") pl.push(prev[k]);
        for (i = 0; i < res.length; i++) {
            c = res[i];
            best = null; bOv = 0;
            for (j = 0; j < pl.length; j++) {
                p = pl[j]; ov = 0;
                for (k = 0; k < c.members.length; k++)
                    if (p.parent && p.parent.indexOf(c.members[k].id) >= 0) ov++;
                if (ov > bOv && ov >= c.members.length * 0.6) { bOv = ov; best = p; }
            }
            drift = best ? Math.abs(c.r - best.tags.radius) / Math.max(1, best.tags.radius) : 0;
            gb = {
                type: "group",
                id: best ? best.id : "g:stable:" + (++model.n),
                source: "stable",
                x: c.x, y: c.y, vx: c.vx, vy: c.vy, r: c.r,
                gen: null, path: null,
                parent: c.members.map(function (b) { return b.id; }),
                born: best ? best.born : ctx.frame,
                hits: best ? ((best.hits || 1) + 1) : 1,
                drift: drift,
                ttl: 45, state: "candidate",
                tags: { label: "稳定弹团", n: c.n, ratio: c.ratio, radius: c.r, skey: c.skey }
            };
            if (gb.hits >= 3 && drift < 0.05) gb.state = "stable";
            ctx.bullets.push(gb);
            ctx.groups.push(gb);
            for (j = 0; j < c.members.length; j++) {
                c.members[j].tags = c.members[j].tags || {};
                c.members[j].tags.stable = gb.id;
            }
        }
        model.frame = ctx.frame;
        return model;
    }};

if (typeof module !== "undefined" && module.exports) module.exports = danmakuStable;
