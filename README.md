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

## Vercel

在 Vercel 中把 **Root Directory** 设为 `player`（若仓库是整个 `web`），或直接部署本目录。

```bash
# 在 player 目录
npx vercel
```

## 新增故事（不改前端代码）

1. 添加 `stories/<id>/story.json`
2. 在 `stories/catalog.json` 注册一条 `status: "available"`
3. 刷新 Library

详见 [STATUS.md](./STATUS.md)。
