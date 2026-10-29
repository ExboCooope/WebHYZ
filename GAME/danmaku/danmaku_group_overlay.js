/**
 * 弹链 / 弹团 的单帧可视化（overlay）
 *
 * 只画两样东西：
 *   1. 弹链的线（按组的 gen 参数连续采样，不画采样点）
 *   2. 弹团的圈，以及被识别成一条链的激光（按光束宽度画）
 * 视野框保留，但必须和场地对齐。
 *
 * 数据来源：danmakuPipeline（vision → 弹链/弹团识别器 → 提交），默认每 2 帧识别一次。
 * 挂载：和 danmaku_overlay.js 一样包 _stgStartLevel；另外每 30 帧 ensureOnTop()，
 *       因为 SHW 读盘后 frame 画布的 z-index 会停在 30，把 ui 画布（本 overlay）压在下面。
 *
 * 开关（都在 STGGLOBAL.js，运行期控制台可改，下一帧生效）：
 *   stg_show_danmaku_group = 0/1      总开关（默认关，和另外两个调试 overlay 一致）
 *   stg_danmaku_group_max_chains = 8  一帧最多几个弹链
 *   stg_danmaku_group_max_clumps = 6  一帧最多几个弹团
 *   stg_danmaku_group_interval = 2    每几帧重算一次（单帧太贵时会自动临时放大）
 *
 * ---- 取数（最常出错的地方）----
 * 坐标在 hitdef.rpos（= 物体 pos + hitdef.pos，由 STGCORE.js _stgEngineObjHit 每帧 update），
 * 速度在 move._speed[0/1]，弹龄是 object.frame，颜色在 (o._obj||o).color。
 * 判定形状按 hitdef.type 分四种（STGCORE.js StgHitDef）：
 *   0 圆    —— range 就是半径
 *   1 激光  —— rpos/rdir/ls/le/rs/re，是一条光束，不是一个点：交给 danmakuLaser 采样成点，
 *              否则整条激光在分类里只剩起点上的一个 8px 小点（本轮修的就是这个）
 *   2 椭圆  —— rs/re 是两条半轴（沿 dir 的是 re），交给 danmakuShape 折算成 hx/hy/skey
 *   3 环    —— range 是外半径，rs 是内半径
 *
 * ---- 坐标 ----
 * 引擎和管线里的 x/y 全是「场地坐标」：左上角 (0,0)，右下角 (stg_frame_w, stg_frame_h)。
 * 但 UI 画布（drawUI → default_2d_misc_shader / testShader2）是整块画面，默认 640x480，
 * 场地只是画布上的一块。场地坐标 → 画布坐标要加场地左上角的偏移：
 *
 *   SHW：GAME/shw/shw_loader.js:209  stgSetPositionA1(hyz.full_screen_object, 32, 16)
 *        → 场地 384x448 的纹理画在 640x480 画布的 (32,16)，1:1 不缩放
 *   HYZ：GAME/hyz/hyz_loader.js:179  stgSetPositionA1(hyz.full_screen_object, 16, 16)
 *   双画面：再用 hyzGetFramePos(sid, p, p) 把 sid 2/3 的场地平移到右半屏（+336）
 *
 * 这套换算和 GAME/default_hitbox_overlay.js（_stgHitboxOverlayOffset / _stgHitboxDrawOne）
 * 完全一致，也是 danmaku_overlay.js 的 offset() 用的同一来源。
 */
var _dgv_pt = [0, 0];   // 复用的临时点：drawChain 每帧采样上千次，避免反复分配

