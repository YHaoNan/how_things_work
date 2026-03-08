import {Circle, Layout, Rect, Txt} from '@motion-canvas/2d';
import {
  ThreadGenerator,
  all,
  any,
  createRef,
  createSignal,
  easeInOutCubic,
  easeOutCubic,
  tween,
  waitFor,
  waitUntil,
} from '@motion-canvas/core';
import {AnimLayer} from '@src/common/animLayer';
import {Colors} from '@src/common/colors';
import {testPoint} from '@src/testing/visualTestPoint';

export class ChatPoemLayer extends AnimLayer {
  private window = createRef<Rect>();
  private header = createRef<Layout>();
  private content = createRef<Layout>();

  private userRow = createRef<Layout>();
  private aiRow = createRef<Layout>();
  private poemCard = createRef<Rect>();

  private userBubble = createRef<Rect>();
  private aiBubble = createRef<Rect>();
  private sendSpark = createRef<Circle>();

  private userText = createSignal('');
  private aiText = createSignal('');
  private thinkingText = createSignal('···');
  private poemText = createSignal('');

  protected on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect width={1920} height={1080} fill={'rgba(0,0,0,0.22)'} />
        <Rect
          ref={this.window}
          width={1680}
          height={920}
          radius={40}
          fill={'#101113'}
          stroke={'rgba(255,255,255,0.08)'}
          lineWidth={4}
          opacity={0}
          scale={0.98}
          shadowColor={'rgba(0,0,0,0.6)'}
          shadowBlur={24}
        >
          <Layout ref={this.header} y={-380} opacity={0}>
            <Rect
              width={1560}
              height={92}
              radius={28}
              fill={'rgba(255,255,255,0.04)'}
              stroke={'rgba(255,255,255,0.06)'}
              lineWidth={2}
            >
              <Layout>
                <Circle x={-720} size={14} fill={'#ff5f57'} />
                <Circle x={-680} size={14} fill={'#febc2e'} />
                <Circle x={-640} size={14} fill={'#28c840'} />
                <Txt
                  text="对话测试：古诗生成"
                  fill={'rgba(255,255,255,0.92)'}
                  fontSize={34}
                  fontFamily={'Arial, sans-serif'}
                  fontWeight={700}
                />
              </Layout>
            </Rect>
          </Layout>

          <Layout ref={this.content} y={10}>
            <Layout ref={this.aiRow} x={-420} y={-180} opacity={0}>
              <Circle
                size={96}
                fill={Colors.green}
                stroke={'rgba(255,255,255,0.18)'}
                lineWidth={3}
                x={-260}
              >
                <Txt
                  text="AI"
                  fill={'rgba(0,0,0,0.85)'}
                  fontSize={42}
                  fontFamily={'Arial, sans-serif'}
                  fontWeight={900}
                />
              </Circle>
              <Layout x={40}>
                <Rect
                  ref={this.aiBubble}
                  width={720}
                  height={170}
                  radius={30}
                  fill={'rgba(255,255,255,0.06)'}
                  stroke={'rgba(255,255,255,0.08)'}
                  lineWidth={2}
                  opacity={0}
                >
                  <Layout x={-300} y={0}>
                    <Txt
                      text={() => (this.aiText() ? this.aiText() : this.thinkingText())}
                      fill={'rgba(255,255,255,0.92)'}
                      fontSize={46}
                      fontFamily={'Arial, sans-serif'}
                      fontWeight={700}
                      textAlign={'left'}
                    />
                  </Layout>
                </Rect>
                <Rect
                  width={22}
                  height={22}
                  radius={6}
                  fill={'rgba(255,255,255,0.06)'}
                  stroke={'rgba(255,255,255,0.08)'}
                  lineWidth={2}
                  x={-372}
                  y={52}
                  rotation={45}
                  opacity={() => this.aiBubble().opacity()}
                />
              </Layout>
            </Layout>

            <Layout ref={this.userRow} x={420} y={-10} opacity={0}>
              <Layout x={-40}>
                <Rect
                  ref={this.userBubble}
                  width={860}
                  height={190}
                  radius={30}
                  fill={Colors.orange}
                  stroke={'rgba(0,0,0,0.25)'}
                  lineWidth={2}
                  opacity={0}
                >
                  <Layout x={-380} y={0}>
                    <Txt
                      text={() => this.userText()}
                      fill={'rgba(0,0,0,0.86)'}
                      fontSize={42}
                      fontFamily={'Arial, sans-serif'}
                      fontWeight={700}
                      textAlign={'left'}
                      maxWidth={760}
                      textWrap
                    />
                  </Layout>
                </Rect>
                <Rect
                  width={22}
                  height={22}
                  radius={6}
                  fill={Colors.orange}
                  stroke={'rgba(0,0,0,0.25)'}
                  lineWidth={2}
                  x={442}
                  y={58}
                  rotation={45}
                  opacity={() => this.userBubble().opacity()}
                />
              </Layout>
              <Circle
                size={96}
                fill={Colors.yellow}
                stroke={'rgba(255,255,255,0.18)'}
                lineWidth={3}
                x={520}
              >
                <Txt
                  text="你"
                  fill={'rgba(0,0,0,0.85)'}
                  fontSize={46}
                  fontFamily={'Arial, sans-serif'}
                  fontWeight={900}
                />
              </Circle>
            </Layout>

            <Circle
              ref={this.sendSpark}
              size={20}
              fill={Colors.yellow}
              opacity={0}
              shadowColor={'rgba(0,0,0,0.5)'}
              shadowBlur={10}
            />

