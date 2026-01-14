from __future__ import annotations

import os
from typing import Any, Dict, List, cast

from pyppeteer import launch


class BrowserClient:
  def __init__(self, repo_root: str):
    self._repo_root = repo_root
    self._default_url = os.environ.get("CHECK_TARGET_URL", "http://127.0.0.1:9000/")
    self._browser = None
    self._page = None

  async def ensure_ready(self) -> None:
    await self._ensure_page()

  async def list_markers(self) -> List[Dict[str, Any]]:
    page = await self._ensure_page()
    await page.waitForFunction("globalThis.__MC_VISUAL_TEST__?.listMarkers")
    markers = await page.evaluate("() => globalThis.__MC_VISUAL_TEST__.listMarkers()")
    return cast(List[Dict[str, Any]], markers) if isinstance(markers, list) else []

  async def goto(self, id_or_name: str) -> None:
    page = await self._ensure_page()
    await page.evaluate("(key) => globalThis.__MC_VISUAL_TEST__.goto(key)", id_or_name)
    await page.waitFor(80)

  async def pause(self) -> None:
    page = await self._ensure_page()
    await page.evaluate("() => globalThis.__MC_VISUAL_TEST__.pause()")

  async def capture(self) -> str:
    page = await self._ensure_page()
    scale = float(os.environ.get("SCREENSHOT_SCALE", "1.0") or "1.0")
    scale = max(0.1, min(1.0, scale))
    fmt = (os.environ.get("SCREENSHOT_FORMAT", "PNG") or "PNG").upper()
    quality = int(float(os.environ.get("SCREENSHOT_QUALITY", "90") or "90"))
    quality = max(0, min(100, quality))

    image_data_url = await page.evaluate(
      """async ({scale, format, quality}) => {
        const capture = globalThis.__MC_VISUAL_TEST__?.capture;
        let src = null;
        if (typeof capture === 'function') {
          src = await capture();
        }
        if (!src) {
          const canvas = document.querySelector('canvas');
          src = canvas ? canvas.toDataURL('image/png') : null;
        }
        if (!src) return null;
        const normalized = String(format || 'PNG').toUpperCase();
        const outFmt = normalized === 'JPEG' ? 'jpeg' : 'png';
        if (scale >= 0.999 && outFmt === 'png') return src;
        const img = new Image();
        img.src = src;
        await img.decode();
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(img.width * scale));
        out.height = Math.max(1, Math.round(img.height * scale));
        const ctx = out.getContext('2d');
        ctx.drawImage(img, 0, 0, out.width, out.height);
        if (outFmt === 'jpeg') return out.toDataURL('image/jpeg', Math.max(0, Math.min(1, (quality ?? 90) / 100)));
        return out.toDataURL('image/png');
      }""",
      {"scale": scale, "format": fmt, "quality": quality},
    )
    if not isinstance(image_data_url, str) or not image_data_url.startswith("data:image/"):
      raise RuntimeError("截图失败：未获得 dataURL")

    out_dir = (os.environ.get("SCREENSHOT_DIR", "") or "").strip()
    if out_dir:
      from .screenshot import save_data_url
      abs_dir = out_dir if os.path.isabs(out_dir) else os.path.join(self._repo_root, "mcp_server", out_dir)
      os.makedirs(abs_dir, exist_ok=True)
      save_data_url(image_data_url, abs_dir, fmt=fmt, quality=quality)

    return image_data_url

  async def close(self) -> None:
    if self._page is not None:
      try:
        await self._page.close()
      except Exception:
        pass
      self._page = None
    if self._browser is not None:
      try:
        await self._browser.close()
      except Exception:
        pass
      self._browser = None

  async def _ensure_page(self):
    if self._browser is None:
      executable_path = (os.environ.get("BROWSER_EXECUTABLE_PATH", "") or "").strip() or None
      if not executable_path:
        executable_path = _detect_chrome_executable()
      self._browser = await launch(
        headless=True,
        executablePath=executable_path,
        args=["--no-sandbox", "--disable-setuid-sandbox"],
      )
    if self._page is None:
      page = await self._browser.newPage()
      await page.setViewport({"width": 1920, "height": 1080, "deviceScaleFactor": 1})
      url = (os.environ.get("CHECK_TARGET_URL", "") or "").strip() or self._default_url
      await page.goto(url, {"waitUntil": "networkidle2", "timeout": 90_000})
      await page.waitForFunction("globalThis.__MC_VISUAL_TEST__?.listMarkers", {"timeout": 90_000})
      self._page = page
    return self._page


def _detect_chrome_executable() -> str | None:
  candidates: List[str] = []
  if os.name == "nt":
    candidates += [
      r"C:\Program Files\Google\Chrome\Application\chrome.exe",
      r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
      r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
      r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    ]
  elif os.name == "posix":
    candidates += [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium",
      "/usr/bin/chromium-browser",
    ]
  for p in candidates:
    if os.path.exists(p):
      return p
  return None