var danmakuGroupView = {
    layer: 99,
    on: 1,                       // 运行期由 stg_show_danmaku_group 每帧覆盖
    ctx: null,
    interval: 2,                 // 每 2 帧跑一次识别（单帧也能跑，降频省预算）
    iv: 2,                       // 实际使用的间隔（单帧太贵时临时放大）
    lastMs: 0,
    lastFrame: -99,
    tick: undefined,             // 自己的帧计数：降频帧不 commit，不能用 h.frame 递推
    lastPlayer: null,
    byId: null,                  // 本帧 id → sid，画线/画圈时按成员所在画面换算
    viewSid: 0,
    perf: null,
    eye: null,                   // 场上"把眼睛挪走"的效果（目前=夜盲之歌 NightEffect）
    eyeTick: -999,               // 上一次扫描 _pool 的帧号（不用每帧扫 2000 个对象）

    // 场地左上角在 UI 画布上的偏移（常量兜底；来源见文件头，SHW = 32,16）。
    // 运行期优先读 hyz.full_screen_object.pos（和 default_hitbox_overlay.js 一样），
    // 所以 HYZ 包（16,16）不用改代码；IFE 没有 hyz，offset() 会回落到 (0,0)。
    ox: 32,
    oy: 16,
    // 场地纹理按 1:1 画到画布上。画布自身的窗口缩放由
    // default_2d_misc_shader.draw_frame() 的 setTransform(canvas.width/o_width) 负责，
    // 这里再乘一次就会重复缩放。
    scale: 1,

    _now: function () {
        return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    },

    /** 全局开关/上限：控制台随时改，不用重启 */
    _readGlobals: function () {
        if (typeof stg_show_danmaku_group !== "undefined") this.on = stg_show_danmaku_group ? 1 : 0;
        if (typeof stg_danmaku_group_interval !== "undefined") {
            var iv = +stg_danmaku_group_interval;
            this.interval = (isFinite(iv) && iv >= 1) ? Math.floor(iv) : 2;
        }
        if (typeof danmakuChainRecognizer !== "undefined" && danmakuChainRecognizer) {
            if (typeof stg_danmaku_group_max_chains !== "undefined" && stg_danmaku_group_max_chains > 0)
                danmakuChainRecognizer.max_groups = stg_danmaku_group_max_chains | 0;
        }
        if (typeof danmakuStable !== "undefined" && danmakuStable && danmakuStable.cfg) {
            if (typeof stg_danmaku_group_max_clumps !== "undefined" && stg_danmaku_group_max_clumps > 0)
                danmakuStable.cfg.max_clumps = stg_danmaku_group_max_clumps | 0;
        }
    },

    localPlayer: function () {
        if (typeof danmakuAI !== "undefined" && danmakuAI && danmakuAI.localPlayer) {
            try { var q = danmakuAI.localPlayer(); if (q) return q; } catch (e) { }
        }
        return (typeof stg_players !== "undefined" && stg_players[0]) ? stg_players[0] : null;
    },

    /** 场地左上角在 UI 画布上的位置；取不到就按常量（非 hyz 包回落到 0,0） */
    offset: function () {
        if (typeof hyz !== "undefined" && hyz && hyz.full_screen_object && hyz.full_screen_object.pos) {
            var p = hyz.full_screen_object.pos;
            var x = +p[0], y = +p[1];
            if (isFinite(x) && isFinite(y)) return [x, y];
        }
        if (typeof hyz === "undefined") return [0, 0];   // IFE 等非 hyz 包：场地就在画布左上角
        return [this.ox, this.oy];
    },

    /**
     * 场地坐标 → UI 画布坐标：
     *   1) hyzGetFramePos(sid) 选画面（SHW 单画面 sid 0/1 不移动；双画面 sid 2/3 +336）
     *   2) 加场地左上角偏移，乘场地缩放（SHW/HYZ 都是 1:1）
     */
    toCanvas: function (x, y, sid) {
        if (typeof hyzGetFramePos === "function") {
            var p = [x, y];
            hyzGetFramePos(sid || 0, p, p);
            x = p[0]; y = p[1];
        }
        var o = this.offset(), s = this.scale;
        return [x * s + o[0], y * s + o[1]];
    },

    /**
     * 找场上"把眼睛挪走"的特效 —— 目前只有《夜盲之歌》的 NightEffect：
     * 它把每个自机的可见圈（一盏灯）从机体位置 luaMoveTo 到场地中间
     * （1 人=正中 192,224；2 人=左右 96 / 288，像一双眼睛），
     * 落地后机体离眼睛 134px，早就出了 size2=120 的可见圈 —— 也就是"看不见自己"。
     * 这里只读它的公开字段（size1/size2/ph[i].pos），不改卡片的任何逻辑。
     * 找不到就返回 null，视野退回原来的"机体上方矩形"。
     */
    _eyeOf: function (player) {
        var i, o, arr = (typeof _pool !== "undefined") ? _pool : null, ps;
        if (this.eye && !this.eye.active) this.eye = null;    // 符卡结束，灯灭了，立刻退回矩形视野
        // 每 60 帧重扫一次（效果会随符卡消失/重开），期间每帧只读坐标
        if (!this.eye || (this.tick - this.eyeTick) > 60) {
            this.eyeTick = (this.tick === undefined) ? 0 : this.tick;
            this.eye = null;
            if (arr && typeof NightEffect !== "undefined") {
                for (i = 0; i < arr.length; i++) {
                    o = arr[i];
                    if (!o || !o.active || o.size1 === undefined || !o.ph) continue;
                    if (!(o instanceof NightEffect)) continue;
                    this.eye = o;
                    break;
                }
            }
        }
        if (!this.eye) return null;
        // 分类器绑在哪个自机：用它在 stg_players 里的序号去取同一只眼
        var idx = 0;
        ps = (typeof stg_players !== "undefined") ? stg_players : null;
        if (ps && player) {
            for (i = 0; i < ps.length; i++) if (ps[i] === player) { idx = i; break; }
        }
        var ph = this.eye.ph[idx] || this.eye.ph[0];
        if (!ph || !ph.pos) return null;
        return { x: ph.pos[0], y: ph.pos[1], r1: this.eye.size1, r2: this.eye.size2 };
    },

    /**
     * 视野：默认是"自机上方 120×220 的矩形"。
     * 但《夜盲之歌》这类卡把可见范围变成一盏灯（圆心不在自机上），
     * 这时视野必须跟着"眼睛"走、形状也要变成圆，否则分类器算的是自机旁边、
     * 而玩家实际看见的是场地中间那一圈，两边对不上。
     */
    viewFor: function (player) {
        var px = player ? (player.pos ? +player.pos[0] : +player.x) : NaN;
        var py = player ? (player.pos ? +player.pos[1] : +player.y) : NaN;
        if (!isFinite(px) || !isFinite(py)) { px = 192; py = 400; }
        this.viewSid = (player && player.sid) || 0;
        var eye = this._eyeOf(player);
        if (eye) {
            return {
                kind: "eye",
                precise: { cx: eye.x, cy: eye.y, r: eye.r1 },     // 灯心：完全看得见
                periphery: { cx: eye.x, cy: eye.y, r: eye.r2 }    // 渐暗到黑，仍算"余光"
            };
        }
        // 竖着的框：自机在下方，视野向上（前方）展开
        var W = 120, UP = 190, DOWN = 30;
        return {
            kind: "rect",
            precise: { x: px - W / 2, y: py - UP, w: W, h: UP + DOWN },
            periphery: { x: px - W, y: py - UP - 50, w: W * 2, h: UP + DOWN + 90 }
        };
    },

    /**
     * 把引擎弹对象转成管线输入。
     * 圆的直接搬；椭圆/环先做形状归一（hx/hy/skey）；激光采样成点后并进同一个数组
     * —— 这样弹链识别器会把光束认成一条等距共线的多重弹，画出来就是那条线。
     */
    gather: function () {
        var out = [], lasers = [], i, o, h, vx, vy, c, b, rec, sh,
            arr = (typeof _hit_pool !== "undefined") ? _hit_pool : null;
        if (!arr) return out;
        for (i = 0; i < arr.length; i++) {
            o = arr[i];
            if (!o || !o.hitdef || !o.hitdef.rpos) continue;
            if (typeof stg_const !== "undefined") {
                if (o.type === stg_const.OBJ_ENEMY) continue;       // 敌机本体不是弹
                if (o.type === stg_const.OBJ_ITEM) continue;        // 可收集道具：也有 hitdef(range=4)、
                                                                    // side 还是 SIDE_ENEMY，不排掉会被
                                                                    // 当成小玉进弹链（danmaku_ai.js 同样排）
                if (o.side === stg_const.SIDE_PLAYER) continue;     // 自机子弹不是"弹幕"
            }
            h = o.hitdef;
            b = (o._obj || o);
            c = (b.color !== undefined ? b.color : o.color);
            // ---- 激光：一条光束 ≠ 一个点 ----
            if (h.type === 1) {
                if (typeof danmakuLaser === "undefined" || !danmakuLaser.fromHitDef) continue;
                var L = danmakuLaser.fromHitDef(h, {
                    id: o.uid === undefined ? i : o.uid,
                    color: c, sid: o.sid || 0
                });
                if (L) lasers.push(L);
                continue;
            }
            vx = 0; vy = 0;
            if (o.move && o.move._speed) { vx = o.move._speed[0] || 0; vy = o.move._speed[1] || 0; }
            rec = {
                x: h.rpos[0], y: h.rpos[1], vx: vx, vy: vy,
                r: 4, radius: 4,
                color: c, age: o.frame || 0, src: o, id: o.id,
                sid: o.sid || 0                                   // 画面号：双画面时换坐标要用
            };
            // 形状归一：圆/椭圆/环各自的包络（不同 skey 的弹不会被并成一组）
            sh = (typeof danmakuShape !== "undefined" && danmakuShape.applyHitDef)
                ? danmakuShape.applyHitDef(h, rec) : null;
            if (!sh) {
                rec.r = rec.radius = (h.type === 0 ? h.range : (h.re || h.rs || 4));
            } else {
                rec.radius = rec.r;
                rec.shape = sh.kind;
                if (sh.inner !== undefined) rec.inner = sh.inner;
            }
            out.push(rec);
        }
        if (lasers.length && typeof danmakuLaser !== "undefined") danmakuLaser.expand(out, lasers);
        return out;
    },

    /** 组内第一个成员在哪个画面（管线组不带 sid，从本帧 real 里按 id 查） */
    _sidOf: function (g) {
        var map = this.byId, p = g && g.parent, i;
        if (map && p) {
            for (i = 0; i < p.length; i++) {
                if (map[p[i]] !== undefined) return map[p[i]];
            }
        }
        return 0;
    },

    // UI 画布平时在场地画布之上（ui=20 > frame=5），但 SHW 读盘时 shw_loading.init 把
    // frame 临时抬到 30，而 shw.game_start_up 在 loading.finish 的那一帧就调 stgStartLevel
    // 清了池，loading 自己的 30→5 复位永远走不到 —— 结果进关后 frame=30 > ui=20，
    // UI 画布（本 overlay / 弹型 overlay / 命中框 overlay）全被压在下面。
    // 和 danmaku_overlay.js 的 ensureOnTop 一样：保证 UI 画布在场地画布上面。
    ensureOnTop: function () {
        var ui = stg_textures.ui, fr = stg_textures.frame;
        if (!ui || !fr || !ui.style || !fr.style) return;
        var zu = parseInt(ui.style.zIndex || "0", 10) || 0;
        var zf = parseInt(fr.style.zIndex || "0", 10) || 0;
        if (zu <= zf) ui.style.zIndex = "" + (zf + 1);
    },

    step: function (player) {
        this._readGlobals();
        if (!this.on) return this.ctx;
        this.lastPlayer = player;
        var h = (typeof stg_danmaku_history !== "undefined" && stg_danmaku_history) ? stg_danmaku_history : null;
        if (!h) h = (typeof window !== "undefined" && window.stg_danmaku_history) || { frame: -1, tracks: {}, models: {}, groups: {} };
        // 注意：引擎里没有 stg_frame_count，这里用自己的帧计数；降频帧不 commit，不能用 h.frame 递推
        var frame = (this.tick === undefined) ? 0 : this.tick + 1;
        this.tick = frame;
        h.frame = frame;
        if ((frame % 30) === 0) this.ensureOnTop();

        // 降频：没到重算帧就复用上一帧的识别结果，只更新视野框（它要跟着自机走）。
        // 不能每帧都 begin/commit：commit 会把 history.groups 覆盖成空数组，线/圈会闪。
        if (this.ctx && (frame - this.lastFrame) < this.iv) {
            this.ctx.view = this.viewFor(player);
            return this.ctx;
        }
        this.lastFrame = frame;

        var t0 = this._now(), t1, t2;
        var raw = this.gather();
        t1 = this._now();
        var ctx = danmakuPipeline.begin(raw, h, { frame: frame, player: player });
        danmakuPipeline.vision(ctx, this.viewFor(player));
        t2 = this._now();
        danmakuPipeline.run(ctx);
        danmakuPipeline.commit(ctx);
        var t3 = this._now();
        this.perf = { gather: t1 - t0, vision: t2 - t1, run: t3 - t2, total: t3 - t0 };

        // 单帧太贵就自动放慢重算频率（密集帧 700 发时 decompose 要几十毫秒，
        // 每 2 帧跑一次会明显掉帧）。关掉开关时不受影响，因为根本不会算到这里。
        var ms = t3 - t0;
        this.lastMs = ms;
        if (ms > 50) this.iv = Math.max(this.interval, 6);
        else if (ms > 25) this.iv = Math.max(this.interval, 4);
        else this.iv = this.interval;

        // 记录本帧 id → sid，供 draw 换算双画面坐标
        var map = {}, i;
        for (i = 0; i < ctx.real.length; i++) map[ctx.real[i].id] = ctx.real[i].sid || 0;
        this.byId = map;
        this.ctx = ctx;
        if (typeof stg_danmaku_history === "undefined" && typeof window !== "undefined") window.stg_danmaku_history = h;
        return ctx;
    },

    /**
     * 弹链：按 gen 连续采样。
     *   p(s) = 发弹点(s) + sp·弹龄(s)·[cos θ(s), sin θ(s)]
     *   s 从 0 走到 n（每发 8 段）：n 发正好走到闭合处，W2 满圈的首尾重复弹也能接上。
     */
    drawChain: function (c, g, sid) {
        var gen = g.gen;
        if (!gen) return;
        var n = (g.parent && g.parent.length > 1) ? g.parent.length : 2;
        var N = n * 8, j, s, age, ang, R, x, y, first = true;
        var kind = g.tags && g.tags.kind;
        var isLaser = g.tags && g.tags.laser;
        var off = this.offset(), sc = this.scale, pt = _dgv_pt;
        var getPos = (typeof hyzGetFramePos === "function");
        // 激光是光束：按宽度画，颜色也和"多重弹"分开
        if (isLaser) {
            c.strokeStyle = "#ff5e5e";
            c.lineWidth = Math.max(3, 2 * ((g.tags.width || 2)));
        } else {
            c.strokeStyle = kind === "multi" ? "#ffd93d"
                : kind === "ring" ? "#4ecdc4" : "#ff6b6b";
            c.lineWidth = 2;
        }
        c.beginPath();
        for (j = 0; j <= N; j++) {
            s = j / 8;
            age = gen.age + gen.dage * s;
            if (age < 0) break;                       // 弹龄不为负（_dg_norm 也是这么 clamp 的）
            ang = gen.ang + gen.dang * s;
            R = gen.sp * age;
            x = gen.ox + gen.dox * s + R * Math.cos(ang);
            y = gen.oy + gen.doy * s + R * Math.sin(ang);
            // 这里每帧要跑上千次，直接换算、复用临时数组，避免每次 toCanvas 分配两个数组
            pt[0] = x; pt[1] = y;
            if (getPos) hyzGetFramePos(sid || 0, pt, pt);
            x = pt[0] * sc + off[0];
            y = pt[1] * sc + off[1];
            if (first) { c.moveTo(x, y); first = false; }
            else c.lineTo(x, y);
        }
        c.stroke();
    },

    /** 弹团：一个圈（圆心/半径都是场地坐标，同样要加偏移） */
    drawClump: function (c, g, sid) {
        var p = this.toCanvas(g.x, g.y, sid);
        c.strokeStyle = "#26de81";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(p[0], p[1], Math.max(1.5, (g.r || 0) * this.scale), 0, Math.PI * 2);
        c.stroke();
    },

    /** 现场画：弹链线 + 弹团圆 + 视野边界 */
    draw: function (c) {
        if (!this.on) return;
        var ctx = this.ctx;
        if (!ctx || !c || !c.beginPath) return;
        var i, g, v, p1, p2, sid;
        v = ctx.view;
        sid = this.viewSid || 0;
        var eye = (v && v.kind === "eye");

        c.save();
        c.lineJoin = "round";
        // 夜盲之歌：场外全是黑的，分类结果也必须只在灯里出现，
        // 否则等于用 overlay 把玩家本来看不见的弹幕照亮了。
        if (eye) {
            var ep = this.toCanvas(v.periphery.cx, v.periphery.cy, sid);
            c.beginPath();
            c.arc(ep[0], ep[1], v.periphery.r * this.scale, 0, Math.PI * 2);
            c.clip();
        }
        c.globalAlpha = 0.85;
        for (i = 0; i < ctx.groups.length; i++) {
            g = ctx.groups[i];
            if (g.source === "chain" && g.gen) this.drawChain(c, g, this._sidOf(g));
            else if (g.source === "stable") this.drawClump(c, g, this._sidOf(g));
        }
        c.restore();

        // 视野边界：矩形关卡画两个框，夜盲这种灯画两个圆
        if (eye) {
            var e1 = this.toCanvas(v.precise.cx, v.precise.cy, sid);
            c.strokeStyle = "rgba(255,70,70,0.55)";
            c.lineWidth = 1;
            c.beginPath();
            c.arc(e1[0], e1[1], v.precise.r * this.scale, 0, Math.PI * 2);
            c.stroke();
            var e2 = this.toCanvas(v.periphery.cx, v.periphery.cy, sid);
            c.strokeStyle = "rgba(255,170,60,0.45)";
            if (c.setLineDash) c.setLineDash([6, 6]);
            c.beginPath();
            c.arc(e2[0], e2[1], v.periphery.r * this.scale, 0, Math.PI * 2);
            c.stroke();
            if (c.setLineDash) c.setLineDash([]);
        } else if (v && v.precise) {
            p1 = this.toCanvas(v.precise.x, v.precise.y, sid);
            p2 = this.toCanvas(v.precise.x + v.precise.w, v.precise.y + v.precise.h, sid);
            c.strokeStyle = "rgba(255,70,70,0.55)";
            c.lineWidth = 1;
            c.strokeRect(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1]);
            p1 = this.toCanvas(v.periphery.x, v.periphery.y, sid);
            p2 = this.toCanvas(v.periphery.x + v.periphery.w, v.periphery.y + v.periphery.h, sid);
            c.strokeStyle = "rgba(255,170,60,0.45)";
            if (c.setLineDash) c.setLineDash([6, 6]);
            c.strokeRect(p1[0], p1[1], p2[0] - p1[0], p2[1] - p1[1]);
            if (c.setLineDash) c.setLineDash([]);
        }
    }
};

