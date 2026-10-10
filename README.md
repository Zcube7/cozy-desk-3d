# 小小陪伴 · 午后桌边

基于用户提供的黑发、蓝衣人物与白猫参考图制作的 3D 网页互动原型。角色、家具、猫咪均为 Three.js 立体几何模型，可转动视角；不是把参考图贴在平面上。

人物按参考图还原：蓬松的黑色锅盖头（尖角刘海盖住眉毛、头顶一撮呆毛、耳朵露在发际下）、眯眼笑和带斜线的腮红、浅蓝 LI-NING 篮球 T 恤、裤脚红黑斜纹的浅粉短裤和灰色凉鞋。白猫是长毛猫：背部淡紫灰渐变、头顶灰褐色带深色额纹、粉色内耳、蓬松的脸颊和胸毛；睡觉时眯眼，翻肚皮醒来后是参考图里那双黑亮的大圆眼。

- 在线试玩：**https://zcube7.github.io/cozy-desk-3d/**
- 源码仓库：https://github.com/Zcube7/cozy-desk-3d
- 自动发布记录：https://github.com/Zcube7/cozy-desk-3d/actions/workflows/deploy-pages.yml

## 持续更新

GitHub 的 `main` 分支是正式版本。每次推送到 `main`，GitHub Actions 都会检查游戏 JavaScript，然后把 `dist/` 发布到同一个 GitHub Pages 地址。也可以在 Actions 页面手动运行 `Deploy GitHub Pages`。

修改页面用 `dist/index.html`，调整样式用 `dist/style.css`；人物改 `dist/js/person.js`，猫改 `dist/js/cat.js`，房间家具改 `dist/js/room.js`（各文件见下方「文件」）。可以直接在 GitHub 编辑，也可以在本地修改、试玩后提交：

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
- 鼠标拖动或单指拖动转动视角，滚轮或双指缩放；右上角重置视角。手机上提示文字会自动换成触屏说法。
- 底部按钮与键盘 `1`、`2`、`3` 触发相同互动。
- 音效默认关闭，开启后播放合成的轻柔互动提示音；不包含录制的人声。

## 本地运行

安装 Node.js 后，在本目录执行：

```powershell
npm start
```

打开 http://127.0.0.1:4177/ 。资源全部随项目提供，运行时不需要 CDN、账号、API Key 或后端服务。请通过 HTTP 打开，不要直接双击 HTML 文件。

## 文件

- `dist/index.html`：页面与辅助互动按钮，预加载全部模块。
- `dist/style.css`：电脑、手机布局与提示气泡。
- `dist/js/main.js`：渲染器、灯光、互动状态、点击判定和渲染循环。
- `dist/js/person.js`：人物（发型、表情、衣服、椅子）和三种姿势。
- `dist/js/cat.js`：猫咪（毛色、脸、眼睛、尾巴）和翻肚皮动作。
- `dist/js/room.js`：地板、墙、窗、书架、书桌和电脑。
- `dist/js/framing.js`：按屏幕形状自动取景，让房间填满标题和说明之外的空间。
- `dist/js/ui.js`：气泡、提示、粒子、按钮、快捷键和合成音效。
- `dist/js/kit.js`：共用材质和几何工具，包括把静止部件合并成少量网格的 `bake`。
- `dist/vendor/`：固定版本 Three.js 0.180.0（官方压缩版）、附加模块与 MIT 许可证。
- `check.mjs`：逐个检查 `dist/js/` 模块语法，发布前由 Actions 运行（`npm run check`）。
- `serve.mjs`：仅监听本机地址的本地静态服务器。
- `.github/workflows/deploy-pages.yml`：从 `main` 自动发布到 GitHub Pages。
- `.openai/hosting.json`：保留的原 Sites 站点配置，不参与 GitHub Pages 发布。后续持续更新以 GitHub Pages 地址为准。

Three.js 官方文档：https://threejs.org/docs/ 。浏览器需支持 WebGL 2；显示错误时页面会提供重试入口。

这是可继续迭代的风格化几何模型原型，不含外部美术建模文件或导出的骨骼动画。头、手、小腿及猫的身体、爪子、尾巴为独立动画节点。人物与猫的状态独立，支持同时互动。

## 性能

- 静止的家具和角色内部不动的部件在加载时按材质合并，每帧绘制调用从约 580 次降到约 200 次，三角形从约 51 万降到约 24 万（都含阴影）。
- 球体按尺寸选精度，细小装饰不投射阴影。
- 没有互动、也没拖动视角时降到 30 帧；页面隐藏或滚出屏幕时停止渲染。互动和拖动时恢复满帧。
- Three.js 换成官方压缩版，首次下载的脚本和样式（gzip 后）从约 416 KB 降到约 214 KB。

## 验证

`verify.mjs` 在无界面 Chrome 中检查 1440 × 1000 和 390 × 844 页面：三种反馈、气泡不出舞台、恢复待机、空闲限帧与绘制预算、快捷键、音效开关、手机不横向溢出且整个房间都在画面内、没有坏几何和控制台报错。`verify-input.mjs` 检查直接点击头部、身体和猫的命中区分，拖动与点空地板不触发动作，以及手机触摸头部和猫咪；点击位置从场景实时换算，改布局后不用改脚本。`qa-output/` 为不参与部署的本地截图。

在地址后加 `?debug`（如 http://127.0.0.1:4177/?debug ）会把场景对象挂到 `window.cozy`，供验证脚本和调试使用，正常访问不受影响。

浏览器验证脚本使用 `.sites-runtime/node_modules/playwright`；需要复跑时先执行 `npm install --prefix .sites-runtime --no-save --package-lock=false playwright@1.56.1`，启动服务器，再运行 `node verify.mjs` 和 `node verify-input.mjs`。本地脚本默认使用 Windows Chrome 安装路径，可按环境调整。这不是对所有真实移动设备的兼容性或性能承诺。

页面按需注册 `interact_with_companions` WebMCP 工具，不支持该接口的浏览器仍可正常游玩。本机 Chrome 未提供该接口，因此未验证原生 WebMCP 执行。
