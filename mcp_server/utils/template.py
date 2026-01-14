from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass(frozen=True)
class Template:
  text: str

  def render(self, variables: Dict[str, Any]) -> str:
    rendered = self.text
    for k, v in variables.items():
      rendered = rendered.replace(f"{{{{{k}}}}}", "" if v is None else str(v))
    if "{{" in rendered and "}}" in rendered:
      return rendered
    return rendered

