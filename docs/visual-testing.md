# 视觉测试（Visual Testing）

## 目标

- 动画作者在时间线上声明测试点（中文名 + 可定位的时间/帧信息）。
- 外部测试框架进入网页后：读取测试点 → 暂停 → 跳转到测试点 → 截图 → 做视觉比对。
- 不需要先完整播放一遍视频来“收集”测试点。

## 在动画里声明测试点

在任意场景的生成器里调用：

```ts
import {testPoint} from '@src/testing/visualTestPoint';

testPoint('标题页-开始');
```

每个测试点会记录：

- name：中文名
- frame：帧号
- time：秒
- scene：所属场景名

## 浏览器侧全局 API

项目加载后会暴露全局对象：

- `window.__MC_VISUAL_TEST__`
- 同时也会把同一个对象挂到 `window.motionMarkers`（兼容旧命名）

常用方法：

- `listMarkers(): {id,name,frame,time,scene}[]`
- `goto(idOrName: string): Promise<void>`：按 id 或 name 跳转
- `pause()` / `play()`
- `setSpeed(speed: number)`：0~64
- `capture(): Promise<string|null>`：返回 canvas 的 PNG dataURL（可选）

## 不跑完整视频也能拿到测试点

测试点在场景执行/时间轴计算过程中就会注册，因此外部框架只要等页面加载完成即可读取，不需要先手动播放完整视频。

## Playwright 使用示例（外部框架）

```ts
import {chromium} from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1920, height: 1080}});

await page.goto('http://127.0.0.1:9000/', {waitUntil: 'networkidle'});

await page.waitForFunction(() => (window as any).__MC_VISUAL_TEST__?.listMarkers);
await page.evaluate(() => (window as any).__MC_VISUAL_TEST__.pause());

const markers = await page.evaluate(() => (window as any).__MC_VISUAL_TEST__.listMarkers());

for (const m of markers) {
  await page.evaluate((id: string) => (window as any).__MC_VISUAL_TEST__.goto(id), m.id);
  await page.waitForTimeout(50);
  await page.locator('canvas').first().screenshot({path: `./screens/${m.id}.png`});
}

await browser.close();
```

