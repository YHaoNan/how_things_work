import { Layout, Rect, Txt, Line, Img } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, waitUntil } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import coverImg from "./assets/推荐视频封面.jpg";

export class ThinkingLayer extends AnimLayer {
    private chatContainer = createRef<Layout>();
    private userBubbleContainer = createRef<Layout>();
    private aiBubbleContainer = createRef<Layout>();
    private aiNameLabel = createRef<Txt>();
    private userBubble = createRef<Rect>();
    private userText = createRef<Txt>();
    private aiBubble = createRef<Rect>();
    private aiText = createRef<Txt>();
    private headerModelName = createRef<Txt>();

    private lineageContainer = createRef<Layout>();
    private centerNode = createRef<Rect>();
    private nodeSC = createRef<Rect>();
    private nodeToT = createRef<Rect>();
    private nodeGoT = createRef<Rect>();
    private nodeFewShot = createRef<Rect>();
    private lineTop = createRef<Line>();
    private lineBottom = createRef<Line>();
    private lineLeft = createRef<Line>();
    private lineRight = createRef<Line>();

    private overlayBackdrop = createRef<Rect>();

    private summaryContainer = createRef<Rect>();
    private summaryItems: Txt[] = [];

    private recommendContainer = createRef<Layout>();
    private recommendImg = createRef<Img>();
    private recommendTitle = createRef<Txt>();

