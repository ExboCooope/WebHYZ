/**
 * 弹幕识别管线（三段式）
 *   1. vision(ctx, view)      真实弹 → id / 视野标记 → ctx.real
 *   2. run(ctx)               按注册顺序跑识别器；识别器只写 tags、只追加 type:"group"
 *   3. commit(ctx)            tracks / models / groups 写回 history
 *
 * 约定（2026-10-29 定）：
 *   - 视野是独立对象，只筛真实弹；合成弹组不参与视野过滤，由生成者用 ttl 续命。
 *   - 一个真实弹可以同时属于多个弹组；模型可以给子弹加任意 tags。
 *   - 决策层先看 groups 还是先看 real，由决策模型自己决定。
 *
 * 纯 ES5 + 全局对象，不依赖引擎。
 */
var danmakuPipeline = {
    recognizers: [],

    use: function (r) { this.recognizers.push(r); return this; },

    /**
     * raw:   引擎原始弹数组（或已归一化的对象）
     * history: 显式传进来，模型可直接读写
     * opt:   {frame, player, view}
     */
    begin: function (raw, history, opt) {
        opt = opt || {};
        return {
            frame: opt.frame || 0,
            view: opt.view || null,
            player: opt.player || null,
            history: history || { frame: -1, tracks: {}, models: {}, groups: {} },
            raw: raw || [],
            bullets: [], real: [], groups: [],
            models: _dp_copy((history || {}).models), used: {},
            stats: { raw: 0, visible: 0, groups: 0, ms: 0, skipped: [] }
        };
    },

    defaultView: function (player) {
        var px = player ? player.x : 192, py = player ? player.y : 400;
        return {
            precise: { x: px - 70, y: py - 150, w: 140, h: 180 },
            periphery: { x: px - 160, y: py - 300, w: 320, h: 340 }
        };
    },

    /** 第一段：视野 + id */
    vision: function (ctx, view) {
        var v = view || ctx.view || this.defaultView(ctx.player);
        var h = ctx.history, i, b, id, out = [];
        ctx.view = v;
        ctx.stats.bad = 0;
        ctx._tidx = null;                 // 跨帧 id 的空间索引：第一次要用时才建
        for (i = 0; i < ctx.raw.length; i++) {
            b = ctx.raw[i];
            b.x = +b.x; b.y = +b.y;
            if (!isFinite(b.x) || !isFinite(b.y)) { ctx.stats.bad++; continue; }
            b.p = _dp_inView(b, v.precise);
            b.q = b.p || _dp_inView(b, v.periphery);
            // 激光是整条光束：按点判"在不在视野里"会把远端整截剪掉，
            // 分类和 overlay 画出来都只剩半根，所以激光采样点一律保留。
            if (!b.q && !b.laser) continue;           // 视野外，不进入本轮
            // 取数层可以直接给 id（激光采样点是 "L:<光束>:<第几个点>"），
            // 有 id 就别再花一次跨帧匹配；引擎弹对象普遍没有 id，仍走 _matchId。
            id = (b.id !== undefined) ? b.id
                : ((b.src && b.src.id !== undefined) ? b.src.id : this._matchId(ctx, b));
            b.id = id; b.type = "real";
            b.tags = b.tags || {};
            out.push(b);
        }
        ctx.real = out;
        ctx.bullets = out.slice();
        ctx.stats.raw = ctx.raw.length;
        ctx.stats.visible = out.length;
        return ctx;
    },

    /**
     * 跨帧 id：在 history.tracks 里找最近邻（门限随速度放大），一帧内不重复分配。
     * tracks 可能上千条，所以按位置建一次网格索引再查近邻 —— 原版每条弹都全表扫一遍，
     * 密集帧里这一路就是几十万次距离计算。
     */
    _matchId: function (ctx, b) {
        var h = ctx.history.tracks || {}, gate = 12 + Math.sqrt(b.vx * b.vx + b.vy * b.vy) * 2;
        var cell = 24, idx = ctx._tidx, k, t, d, best = null, bd = gate, near, i, ck;
        if (!idx) {
            idx = { cell: cell, map: {} };
            for (k in h) {
                t = h[k];
                if (!t) continue;
                ck = Math.round(t.x / cell) + "," + Math.round(t.y / cell);
                if (!idx.map[ck]) idx.map[ck] = [];
                idx.map[ck].push(k);
            }
            ctx._tidx = idx;
        }
        var cx = Math.round(b.x / cell), cy = Math.round(b.y / cell);
        // 桶是 round(x/cell) 分的：距离 ≤ gate 的两点最多差 ceil(gate/cell)+1 个桶
        var span = Math.ceil(gate / cell) + 1;
        for (i = -span; i <= span; i++) {
            for (k = -span; k <= span; k++) {
                near = idx.map[(cx + i) + "," + (cy + k)];
                if (!near) continue;
                for (var j = 0; j < near.length; j++) {
                    var id2 = near[j];
                    if (ctx.used[id2]) continue;
                    t = h[id2];
                    if (!t) continue;
                    d = Math.sqrt((t.x - b.x) * (t.x - b.x) + (t.y - b.y) * (t.y - b.y));
                    if (d < bd) { bd = d; best = id2; }
                }
            }
        }
        if (best) { ctx.used[best] = 1; if (h[best]) h[best].seen = ctx.frame; return best; }
        var id = "b:" + ctx.frame + ":" + b.x.toFixed(0) + "," + b.y.toFixed(0), n = 2;
        while (ctx.used[id]) { id = "b:" + ctx.frame + ":" + b.x.toFixed(0) + "," + b.y.toFixed(0) + "#" + n; n++; }
        ctx.used[id] = 1;
        return id;
    },

    /** 第二段：识别器按顺序执行 */
    run: function (ctx) {
        var t0 = Date.now(), i, k, r, m, ok;
        for (i = 0; i < this.recognizers.length; i++) {
            r = this.recognizers[i];
            ok = true;
            if (r.requires) for (k = 0; k < r.requires.length; k++) if (!ctx.models[r.requires[k]]) ok = false;
            if (!ok) { ctx.stats.skipped.push(r.name + ":依赖缺失"); continue; }
            if (r.interval && r.interval > 1 && (ctx.frame % r.interval) !== 0 && ctx.models[r.name]) {
                if (r.idle) r.idle(ctx, ctx.models[r.name]);   // 降频：模型自己决定续命
                ctx.stats.skipped.push(r.name + ":降频");
                continue;
            }
            m = ctx.models[r.name] || (r.init ? r.init() : {});
            m = r.step(ctx, m) || m;
            ctx.models[r.name] = m;
        }
        ctx.stats.ms = Date.now() - t0;
        return ctx;
    },

    /** 第三段：写回 history（显式可见，供降级时用上一帧状态 + 时间推演） */
    commit: function (ctx) {
        var h = ctx.history, i, b, g, k, keep = {};
        h.frame = ctx.frame;
        h.view = ctx.view;
        for (i = 0; i < ctx.real.length; i++) {
            b = ctx.real[i];
            h.tracks[b.id] = { x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: b.r,
                color: b.color, age: b.age, f: ctx.frame };
            keep[b.id] = 1;
        }
        // 上一帧没再出现的弹就丢掉：tracks 只保留「本帧可见」这一份。
        // 不清理的话它只增不减，而 vision 的 _matchId 是线性扫描所有 tracks
        // （引擎弹对象没有 id，每发都要走一次匹配）—— 跑几分钟后每帧几十万次比较。
        for (k in h.tracks) if (!keep[k]) delete h.tracks[k];
        for (k in ctx.models) h.models[k] = ctx.models[k];
        h.groups = {};
        for (i = 0; i < ctx.groups.length; i++) {
            g = ctx.groups[i];
            if (g.drop || g.ttl <= 0) continue;
            h.groups[g.id] = g;
        }
        ctx.stats.groups = ctx.groups.length;
        return ctx;
    }
};

