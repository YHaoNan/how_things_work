import asyncio

from .main import run

if __name__ == "__main__":
  import os
  if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
  asyncio.run(run())
