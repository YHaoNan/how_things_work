from dataclasses import dataclass
from typing import Any, Optional


@dataclass(frozen=True)
class JsonRpcError(Exception):
  code: int
  message: str
  data: Optional[Any] = None

