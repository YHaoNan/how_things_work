from __future__ import annotations

import json
import os
import re
import urllib.request
from typing import Any, Dict, List, Optional


def _extract_json(text: str) -> Any:
  raw = text.strip()
  raw = re.sub(r"^```(?:json)?\s*", "", raw)
  raw = re.sub(r"\s*```$", "", raw)
  try:
    return json.loads(raw)
  except Exception:
    pass
  start = raw.find("[")
  end = raw.rfind("]")
  if start != -1 and end != -1 and end > start:
    return json.loads(raw[start : end + 1])
  start = raw.find("{")
  end = raw.rfind("}")
  if start != -1 and end != -1 and end > start:
    return json.loads(raw[start : end + 1])
  raise ValueError("无法解析JSON输出")


class VisionModel:
  def __init__(self):
    self._base_url = os.environ.get("MODEL_BASE_URL", "").rstrip("/")
    self._api_key = os.environ.get("MODEL_API_KEY", "")
    self._model = os.environ.get("MODEL_NAME", "")

  def is_configured(self) -> bool:
    return bool(self._base_url and self._api_key and self._model)

  def _endpoint(self) -> str:
    base = self._base_url.rstrip("/")
    if base.endswith("/chat/completions"):
      return base
    if base.endswith("/v1"):
      return f"{base}/chat/completions"
    return f"{base}/v1/chat/completions"

  async def evaluate(self, prompt: Dict[str, Any], image_data_url: str) -> List[Dict[str, Any]]:
    if not self.is_configured():
      return [
        {
          "bug": "视觉模型未配置，无法执行截图分析",
          "todo": "在 mcp_server/.env 或启动环境中设置 MODEL_BASE_URL、MODEL_API_KEY、MODEL_NAME",
        }
      ]
    url = self._endpoint()

    body: Dict[str, Any] = {
      "model": self._model,
      "temperature": 0.2,
      "messages": [
        {"role": "system", "content": prompt["system"]},
        {
          "role": "user",
          "content": [
            {"type": "text", "text": prompt["user"]},
            {"type": "image_url", "image_url": {"url": image_data_url}},
          ],
        },
      ],
    }
    req = urllib.request.Request(
      url,
      data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
      headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {self._api_key}",
      },
      method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
      payload = json.loads(resp.read().decode("utf-8", errors="replace"))
    content = (((payload.get("choices") or [{}])[0]).get("message") or {}).get("content") or ""
    parsed = _extract_json(content)
    if isinstance(parsed, dict) and "items" in parsed:
      parsed = parsed["items"]
    if not isinstance(parsed, list):
      raise RuntimeError("模型输出不是JSON列表")
    normalized: List[Dict[str, Any]] = []
    for item in parsed:
      if not isinstance(item, dict):
        continue
      bug = str(item.get("bug") or "").strip()
      todo = str(item.get("todo") or "").strip()
      if bug and todo:
        normalized.append({"bug": bug, "todo": todo})
    return normalized
