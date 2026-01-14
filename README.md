# 好奇的事-视频框架

本项目用于构建“好奇的事”频道的视频。

## TODO
- 提示词优化迭代
- [x] 项目路径问题
- 基于BrowserUse构建MCP Server，提供视觉自动化校验，编译错误，挂起问题等自动解决
- 接入视频生成tool

## 视频结构

- 开头：固定的片头动画，包含一个很酷的动画和本期标题
- 内容：开始讲解本期内容
  - 思维导图：一个固定场景，帮助用户梳理本期结构
  - 具体内容：某个具体的思维导图卡片可能包含讲解动画
- 结尾：固定的结尾动画

## 项目架构
本项目使用motion-canvas框架构建视频。

- `intro.tsx`是片头场景
- `main.tsx`是项目的主场景，但由于每一个项目的主场景非常不同，所以`main.tsx`只是一个空壳，具体内容是如何被加载的详见内容加载一节
- `outro.tsx`是片尾场景

## 内容加载
`main.tsx`场景负责加载整个视频的全部内容，这包含：
- 思维导图
- 具体动画
- 在二者之间进行编排的代码，比如何时展示思维导图，何时调度思维导图的某个动画（缩放、聚焦到某个节点、下探到某个节点以播放具体的动画）

我们将`main.tsx`场景拆分成图层，并抽象出`Layer`类，思维导图是一个Layer、每一个具体动画是一个Layer，Layer保证它们之间的元素互不干扰，都在各自的Root Node下，并且最多只有一个展示出来。

```text
Scene(main.tsx)
|- Layer Root Node
   |- MindMap Layer
|- Layer Root Node
   |- Specific Animation 1 Layer
|- Layer Root Node
   |- Specific Animation 2 Layer
```

## 项目切换
```bash
npm run list           列出所有项目
npm run cd <项目名>    切换到指定项目
```

## 测试框架
1. 动画在稳定状态主动添加`testPoint`
2. 框架通过`window.__MC_VISUAL_TEST__`来获得所有测试点，并逐一截图交给视觉引擎检查
   1. `listMarkers`列出所有测试点的名称、id、时间、check
   2. `goto(id)`，跳转到指定测试点
