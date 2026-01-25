---
name: animation-generation
description: 指导你如何生成动画
---

# Step by Step Instruction
1. 明确这段动画只解释一个概念（对应一个mindmap节点）
2. 将讲解拆成多个演示步骤，每步都有清晰的画面状态
3. 在on_build_ui中搭建UI：布局自适应，文本可换行，避免溢出裁切
4. 在on_play中编排动画和时间线：步骤之间用yield* waitUntil('事件名')停顿
5. 优先使用项目assets中的图片/视频资源，保证比例与清晰度
6. 需要视觉自检时，在稳定画面添加测试点（详见test-animation技能）
