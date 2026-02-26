---
name: test-animation
description: 对动画做运行与视觉自检
---

# Compile validation
1. 针对当前动画执行编译`npm run build`，确保当前无语法错误
2. 如有语法错误，先修复语法错误

# Runtime Error
1. 运行`npm start`
2. 使用chrome devtools打开页面并开始播放
3. 执行`window.__MC_VISUAL_TEST.setSpeed(50)`
4. 执行`window.play()`，等待动画播放完毕
5. 判断控制台是否出现运行时错误，出现则修复

# Vision Test Step by Step Instruction
> 若check MCP工具不存在，则证明用户不希望进行视觉测试，跳过即可

1. 在program.tsx中将当前动画放入`director.playLayer(待测试Layer)`，这样就可以在页面上看到当前动画的运行
2. 启动开发服务`npm start`，保证页面能通过CHECK_TARGET_URL访问（默认http://127.0.0.1:9000/）
3. 在关键静态画面添加测试点：testPoint('中文名', {check: '你对当前画面的预期描述'})
4. 逐个测试点调用check工具，修复返回的问题
5. 每次修复后重复检查全部测试点，直到没有问题

当你遇到问题，你应该回到收集信息的步骤中

# Close Server
当你完成测试阶段，必须关闭你所打开的server