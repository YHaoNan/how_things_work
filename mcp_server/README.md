# How things work MCP Server
给Trae Agent提供MCP服务，以完成视频生成中的各种复杂功能

## 已实现
- MCP server 框架（Python stdio + JSON-RPC）
- 工具协议：`mcp_protocal.md`
- 依赖预置：Node `puppeteer`、Python `langchain`

## 模块划分
- `tool/`：提供MCP工具，所有工具继承`BaseTool`
- `llm/`：用于驱动模型
- `utils/`：一些工具函数
- `test/`：测试代码
- `env/`：用于动态加载配置，如env
- `server/`：MCP服务器相关包
- `main.py`：主脚本，融合一切

## 当前状态

- 仅暴露一个工具：`check`（协议见 `mcp_protocal.md`）
- `check` 逻辑暂未实现（按当前阶段要求仅搭建框架）
- 会读取 `mcp_server/.env` 并在 `initialize` 返回 `env` 字段（只包含 `.env` 中的 key）
