from typing import Any, Dict, List


class BaseTool:
  name: str = ""
  description: str = ""

  def schema(self) -> Dict[str, Any]:
    raise NotImplementedError

  async def call(self, arguments: Dict[str, Any]) -> List[Dict[str, Any]]:
    raise NotImplementedError

