# WeiOps Lab | 阿伟运维实验室

一个面向 Linux 运维、Docker、K3s/Kubernetes 与 DevOps 入门的静态实战学习站。它把命令、故障排查思路、模拟终端、英文工单表达和个人实验记录放进同一条可持续的学习路径。

## 项目目标

- 用真实工作场景学习 Linux 与运维排障。
- 训练 Docker、K3s/Kubernetes 的基础操作与故障思路。
- 积累 IT Support / Junior DevOps 的英文工作表达。
- 用浏览器本地存储保存学习进度与实验记录。
- 作为可部署到 GitHub Pages 的技术作品集。

## 技术栈

- React + Vite
- 原生 CSS 响应式界面
- localStorage
- GitHub Actions + GitHub Pages

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://127.0.0.1:8767`。

## 构建与预览

```bash
npm run build
npm run preview
```

## 页面模块

- Dashboard 学习进度与路线
- Linux 命令场景卡片、收藏与复制
- 15 个故障排查训练场景
- 网络诊断流程、Systemd 服务排查
- Docker 与 K3s/Kubernetes 模拟实验
- DevOps 路线图
- 30 条中英工单表达
- localStorage 实验记录，可编辑、删除、导出 Markdown
- 轻量测验

## GitHub Pages 部署

1. 创建仓库 `weiops-lab` 并推送 `main` 分支。
2. 在仓库 Settings → Pages 将 Source 设为 **GitHub Actions**。
3. `.github/workflows/deploy.yml` 会在每次推送 `main` 时运行 `npm ci`、`npm run build` 并发布 `dist`。

Vite 的 `base` 已设置为 `/weiops-lab/`。

## 注意事项

本项目是静态前端学习站。所有终端内容均为示例命令、模拟输出或操作步骤，**不会执行任何真实 Linux、Docker 或 Kubernetes 命令**。

## 后续扩展

Shell 脚本训练、GitHub Actions 实验、Prometheus/Grafana、Nginx/Ansible/Terraform、Homelab 记录与英文面试题。
