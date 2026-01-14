import asyncio
import os
import sys


async def main() -> None:
  repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
  if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

  from mcp_server.env.loader import load_env
  from mcp_server.tool.check import VisionCheckTool

  dotenv = load_env(repo_root)
  env_keys = sorted(dotenv.keys())
  tool = VisionCheckTool(env_keys, repo_root)
  result = await tool.call({"id": "tp_chat_intro", "env": {}})
  print(result)


if __name__ == "__main__":
  asyncio.run(main())
