# 小小陪伴 · 午后桌边

基于用户提供的黑发、蓝衣人物与白猫参考图制作的 3D 网页互动原型。角色、家具、猫咪均为 Three.js 立体几何模型，可转动视角；不是把参考图贴在平面上。

- 在线试玩：**https://zcube7.github.io/cozy-desk-3d/**
- 源码仓库：https://github.com/Zcube7/cozy-desk-3d
- 自动发布记录：https://github.com/Zcube7/cozy-desk-3d/actions/workflows/deploy-pages.yml

## 持续更新

GitHub 的 `main` 分支是正式版本。每次推送到 `main`，GitHub Actions 都会检查游戏 JavaScript，然后把 `dist/` 发布到同一个 GitHub Pages 地址。也可以在 Actions 页面手动运行 `Deploy GitHub Pages`。

修改页面用 `dist/index.html`，调整样式用 `dist/style.css`，修改角色造型和互动动画用 `dist/main.js`。可以直接在 GitHub 编辑，也可以在本地修改、试玩后提交：

```powershell
git pull --ff-only
npm start
# 试玩结束后按 Ctrl+C 停止本地服务，再提交改动。
git add dist
git commit -m "Improve game interaction"
git push origin main
```

发布是否完成以 Actions 的绿色成功状态为准；如果检查失败，修复后重新推送。需要恢复旧版本时，在 Git 中撤销对应提交再推送，网站会跟随更新。

GitHub 仓库和 Pages 网页均为公开。网站运行和自动发布都不需要额外配置 API Key 或部署密钥。

## 玩法

- 锤下脑袋：双手抬起护住脑袋，委屈地回应「别打别打！」。
- 挠挠痒痒：缩身、摇晃、大笑，回应「俺不中嘞」。
- 摸摸猫咪：从睡姿翻转，露出肚皮、摆动爪子和尾巴，回应「呼噜呼噜」，随后重新入睡。
- 鼠标拖动或单指拖动转动视角，滚轮或双指缩放；右上角重置视角。
- 底部按钮与键盘 `1`、`2`、`3` 触发相同互动。
- 音效默认关闭，开启后播放合成的轻柔互动提示音；不包含录制的人声。

## 本地运行

安装 Node.js 后，在本目录执行：

```powershell
npm start
```

打开 http://127.0.0.1:4177/ 。资源全部随项目提供，运行时不需要 CDN、账号、API Key 或后端服务。请通过 HTTP 打开，不要直接双击 HTML 文件。

## 文件

- `dist/index.html`：页面与辅助互动按钮。
- `dist/style.css`：电脑、手机布局与提示气泡。
- `dist/main.js`：场景、模型、灯光、射线点击、动画状态与合成音效。
- `dist/vendor/`：固定版本 Three.js 0.180.0、附加模块与 MIT 许可证。
- `serve.mjs`：仅监听本机地址的本地静态服务器。
- `.github/workflows/deploy-pages.yml`：从 `main` 自动发布到 GitHub Pages。
- `.openai/hosting.json`：保留的原 Sites 站点配置，不参与 GitHub Pages 发布。后续持续更新以 GitHub Pages 地址为准。

Three.js 官方文档：https://threejs.org/docs/ 。浏览器需支持 WebGL 2；显示错误时页面会提供重试入口。

这是可继续迭代的风格化几何模型原型，不含外部美术建模文件或导出的骨骼动画。头、手、腿及猫的身体、爪子、尾巴为独立动画节点。人物与猫的状态独立，支持同时互动。页面隐藏时暂停动画计时，低帧率下仍按实际可见经过时间恢复。

## 验证

在本机独立 Chrome 浏览器会话中检查了 1440 × 1000 和 390 × 844 页面，包括三种反馈、恢复待机、快捷键、音效开关及窄屏溢出。额外验证了直接点击模型时头部、身体和猫的命中区分、拖动与空白点击不触发动作，以及手机触摸人物头部和猫咪。`qa-output/` 为不参与部署的本地截图。

浏览器验证脚本使用 `.sites-runtime/node_modules/playwright`；需要复跑时先执行 `npm install --prefix .sites-runtime --no-save --package-lock=false playwright@1.56.1`，启动服务器，再运行 `node verify.mjs` 和 `node verify-input.mjs`。本地脚本默认使用 Windows Chrome 安装路径，可按环境调整。这不是对所有真实移动设备的兼容性或性能承诺。

页面按需注册 `interact_with_companions` WebMCP 工具，不支持该接口的浏览器仍可正常游玩。本机 Chrome 未提供该接口，因此未验证原生 WebMCP 执行。
