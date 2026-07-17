# 证件照生成器 / ID Photo Generator

> 在线证件照生成工具 — 上传普通手机照片，一键生成符合各国规格的证件照

## ✨ 功能特点

- **📸 智能抠图**：基于 hivision_modnet 模型，精准分离人像与背景
- **🌍 多国规格**：支持中国、美国、欧盟、英国、日本、韩国等证件照标准
- **🎨 背景换色**：纯白、蓝、红等多种背景色自由选择，支持自定义颜色
- **⚡ 两种处理模式**：
  - **在线精修**：通过后端服务处理，画质更锐利，毛发边缘更自然
  - **本地精修**：浏览器端 ONNX Runtime 处理，照片不上传，更注重隐私
- **📥 一键导出**：支持单张下载和 8 张排版版下载

## 🚀 快速开始

### 本地开发

#### 前置依赖

- Node.js 18+
- Python 3.10+

#### 1. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动。

#### 2. 启动后端（可选，用于"在线精修"模式）

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

> ⚠️ 首次运行会自动下载 hivision_modnet 模型权重（约 24.7MB）。

> 如果 rembg 下载模型遇到网络问题，可手动将权重文件 `hivision_modnet.onnx` 放到 `backend/models/weights/` 目录。

## 📦 部署到 GitHub Pages

### 前提条件

1. 将项目推送到 GitHub 仓库
2. 在仓库 Settings → Pages 中，Source 选择 "GitHub Actions"

### 自动部署

项目已包含 GitHub Actions 工作流文件 `.github/workflows/deploy.yml`，推送 `main` 分支后会自动：

1. 安装前端依赖
2. 复制 ONNX Runtime WASM 文件到生产目录
3. 构建前端静态文件
4. 部署到 GitHub Pages

### 后端部署

"在线精修"模式需要后端支持，推荐以下平台：

| 平台 | 说明 |
|------|------|
| [Render](https://render.com) | 免费版支持 Web Service，部署 FastAPI 应用 |
| [Railway](https://railway.app) | 简单配置，自动部署 |
| [Fly.io](https://fly.io) | 全球边缘部署，延迟低 |

部署后端后，更新 `frontend/src/services/apiClient.ts` 中的 `API_BASE` 为实际后端地址。

## 🏗️ 项目结构

```
idphoto/
├── frontend/                # React + Vite 前端
│   ├── public/
│   │   ├── ort/            # ONNX Runtime WASM 文件
│   │   ├── mediapipe/      # MediaPipe 文件（已弃用）
│   │   ├── models/         # ONNX 模型权重
│   │   └── icon-*.png      # PWA 图标
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── services/       # API 和本地处理服务
│   │   ├── store/          # Zustand 状态管理
│   │   └── utils/          # 工具函数和数据
│   └── vite.config.ts
├── backend/                 # FastAPI 后端
│   ├── routers/            # API 路由
│   ├── services/           # 图片处理服务
│   ├── models/             # 模型和规格数据
│   └── main.py
└── .github/workflows/      # GitHub Actions
```

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**：Python FastAPI + ONNX Runtime + rembg
- **抠图模型**：hivision_modnet（基于 MODNet 微调的证件照优化模型）
- **本地处理**：ONNX Runtime Web（浏览器端 WASM 推理）
- **PWA**：支持离线访问和移动端安装

## 📄 许可

MIT