    protected on_build_ui(): void {
        const font = '"Microsoft YaHei", "SimHei", sans-serif';

        this.root.add(
            <Layout>
                <Rect width={1000} height={800} fill={"#1e1e1e"} radius={20} stroke={"#333"} lineWidth={2} clip y={0} x={0}>
                    <Rect width={1000} height={60} fill={"#2d2d2d"} y={-370}>
                        <Txt ref={this.headerModelName} text={"Qwen/Qwen3-8B-Base"} fill={"#fff"} fontSize={24} fontFamily={font} fontWeight={700} />
                    </Rect>
                    <Layout ref={this.chatContainer} y={30} width={900} direction={"column"} gap={40} layout>
                        <Layout ref={this.userBubbleContainer} direction={"column"} alignItems={"end"} opacity={0} width={900}>
                            <Txt text={"You"} fill={"#fff"} fontSize={20} fontFamily={font} fontWeight={700} marginBottom={10} />
                            <Rect ref={this.userBubble} fill={"#444"} radius={16} padding={20} layout direction={"column"} gap={10} width={null as any} height={null as any}>
                                <Txt ref={this.userText} text={""} fill={"#fff"} fontSize={24} fontFamily={font} textWrap={true} maxWidth={520} />
                            </Rect>
                        </Layout>

                        <Layout ref={this.aiBubbleContainer} direction={"column"} alignItems={"start"} opacity={0} width={900}>
                            <Txt text={"Model"} fill={Colors.yellow} fontSize={20} fontFamily={font} fontWeight={700} marginBottom={10} ref={this.aiNameLabel} />
                            <Rect ref={this.aiBubble} fill={"#2d2d2d"} radius={16} padding={20} stroke={Colors.yellow} lineWidth={2} layout direction={"column"} gap={10} width={null as any} height={null as any}>
                                <Txt ref={this.aiText} text={""} fill={"#fff"} fontSize={24} fontFamily={font} textWrap={true} maxWidth={520} />
                            </Rect>
                        </Layout>
                    </Layout>
                </Rect>

                <Rect ref={this.overlayBackdrop} width={1920} height={1080} fill={"rgba(0,0,0,1)"} opacity={0} />

                <Layout ref={this.lineageContainer} opacity={0} y={60}>
                    <Line ref={this.lineTop} points={[[0, -55], [0, -240]]} stroke={Colors.yellow} lineWidth={6} opacity={0} />
                    <Line ref={this.lineBottom} points={[[0, 55], [0, 240]]} stroke={Colors.green} lineWidth={6} opacity={0} />
                    <Line ref={this.lineLeft} points={[[-150, 0], [-420, 0]]} stroke={Colors.brown} lineWidth={6} opacity={0} />
                    <Line ref={this.lineRight} points={[[150, 0], [420, 0]]} stroke={Colors.red} lineWidth={6} opacity={0} />
                    <Rect ref={this.centerNode} width={300} height={110} radius={24} fill={Colors.orange} shadowBlur={20} shadowColor={"rgba(255,165,0,0.6)"} x={0} y={0} opacity={0} layout alignItems={"center"} justifyContent={"center"}>
                        <Txt text={"CoT (思维链)"} fill={"#fff"} fontSize={36} fontFamily={font} textAlign={"center"} width={260} />
                    </Rect>
                    <Rect ref={this.nodeSC} width={320} height={100} radius={20} fill={Colors.yellow} shadowBlur={18} shadowColor={"rgba(255,255,0,0.5)"} x={0} y={-280} opacity={0} layout alignItems={"center"} justifyContent={"center"}>
                        <Txt text={"CoT-SC (自洽)"} fill={"#fff"} fontSize={30} fontFamily={font} textAlign={"center"} width={280} />
                    </Rect>
                    <Rect ref={this.nodeToT} width={320} height={100} radius={20} fill={Colors.green} shadowBlur={18} shadowColor={"rgba(97,194,140,0.5)"} x={0} y={280} opacity={0} layout alignItems={"center"} justifyContent={"center"}>
                        <Txt text={"ToT (思维树)"} fill={"#fff"} fontSize={30} fontFamily={font} textAlign={"center"} width={280} />
                    </Rect>
                    <Rect ref={this.nodeGoT} width={320} height={100} radius={20} fill={Colors.brown} shadowBlur={18} shadowColor={"rgba(141,103,38,0.5)"} x={-440} y={0} opacity={0} layout alignItems={"center"} justifyContent={"center"}>
                        <Txt text={"GoT (思维图)"} fill={"#fff"} fontSize={30} fontFamily={font} textAlign={"center"} width={280} />
                    </Rect>
                    <Rect ref={this.nodeFewShot} width={320} height={100} radius={20} fill={Colors.red} shadowBlur={18} shadowColor={"rgba(113,80,91,0.6)"} x={440} y={0} opacity={0} layout alignItems={"center"} justifyContent={"center"}>
                        <Txt text={"Few-Shot CoT"} fill={"#fff"} fontSize={30} fontFamily={font} textAlign={"center"} width={280} />
                    </Rect>
                </Layout>

                <Rect ref={this.summaryContainer} opacity={0} width={1920} height={1080} fill={"rgba(0,0,0,0.95)"} x={0} y={0}>
                    <Txt text={"构建思考模型的挑战"} y={-300} fill={Colors.orange} fontSize={64} fontFamily={font} />
                    <Layout y={-20} x={-200} direction={"column"} gap={60} layout>
                        <Txt text={"1. 更长的训练数据更有效"} fill={"#fff"} fontSize={40} fontFamily={font} opacity={0} textAlign={"left"} width={1200} ref={makeRef(this.summaryItems, 0)} />
                        <Txt text={"2. 如何生成思考轨迹（如Orca、自动化生成/验证）"} fill={"#fff"} fontSize={40} fontFamily={font} opacity={0} textAlign={"left"} width={1200} ref={makeRef(this.summaryItems, 1)} />
                    </Layout>
                </Rect>

                <Layout ref={this.recommendContainer} opacity={0} y={0}>
                    <Img ref={this.recommendImg} src={coverImg} width={720} height={405} radius={20} />
                    <Txt ref={this.recommendTitle} text={"为什么大模型会【涌现】智能"} y={260} fill={Colors.orange} fontSize={48} fontFamily={font} />
                </Layout>
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        yield* waitUntil("start_thinking_chat");
        this.userText().text("");
        this.aiText().text("");
        yield* this.userBubbleContainer().opacity(1, 0.4);
        yield* this.aiBubbleContainer().opacity(1, 0.4);

        yield* waitUntil("thinking_rabbit_wrong_question");
        yield* this.userText().text("如果兔子跑步速度为10km/h，乌龟比它慢10倍，乌龟跑步速度是多快？", 1.4);

        yield* waitUntil("thinking_rabbit_wrong_answer");
        this.aiText().text("");
        yield* this.aiText().text("21(❌)", 0.6);
        yield* waitFor(0.4);

        yield* waitUntil("thinking_expand_avatars");

        yield* waitUntil("thinking_clear_chat");
        yield* all(
            this.userText().opacity(0, 0.25),
            this.aiText().opacity(0, 0.25)
        );
        this.userText().text("");
        this.aiText().text("");
        this.userText().opacity(1);
        this.aiText().opacity(1);

        yield* waitUntil("thinking_chain_example");
        yield* this.userText().text(
            "如果小明比小红大2岁，小红今年8岁，5年后小明多大？\n\n思考：\n小明比小红大2岁，小红今年8岁，那么小明今年就是8+2=10岁，5年后，小明的年龄为10+5=15岁。\n\n如果兔子跑步速度为10km/h，乌龟比它慢10倍，乌龟跑步速度是多快？",
            2.6
        );

        yield* waitUntil("thinking_rabbit_correct_answer");
        this.aiText().text("");
        yield* this.aiText().text("兔子跑步速度为10km/h，乌龟比他慢10倍，则为10/10=1，所以乌龟跑步的速度是1km/h(✅)", 1.8);
        yield* waitFor(0.6);

        yield* waitUntil("show_lineage");
        yield* this.overlayBackdrop().opacity(0.9, 0.3);
        yield* this.lineageContainer().opacity(1, 0.3);
        yield* this.centerNode().opacity(1, 0.3);
        yield* this.lineTop().opacity(1, 0.25);
        yield* this.nodeSC().opacity(1, 0.25);
        yield* this.lineBottom().opacity(1, 0.25);
        yield* this.nodeToT().opacity(1, 0.25);
        yield* this.lineLeft().opacity(1, 0.25);
        yield* this.nodeGoT().opacity(1, 0.25);
        yield* this.lineRight().opacity(1, 0.25);
        yield* this.nodeFewShot().opacity(1, 0.25);
        yield* this.centerNode().scale(1.06, 0.4).to(1, 0.4);
        yield* waitFor(1);

        yield* waitUntil("start_thinking_summary");
        yield* all(
            this.overlayBackdrop().opacity(0, 0.2),
            this.summaryContainer().opacity(1, 0.4)
        );
        for (let i = 0; i < this.summaryItems.length; i++) {
            yield* waitUntil(`thinking_summary_item_${i + 1}`);
            const item = this.summaryItems[i];
            yield* item.opacity(1, 0.4);
            yield* waitFor(0.2);
        }
        yield* waitFor(1.2);

        yield* waitUntil("thinking_summary_last_before_disappear");
        yield* all(
            this.summaryContainer().opacity(0, 0.3),
            this.chatContainer().opacity(0, 0.3),
            this.lineageContainer().opacity(0, 0.3),
            this.overlayBackdrop().opacity(0, 0.3)
        );
        yield* this.recommendContainer().opacity(1, 0.3);
        yield* waitFor(1.2);

        yield* waitUntil("end_thinking");
    }
}

function makeRef<T>(arr: T[], index: number) {
    return (el: T) => { arr[index] = el; };
}
