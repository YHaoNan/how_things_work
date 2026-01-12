import { Layout, Rect, Txt, Circle, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, sequence, waitFor, waitUntil, createSignal, DEFAULT, any } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ChatLayer extends AnimLayer {
    private chatContainer = createRef<Layout>();
    private windowFrame = createRef<Rect>();
    
    // Header
    private headerModelName = createRef<Txt>();
    
    // User Elements
    private userBubbleContainer = createRef<Layout>();
    private userBubble = createRef<Rect>();
    private userText = createRef<Txt>();
    
    // AI Elements
    private aiBubbleContainer = createRef<Layout>();
    private aiNameLabel = createRef<Txt>();
    private aiBubble = createRef<Rect>();
    private aiText = createRef<Txt>();
    
    // Few-Shot placeholder (kept for timeline compatibility)
    private historyContainer = createRef<Layout>();

    private dataStreamPanel = createRef<Rect>();
    private dataStreamContent = createRef<Layout>();
    private dataStreamY = createSignal(0);

    // Summary
    private summaryContainer = createRef<Layout>();
    private summaryItems: Txt[] = [];

    protected on_build_ui(): void {
        const fontFamily = '"Microsoft YaHei", "SimHei", sans-serif';
        const glyphs = "01<>[]{}()=+-*/_~^$#@!?;:,.|\\";
        const lines = 38;
        const cols = 26;
        const matrixLines = Array.from({length: lines}).map(() => {
            let line = "";
            for (let i = 0; i < cols; i++) {
                line += glyphs[Math.floor(Math.random() * glyphs.length)];
            }
            return line;
        });
        const matrixText = matrixLines.join("\n");

        this.root.add(
            <Layout ref={this.chatContainer} y={0}>
                {/* Main Window Frame */}
                <Rect
                    ref={this.windowFrame}
                    width={1000}
                    height={800}
                    fill={'#1e1e1e'}
                    radius={20}
                    stroke={'#333'}
                    lineWidth={2}
                    clip={true}
                >
                    {/* Header Bar */}
                    <Rect
                        width={1000}
                        height={60}
                        fill={'#2d2d2d'}
                        y={-370} 
                    >
                        <Txt
                            ref={this.headerModelName}
                            text="DeepSeek Chat WebUI"
                            fill={'#fff'}
                            fontSize={24}
                            fontFamily={fontFamily}
                            fontWeight={700}
                        />
                    </Rect>

                    {/* Chat Content Area */}
                    <Layout
                        y={30} 
                        width={900}
                        direction={'column'}
                        gap={40}
                        layout 
                    >
                        {/* User Message Row */}
                        <Layout
                            ref={this.userBubbleContainer}
                            direction={'column'}
                            alignItems={'end'} 
                            opacity={0}
                            width={900} 
                        >
                            <Txt 
                                text="User" 
                                fill={'#fff'} 
                                fontSize={20} 
                                fontFamily={fontFamily} 
                                fontWeight={700} 
                                marginBottom={10}
                            />
                            <Rect
                                ref={this.userBubble}
                                fill={'#444'}
                                radius={16}
                                padding={20}
                                layout
                                direction={'column'}
                                gap={10}
                                width={null as any}
                                height={null as any}
                            >
                                <Txt
                                    ref={this.userText}
                                    text=""
                                    fill={'#fff'}
                                    fontSize={24}
                                    fontFamily={fontFamily}
                                    textWrap={'pre'}
                                    maxWidth={600}
                                />
                            </Rect>
                        </Layout>

                        {/* AI Message Row */}
                        <Layout
                            ref={this.aiBubbleContainer}
                            direction={'column'}
                            alignItems={'start'} 
                            opacity={0}
                            width={900}
                        >
                            <Txt 
                                text="Assistant" 
                                fill={Colors.green} 
                                fontSize={20} 
                                fontFamily={fontFamily} 
                                fontWeight={700} 
                                marginBottom={10}
                                ref={this.aiNameLabel}
                            />
                            <Rect
                                ref={this.aiBubble}
                                fill={'#2d2d2d'}
                                radius={16}
                                padding={20}
                                stroke={Colors.green}
                                lineWidth={2}
                                layout
                                direction={'column'}
                                gap={10}
                                width={null as any}
                                height={null as any}
                            >
                                <Txt
                                    ref={this.aiText}
                                    text=""
                                    fill={'#fff'}
                                    fontSize={24}
                                    fontFamily={fontFamily}
                                    textWrap={'pre'}
                                    maxWidth={600}
                                />
                            </Rect>
                        </Layout>
                    </Layout>
                </Rect>

                <Layout ref={this.historyContainer} x={0} y={-450} opacity={0} />
            </Layout>
        );

        this.root.add(
            <Rect
                ref={this.dataStreamPanel}
                x={-720}
                y={0}
                width={380}
                height={820}
                radius={20}
                fill={'rgba(0,0,0,0.75)'}
                stroke={'#1c1c1c'}
                lineWidth={2}
                opacity={0}
                clip
            >
                <Layout ref={this.dataStreamContent} y={() => this.dataStreamY()} layout direction={'column'} gap={14} x={-165}>
                    <Txt text={matrixText} fill={Colors.green} fontSize={18} fontFamily={'JetBrains Mono'} opacity={0.75} />
                    <Txt text={matrixText} fill={Colors.green} fontSize={18} fontFamily={'JetBrains Mono'} opacity={0.75} />
                </Layout>
                <Rect width={380} height={820} fill={'rgba(0,0,0,0.25)'} />
                <Rect width={380} height={46} fill={'rgba(0,0,0,0.55)'} y={-387} />
                <Txt text="大量对话数据…" fill={Colors.green} fontSize={18} fontFamily={'JetBrains Mono'} x={-120} y={-388} opacity={0.9} />
            </Rect>
        );

        // Summary Layer (Full Screen)
        this.root.add(
            <Rect 
                ref={this.summaryContainer} 
                opacity={0} 
                width={1920} 
                height={1080} 
                fill={'rgba(0,0,0,0.95)'}
            >
                <Txt text="构建Chat模型的挑战" y={-300} fill={Colors.orange} fontSize={64} fontFamily={fontFamily} />
                <Layout y={-20} x={-200} direction={'column'} gap={60} layout>
                     <Txt text="1. 记忆能力 (Context Management)" fill={'#fff'} fontSize={40} fontFamily={fontFamily} opacity={0} textAlign={'left'} width={1200} ref={makeRef(this.summaryItems, 0)} />
                     <Txt text="2. 训练数据获取 (Distillation/Self-Generation)" fill={'#fff'} fontSize={40} fontFamily={fontFamily} opacity={0} textAlign={'left'} width={1200} ref={makeRef(this.summaryItems, 1)} />
                     <Txt text="3. 行为限制与偏好 (Alignment/RLHF)" fill={'#fff'} fontSize={40} fontFamily={fontFamily} opacity={0} textAlign={'left'} width={1200} ref={makeRef(this.summaryItems, 2)} />
                     <Txt text="4. 能力平衡 (Mixture of Tasks)" fill={'#fff'} fontSize={40} fontFamily={fontFamily} opacity={0} textAlign={'left'} width={1200} ref={makeRef(this.summaryItems, 3)} />
                </Layout>
            </Rect>
        )
    }
    
    private summaryItems: Txt[] = [];

    protected *on_play(): ThreadGenerator {
        const streamHeight = 38 * 18 * 1.15 + 14 * 37;
        let streamRunning = true;
        const self = this;
        function* streamLoop(): ThreadGenerator {
            while (streamRunning) {
                const next = (self.dataStreamY() - 28) % -streamHeight;
                self.dataStreamY(next);
                yield* waitFor(0.033);
            }
        }

        // --- 1. Chat Capability (DeepSeek) ---
        yield* waitUntil('start_chat_deepseek');
        
        // User Message
        this.userText().text("迪迦奥特曼昨天在");
        this.userText().fill("#fff");
        yield* this.userBubbleContainer().opacity(1, 0.5);
        yield* waitFor(0.5);

        // AI Message
        yield* all(
            this.headerModelName().text("DeepSeek Chat WebUI", 0),
            this.aiNameLabel().fill(Colors.green, 0),
            this.aiBubble().stroke(Colors.green, 0),
            this.aiText().fill("#fff", 0),
        );

        const deepseekReply =
            "看起来你的句子还没写完呢 😄\n\n" +
            "• 迪迦奥特曼昨天在哪里出现了？\n" +
            "• 迪迦奥特曼的剧情里昨天发生了什么？\n" +
            "• 迪迦奥特曼相关的新闻或活动？";
        this.aiText().text("");
        yield* this.aiBubbleContainer().opacity(1, 0.5);
        yield* this.aiText().text(deepseekReply, 2.2);
        yield* waitFor(0.5);

        yield* waitUntil('explain_deepseek_done');

        // --- 2. Base Model Behavior ---
        yield* waitUntil('start_qwen_base');

        // Transition: Change Header and accent, keep reply text white
        yield* all(
            this.headerModelName().text("Qwen/Qwen3-8B-Base", 0.5),
            this.aiBubbleContainer().opacity(0, 0.5),
            // User input stays visible!
        );
        this.aiText().text("");
        
        // Show Base Model Output (same bubble style, yellow accent)
        yield* all(
            this.aiNameLabel().fill(Colors.yellow, 0.3),
            this.aiBubble().stroke(Colors.yellow, 0.3),
            this.aiText().fill("#fff", 0),
        );
        this.aiText().text("");
        yield* this.aiBubbleContainer().opacity(1, 0.5);
        yield* this.aiText().text("迪迦奥特曼昨天在哪个频道播出？", 2); 

        yield* waitUntil('explain_base_done');

        // --- 3. Few-Shot Learning ---
        yield* waitUntil('start_few_shot');

        yield* all(
            this.userBubbleContainer().opacity(0, 0.35),
            this.aiBubbleContainer().opacity(0, 0.35),
        );
        this.userText().text("");
        this.aiText().text("");
        yield* waitFor(0.1);
        yield* this.userBubbleContainer().opacity(1, 0.35);

        // Few-shot prompt lives inside the user bubble, unified typewriter
        this.userText().text("");
        yield* this.userText().text(
            "用户：java是什么？ 助手：一门跨平台的编程语言\n" +
            "用户：昨天 助手：你好像输入了一段不完整的话\n" +
            "用户：迪迦奥特曼昨天在",
            1.6,
        );
        
        // Clear previous output
        this.aiText().text("");
        yield* waitFor(0.5);
        yield* this.aiBubbleContainer().opacity(1, 0.35);
        yield* this.aiText().text("你好像输入了一段不完整的话", 2);

        yield* waitUntil('explain_few_shot_done');

        yield* waitUntil('show_chat_data_stream');
        this.dataStreamY(0);
        streamRunning = true;
        yield* this.dataStreamPanel().opacity(1, 0.4);
        yield* any(
            streamLoop(),
            (function* () {
                yield* waitUntil('hide_chat_data_stream');
                streamRunning = false;
            })()
        );
        yield* this.dataStreamPanel().opacity(0, 0.3);

        // --- 4. Summary ---
        yield* waitUntil('start_summary');
        
        // Hide everything
        yield* this.chatContainer().opacity(0, 0.5);
        yield* this.summaryContainer().opacity(1, 0.5);
        
        for (let i = 0; i < this.summaryItems.length; i++) {
            yield* waitUntil(`chat_summary_item_${i + 1}`);
            const item = this.summaryItems[i];
            yield* item.opacity(1, 0.5);
            yield* waitFor(0.2);
        }
        
        yield* waitFor(1);
        yield* waitUntil('chat_summary_last_before_disappear');
        yield* this.summaryContainer().opacity(0, 0.5);
    }
}

function makeRef<T>(arr: T[], index: number) {
    return (el: T) => { arr[index] = el; }
}