            <Rect
              ref={this.poemCard}
              x={-260}
              y={280}
              width={860}
              height={360}
              radius={34}
              fill={'rgba(255,255,255,0.04)'}
              stroke={'rgba(255,255,255,0.10)'}
              lineWidth={3}
              opacity={0}
              scale={0.98}
              shadowColor={'rgba(0,0,0,0.5)'}
              shadowBlur={18}
            >
              <Layout>
                <Txt
                  text="生成的古诗"
                  y={-125}
                  fill={Colors.yellow}
                  fontSize={34}
                  fontFamily={'Arial, sans-serif'}
                  fontWeight={800}
                />
                <Rect
                  y={-80}
                  width={720}
                  height={2}
                  radius={2}
                  fill={'rgba(255,255,255,0.12)'}
                />
                <Txt
                  text={() => this.poemText()}
                  y={55}
                  fill={'rgba(255,255,255,0.92)'}
                  fontSize={44}
                  fontFamily={'Arial, sans-serif'}
                  fontWeight={700}
                  textAlign={'center'}
                  maxWidth={760}
                  textWrap
                  lineHeight={62}
                />
              </Layout>
            </Rect>
          </Layout>
        </Rect>
      </Layout>,
    );
  }

  protected *on_play(): ThreadGenerator {
    const waitStep = (name: string, fallbackSeconds: number) =>
      any(waitUntil(name), waitFor(fallbackSeconds));

    const typeText = (
      setText: (value: string) => void,
      fullText: string,
      duration: number,
    ) =>
      tween(duration, value => {
        const count = Math.floor(value * fullText.length);
        setText(fullText.slice(0, count));
      });

    this.userText('');
    this.aiText('');
    this.thinkingText('···');
    this.poemText('');

    this.window().opacity(0);
    this.header().opacity(0);
    this.userRow().opacity(0);
    this.aiRow().opacity(0);
    this.userBubble().opacity(0);
    this.aiBubble().opacity(0);
    this.poemCard().opacity(0);
    this.sendSpark().opacity(0);

    yield* waitStep('chat_intro_start', 0.1);
    yield* all(
      this.window().opacity(1, 0.6, easeOutCubic),
      this.window().scale(1, 0.6, easeOutCubic),
      this.header().opacity(1, 0.5, easeOutCubic),
    );
    testPoint('chat-intro', {
      id: 'tp_chat_intro',
      check: '窗口应居中；标题栏可见；背景微暗；无元素越界或重叠',
    });
    yield* waitStep('chat_intro_end', 0.25);

    yield* waitStep('chat_user_typing_start', 0.2);
    this.userRow().opacity(1);
    this.userRow().x(520);
    this.userBubble().opacity(1);
    yield* all(
      this.userRow().x(420, 0.5, easeOutCubic),
      this.userBubble().scale(1, 0.5, easeOutCubic),
    );
    yield* typeText(this.userText, '你好，请生成一首古诗', 1.6);
    testPoint('chat-user-message', {
      id: 'tp_chat_user',
      check: '右侧用户气泡橙色；文本完整显示；右侧头像为“你”；气泡尾巴朝右',
    });
    yield* waitStep('chat_user_typing_end', 0.25);

    yield* waitStep('chat_user_send_start', 0.2);
    this.sendSpark().opacity(1);
    this.sendSpark().position([420 + 260, -10 + 40]);
    yield* all(
      this.sendSpark().position([-420 - 220, -180 + 50], 0.55, easeInOutCubic),
      this.sendSpark().size(34, 0.25, easeOutCubic).to(20, 0.3),
    );
    this.sendSpark().opacity(0);
    yield* waitStep('chat_user_send_end', 0.2);

    yield* waitStep('chat_ai_thinking_start', 0.2);
    this.aiRow().opacity(1);
    this.aiRow().x(-520);
    this.aiBubble().opacity(1);
    yield* all(
      this.aiRow().x(-420, 0.5, easeOutCubic),
      this.aiBubble().scale(1, 0.5, easeOutCubic),
    );
    for (let i = 0; i < 9; i++) {
      this.thinkingText(i % 3 === 0 ? '·' : i % 3 === 1 ? '··' : '···');
      yield* waitFor(0.14);
    }
    yield* waitStep('chat_ai_thinking_end', 0.15);

    yield* waitStep('chat_ai_reply_start', 0.2);
    this.thinkingText('');
    this.aiText('');
    yield* typeText(this.aiText, '好的', 0.45);
    testPoint('chat-ai-reply', {
      id: 'tp_chat_ai',
      check: '左侧AI气泡出现“好的”；左侧头像为“AI”；两侧对齐清晰',
    });
    yield* waitStep('chat_ai_reply_end', 0.25);

    yield* waitStep('chat_poem_generate_start', 0.2);
    this.poemCard().opacity(1);
    this.poemCard().y(320);
    yield* all(
      this.poemCard().y(280, 0.7, easeOutCubic),
      this.poemCard().scale(1, 0.7, easeOutCubic),
    );
    const poem = '山色入窗青，\n溪声到枕轻。\n一瓯新雨后，\n茶里见春明。';
    yield* typeText(this.poemText, poem, 2.4);
    testPoint('chat-poem-done', {
      id: 'tp_chat_poem',
      check: '下方诗卡片出现四行古诗；行距舒适；文本不溢出；整体布局稳定',
    });
    yield* waitStep('chat_poem_generate_end', 0.35);

    yield* waitStep('chat_hold_start', 0.2);
    yield* waitFor(1.2);
    yield* waitStep('chat_hold_end', 0.2);

    yield* this.root.opacity(0, 0.8, easeOutCubic);
  }
}

