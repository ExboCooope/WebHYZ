/**
 * 单帧弹组分解（算法1）+ 剖分评价（算法2）
 * ============================================================
 * 弹组的定义（用户 2026-10-29 定）：
 *   一组子弹 = 一条「等差数列链」：从前两发定一条（高阶空间里的）直线，
 *   判断步长是否可以外推，再去找下一条子弹；两个方向都要延伸；子弹尽量多；
 *   断了就另起一组。组与组可以重叠，只要不严格包含、两两相同的弹不超过 1 发。
 *
 *   因为「平行弹幕铺满整数坐标时能分解出非常多种组」，算法1 的定位是**候选生成器**：
 *   宁可多给候选（按「链越长、步长越稳、相邻越近」排序），由算法2 去挑一份剖分。
 *
 * 关键点：分组不用「公共发弹源」。平行弹幕没有源点，全程只用
 *   位置 + 速度方向 + 弹龄 + 弹种（半径/颜色） 这四类量。
 *
 * 尺度（用户 2026-10-29 定）：组的尺度必须是**局部间距**。
 *   被 24px 间距的弹幕包着时，281px 的环弹不是同一个威胁，不该算进同一组。
 *   所以每发的种子搜索半径 = 自己的局部间距（到最近 3 个邻居的中位距离）× 2.5，
 *   组的 rel_step = 步长 / 组内局部间距，排序时 rel_step 越小越优先。
 *
 * 四条度量（每组都给）：
 *   n          弹幕数量
 *   均分程度   evenness = 1 - std(步长)/mean(步长)          // 「最好能等间距」
 *   多甩复     θ = 弹型走向 与 速度方向 的夹角，index=θ/90°
 *                0=同向（前后一列）→ 多重弹；1=垂直（横着一排）→ 复数弹；中间 → 甩弹
 *                弹型走向用链上相邻三点的局部主方向（对平行弹幕同样成立）
 *   密度       difficulty：自机钻过这串弹的难易
 *                缝宽 gap = 步长 - 2×弹径；难度 = 自机需要的身位 / 缝宽（≥1 钻不过去）
 *
 * 输入：{player:{x,y,hitbox_r}, bullets:[{x,y,vx,vy,speed,dir_deg,radius,color,age}]}
 *       或裸 bullets 数组；age 用来算时间间距（缺失时退化为 0）。
 * 输出：见 decompose() / evaluate() 的注释。
 *
 * 纯 ES5 + 全局对象，不依赖引擎；Node 里可直接 require。
 */

var _dg_sin = Math.sin, _dg_cos = Math.cos, _dg_sqrt = Math.sqrt, _dg_atan2 = Math.atan2,
    _dg_acos = Math.acos, _dg_abs = Math.abs, _dg_max = Math.max, _dg_min = Math.min,
    _dg_round = Math.round, _dg_ceil = Math.ceil, _dg_PI = Math.PI, _dg_2PI = Math.PI * 2,
    _dg_DEG = 180 / Math.PI, _dg_RAD = Math.PI / 180;

/* ---------------- 小工具 ---------------- */

function _dg_mean(a) {
    var s = 0, i;
    if (!a.length) return 0;
    for (i = 0; i < a.length; i++) s += a[i];
    return s / a.length;
}
function _dg_std(a) {
    var m = _dg_mean(a), s = 0, i;
    if (a.length < 2) return 0;
    for (i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return _dg_sqrt(s / a.length);
}
function _dg_median(a) {
    if (!a.length) return 0;
    var b = a.slice().sort(function (x, y) { return x - y; }), i = b.length >> 1;
    return (b.length & 1) ? b[i] : (b[i - 1] + b[i]) * 0.5;
}
function _dg_clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
function _dg_wrapPi(a) {
    a = ((a + _dg_PI) % _dg_2PI + _dg_2PI) % _dg_2PI - _dg_PI;
    return a;
}
function _dg_dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return _dg_sqrt(dx * dx + dy * dy);
}
// 三点局部主方向（PCA），单位向量
function _dg_dir3(a, b, c) {
    var pts = [], i, mx = 0, my = 0, sxx = 0, syy = 0, sxy = 0, th;
    if (a) pts.push(a); if (b) pts.push(b); if (c) pts.push(c);
    if (pts.length < 2) return null;
    for (i = 0; i < pts.length; i++) { mx += pts[i].x; my += pts[i].y; }
    mx /= pts.length; my /= pts.length;
    for (i = 0; i < pts.length; i++) {
        sxx += (pts[i].x - mx) * (pts[i].x - mx);
        syy += (pts[i].y - my) * (pts[i].y - my);
        sxy += (pts[i].x - mx) * (pts[i].y - my);
    }
    if (sxx + syy < 1e-9) return null;
    th = 0.5 * _dg_atan2(2 * sxy, sxx - syy);
    return [_dg_cos(th), _dg_sin(th)];
}

