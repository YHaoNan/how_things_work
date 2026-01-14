import asyncio
import os
import sys
from typing import Any, Tuple

def _imports() -> Tuple[Any, Any, Any]:
  if __package__:
    from .server.app import McpApp
    from .server.runtime import repo_root_from_here, run_stdio
    return McpApp, repo_root_from_here, run_stdio

  repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
  if repo_root not in sys.path:
    sys.path.insert(0, repo_root)
  from mcp_server.server.app import McpApp
  from mcp_server.server.runtime import repo_root_from_here, run_stdio
  return McpApp, repo_root_from_here, run_stdio


async def run() -> None:
  McpApp, repo_root_from_here, run_stdio = _imports()
  repo_root = repo_root_from_here(os.path.dirname(__file__))
  await run_stdio(McpApp(repo_root))


if __name__ == "__main__":
  if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
  asyncio.run(run())
