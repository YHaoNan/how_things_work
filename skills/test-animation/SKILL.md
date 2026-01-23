---
name: test-animation
description: 对动画做运行与视觉自检
---

# Step by Step Instruction
1. 在program.tsx中只播放当前待测的Layer，减少干扰
2. 启动开发服务，保证页面能通过CHECK_TARGET_URL访问（默认http://127.0.0.1:9000/）
3. 在关键静态画面添加测试点：testPoint('中文名', {check: '你的预期'})
4. 逐个测试点调用check工具，按返回的问题修复布局/遮挡/溢出
5. 每次修复后重复检查全部测试点，直到没有问题
