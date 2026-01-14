import json
from typing import Any, Dict


def make_error(code: int, message: str, data: Any = None) -> Dict[str, Any]:
  err: Dict[str, Any] = {"code": code, "message": message}
  if data is not None:
    err["data"] = data
  return err


def make_response(req_id: Any, result: Any) -> Dict[str, Any]:
  return {"jsonrpc": "2.0", "id": req_id, "result": result}

