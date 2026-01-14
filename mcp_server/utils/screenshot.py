from __future__ import annotations

import base64
import os
import time
from typing import Optional


def _ext(fmt: str) -> str:
  return "jpg" if fmt.upper() == "JPEG" else "png"


def save_data_url(data_url: str, directory: str, fmt: str = "PNG", quality: int = 90) -> str:
  prefix, _, b64 = data_url.partition(",")
  if not prefix.startswith("data:image/") or not b64:
    raise ValueError("不是有效的 image dataURL")
  os.makedirs(directory, exist_ok=True)
  filename = f"visual_{int(time.time() * 1000)}.{_ext(fmt)}"
  path = os.path.join(directory, filename)
  with open(path, "wb") as f:
    f.write(base64.b64decode(b64))
  return path

