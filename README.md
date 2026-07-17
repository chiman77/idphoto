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

### 一键启动（开发模式）

双击 `start.bat`，自动安装依赖并启动完整服务（前端+后端），访问 http://localhost:3000。

## 📦 构建与部署

### 构建独立可执行文件

使用 PyInstaller 将整个应用打包为独立的 Windows 可执行文件：

```bash
# 安装构建工具
pip install pyinstaller

# 构建（包含前端静态文件和所有 Python 依赖）
pyinstaller build_package.spec

# 输出位于 dist/IDPhotoGenerator/
# 直接双击 IDPhotoGenerator.exe 即可运行
```

### 构建 Windows 安装包

需要安装 [Inno Setup 6](https://jrsoftware.org/isdl.php)：

```bash
# 1. 先构建 PyInstaller 可执行文件
pyinstaller build_package.spec

# 2. 编译安装包
iscc setup.iss

# 输出位于 installer/IDPhotoGenerator_Setup_v1.0.0.exe (~430 MB)
```

### 一键构建

双击 `build_installer.bat`，自动完成前端构建 → PyInstaller 打包 → Inno Setup 安装包编译。

## 💻 系统要求

- **运行环境**：Windows 10/11 64位
- **内存**：推荐 4GB+
- **磁盘空间**：安装包 ~430MB，安装后 ~800MB
- **无需网络**：安装后完全离线可用

## 🏗️ 项目结构

```
├── backend/               # Python 后端服务
│   ├── main.py            # FastAPI 入口
│   ├── routers/           # API 路由
│   ├── services/          # 业务逻辑（抠图、换背景、裁剪）
│   └── models/            # 模型定义
├── frontend/              # React 前端
│   ├── src/               # 源代码
│   └── dist/              # 构建产物
├── start_server.py        # 统一服务入口（前端+后端）
├── build_package.spec     # PyInstaller 构建配置
├── setup.iss              # Inno Setup 安装包脚本
├── build_installer.bat    # 一键构建脚本
├── start.bat              # 开发启动脚本
└── docker-compose.yml     # Docker 部署
```

## 🌐 在线版本

访问 [https://chiman77.github.io/idphoto/](https://chiman77.github.io/idphoto/) 使用在线版本。

> 注：在线版本的"本地精修"模式需要下载模型文件（~25MB），首次加载较慢。
