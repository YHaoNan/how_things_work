---
name: mindmap-generation
description: 根据script.md生成mindmap.json
---

# Output
- 项目目录下的mindmap.json

# Step by Step Instruction
1. 读取项目下的script.md，只提取正文的章节/小节标题
2. 忽略前言、结语、致谢等非正文内容
3. 将标题整理成2~3层树结构：根节点→章节→小节（可选）
4. 为每个节点生成稳定且唯一的id，并分配color（使用CardColors的键名）
5. 写入mindmap.json：每个节点包含id/name/color/children字段
