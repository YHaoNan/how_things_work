from __future__ import annotations

import os
from typing import Any, Dict, List

from .template import Template


def _read_text(path: str) -> str:
  with open(path, "r", encoding="utf-8") as f:
    return f.read()


def build_prompt(system_vars: Dict[str, Any], user_vars: Dict[str, Any]) -> Dict[str, Any]:
  repo_root = str(system_vars.get("repo_root") or "")
  prompts_dir = os.path.join(repo_root, "mcp_server", "prompts")
  system_path = os.path.join(prompts_dir, "vision_system.md")
  user_path = os.path.join(prompts_dir, "vision_user.md")

  system_text = Template(_read_text(system_path)).render(system_vars)
  checks: List[str] = user_vars.get("checks") or []
  checks_text = "\n".join([f"- {c}" for c in checks if str(c).strip()])
  user_text = Template(_read_text(user_path)).render({**user_vars, "checks_markdown": checks_text})
  return {"system": system_text, "user": user_text}

