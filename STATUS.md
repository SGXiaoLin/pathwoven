# 发布状态清单（最小可体验版）

更新时间：2026-07-31

## 已完成

- [x] 故事运行时引擎（状态机 + JSON）
- [x] 示例故事可通关、多结局（见 `stories/`）
- [x] **前置 Library 首页**（`index.html`）
- [x] **游玩页**（`play.html?id=<storyId>`）
- [x] **站点壳**：品牌头、导航回 Library、页脚说明
- [x] **目录驱动**：`stories/catalog.json` 注册故事
- [x] **加故事不改前端代码**：新目录 + catalog 条目即可
- [x] 本地存档 / Start Over / 结局故事线导出
- [x] 冒烟脚本 `scripts/smoke.py`
- [x] Vercel 静态配置 `vercel.json`（根目录部署 `player/`）

## 待完成（上线前建议）

- [ ] 部署到 Vercel，拿到公网 HTTPS URL
- [ ] 手机浏览器实机点一遍（Library → Play → 结局）
- [ ] 自定义域名（可选）
- [ ] Reddit / 试玩帖用公网链接

## 可完成（后续增强，非上线阻塞）

- [x] 第二本 *Forrest Path*、第三本 *Three Kingdoms*、第四本原创长篇 *Maskward City*
- [ ] 更多故事（只改 catalog + 新 `story.json`）
- [ ] 故事封面图 / 更丰富的 Detail 页
- [ ] 账号与云存档
- [ ] 付费解锁 / 订阅
- [ ] 简易故事校验 CI
- [ ] PWA / 离线
- [ ] 分析（完成率、结局分布）
- [ ] 「Coming Soon」占位故事卡片（catalog 已支持 `status`）

## 如何新增故事（不改网页代码）

1. 新建 `stories/<id>/story.json`（沿用现有 schema）
2. 在 `stories/catalog.json` 的 `stories` 数组追加一条：

```json
{
  "id": "<id>",
  "title": "...",
  "blurb": "...",
  "estimatedMinutes": 10,
  "locale": "en",
  "tags": ["..."],
  "status": "available",
  "path": "<id>/story.json",
  "contentNotes": "optional"
}
```

3. 刷新 Library，应出现新卡片；游玩地址：`/play?id=<id>`（或 `play.html?id=<id>`）

## 本地运行

```bash
cd player
python3 -m http.server 4173
# http://localhost:4173/
```
