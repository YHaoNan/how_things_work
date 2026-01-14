import asyncio
import json
import sys
import threading
from typing import Any, Dict


class StdioTransport:
  def __init__(self) -> None:
    self.reader = asyncio.StreamReader()
    self.protocol = asyncio.StreamReaderProtocol(self.reader)
    self.write_lock = asyncio.Lock()
    self._fallback_thread: threading.Thread | None = None
    self._fallback_queue: asyncio.Queue[bytes | None] | None = None

  async def start(self) -> None:
    loop = asyncio.get_running_loop()
    if sys.platform == "win32":
      self._start_fallback_reader(loop)
      return
    if hasattr(sys.stdin, "isatty") and sys.stdin.isatty():
      self._start_fallback_reader(loop)
      return
    try:
      await loop.connect_read_pipe(lambda: self.protocol, sys.stdin)
      return
    except Exception:
      self._start_fallback_reader(loop)

  def _start_fallback_reader(self, loop: asyncio.AbstractEventLoop) -> None:
    self._fallback_queue = asyncio.Queue()

    def _reader() -> None:
      try:
        while True:
          chunk = sys.stdin.buffer.readline()
          if not chunk:
            loop.call_soon_threadsafe(self._fallback_queue.put_nowait, None)
            break
          loop.call_soon_threadsafe(self._fallback_queue.put_nowait, chunk)
      except Exception:
        try:
          loop.call_soon_threadsafe(self._fallback_queue.put_nowait, None)
        except Exception:
          pass

    t = threading.Thread(target=_reader, name="stdio-reader", daemon=True)
    self._fallback_thread = t
    t.start()

  async def recv(self) -> Dict[str, Any]:
    if self._fallback_queue is None:
      line = await self.reader.readline()
    else:
      chunk = await self._fallback_queue.get()
      if chunk is None:
        raise EOFError
      line = chunk
    if not line:
      raise EOFError
    raw = line.decode("utf-8", errors="replace").strip()
    if not raw:
      return {}
    return json.loads(raw)

  async def send(self, message: Dict[str, Any]) -> None:
    payload = (json.dumps(message, ensure_ascii=False) + "\n").encode("utf-8")
    async with self.write_lock:
      sys.stdout.buffer.write(payload)
      await asyncio.get_running_loop().run_in_executor(None, sys.stdout.buffer.flush)
