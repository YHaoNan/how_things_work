import { Layout, Rect, Txt, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil, easeInOutCubic, easeOutCubic } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class AgentLayer extends AnimLayer {
    private leftChat = createRef<Layout>();
    private userBubbleContainer = createRef<Layout>();
    private userBubble = createRef<Rect>();
    private userText = createRef<Txt>();

    private aiSection = createRef<Layout>();
    private aiTitle = createRef<Txt>();
    private stageBar = createRef<Layout>();
    private stageThought = createRef<Rect>();
    private stageAction = createRef<Rect>();
    private stageObserve = createRef<Rect>();
    private thoughtBubble = createRef<Rect>();
    private thoughtText = createRef<Txt>();
    private actionBubble = createRef<Rect>();
    private actionText = createRef<Txt>();
    private observeBubble = createRef<Rect>();
    private observeText = createRef<Txt>();

    private frameworkBar = createRef<Rect>();
    private frameworkTitle = createRef<Txt>();
    private frameworkStatus = createRef<Txt>();
    private frameworkTool = createRef<Txt>();
    private frameworkFilePath = createRef<Txt>();
    private progressBg = createRef<Rect>();
    private progressFill = createRef<Rect>();
    private logLine1 = createRef<Txt>();
    private logLine2 = createRef<Txt>();

    private toFrameworkLine = createRef<Line>();
    private toModelLine = createRef<Line>();

    private absorbContainer = createRef<Layout>();
    private tagThought = createRef<Rect>();
    private tagAction = createRef<Rect>();
    private tagObserve = createRef<Rect>();

    private summaryContainer = createRef<Rect>();
    private summaryItems: Txt[] = [];

    protected on_build_ui(): void {
        const font = '"Microsoft YaHei", "SimHei", sans-serif';

        this.root.add(
            <Layout>
                <Layout ref={this.leftChat} x={-520} y={0} direction={"column"} gap={20} layout opacity={1}>
                    <Layout ref={this.userBubbleContainer} direction={"column"} alignItems={"start"} opacity={0} width={520}>
                        <Txt text="User" fill={"#fff"} fontSize={20} fontFamily={font} fontWeight={700} marginBottom={10} />
                        <Rect ref={this.userBubble} fill={"#444"} radius={16} padding={20} layout direction={"column"} gap={10} width={null as any} height={null as any}>
                            <Txt ref={this.userText} text={""} fill={"#fff"} fontSize={24} fontFamily={font} textWrap={true} maxWidth={420} />
                        </Rect>
                    </Layout>
                </Layout>

                <Layout ref={this.aiSection} topLeft={[120, -200]} width={840} layout direction={"column"} gap={18} alignItems={"start"} opacity={0}>
                    <Txt ref={this.aiTitle} text={"AI 模型"} fill={Colors.green} fontSize={36} fontFamily={font} fontWeight={800} />
                    <Layout ref={this.stageBar} width={840} layout direction={"row"} gap={14} alignItems={"center"}>
                        <Rect ref={this.stageThought} radius={999} padding={[8, 14]} fill={"#2a2a2a"} layout>
                            <Txt text={"思考"} fill={"#fff"} fontSize={20} fontFamily={font} fontWeight={700} />
                        </Rect>
                        <Rect ref={this.stageAction} radius={999} padding={[8, 14]} fill={"#2a2a2a"} layout>
                            <Txt text={"行动"} fill={"#fff"} fontSize={20} fontFamily={font} fontWeight={700} />
                        </Rect>
                        <Rect ref={this.stageObserve} radius={999} padding={[8, 14]} fill={"#2a2a2a"} layout>
                            <Txt text={"观察"} fill={"#fff"} fontSize={20} fontFamily={font} fontWeight={700} />
                        </Rect>
                    </Layout>
                    <Layout width={840} layout direction={"column"} gap={14} alignItems={"start"} marginTop={8}>
                        <Rect ref={this.thoughtBubble} radius={16} fill={"#1f1f1f"} stroke={Colors.yellow} lineWidth={2} opacity={0} padding={16} layout direction={"column"} gap={8} width={null as any} height={null as any}>
                            <Txt ref={this.thoughtText} text={""} fill={"#fff"} fontSize={24} fontFamily={font} textWrap={true} maxWidth={760} />
                        </Rect>
                        <Rect ref={this.actionBubble} radius={16} fill={"#1f1f1f"} stroke={Colors.orange} lineWidth={2} opacity={0} padding={16} layout direction={"column"} gap={8} width={null as any} height={null as any}>
                            <Txt ref={this.actionText} text={""} fill={"#fff"} fontSize={24} fontFamily={font} textWrap={true} maxWidth={760} />
                        </Rect>
                        <Rect ref={this.observeBubble} radius={16} fill={"#1f1f1f"} stroke={Colors.green} lineWidth={2} opacity={0} padding={16} layout direction={"column"} gap={8} width={null as any} height={null as any}>
                            <Txt ref={this.observeText} text={""} fill={"#fff"} fontSize={24} fontFamily={font} textWrap={true} maxWidth={760} />
                        </Rect>
                    </Layout>
                </Layout>

                <Rect ref={this.frameworkBar} x={0} y={330} width={1320} height={200} radius={24} fill={"#151515"} stroke={"#2a2a2a"} lineWidth={2} opacity={0} padding={24} layout direction={"column"} gap={16}>
                    <Layout layout direction={"row"} alignItems={"center"} justifyContent={"space-between"} width={1272}>
                        <Txt ref={this.frameworkTitle} text={"框架 / Tool Runner"} fill={"#fff"} fontSize={28} fontFamily={font} fontWeight={700} />
                        <Txt ref={this.frameworkStatus} text={""} fill={Colors.yellow} fontSize={24} fontFamily={font} fontWeight={700} />
                    </Layout>
                    <Layout layout direction={"row"} gap={18} width={1272} alignItems={"center"}>
                        <Rect width={76} height={76} radius={18} fill={"#232323"} layout>
                            <Txt text={"⚙"} fill={Colors.yellow} fontSize={42} fontFamily={font} y={2} />
                        </Rect>
                        <Layout layout direction={"column"} gap={8} width={1120}>
                            <Layout layout direction={"row"} gap={16} alignItems={"center"} width={1120}>
                                <Txt ref={this.frameworkTool} text={""} fill={Colors.yellow} fontSize={24} fontFamily={font} fontWeight={700} />
                                <Txt ref={this.frameworkFilePath} text={""} fill={"#bdbdbd"} fontSize={22} fontFamily={font} />
                            </Layout>
                            <Rect ref={this.progressBg} width={1120} height={14} radius={999} fill={"#2a2a2a"} clip>
                                <Rect ref={this.progressFill} width={0} height={14} radius={999} fill={Colors.green} />
                            </Rect>
                            <Layout layout direction={"column"} gap={4} opacity={1}>
                                <Txt ref={this.logLine1} text={""} fill={"#9a9a9a"} fontSize={20} fontFamily={font} />
                                <Txt ref={this.logLine2} text={""} fill={"#9a9a9a"} fontSize={20} fontFamily={font} />
                            </Layout>
                        </Layout>
                    </Layout>
                </Rect>

                <Line ref={this.toFrameworkLine} points={[[220, -30], [0, 250]]} stroke={Colors.orange} lineWidth={4} end={0} opacity={0} shadowBlur={14} shadowColor={"rgba(237,150,79,0.9)"} />
                <Line ref={this.toModelLine} points={[[0, 250], [260, -10]]} stroke={Colors.green} lineWidth={4} end={0} opacity={0} shadowBlur={14} shadowColor={"rgba(97,194,140,0.9)"} />

                <Layout ref={this.absorbContainer} x={450} y={0} opacity={0}>
                    <Rect ref={this.tagThought} x={-300} y={-200} width={180} height={60} radius={12} fill={Colors.yellow} opacity={0} layout>
                        <Txt text={"思考"} fill={"#000"} fontSize={24} fontFamily={font} />
                    </Rect>
                    <Rect ref={this.tagAction} x={-300} y={-120} width={180} height={60} radius={12} fill={Colors.orange} opacity={0} layout>
                        <Txt text={"行动"} fill={"#000"} fontSize={24} fontFamily={font} />
                    </Rect>
                    <Rect ref={this.tagObserve} x={-300} y={-40} width={180} height={60} radius={12} fill={Colors.green} opacity={0} layout>
                        <Txt text={"观察"} fill={"#000"} fontSize={24} fontFamily={font} />
                    </Rect>
                </Layout>

                <Rect ref={this.summaryContainer} opacity={0} width={1920} height={1080} fill={"rgba(0,0,0,0.95)"} x={0} y={0}>
                    <Txt text={"构建Agent能力的挑战"} y={-300} fill={Colors.orange} fontSize={64} fontFamily={font} />
                    <Layout y={-20} x={-200} direction={"column"} gap={60} layout>
                        <Txt text={"1. 与模型交互策略：ReAct、Focused ReAct、框架Agent实现"} fill={"#fff"} fontSize={40} fontFamily={font} opacity={0} textAlign={"left"} width={1400} ref={makeRef(this.summaryItems, 0)} />
                        <Txt text={"2. 复杂任务轨迹的描述与通用格式：AgentTuning、ADP"} fill={"#fff"} fontSize={40} fontFamily={font} opacity={0} textAlign={"left"} width={1400} ref={makeRef(this.summaryItems, 1)} />
                        <Txt text={"3. 高质量轨迹的自动化生成与校验：Nex-N1工作流"} fill={"#fff"} fontSize={40} fontFamily={font} opacity={0} textAlign={"left"} width={1400} ref={makeRef(this.summaryItems, 2)} />
                    </Layout>
                </Rect>
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        yield* waitUntil("start_react_flow");
        yield* all(
            this.userBubbleContainer().opacity(1, 0.5),
            this.aiSection().opacity(1, 0.4),
            this.frameworkBar().opacity(1, 0.4)
        );

        this.stageThought().fill("#2a2a2a");
        this.stageAction().fill("#2a2a2a");
        this.stageObserve().fill("#2a2a2a");

        this.frameworkTitle().text("框架 / Tool Runner");
        this.frameworkStatus().text("");
        this.frameworkTool().text("");
        this.frameworkFilePath().text("");
        this.logLine1().text("");
        this.logLine2().text("");
        this.progressFill().width(0);

        yield* waitUntil("agent_step_user");
        this.userText().text("");
        yield* this.userText().text("请帮我编写一个小程序输出爱心…\n\n可用工具：write_file(path, content)", 2.0);

        yield* waitUntil("agent_step_think");
        this.thoughtText().text("");
        yield* this.thoughtBubble().opacity(1, 0.25);
        yield* this.stageThought().fill(Colors.yellow, 0.25);
        yield* this.thoughtText().text("思考：要完成任务，我需要把程序写入 heart.py", 1.1);
        yield* waitFor(0.2);

        yield* waitUntil("agent_step_action");
        this.actionText().text("");
        yield* this.actionBubble().opacity(1, 0.25);
        yield* this.stageAction().fill(Colors.orange, 0.25);
        yield* this.actionText().text("行动：调用 write_file('./heart.py', '...')", 0.9);
        yield* waitFor(0.15);

        yield* waitUntil("agent_step_call_tool");
        this.toFrameworkLine().end(0);
        this.toFrameworkLine().opacity(1);
        yield* this.toFrameworkLine().end(1, 0.35, easeOutCubic);
        yield* this.toFrameworkLine().opacity(0, 0.15);

        this.frameworkStatus().text("执行中…");
        this.frameworkTool().text("write_file");
        this.frameworkFilePath().text("./heart.py");
        this.logLine1().text("准备写入文件…");
        this.logLine2().text("写入中：heart.py");
        yield* this.progressFill().width(1120, 0.9, easeInOutCubic);
        this.frameworkStatus().text("完成 ✓");
        this.logLine1().text("write_file 返回：OK");
        this.logLine2().text("文件已生成：heart.py");

        yield* waitUntil("agent_step_tool_done");
        this.toModelLine().end(0);
        this.toModelLine().opacity(1);
        yield* this.toModelLine().end(1, 0.35, easeOutCubic);
        yield* this.toModelLine().opacity(0, 0.15);

        yield* waitUntil("agent_step_observe");
        this.observeText().text("");
        yield* this.observeBubble().opacity(1, 0.25);
        yield* this.stageObserve().fill(Colors.green, 0.25);
        yield* this.observeText().text("观察：write_file 返回 OK，任务完成", 0.9);
        yield* waitFor(0.5);

        yield* waitUntil("start_agent_summary");
        yield* all(
            this.leftChat().opacity(0, 0.4),
            this.aiSection().opacity(0, 0.4),
            this.frameworkBar().opacity(0, 0.4)
        );
        yield* this.summaryContainer().opacity(1, 0.5);
        for (let i = 0; i < this.summaryItems.length; i++) {
            yield* waitUntil(`agent_summary_item_${i + 1}`);
            const item = this.summaryItems[i];
            yield* item.opacity(1, 0.4);
            yield* waitFor(0.2);
        }
        yield* waitUntil("agent_summary_last_before_disappear");
        yield* this.summaryContainer().opacity(0, 0.5);

        yield* waitUntil("end_agent");
    }
}

function makeRef<T>(arr: T[], index: number) {
    return (el: T) => { arr[index] = el; };
}
