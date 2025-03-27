# TeX Editor

一个基于 Electron 的 TeX 编辑器，支持实时预览。

## 开发环境准备

### 1. 安装 TeX Live

在开始开发之前，请确保已安装 TeX Live。

#### Windows
1. 下载 TeX Live ISO 镜像：https://mirror.ctan.org/systems/texlive/Images/texlive.iso
2. 挂载 ISO 文件
3. 运行 `install-tl-windows.bat`
4. 选择完整安装（推荐）
5. 安装完成后确保 `pdflatex` 命令可用

#### macOS
```bash
brew install texlive
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install texlive-full
```

### 2. 安装 Node.js 依赖

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 打包应用
npm run make
```

## 项目结构 