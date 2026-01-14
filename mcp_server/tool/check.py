from typing import Any, Dict, List

from .base import BaseTool
from ..server.errors import JsonRpcError


class VisionCheckTool(BaseTool):
  name = "check"
  description = "接收测试点id，返回待改进问题与修改建议的 JSON 列表。"

  def __init__(self, env_keys: List[str], repo_root: str):
    self._env_keys = env_keys
    self._repo_root = repo_root
    from ..utils.browser import BrowserClient
    from ..llm.vision import VisionModel
    from ..utils.prompts import build_prompt
    self._browser = BrowserClient(repo_root)
    self._vision = VisionModel()
    self._build_prompt = build_prompt

  def schema(self) -> Dict[str, Any]:
    return {
      "name": self.name,
      "description": self.description,
      "inputSchema": {
        "type": "object",
        "properties": {
          "id": {"type": "string", "description": "测试点 id（来自 window.__MC_VISUAL_TEST__.listMarkers()）"},
          "env": {
            "type": "object",
            "description": "可选：运行时环境变量快照（便于调试/审计）。",
            "properties": {k: {"type": "string"} for k in self._env_keys},
            "additionalProperties": True,
          },
        },
        "required": ["id"],
        "additionalProperties": True,
      },
    }

  async def call(self, arguments: Dict[str, Any]) -> List[Dict[str, Any]]:
    browser_opened = False
    try:
      tp_id = str(arguments.get("id") or "").strip()
      if not tp_id:
        raise JsonRpcError(code=-32602, message="缺少测试点id")
      env_snapshot = arguments.get("env") or {}

      await self._browser.ensure_ready()
      browser_opened = True
      markers = await self._browser.list_markers()
      target = next((m for m in markers if m.get("id") == tp_id or m.get("name") == tp_id), None)
      if not target:
        raise JsonRpcError(code=-32602, message=f"未找到测试点: {tp_id}")

      await self._browser.goto(tp_id)
      await self._browser.pause()
      screenshot_b64 = await self._browser.capture()
      check_hint = target.get("check")

      base_checks = [
        "文本不应溢出容器边界，且不被裁切",
        "关键元素之间间距合理，不拥挤也不过空",
        "色彩对比度足够，重要信息清晰可辨",
        "图层不应错误遮挡：气泡尾巴与头像层级正确",
        "无异常模糊、拉伸或变形的效果",
        "对齐规范：左右列对齐、卡片标题与正文对齐",
      ]
      user_checks = []
      if isinstance(check_hint, list):
        user_checks = [str(x) for x in check_hint]
      elif isinstance(check_hint, str) and check_hint.strip():
        user_checks = [check_hint.strip()]
      checks = base_checks + user_checks

      prompt = self._build_prompt(
        system_vars={"env": env_snapshot, "repo_root": self._repo_root},
        user_vars={"id": tp_id, "checks": checks},
      )
      result = await self._vision.evaluate(prompt, screenshot_b64)
      return result
    except JsonRpcError:
      raise
    except Exception as e:
      raise JsonRpcError(code=-32603, message="视觉检查失败", data={"message": str(e)})
    finally:
      if browser_opened:
        try:
          await self._browser.close()
        except Exception:
          pass