/* ---------------- 归一化 + 空间索引 ---------------- */

function _dg_norm(state) {
    var src = null, out = [], i, b, vx, vy, sp, age, d;
    if (state && state.bullets) src = state.bullets;
    else if (state && state.length !== undefined) src = state;
    if (!src) return out;
    for (i = 0; i < src.length; i++) {
        b = src[i];
        vx = b.vx; vy = b.vy;
        if (vx === undefined || vy === undefined) {
            d = (b.dir_deg || 0) * _dg_RAD; sp = b.speed || 0;
            vx = _dg_cos(d) * sp; vy = _dg_sin(d) * sp;
        }
        out.push({
            i: i, x: b.x, y: b.y, vx: vx, vy: vy,
            sp: _dg_sqrt(vx * vx + vy * vy),
            ang: _dg_atan2(vy, vx),
            r: (b.radius === undefined) ? 4 : b.radius,
            color: b.color,
            laser: b.laser ? 1 : 0,        // 激光采样点：一束光的整体，不能按"点"算视野
            age: _dg_max(0, (b.age === undefined) ? 0 : b.age),   // 弹龄不许为负
            ox: b.x - vx * _dg_max(0, (b.age === undefined) ? 0 : b.age),
            oy: b.y - vy * _dg_max(0, (b.age === undefined) ? 0 : b.age),
            raw: b
        });
    }
    return out;
}

// 网格索引：按预测点的邻域找候选，避免 O(n²)
// useOrigin=true 时按「发弹点」(ox,oy) 建索引 —— 链外推是在发弹空间里做的，
// 用位置空间找候选会把整条弹道上的弹都扫进来。
function _dg_buildIndex(list, cell, useOrigin) {
    var idx = { cell: cell, map: {}, ox: !!useOrigin }, i, b, x, y, k;
    for (i = 0; i < list.length; i++) {
        b = list[i];
        if (idx.ox) { x = b.ox; y = b.oy; } else { x = b.x; y = b.y; }
        k = _dg_round(x / cell) + "," + _dg_round(y / cell);
        if (!idx.map[k]) idx.map[k] = [];
        idx.map[k].push(b);
    }
    return idx;
}
function _dg_near(idx, x, y, rad) {
    var c = idx.cell, out = [], cx = _dg_round(x / c), cy = _dg_round(y / c),
        i, j, k, arr, ix, iy, d, useOx = idx.ox;
    // 桶是按 round(x/c) 分的，所以"距离 ≤ rad 的两点"最多差 ceil(rad/c)+1 个桶，
    // 少给这一格就会漏掉边界上的邻居（局部间距/链外推都会因此偏差）。
    var span = _dg_ceil(rad / c) + 1;
    for (i = -span; i <= span; i++) {
        for (j = -span; j <= span; j++) {
            arr = idx.map[(cx + i) + "," + (cy + j)];
            if (!arr) continue;
            for (k = 0; k < arr.length; k++) {
                ix = (useOx ? arr[k].ox : arr[k].x) - x;
                iy = (useOx ? arr[k].oy : arr[k].y) - y;
                d = ix * ix + iy * iy;
                if (d <= rad * rad) out.push({ b: arr[k], d: _dg_sqrt(d) });
            }
        }
    }
    return out;
}

/* ---------------- 特征空间里的「近」 ---------------- */
/* 用户要求：挑最近的（位置、方向角/平行速度、时间、类型差别都要算） */

function _dg_nearCost(a, b, cfg) {
    var dx = a.x - b.x, dy = a.y - b.y;
    var dpos = _dg_sqrt(dx * dx + dy * dy);
    var dang = _dg_abs(_dg_wrapPi(a.ang - b.ang)) * cfg.ang_px;      // 角度差折算成弧长
    var dage = _dg_abs(a.age - b.age) * cfg.age_px;                  // 帧差折算成弧长
    var dtyp = (a.r !== b.r ? cfg.type_px : 0) + (a.color !== b.color ? cfg.type_px * 0.4 : 0);
    return dpos + dang * cfg.w_ang + dage * cfg.w_age + dtyp;
}