/* 接线：danmaku_pipeline.js 只 use 了弹链识别器，弹团识别器（danmaku_stable.js）
 * 一直没人登记，于是 ctx.groups 里永远没有 source==="stable" 的组，弹团的圈画不出来。
 * 这里补登记（只动接线，不改 pipeline/识别器的算法逻辑；单测只加载
 * danmaku_group + danmaku_pipeline，不会走到这段）。 */
(function () {
    if (typeof danmakuPipeline === "undefined" || typeof danmakuStableRecognizer === "undefined") return;
    for (var i = 0; i < danmakuPipeline.recognizers.length; i++) {
        if (danmakuPipeline.recognizers[i] === danmakuStableRecognizer) return;
    }
    danmakuPipeline.use(danmakuStableRecognizer);
})();

/* 挂到关卡上：和 danmaku_overlay.js 一样——StgRender + 包 _stgStartLevel */
var danmaku_group_view_object = {
    layer: 99,
    init: function () {
        this.layer = danmakuGroupView.layer;
        // 和 default_hitbox_overlay.js 一致：UI 流程 drawUI 用的就是 testShader2
        // （= GAME/default_graphics.js 的 default_2d_misc_shader，type=4 时回调 script(c)）
        this.render = new StgRender("testShader2");
        this.render.type = 4;
        this.render.script = function (context) {
            danmakuGroupView.draw(context);
        };
    },
    script: function () {
        var p = danmakuGroupView.localPlayer();
        danmakuGroupView.step(p);
    }
};

function danmakuGroupViewAttach() {
    var o = danmaku_group_view_object, i;
    // 新关卡：清掉上一关的识别结果、帧计数和跨帧记忆
    danmakuGroupView.ctx = null;
    danmakuGroupView.tick = undefined;
    danmakuGroupView.lastFrame = -99;
    danmakuGroupView.byId = null;
    danmakuGroupView.iv = danmakuGroupView.interval;
    danmakuGroupView.perf = null;
    var hist = (typeof stg_danmaku_history !== "undefined" && stg_danmaku_history) ? stg_danmaku_history
        : (typeof window !== "undefined" ? window.stg_danmaku_history : null);
    if (hist) { hist.frame = -1; hist.tracks = {}; hist.models = {}; hist.groups = {}; }
    for (i = 0; i < _pool.length; i++) {
        if (_pool[i] === o) return o;
    }
    stgAddObject(o);
    // 读盘时 frame 画布被抬到 30，进关这一帧就先把 ui 拉回上面，别等 30 帧之后
    danmakuGroupView.ensureOnTop();
    return o;
}

(function () {
    var orig = _stgStartLevel;
    _stgStartLevel = function () {
        orig.apply(null, arguments);
        danmakuGroupViewAttach();
    };
})();
