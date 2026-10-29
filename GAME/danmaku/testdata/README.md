# 测试数据

## `nonspell1_frame.json`

SHW 关卡 `shw_level` **第一张非符**（`BossSLZ.NonSpell1`，就是黄色大玉那一波）的**一帧**真值快照。

抓取时间 2026-10-29T12:14:32Z；难度 `difficulty=0`；场地 384×448（`stg_frame_w/h`）。

| 字段 | 含义 |
|---|---|
| `meta` | 关卡、相位、抓取时间、场地尺寸、`stg_clip`、难度、坐标约定 |
| `player.x/y` | 自机位置（场地坐标，y 向下） |
| `player.hitbox_r` | 自机被弹判定半径（蕾米是 **0**，即一个点） |
| `player.life/state/slow/age` | 残机、状态（0=正常）、是否低速、存活帧数 |
| `enemies[]` | 敌机：`x,y`、`radius`（可被击中的判定半径）、`hitby_r`（攻击判定半径）、`life`、`age` |
| `bullets[]` | 所有**敌方**弹幕（不含自机子弹、不含道具） |
| `bullets[].x/y` | 判定中心位置 |
| `bullets[].vx/vy` | 每帧位移（引擎的 `move._speed`，速度恒定者可用来反推源点） |
| `bullets[].speed` | 速度大小（像素/帧） |
| `bullets[].dir_deg` | 飞行方向（度，0=向右，90=向下） |
| `bullets[].radius` | 判定半径（`hitdef.range`；本作小玉 4、中玉 6、大玉 14） |
| `bullets[].color` | 颜色 ID（引擎里的 `o.color`：2=小玉配色，3=中/大玉配色） |
| `bullets[].hit_type` | 判定形状类型：0=圆（本作玩家/敌机/子弹全是 0） |
| `bullets[].age` | 弹龄（帧）：**同一帧发射的一批弹龄相同**，用它就能分出"波" |
| `summary` | 按颜色/半径/弹龄的计数 |

### 这一帧里有什么

199 发敌方弹幕 + Boss 一个（192,80）。按 `(颜色/半径/速度)` 可以干净地分成三套：

| 套 | 数量 | 波数 | 结构 |
|---|---|---|---|
| `color3 / r14 / v3.5` | 74 | 11 | 黄色大玉：W2 铺满 360°、`angle_add=360/(n-1)` → **11 个互不相同的角度**，每 12 帧发一波，每波整体转 23° |
| `color3 / r6 / v2` | 80 | 17 | 中玉：8 发一圈（**7 个不同角度**，51.4° 间隔），同样每波转 |
| `color2 / r4 / v1.8` | 45 | 13 | 小玉：4 发扇形（16° 张角），每波转 23.8° |

对这些数据跑 `danmakuPattern.analyze`（见 `.run-test/check-frame.mjs`）得到：
圈甩 r6、甩弹 r4、圈甩 r14（顺序/阶数/旋转量都打在输出里）。

### 注意

- 这是**真值**，没有做视野过滤；弹幕飞出场地 ±32 就会被引擎删除，所以**越老的波剩下的子弹越少**
  （例如 r14 的 11 波里最早几波只剩 1~3 发），正好可以用来测"残缺圈还能不能认出来"。
- 会出现**坐标完全相同的两发**：`stgCreateShotW2` 铺满 360° 时首尾角度重合，是两发实弹，不是数据重复。
- `enemies` 里 Boss 的 `radius=32` 是"可被击中"的判定，`hitby_r=50` 是它的攻击判定（玩家子弹打这个）。

### 重新生成

```powershell
python -m http.server 8123                  # 或 node .run-test/static-server.mjs 8123
# 另开一个带调试端口的 Edge/Chrome：
#   msedge --headless=new --remote-debugging-port=9223 --user-data-dir=... about:blank
node GAME/danmaku/testdata/capture-frame.mjs
```

脚本会自己进 BIOS、开 SHW 包、进关卡，等第一张非符的大玉成批出现、且自机活着时抓一帧。
默认输出到本目录的 `nonspell1_frame.json`，可以传路径参数改名字。
