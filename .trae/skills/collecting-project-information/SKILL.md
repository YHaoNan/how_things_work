---
name: collecting-project-information
description: 收集当前项目信息，应在生成工作开始前执行以更好的了解如何工作
---

# Environment Details
现在你所处在How Things Work项目中，项目结构如下：

```text
projects          用户实际的项目目录
|-- 项目文件夹（项目名）
    |-- assets        你生成视频时可能用到的资源文件，如图片、视频等
    |-- script.md     视频口播脚本，其中包含视频的口播内容以及用户给出的额外提示（`>`开头的行）
    |-- mindmap.json  思维导图文件，由你根据脚本生成
    |-- xxx.tsx       动画文件，由你根据脚本生成
    |-- yyy.tsx       动画文件，由你根据脚本生成
    |-- program.tsx   流程编排，编排思维导图、各个演示动画如何流转，由你生成
|-- 项目文件夹2
tsconfig.json         你需要十分关注这个文件，其中的@ws定义了当前你的工作目录
```

# Step by Step Instruction
1. 你可以利用并总结通用知识，关于通用知识，详见knowledge-summary技能
2. 阅读tsconfig.json，了解你当前的工作项目目录，它是用户当前想要生成的视频，后续你所有的工作应专注于这个项目目录
3. 阅读项目下的script.md，了解这篇视频讲解的内容以及用户给你的提示
4. 你可以将这个阶段获取到的所有知识压缩至项目根目录下的.knowledge文件夹中，以便后续直接查阅，详情请参考knowledge-summary技能