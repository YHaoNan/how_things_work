import {makeScene2D, Circle, Rect, Txt, View2D} from '@motion-canvas/2d';
import {createRef, easeInExpo, easeOutExpo, waitFor, ThreadGenerator, all, usePlayback} from '@motion-canvas/core';
import {Colors} from '@src/common/colors';
import {Director} from '@src/common/director';
import {program} from '@ws/program';
import subtitleContent from '@ws/subtitle.srt?raw';
import {testPoint} from '@src/testing/visualTestPoint';

// SRT字幕项接口
interface SubtitleItem {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

// 解析SRT字幕文件
function parseSRT(content: string): SubtitleItem[] {
  const subtitles: SubtitleItem[] = [];
  const blocks = content.split('\n\n').filter(block => block.trim());

  for (const block of blocks) {
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length < 3) continue;

    const id = parseInt(lines[0]);
    const timeLine = lines[1];
    const text = lines.slice(2).join('\n');

    // 解析时间格式 00:00:00,000 --> 00:00:02,000
    const timeRegex = /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/;
    const match = timeLine.match(timeRegex);
    if (!match) continue;

    const [, h1, m1, s1, ms1, h2, m2, s2, ms2] = match;
    const startTime = parseInt(h1) * 3600 + parseInt(m1) * 60 + parseInt(s1) + parseInt(ms1) / 1000;
    const endTime = parseInt(h2) * 3600 + parseInt(m2) * 60 + parseInt(s2) + parseInt(ms2) / 1000;

    subtitles.push({
      id,
      startTime,
      endTime,
      text
    });
  }

  return subtitles;
}

// 播放字幕的生成器函数
function* playSubtitles(view: View2D): ThreadGenerator {
  const subtitles = parseSRT(subtitleContent);
  const playback = usePlayback();
  
  // 创建字幕文本对象
  const subtitleText = createRef<Txt>();
  view.add(
    <Txt
      ref={subtitleText}
      text=""
      fontSize={32}
      fill="#ffffff"
      position={[0, 450]}
      opacity={0}
      textAlign="center"
      width={1200}
      zIndex={1000}
      shadowColor="rgba(0, 0, 0, 0.3)"
      shadowBlur={2}
      shadowOffsetX={1}
      shadowOffsetY={1}
    />
  );
  
  // 按时间顺序播放字幕
  for (const subtitle of subtitles) {
    // 等待到字幕开始时间
    yield* waitFor(subtitle.startTime - playback.time);
    
    // 显示字幕
    subtitleText().text(subtitle.text);
    yield* subtitleText().opacity(1, 0.3);
    
    // 等待到字幕结束时间
    yield* waitFor(subtitle.endTime - playback.time);
    
    // 隐藏字幕
    yield* subtitleText().opacity(0, 0.3);
  }
  
  // 移除字幕
  subtitleText().remove();
}

export default makeScene2D(function* (view: View2D) {
  view.fill(Colors.background);

  const director = new Director(view);
  testPoint('主场景-开始');
  
  // 并行运行主程序和字幕
  yield* all(
    program(director),
    playSubtitles(view)
  );

  // 3. Transition Out Animation
  // Cover the scene
  yield* waitFor(0.5); // Hold black/red for a moment
  testPoint('主场景-结束');
});
