import os
from typing import Dict


def parse_dotenv(path: str) -> Dict[str, str]:
  if not os.path.exists(path):
    return {}
  result: Dict[str, str] = {}
  with open(path, "r", encoding="utf-8") as f:
    for raw in f.read().splitlines():
      line = raw.strip()
      if not line or line.startswith("#") or "=" not in line:
        continue
      k, v = line.split("=", 1)
      key = k.strip()
      value = v.strip().strip('"').strip("'")
      if key:
        result[key] = value
  return result


def load_env(repo_root: str) -> Dict[str, str]:
  dotenv_path = os.path.join(repo_root, "mcp_server", ".env")
  values = parse_dotenv(dotenv_path)
  for k, v in values.items():
    os.environ.setdefault(k, v)
  return values