/* ---------------- 局部间距：弹组只在「同一间距尺度」上成立 ---------------- */
/**
 * 每发的局部间距 = 到最近 k 个邻居的距离的中位数。
 * 用户 2026-10-29：被 24px 间距的弹幕包住时，281px 的环弹根本不是同一个威胁，
 * 所以「挑最近」不是偷懒，而是分组本身的尺度定义。
 * idx 给了就只查邻域（半径自适应加倍，直到凑够 k 个），结果与原版的全量扫描一致。
 */
function _dg_localSpacing(list, k, idx) {
    var out = [], i, j, n = list.length, ds, near, rad, q, b;
    k = k || 3;
    for (i = 0; i < n; i++) {
        b = list[i];
        ds = [];
        if (idx) {
            rad = 24;
            for (j = 0; j < 8; j++) {
                ds.length = 0;
                near = _dg_near(idx, b.x, b.y, rad);
                for (q = 0; q < near.length; q++) if (near[q].b !== b) ds.push(near[q].d);
                if (ds.length >= k) break;
                rad *= 2;
            }
        } else {
            for (j = 0; j < n; j++) if (j !== i) ds.push(_dg_dist(list[i], list[j]));
        }
        ds.sort(function (a, b2) { return a - b2; });
        out[i] = ds.length ? _dg_median(ds.slice(0, _dg_min(k, ds.length))) : 0;
    }
    return out;
}

/* ---------------- 视野：精确视野 + 余光 ---------------- */
function _dg_view(v, player) {
    if (v && v.precise && v.periphery) return v;
    var px = player ? player.x : 192, py = player ? player.y : 400;
    v = v || {};
    return {
        precise: v.precise || { x: px - 70, y: py - 150, w: 140, h: 180 },
        periphery: v.periphery || { x: px - 160, y: py - 300, w: 320, h: 340 }
    };
}
function _dg_inRect(b, r) {
    return b.x >= r.x && b.x <= r.x + r.w && b.y >= r.y && b.y <= r.y + r.h;
}
/* 视野也可能是圆 {cx,cy,r}：夜盲之歌把"眼睛"挪到场地中间，可见范围是一盏灯 */
function _dg_inView(b, r) {
    if (!r) return false;
    if (r.r !== undefined && r.r !== null) {
        var dx = b.x - r.cx, dy = b.y - r.cy;
        return dx * dx + dy * dy <= r.r * r.r;
    }
    return _dg_inRect(b, r);
}
/* ---------------- 链生长 ---------------- */

/**
 * 从 [a,b,c] 起，用「步长不变、按上一段转角旋转」外推，找最近的下一发；
 * 两个方向都延伸；返回链（弹对象数组）。inSet 记录已用，避免重复。
 */
function _dg_feat(b, cfg) {
    // 发弹空间：发弹点(ox,oy) + 角度 + 弹龄，角度/弹龄折算成像素尺度
    return [b.ox, b.oy, b.ang * cfg.ang_px, b.age * cfg.age_px];
}

/**
 * 在发弹空间里做等差数列外推：
 *   两发定一步 → 预测下一发的 (发弹点, 角度, 弹龄) → 找匹配的弹 → 继续。
 * 环 = 角度等差（弹龄不变）；甩 = 角度与弹龄同步等差；多重 = 只有弹龄等差；
 * 平行墙 = 发弹点沿一条线等差。两头都延伸。
 */