function _dp_copy(o) {
    var out = {}, k;
    if (!o) return out;
    for (k in o) out[k] = o[k];
    return out;
}

function _dp_rect(b, r) {
    return b.x >= r.x && b.x <= r.x + r.w && b.y >= r.y && b.y <= r.y + r.h;
}
/**
 * 视野既可能是矩形 {x,y,w,h}，也可能是圆 {cx,cy,r} —— 夜盲之歌那种
 * "只亮一小圈"的卡，玩家的可见范围是圆的，而且圆心不在自机上。
 */
function _dp_inView(b, r) {
    if (!r) return false;
    if (r.r !== undefined && r.r !== null) {
        var dx = b.x - r.cx, dy = b.y - r.cy;
        return dx * dx + dy * dy <= r.r * r.r;
    }
    return _dp_rect(b, r);
}

/* ---------------- 内置识别器：弹链 ---------------- */
/**
 * 每帧调 danmakuGroups.decompose 重新分组，把结果包装成 type:"group" 的“弹组弹”追加进数组。
 * 降频时（interval>1）走 idle()：用 history.groups 里的上一次结果 + Δ帧 续命。
 */
var danmakuChainRecognizer = {
    name: "chain",
    interval: 1,
    max_groups: 8,
    requires: [],
    init: function () { return { n: 0, frame: -1 }; },

    step: function (ctx, model) {
        var player = ctx.player || { x: 192, y: 404 };
        var srcs = ctx.real;   // 注意：传归一化记录（x/y/vx/vy/radius/age），不是引擎对象
        var nPre = 0, i0;
        for (i0 = 0; i0 < ctx.real.length; i0++) if (ctx.real[i0].p) nPre++;
        ctx.stats.precise = nPre;
        var vw = ctx.view;
        if (!nPre) {   // 降级：精确视野空 → 用余光当种子
            vw = { precise: ctx.view.periphery, periphery: ctx.view.periphery };
            ctx.stats.degraded = 1;
        }
        var out = danmakuGroups.decompose({ bullets: srcs, player: player },
            { view: vw, player_r: 2 });
        var cap = danmakuChainRecognizer.max_groups || 8;
        if (out.groups.length > cap) {
            out.groups = out.groups.slice(0, cap);
            ctx.stats.attention = "low";
            ctx.stats.truncated = (ctx.stats.truncated || 0) + 1;
        }
        var i, j, g, members, gb, sx, sy, k, sp, laser;
        model.frame = ctx.frame;
        for (i = 0; i < out.groups.length; i++) {
            g = out.groups[i];
            members = [];
            for (j = 0; j < g.bullets.length; j++) {
                k = g.bullets[j].i;
                if (ctx.real[k]) members.push(ctx.real[k]);
            }
            if (members.length < 2) continue;
            sx = 0; sy = 0; laser = 1;
            for (j = 0; j < members.length; j++) {
                sx += members[j].x; sy += members[j].y;
                if (!members[j].laser) laser = 0;
            }
            gb = {
                type: "group", id: "g:chain:" + (++model.n), source: "chain",
                x: sx / members.length, y: sy / members.length,
                vx: members[0].vx, vy: members[0].vy,
                r: g.density && g.density.spacing ? g.density.spacing / 2 : g.step / 2,
                gen: g.gen, path: null,
                parent: members.map(function (b) { return b.id; }),
                born: ctx.frame, ttl: 30, state: "fresh",
                degraded: ctx.stats.degraded || 0,
                tags: { label: g.label, kind: g.kind, n: g.n, step: g.step, evenness: g.evenness,
                    msf: g.msf, density: g.density, spacing: g.spacing, rel_step: g.rel_step,
                    // 整条链都是激光采样点：这一组其实是一条光束，画的时候要按宽度画
                    laser: laser, width: laser ? members[0].r : 0 }
            };
            ctx.bullets.push(gb);
            ctx.groups.push(gb);
            for (j = 0; j < members.length; j++) {
                members[j].tags.group = members[j].tags.group || [];
                members[j].tags.group.push(gb.id);
            }
        }
        return model;
    },

    /** 降频帧：不重算，把上一帧的组按时间外推、ttl 递减 */
    idle: function (ctx, model) {
        var h = ctx.history.groups || {}, k, g, dt;
        for (k in h) {
            g = h[k]; dt = ctx.frame - g.born;
            if (dt > 600) continue;
            g.ttl -= 1;
            g.state = "decayed";
            g.x += g.vx * 1; g.y += g.vy * 1;
            if (!g.drop && g.ttl > 0) { ctx.groups.push(g); ctx.bullets.push(g); }
        }
        model.frame = ctx.frame;
        return model;
    }
};

danmakuPipeline.use(danmakuChainRecognizer);

if (typeof module !== "undefined" && module.exports) module.exports = danmakuPipeline;
