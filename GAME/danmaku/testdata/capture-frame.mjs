/**
 * 生产一帧测试数据：SHW 第一张非符（黄色大玉那波）
 * 输出 GAME/danmaku/testdata/nonspell1_frame.json，字段：
 *   自机位置 / 所有敌方弹幕（位置、速度、方向、大小、颜色ID）/ 敌人位置
 * 用法：先起 8123 静态站 + 9223 CDP 的 Edge，再
 *   node GAME/danmaku/testdata/capture-frame.mjs [输出路径]
 */
import fs from 'node:fs';
import path from 'node:path';

const CDP = 'http://127.0.0.1:9223';
const OUT = process.argv[2] || 'D:/WebHYZ/GAME/danmaku/testdata/nonspell1_frame.json';
fs.mkdirSync(path.dirname(OUT), { recursive: true });

let ws, id = 1;
const pend = new Map();
const send = (m, p = {}) => new Promise((res, rej) => { const i = id++; pend.set(i, { res, rej, m }); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function ev(x) {
  const r = await send('Runtime.evaluate', { expression: x, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
}
async function waitFor(expr, label, t = 150000) {
  const t0 = Date.now(); let last;
  while (Date.now() - t0 < t) { try { last = await ev(expr); if (last) return last; } catch (e) { last = e.message; } await sleep(400); }
  throw new Error('timeout ' + label + ' ' + JSON.stringify(last));
}

const DUMP = `(function(){
  var DEG=180/Math.PI;
  var p=stg_players[0];
  var out={
    meta:{
      level:"shw_level",
      phase:"NonSpell1（第一张非符：lDY 黄大玉 + mZY + sXY）",
      time:new Date().toISOString(),
      screen:[stg_frame_w,stg_frame_h],
      clip:stg_clip,
      difficulty:(typeof stg_common_data!="undefined")?(stg_common_data.difficulty||0):0,
      note:"所有坐标是场地坐标（左上角 0,0，y 向下）；dir/speed 由 vx,vy 换算，也保留原值"
    },
    player:{
      x:p.pos[0], y:p.pos[1],
      hitbox_r:(p.hitby&&p.hitby.range!==undefined)?p.hitby.range:0,
      life:p.life, state:p.state, slow:p.slow, age:p.frame
    },
    enemies:[],
    bullets:[]
  };
  var i,o,h,vx,vy,sp;
  for(i=0;i<_hit_pool.length;i++){
    o=_hit_pool[i];
    if(!o||!o.hitdef||!o.hitdef.rpos)continue;
    h=o.hitdef;
    vx=0;vy=0;
    if(o.move&&o.move._speed){vx=o.move._speed[0]||0;vy=o.move._speed[1]||0;}
    sp=Math.sqrt(vx*vx+vy*vy);
    var rec={
      x:Math.round(o.hitdef.rpos[0]*1000)/1000,
      y:Math.round(o.hitdef.rpos[1]*1000)/1000,
      vx:Math.round(vx*1000)/1000,
      vy:Math.round(vy*1000)/1000,
      speed:Math.round(sp*1000)/1000,
      dir_deg:Math.round(Math.atan2(vy,vx)*DEG*10)/10,
      radius:(h.type===0?h.range:(h.re||h.rs||0)),
      color:(function(){var b=(o._obj||o);var c=(b.color!==undefined?b.color:o.color);return (c===undefined?null:c);})(),
      hit_type:h.type,
      age:o.frame,
      kind:(o.type===stg_const.OBJ_ENEMY?"enemy":"bullet")
    };
    if(o.type===stg_const.OBJ_ENEMY){
      rec.life=o.life;
      rec.hitby_r=(o.hitby&&o.hitby.range!==undefined)?o.hitby.range:null;
      var base=o._obj||o;rec.name=(base.constructor&&base.constructor.name)||null;
      out.enemies.push(rec);
    }else{
      out.bullets.push(rec);
    }
  }
  // 按颜色/大小/弹龄统计，方便人眼核对
  var byColor={},byRadius={},byAge={};
  for(i=0;i<out.bullets.length;i++){
    var b=out.bullets[i];
    byColor[b.color]=(byColor[b.color]||0)+1;
    byRadius[b.radius]=(byRadius[b.radius]||0)+1;
    byAge[b.age]=(byAge[b.age]||0)+1;
  }
  out.summary={bullets:out.bullets.length,enemies:out.enemies.length,
               byColor:byColor,byRadius:byRadius,byAge:byAge};
  return JSON.stringify(out);
})()`;

(async () => {
  const list = await (await fetch(CDP + '/json/list')).json();
  const page = list.find((t) => t.type === 'page' && t.url.indexOf('127.0.0.1:8123') >= 0) || list.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(typeof e.data === 'string' ? e.data : String(e.data));
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
  });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:8123/index.html' });
  await waitFor(`typeof danmakuAI!='undefined'`, 'modules');
  await sleep(1000);
  await ev(`bios.startGame(javaStage.packages["SHW Demo Version 0.1"])`);
  await waitFor(`typeof shw!='undefined' && typeof shw.startGame=='function'`, 'shw');
  await ev(`shw.startGame("shw_level")`);
  await waitFor(`stg_game_state==102 && _hit_pool.length>10`, 'game', 60000);
  console.log('[ok] 进关卡，等第一张非符…（约 30 秒）');
  // 第一张非符：Boss 出现 + 黄色大玉（r=14）成批
  await waitFor(`(function(){
    var big=0,enemy=0;
    for(var i=0;i<_hit_pool.length;i++){
      var o=_hit_pool[i];
      if(!o||!o.hitdef)continue;
      if(o.side===stg_const.SIDE_PLAYER)continue;
      if(o.type===stg_const.OBJ_ENEMY)enemy++;
      if(o.hitdef.type===0&&o.hitdef.range>=14)big++;
    }
    return big>=40&&enemy>=1;
  })()`, 'nonspell1 big jade', 180000);
  // 再等一点点，让弹幕铺开（太早只有一两波），并且等自机活着站在场地里的时候再抓
  await sleep(1500);
  await waitFor('stg_players[0].state===0 && stg_players[0].pos[1]<450 && stg_players[0].pos[1]>200', 'player alive', 90000);
  const data = await ev(DUMP);
  fs.writeFileSync(OUT, data, 'utf8');
  const o = JSON.parse(data);
  console.log('[saved] ' + OUT);
  console.log('自机: ' + JSON.stringify(o.player));
  console.log('敌人: ' + JSON.stringify(o.enemies));
  console.log('弹幕: ' + o.summary.bullets + ' 发');
  console.log('  按颜色: ' + JSON.stringify(o.summary.byColor));
  console.log('  按半径: ' + JSON.stringify(o.summary.byRadius));
  console.log('  按弹龄: ' + JSON.stringify(o.summary.byAge));
  console.log('前 5 发: ' + JSON.stringify(o.bullets.slice(0, 5)));
  ws.close();
})().catch((e) => { console.error('[FATAL]', e.message); process.exit(1); });
