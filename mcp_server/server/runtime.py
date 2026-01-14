import os
from typing import Any, Dict

from ..utils.stdio import StdioTransport
from .errors import JsonRpcError
from .jsonrpc import make_error


async def run_stdio(app: Any) -> None:
  transport = StdioTransport()
  await transport.start()

  while True:
    try:
      request: Dict[str, Any] = await transport.recv()
      if not request:
        continue
      try:
        response = await app.handle(request)
        await transport.send(response)
      except JsonRpcError as e:
        await transport.send({"jsonrpc": "2.0", "id": request.get("id"), "error": make_error(e.code, e.message, e.data)})
      except Exception as e:
        await transport.send({"jsonrpc": "2.0", "id": request.get("id"), "error": make_error(-32603, "内部错误", {"message": str(e)})})
    except EOFError:
      break


def repo_root_from_here(here: str) -> str:
  return os.path.abspath(os.path.join(here, ".."))

