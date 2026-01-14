# MCP Server 配置（USAGE）

本目录提供一个基于 stdio 的 Python MCP Server 框架，可在 Trae 中作为 MCP Server 接入使用。

## 1. 环境变量

在 `mcp_server/.env` 中配置（已提交为模板文件，可直接修改）：

- `BROWSER_EXECUTABLE_PATH`：Chrome 可执行文件路径（用于 puppeteer 驱动浏览器）
- `SCREENSHOT_DIR`：截图落盘目录（用于排查问题）
- `SCREENSHOT_FORMAT`：`JPEG` 或 `PNG`
- `SCREENSHOT_QUALITY`：`0~100`（JPEG 有效）
- `SCREENSHOT_SCALE`：`0.1~1.0`
- `MODEL_BASE_URL`：兼容 OpenAI API 的模型网关地址
- `MODEL_API_KEY`：模型 API Key（不要提交到仓库）
- `MODEL_NAME`：模型名（例如 `qwen-plus`）

Server 启动后会读取 `mcp_server/.env`，并把其中出现过的 key 通过 `initialize` 的 `env` 字段暴露给 MCP Client。

优先级说明：
- 如果 Trae 在启动进程时已经注入了同名环境变量，则以 Trae 注入的为准（本服务只会对未设置的 key 做默认填充）。

## 2. 安装依赖

Python（langchain）：

```bash
cd mcp_server
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
```

Node（puppeteer）：

```bash
cd mcp_server
npm install
```

## 3. 在 Trae 中配置 MCP Server（用户视角）

在 Trae 的 MCP/Tools/MCP Servers 配置页中新增一个“stdio 类型”的 MCP Server（不同版本入口名称可能略有差异），按下面填：

- **Name**：`how-things-work-mcp`（任意）
- **Transport**：stdio
- **Command**：`python`
- **Args**：`-m mcp_server`

如果你发现 Trae 不认 `cwd`（或者根本不提供该配置），那么 `python -m mcp_server` 是否能运行，取决于 Python 能否在它的 `sys.path` 里找到 `mcp_server` 包。推荐用下面两种方式之一解决：

### 方式 A（推荐）：把 mcp_server 安装到虚拟环境里

一旦安装到虚拟环境中，Trae 不管从哪个目录启动进程，都能 `-m mcp_server`。

安装（只需要做一次）：

```bash
cd mcp_server
python -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\pip install -e .
```

然后在 Trae 配置里使用虚拟环境的 python（可用相对路径，避免绝对路径）：

- **Command**：`mcp_server\\.venv\\Scripts\\python.exe`
- **Args**：`-m mcp_server`

也可以直接用 `pyproject.toml` 里声明的脚本名（同样依赖 `pip install -e .`）：

- **Command**：`mcp_server`（或 `mcp-server`，取决于你安装后生成的脚本名）

### 方式 B：直接运行脚本（不依赖 -m）

如果你不想安装包，也可以在 Trae 里让 Python 直接跑脚本：

- **Command**：`python`
- **Args**：`mcp_server\\main.py`

如果你的 Trae 版本支持直接粘贴 JSON 配置，可以使用下面的示例（字段名以 Trae 实际 UI/配置为准，常见格式是 `mcpServers`）：

```json
{
  "mcpServers": {
    "how-things-work-mcp": {
      "command": "python",
      "args": [
        "D:/WorkSpace/personal/how_things_work/mcp_server/main.py"
      ],
      "env": {
        "BROWSER_EXECUTABLE_PATH": "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "SCREENSHOT_DIR": "./screenshots",
        "SCREENSHOT_FORMAT": "JPEG",
        "SCREENSHOT_QUALITY": "90",
        "SCREENSHOT_SCALE": "0.5",
        "MODEL_BASE_URL": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "MODEL_API_KEY": "",
        "MODEL_NAME": "qwen-plus"
      }
    }
  }
}
```

说明：
- 你也可以不填 `env`，让服务端从 `mcp_server/.env` 自动加载；如果 Trae 注入了同名环境变量，则会覆盖 `.env` 的默认值。
- `MODEL_API_KEY` 不要写入仓库配置文件，建议在 Trae 的环境变量配置里注入。

## 4. 本地手动启动（用于排障）

推荐（以模块方式启动）：

```bash
cd <仓库根目录>
python -m mcp_server
```

或：

```bash
cd mcp_server
python .\main.py
```

## 5. 工具协议

当前只暴露一个工具：`check`，协议定义见 `mcp_protocal.md`。

注意：按当前阶段约定，`check` 只保留骨架，业务逻辑尚未实现。