function _dg_extend(chain, inSet, list, cfg, oidx) {
    var dir, guard, n, f1, f2, pred, i, b, bd, best, fd, d, predAng, predAge, tolA, tolG;
    var near = null, q, lim = cfg.pos_tol * 1.4143;   // 两个轴的容差 → 欧氏半径
    for (dir = 0; dir < 2; dir++) {
        if (dir === 1) chain.reverse();
        guard = 0;
        while (guard++ < cfg.max_len) {
            n = chain.length;
            f1 = _dg_feat(chain[n - 2], cfg);
            f2 = _dg_feat(chain[n - 1], cfg);
            pred = [f2[0] + (f2[0] - f1[0]), f2[1] + (f2[1] - f1[1]),
                    f2[2] + (f2[2] - f1[2]), f2[3] + (f2[3] - f1[3])];
            predAng = chain[n - 1].ang + (chain[n - 1].ang - chain[n - 2].ang);
            predAge = chain[n - 1].age + (chain[n - 1].age - chain[n - 2].age);
            best = null; bd = 1e9;
            // 只在预测点附近找（发弹空间的网格索引）；没给索引就退回全量扫描。
            // 原版每走一步都扫全部子弹，是这一路的真正热点（700 发时单帧 500ms+）。
            near = oidx ? _dg_near(oidx, pred[0], pred[1], lim) : null;
            var scanN = near ? near.length : list.length;
            for (i = 0; i < scanN; i++) {
                b = near ? near[i].b : list[i];
                if (inSet[b.i]) continue;
                if (!b.v1) continue;
                if (b.r !== chain[n - 1].r || b.color !== chain[n - 1].color) continue;
                fd = _dg_feat(b, cfg);
                if (_dg_abs(fd[0] - pred[0]) > cfg.pos_tol) continue;
                if (_dg_abs(fd[1] - pred[1]) > cfg.pos_tol) continue;
                if (_dg_abs(_dg_wrapPi(b.ang - predAng)) * _dg_DEG > cfg.ang_tol) continue;
                if (_dg_abs(b.age - predAge) > cfg.age_tol) continue;
                d = _dg_sqrt((fd[0] - pred[0]) * (fd[0] - pred[0]) +
                    (fd[1] - pred[1]) * (fd[1] - pred[1]) +
                    (fd[2] - pred[2]) * (fd[2] - pred[2]) +
                    (fd[3] - pred[3]) * (fd[3] - pred[3]));
                if (d < bd) { bd = d; best = b; }
            }
            if (!best) break;
            inSet[best.i] = 1;
            chain.push(best);
            if (chain.length > 4 && _dg_dist(chain[chain.length - 1], chain[0]) < 0.5) break;
        }
        if (dir === 1) chain.reverse();
    }
    return chain;
}

/* ---------------- 一条链 → 一个弹组（含四项度量） ---------------- */

function _dg_measure(chain, cfg, ls) {
    // 首尾重合的那一发是 W2 铺满 360° 时的重复弹，量之前先去掉
    if (chain.length > 4 && _dg_dist(chain[0], chain[chain.length - 1]) < 0.5) chain = chain.slice(0, chain.length - 1);
    var n = chain.length, i, steps = [], turns = [], ths = [], g = { n: n, bullets: chain };
    var a, b, c, dx, dy, v, pt, va;
    var fst = [], fa, fb;
    for (i = 1; i < n; i++) {
        steps.push(_dg_dist(chain[i - 1], chain[i]));
        fa = _dg_feat(chain[i - 1], cfg); fb = _dg_feat(chain[i], cfg);
        fst.push(_dg_sqrt((fa[0]-fb[0])*(fa[0]-fb[0])+(fa[1]-fb[1])*(fa[1]-fb[1])+(_dg_wrapPi(chain[i-1].ang-chain[i].ang)*cfg.ang_px)*(_dg_wrapPi(chain[i-1].ang-chain[i].ang)*cfg.ang_px)+(fa[3]-fb[3])*(fa[3]-fb[3])));
    }
    for (i = 1; i + 1 < n; i++) {
        a = chain[i - 1]; b = chain[i]; c = chain[i + 1];
        turns.push(_dg_wrapPi(_dg_atan2(c.y - b.y, c.x - b.x) - _dg_atan2(b.y - a.y, b.x - a.x)) * _dg_DEG);
        pt = _dg_dir3(a, b, c);
        if (!pt) continue;
        v = _dg_sqrt(b.vx * b.vx + b.vy * b.vy);
        if (v < 1e-6) continue;
        va = _dg_abs((pt[0] * b.vx + pt[1] * b.vy) / v);
        ths.push(_dg_acos(_dg_clamp(va, 0, 1)) * _dg_DEG);
    }
    g.step = _dg_median(steps);
    g.step_min = steps.length ? _dg_min.apply(null, steps) : 0;
    g.step_max = steps.length ? _dg_max.apply(null, steps) : 0;
    var fmean = _dg_mean(fst);
    g.step_cv = fmean > 1e-6 ? _dg_std(fst) / fmean : 1;
    g.evenness = _dg_clamp(1 - g.step_cv, 0, 1);                 // 均分程度
    g.turn = turns.length ? _dg_mean(turns) : 0;
    g.turn_std = _dg_std(turns);
    g.theta_deg = ths.length ? _dg_mean(ths) : null;             // 弹型走向 vs 速度
    g.msf = {
        angle_deg: g.theta_deg,
        index: g.theta_deg === null ? null : _dg_clamp(g.theta_deg / 90, 0, 1)
    };
    g.rot = { deg_step: g.turn, std: g.turn_std };
    g.radius = _dg_median(chain.map(function (p) { return p.r; }));
    g.speed = _dg_median(chain.map(function (p) { return p.sp; }));
    // 生成器：两发定一步，位置=发弹点+速度×弹龄，可按参数连续采样
    if (chain.length >= 2) {
        var q0 = chain[0], q1 = chain[1];
        g.gen = { ox: q0.ox, oy: q0.oy, ang: q0.ang, age: q0.age,
            dox: q1.ox - q0.ox, doy: q1.oy - q0.oy,
            dang: _dg_wrapPi(q1.ang - q0.ang), dage: q1.age - q0.age, sp: g.speed };
    }
    g.ages = chain.map(function (p) { return p.age; });
    g.age_span = g.ages.length ? (_dg_max.apply(null, g.ages) - _dg_min.apply(null, g.ages)) : 0;
    g.closed = n > 4 && _dg_dist(chain[0], chain[n - 1]) < g.step * 1.5;
    // 局部间距尺度：组的步长应当和它处在同一量级（rel_step≈1 才是"眼前这一片"）
    if (ls) {
        var sp = [];
        for (i = 0; i < n; i++) if (ls[chain[i].i] !== undefined) sp.push(ls[chain[i].i]);
        g.spacing = sp.length ? _dg_median(sp) : g.step;
    } else {
        g.spacing = g.step;
    }
    g.rel_step = g.step / _dg_max(0.1, g.spacing);
    g.kind = _dg_kind(g, cfg);
    g.label = danmakuGroups.NAMES[g.kind] || g.kind;
    g.conf = _dg_clamp(0.5 * g.evenness + 0.5 * (1 - _dg_clamp(g.turn_std / 20, 0, 1)), 0, 1);
    return g;
}

