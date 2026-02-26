---
name: collecting-framework-environment
description: 收集当前框架的环境信息，应在生成工作开始前执行以更好的了解如何工作
---

# Environment Details
现在你所处在How Things Work项目中，项目结构如下：

```text
src               视频框架代码，你可以利用它更好的了解视频框架的运作原理以提升生成代码的准确性
example_project   一个示例项目，你可以利用它来了解如何生成可运行的视频项目
projects          用户实际的项目目录
|-- 项目文件夹（项目名）
    |-- assets        你生成视频时可能用到的资源文件，如图片、视频等
    |-- script.md     视频口播脚本，其中包含视频的口播内容以及用户给出的额外提示（`>`开头的行）
    |-- mindmap.json  思维导图文件，由你根据脚本生成
    |-- xxx.tsx       动画文件，由你根据脚本生成
    |-- yyy.tsx       动画文件，由你根据脚本生成
    |-- program.tsx   流程编排，编排思维导图、各个演示动画如何流转，由你生成
|-- 项目文件夹2
```

# The dir/files you don't need to pay attention to
1. `dist`/`agent`/`mcp_server`/`docs`/`output`/`public`/`scripts`

# Step by Step Instruction
1. 你可以利用或总结通用知识，详见knowledge-summary技能
2. 阅读框架代码和示例项目，充分了解你要做什么
3. 你可以将这个阶段获取到的所有知识压缩至框架根目录下的.knowledge文件夹中，以便后续直接查阅，详情请参考knowledge-summary技能