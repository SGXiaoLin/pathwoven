# Pathwoven Player

静态站点：Library 首页 + 可扩展故事目录 + 选择向运行时。

## 本地运行

```bash
cd player
python3 -m http.server 4173
```

- 首页：http://localhost:4173/
- 游玩：http://localhost:4173/play.html?id=forrest-path
- 冒烟：`python3 scripts/smoke.py`

## Vercel Web Analytics & Speed Insights

本站是**静态 HTML**，不能使用 Next.js 的 `<Analytics />` / `<SpeedInsights />`。

已用等价接入：`js/analytics.js`

- Analytics → `/_vercel/insights/script.js`
- Speed Insights → `/_vercel/speed-insights/script.js`

上线步骤：

1. Vercel 项目 → **Analytics** → **Enable**
2. Vercel 项目 → **Speed Insights** → **Enable**
3. 推送后 **Redeploy**（Enable 之后必须重新部署）
4. Dashboard 查看访问与性能数据

## 新增故事（不改前端代码）

1. 添加 `stories/<id>/story.json`
2. 在 `stories/catalog.json` 注册一条 `status: "available"`
3. 刷新 Library

详见 [STATUS.md](./STATUS.md)。