function _dg_kind(g, cfg) {
    if (g.n < 3) return "single";
    if (g.speed < 0.08) return "static";
    var t = _dg_abs(g.turn), idx = g.msf.index;
    if (idx === null) return "sweep";
    if (idx > 0.8) return g.closed ? "ring" : "fan";     // 走向与速度垂直：横着排（环/墙）
    if (t < cfg.straight_deg) {                          // 转角≈0 = 直线
        return idx < 0.25 ? "multi" : "fan";             // 沿弹道=多重；斜排=复数·直线
    }
    return "sweep";                                      // 只有转角不为零才是甩
}

/* ---------------- 密度：钻过这串弹的难易 ---------------- */

function _dg_density(g, ctx, cfg) {
    var pr = (ctx && ctx.player_r !== undefined) ? ctx.player_r : cfg.player_r;
    var vp = (ctx && ctx.player_speed) ? ctx.player_speed[0] : cfg.player_speed[0];
    // 缝宽按「局部间距」算：能打到你的是眼前这一片，不是整组的步长
    var sp = _dg_min(g.step, g.spacing === undefined ? g.step : g.spacing);
    var gap = sp - 2 * g.radius;                        // 相邻两弹之间的净缝
    var d = { step: g.step, spacing: sp, gap_px: gap, player_r: pr, player_speed: vp };
    if (gap <= 0) {
        d.gap_body = 0; d.difficulty = 1;
        return d;
    }
    d.gap_body = gap / _dg_max(0.5, 2 * pr);            // 缝里能塞下几个自机
    // 钻过去需要的身位 / 缝宽；再按「缝存在的时间」修正：缝以弹速掠过
    var need = 2 * pr, t_pass = gap / _dg_max(0.05, g.speed);   // 缝掠过一点的帧数
    var t_cross = need / _dg_max(0.05, vp);                     // 自机横穿身位所需帧数
    d.t_pass = t_pass; d.t_cross = t_cross;
    d.difficulty = _dg_clamp(_dg_max(need / gap, t_cross / _dg_max(0.05, t_pass)), 0, 1);
    return d;
}

/* ---------------- 剖分评价用的组内重算 ---------------- */
/**
 * 评价一个「别人给的组」时，不假设它一定是一条链：
 *   规整度 = 1 - std(组内最近邻间距)/mean
 *   纯度   = 多数弹种（半径）占比
 * 网格状的组（同一套弹的所有波）也能拿高分；组太碎/太杂由 MDL 和纯度扣。
 */
