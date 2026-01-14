import json
import os
from typing import Any, Dict, List

from ..env.loader import load_env
from ..tool.check import VisionCheckTool
from .errors import JsonRpcError
from .jsonrpc import make_response


class McpApp:
  def __init__(self, repo_root: str):
    self.repo_root = repo_root
    self.dotenv = load_env(repo_root)
    self.env_keys = sorted(self.dotenv.keys())
    self.tools = [VisionCheckTool(self.env_keys, repo_root)]

  def list_tools(self) -> List[Dict[str, Any]]:
    return [t.schema() for t in self.tools]

  async def call_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    for t in self.tools:
      if t.name == name:
        result = await t.call(arguments)
        return {"content": [{"type": "text", "text": json.dumps(result, ensure_ascii=False)}]}
    raise JsonRpcError(code=-32601, message=f"未知工具: {name}")

  async def handle(self, request: Dict[str, Any]) -> Dict[str, Any]:
    method = request.get("method")
    req_id = request.get("id")
    params = request.get("params") or {}

    if method == "initialize":
      client_info = params.get("clientInfo") or {}
      return make_response(
        req_id,
        {
          "protocolVersion": "2024-11-05",
          "serverInfo": {"name": "mcp_server", "version": "0.1.0"},
          "capabilities": {"tools": {}},
          "env": {k: os.environ.get(k, "") for k in self.env_keys},
          "clientInfo": client_info,
        },
      )

    if method == "tools/list":
      return make_response(req_id, {"tools": self.list_tools()})

    if method == "tools/call":
      name = params.get("name")
      arguments = params.get("arguments") or {}
      result = await self.call_tool(name, arguments)
      return make_response(req_id, result)

    if method == "ping":
      return make_response(req_id, {"ok": True})

    raise JsonRpcError(code=-32601, message=f"未知方法: {method}")