function _dg_refit(members, cfg) {
    var n = members.length, i, j, d, bd, steps = [], rcnt = {}, bestR = 0, rk, g;
    if (n < 2) return { n: n, evenness: 0.5, step: 0, turn: 0, turn_std: 0,
        theta_deg: null, msf: { index: null }, kind: "single", label: "单发", purity: 1 };
    for (i = 0; i < n; i++) {
        bd = 1e9;
        for (j = 0; j < n; j++) {
            if (i === j) continue;
            d = _dg_dist(members[i], members[j]);
            if (d < bd) bd = d;
        }
        if (bd < 1e9) steps.push(bd);
        rk = members[i].r;
        rcnt[rk] = (rcnt[rk] || 0) + 1;
    }
    for (rk in rcnt) if (rcnt[rk] > bestR) bestR = rcnt[rk];
    var step = _dg_median(steps), cv = step > 1e-6 ? _dg_std(steps) / step : 1;
    return {
        n: n, step: step, step_cv: cv,
        evenness: _dg_clamp(1 - cv, 0, 1),
        purity: bestR / n,
        turn: 0, turn_std: 0, theta_deg: null, msf: { index: null },
        kind: "group", label: "组"
    };
}

/* ================================================================ */

var danmakuGroups = {
    version: "0.2",
    cfg: {
        // 特征空间：角度差/帧差折算成多少像素
        ang_px: 80, age_px: 2.0,
        w_ang: 0.45, w_age: 0.35, type_px: 8,
        // 链生长（精确模式：快照是精确值，不做模糊匹配）
        nn_k: 10,             // 每发取多少个近邻当种子
        seed_min: 12,         // 种子搜索半径下限（px）
        seed_scale: 2.0,      // 种子搜索半径 = 该弹局部间距 × 这个
        step_ratio_lo: 0.94,  // 第三发与第一段的长度比允许范围
        step_ratio_hi: 1.06,
        step_eps: 0.04,       // 相邻两步的长度相对误差上限
        step_tol: 0.04,       // 预测点容差 = 步长 × 这个
        tol_min: 0.6, tol_max: 2.6, pos_tol: 0.9, ang_tol: 0.6,
        age_tol: 0.4,         // 预测弹龄的容差（帧）—— 跨波跳变在这里被卡死
        turn_max: 70 * Math.PI / 180,
        turn_consist: 1.5,    // 相邻两次转角之差上限（度），防止绕 Boss 拐弯
        max_len: 64,
        min_len: 3,
        max_seeds: 20000,
        max_groups: 300,
        straight_deg: 6,
        // 密度
        player_r: 2, player_speed: [4, 2],
        // 评价权重
        w_validity: 0.30, w_coverage: 0.20, w_fit: 0.25, w_mdl: 0.25
    },
    NAMES: {
        multi: "多重弹", fan: "复数弹", ring: "复数弹·环", sweep: "甩弹",
        static: "静止弹", single: "单发"
    },

    /**
     * 算法1：一帧 → 候选弹组（宁可多给，按「长、稳、近」排序）
     * opt: {player:{x,y,hitbox_r}, player_r, player_speed, cfg}
     */
    decompose: function (state, opt) {
        opt = opt || {};
        var cfg = opt.cfg || this.cfg;
        var list = _dg_norm(state), i, j, k, b, nb, cand, chain, key, key2, inSet;
        var idx = _dg_buildIndex(list, 24);
        var oidx = _dg_buildIndex(list, 16, true);   // 发弹点索引：链外推只在预测点附近找
        var seeds = [], seen = {}, groups = [], t0 = Date.now();
        var ls = _dg_localSpacing(list, 3, idx);
        var VW = _dg_view(opt.view || cfg.view, opt.player || (state && state.player));
        // 视野标记。激光是整条光束：只要它在场上就该被认出来，不能因为它"不在精确视野
        // 里就当一个远处的点"——那等于把最粗的那根威胁从分类里抹掉。所以激光点直接算可见。
        for (i = 0; i < list.length; i++) {
            list[i].v0 = list[i].laser ? 1 : _dg_inView(list[i], VW.precise);
            list[i].v1 = list[i].v0 || _dg_inView(list[i], VW.periphery);
        }          // 每发的局部间距（分组的尺度）

        // 1. 种子：每发在特征空间里的 k 个近邻，搜索半径按「自己的局部间距」缩放
        //    邻域用位置网格查（种子本来就是在 lim 半径内挑），不再全表扫描。
        var cands;
        for (i = 0; i < list.length; i++) {
            b = list[i];
            if (!b.v0) continue;
            var lim = _dg_max(cfg.seed_min, ls[i] * cfg.seed_scale);
            cand = [];
            cands = _dg_near(idx, b.x, b.y, lim);
            for (j = 0; j < cands.length; j++) {
                nb = cands[j].b;
                if (nb === b) continue;
                cand.push({ j: nb.i, c: _dg_nearCost(b, nb, cfg) });
            }
            cand.sort(function (p, q) { return p.c - q.c; });
            for (k = 0; k < _dg_min(cfg.nn_k, cand.length); k++) {
                nb = list[cand[k].j];
                key = i + ">" + nb.i;
                if (seen[key]) continue;
                seen[key] = 1;
                seeds.push([b, nb]);
                if (seeds.length >= cfg.max_seeds) break;
            }
        }

        // 2. 每个种子两发 → 先找第三发学会转角，再双向延伸
        var found = {};
        for (i = 0; i < seeds.length; i++) {
            var A = seeds[i][0], B = seeds[i][1];
            if (A.r !== B.r || A.color !== B.color) continue;
            inSet = {}; inSet[A.i] = 1; inSet[B.i] = 1;
            chain = _dg_extend([A, B], inSet, list, cfg, oidx);
            if (chain.length < cfg.min_len) continue;
            key2 = chain.map(function (p2) { return p2.i; }).sort(function (x, y) { return x - y; }).join(",");
            if (!found[key2] || found[key2].length < chain.length) found[key2] = chain;
        }


        // 3. 先算度量再挑：长 → 稳 → 直
        var all = [];
        for (key2 in found) {
            var g = _dg_measure(found[key2], cfg, ls);
            g.density = _dg_density(g, { player_r: opt.player_r, player_speed: opt.player_speed }, cfg);
            all.push(g);
        }
        all.sort(function (p, q) {
            if (q.n !== p.n) return q.n - p.n;                  // 先要长
            if (_dg_abs(p.rel_step - q.rel_step) > 0.4) return p.rel_step - q.rel_step;  // 再要"眼前这一片"
            return p.step_cv - q.step_cv;                        // 最后要稳
        });

        // 4. 选择：不严格包含、两两相同弹 ≤ 1 发（用户定的规则）
        var picked = [], used = {}, memCount = {};
        for (i = 0; i < all.length && picked.length < cfg.max_groups; i++) {
            g = all[i];
            var gset = {}, dup = 0, ok = true;
            for (j = 0; j < g.bullets.length; j++) gset[g.bullets[j].i] = 1;
            for (j = 0; j < picked.length && ok; j++) {
                var ps = picked[j]._set, inter = 0, s2;
                for (s2 in gset) if (ps[s2]) inter++;
                if (inter > 1) ok = false;
                if (inter === g.bullets.length && g.bullets.length < picked[j].n) ok = false;
                if (inter === picked[j].n && picked[j].n < g.bullets.length) ok = false;
            }
            if (!ok) continue;
            g._set = gset;
            g.id = picked.length + 1;
            g.desc = this.describe(g);
            picked.push(g);
        }
        // 5. 没有被任何组覆盖的弹（单发）
        var singles = [];
        for (i = 0; i < list.length; i++) {
            k = 0;
            for (j = 0; j < picked.length; j++) if (picked[j]._set[i]) k++;
            if (!k) singles.push(list[i]);
        }
        for (i = 0; i < picked.length; i++) delete picked[i]._set;
        return {
            groups: picked, singles: singles,
            view: VW,
            stats: { bullets: list.length, groups: picked.length, candidates: all.length,
                singles: singles.length, covered: list.length - singles.length,
                spacing: _dg_median(ls),
                ms: Date.now() - t0 }
        };
    },

    /**
     * 算法2：评价一份剖分
     * groups: [{id?, bullets:[弹序号 | 弹对象]}]
     * opt: {player_r, player_speed, truth:[每发标签], w_*}
     */
    evaluate: function (state, groups, opt) {
        opt = opt || {};
        var cfg = opt.cfg || this.cfg, list = _dg_norm(state), n = list.length;
        var i, j, s, ref, idx, sets = [], cover = [], viol = [];
        for (i = 0; i < n; i++) cover.push(0);
        for (i = 0; i < groups.length; i++) {
            var gi = groups[i], refs = gi.bullets || gi.members || [], seen = {}, mem = [];
            for (j = 0; j < refs.length; j++) {
                ref = refs[j]; idx = -1;
                if (typeof ref === "number") idx = ref;
                else if (ref && ref.i !== undefined) idx = ref.i;
                if (idx >= 0 && idx < n && !seen[idx]) { seen[idx] = 1; mem.push(list[idx]); }
            }
            sets.push({ id: (gi.id === undefined ? i : gi.id), seen: seen, members: mem });
        }
        var covered = 0, multi = 0;
        for (i = 0; i < sets.length; i++) for (idx in sets[i].seen) cover[idx]++;
        for (i = 0; i < n; i++) { if (cover[i] > 0) covered++; if (cover[i] > 1) multi++; }
        for (i = 0; i < sets.length; i++) {
            for (j = i + 1; j < sets.length; j++) {
                var na = 0, nb = 0, inter = 0, kk;
                for (kk in sets[i].seen) { na++; if (sets[j].seen[kk]) inter++; }
                for (kk in sets[j].seen) nb++;
                if (inter > 1) viol.push({ type: "overlap", a: sets[i].id, b: sets[j].id, n: inter });
                if (inter === na && na < nb) viol.push({ type: "contain", a: sets[i].id, b: sets[j].id, n: na });
                if (inter === nb && nb < na) viol.push({ type: "contain", a: sets[j].id, b: sets[i].id, n: nb });
            }
        }
        var per = [], sw = 0, sq = 0, spur = 0, mparam = 0, mdata = 0;
        for (i = 0; i < sets.length; i++) {
            s = sets[i];
            if (s.members.length < 2) {
                per.push({ id: s.id, n: s.members.length, quality: 0.5, note: "单发/空组" });
                continue;
            }
            var g = _dg_refit(s.members, cfg);
            var q = 0.60 * g.evenness + 0.40 * g.purity;
            var rEff = _dg_clamp(1 - g.evenness + (1 - g.purity) * 0.5, 0, 1);
            per.push({ id: s.id, n: g.n, quality: q, step: g.step,
                evenness: g.evenness, purity: g.purity, r_eff: rEff });
            sw += g.n; sq += g.n * q;
            mparam += 4;                                   // 每条链：起点+步长+转角+种类
            mdata += g.n * (2 + 8 * rEff);
        }
        var fit = sw ? sq / sw : 0;
        var dl = mparam * 6 + mdata, naive = _dg_max(1, n * 12);
        var mdl = _dg_clamp(1 - dl / naive, 0, 1);
        var truth = null;
        if (opt.truth && opt.truth.length === n) {
            var pure = 0, cnt = 0, okc = 0;
            for (i = 0; i < sets.length; i++) {
                var cnt2 = {}, bn = 0;
                for (idx in sets[i].seen) {
                    var L = opt.truth[idx];
                    cnt2[L] = (cnt2[L] || 0) + 1;
                    if (cnt2[L] > bn) bn = cnt2[L];
                }
                pure += bn; cnt += sets[i].members.length;
            }
            for (i = 0; i < n; i++) if (cover[i] > 0 && opt.truth[i] !== undefined) okc++;
            truth = { purity: cnt ? pure / cnt : 0, coverage: n ? okc / n : 0 };
            truth.f1 = (truth.purity + truth.coverage) > 0 ?
                2 * truth.purity * truth.coverage / (truth.purity + truth.coverage) : 0;
        }
        var validity = _dg_clamp(1 - viol.length / _dg_max(1, sets.length * (sets.length - 1) / 2), 0, 1);
        var coverage = n ? covered / n : 0;
        var wv = opt.w_validity === undefined ? cfg.w_validity : opt.w_validity;
        var wc = opt.w_coverage === undefined ? cfg.w_coverage : opt.w_coverage;
        var wf = opt.w_fit === undefined ? cfg.w_fit : opt.w_fit;
        var wm = opt.w_mdl === undefined ? cfg.w_mdl : opt.w_mdl;
        var wsum = wv + wc + wf + wm;
        var parts = { validity: validity, coverage: coverage, fit: fit, mdl: mdl };
        if (truth) parts.truth = truth;
        return {
            score: 100 * (wv * validity + wc * coverage + wf * fit + wm * mdl) / (wsum || 1),
            parts: parts, perGroup: per, violations: viol,
            n: n, covered: covered, multi: multi, groups: sets.length,
            mdl: { params: mparam, bits_model: mparam * 6, bits_data: mdata, dl: dl, naive: naive }
        };
    },

    describe: function (g) {
        var s = (g.label || g.kind) + " n=" + g.n + " 步长=" + g.step.toFixed(1);
        s += " 均分=" + g.evenness.toFixed(2);
        if (g.msf && g.msf.index !== null) s += " 多甩复=" + g.msf.index.toFixed(2);
        s += " 转角=" + g.turn.toFixed(1) + "°";
        if (g.density) s += " 密度=" + g.density.difficulty.toFixed(2);
        return s;
    },

    // 内部件，供单测
    _norm: _dg_norm, _measure: _dg_measure, _density: _dg_density, _extend: _dg_extend
};

if (typeof module !== "undefined" && module.exports) module.exports = danmakuGroups;

