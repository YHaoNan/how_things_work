import { Layout, Rect, Txt, Circle, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, sequence, waitFor, waitUntil, easeInOutCubic, Vector2 } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ThinkingLayer extends AnimLayer {
    // Scene 1: Reasoning Demo
    private chatContainer = createRef<Layout>();
    private userBubble = createRef<Rect>();
    private aiBubble = createRef<Rect>();
    private thinkingBox = createRef<Rect>();
    private thinkingText = createRef<Txt>();
    private answerText = createRef<Txt>();

    // Scene 2: CoT Family Tree
    private treeContainer = createRef<Layout>();
    private cotNode = createRef<Circle>();
    private cotLabel = createRef<Txt>();
    private branches: Line[] = [];
    private branchWrappers: Layout[] = [];
    
    // Scene 3: Summary
    private summaryContainer = createRef<Layout>();
    private summaryItems: Txt[] = [];

    protected on_build_ui(): void {
        const fontFamily = '"Microsoft YaHei", "SimHei", sans-serif';

        // --- Scene 1: Chat/Reasoning UI ---
        this.root.add(
            <Layout ref={this.chatContainer} y={-50}>
                {/* User Question */}
                <Rect
                    ref={this.userBubble}
                    x={200}
                    y={-300}
                    fill={'#444'}
                    radius={16}
                    padding={20}
                    opacity={0}
                >
                    <Txt
                        text="如果兔子跑步速度为10km/h，乌龟比它慢10倍，乌龟跑步速度是多快？"
                        fill={'#fff'}
                        fontSize={24}
                        fontFamily={fontFamily}
                        maxWidth={600}
                        textWrap={true}
                    />
                </Rect>

                {/* AI Answer Container */}
                <Layout x={-200} y={-100}>
                    {/* Thinking Process (Hidden initially) */}
                    <Rect
                        ref={this.thinkingBox}
                        y={0}
                        width={500}
                        height={0} // Expands later
                        fill={'#222'}
                        stroke={'#555'}
                        lineWidth={1}
                        radius={8}
                        opacity={0}
                        clip={true}
                    >
                         <Txt
                            text="思考过程："
                            x={-220}
                            y={-60} // Adjusted relative to content
                            fill={'#888'}
                            fontSize={18}
                            fontFamily={fontFamily}
                        />
                        <Txt
                            ref={this.thinkingText}
                            text=""
                            x={0}
                            y={0}
                            fill={'#aaa'}
                            fontSize={18}
                            fontFamily={fontFamily}
                            width={460}
                            textWrap={true}
                        />
                    </Rect>

                    {/* Final Answer */}
                    <Rect
                        ref={this.aiBubble}
                        y={150} // Below thinking box
                        opacity={0}
                        fill={'#2d2d2d'}
                        radius={16}
                        padding={20}
                        stroke={Colors.green}
                        lineWidth={2}
                    >
                        <Txt
                            ref={this.answerText}
                            text=""
                            fill={'#fff'}
                            fontSize={24}
                            fontFamily={fontFamily}
                            maxWidth={460}
                            textWrap={true}
                        />
                    </Rect>
                </Layout>
            </Layout>
        );

        // --- Scene 2: CoT Family Tree ---
        this.root.add(
            <Layout ref={this.treeContainer} opacity={0}>
                {/* Center Node */}
                <Circle
                    ref={this.cotNode}
                    size={120}
                    fill={Colors.red}
                    stroke={'#fff'}
                    lineWidth={4}
                >
                     <Txt ref={this.cotLabel} text="CoT\n(思维链)" fill={'#fff'} fontSize={28} fontFamily={fontFamily} textAlign={'center'} />
                </Circle>
                
                {this.buildBranches(fontFamily)}
            </Layout>
        );

        // --- Scene 3: Summary ---
        this.root.add(
            <Layout ref={this.summaryContainer} opacity={0}>
                <Rect width={900} height={500} fill={'rgba(0,0,0,0.9)'} radius={20} stroke={Colors.yellow} lineWidth={2} />
                <Txt text="构建思考模型(Reasoning)的挑战" y={-200} fill={Colors.yellow} fontSize={48} fontFamily={fontFamily} />
                <Layout y={-100} x={-400}>
                     <Txt text="1. 训练数据构造 (Quality & Length)" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={0} opacity={0} ref={makeRef(this.summaryItems, 0)} />
                     <Txt text="2. 思考轨迹生成 (Process Supervision)" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={60} opacity={0} ref={makeRef(this.summaryItems, 1)} />
                     <Txt text="3. 自动化验证 (Outcome/Process Reward Models)" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={120} opacity={0} ref={makeRef(this.summaryItems, 2)} />
                </Layout>
                 {/* Video Recommendation */}
                <Layout y={150} opacity={0} ref={makeRef(this.summaryItems, 3)}>
                    <Txt text="推荐观看：为什么大模型会【涌现】智能" fill={Colors.orange} fontSize={36} fontFamily={fontFamily} />
                </Layout>
            </Layout>
        );
    }

    private buildBranches(fontFamily: string) {
        const branchData = [
            { name: "CoT-SC\n(自洽)", pos: new Vector2(0, -250), color: Colors.orange },
            { name: "ToT\n(思维树)", pos: new Vector2(-300, 0), color: Colors.green },
            { name: "GoT\n(思维图)", pos: new Vector2(300, 0), color: Colors.brown },
            { name: "Few-Shot\nCoT", pos: new Vector2(0, 250), color: Colors.yellow },
        ];

        const els: any[] = [];
        branchData.forEach((data, i) => {
             // Line
             const line = createRef<Line>();
             els.push(
                 <Line
                    ref={line}
                    points={[Vector2.zero, Vector2.zero]} 
                    endArrow={true}
                    stroke={'#fff'}
                    lineWidth={4}
                    opacity={0}
                 />
             );
             
             // Wrapper
             const wrapper = createRef<Layout>();
             els.push(
                 <Layout ref={wrapper} x={data.pos.x} y={data.pos.y} opacity={0} scale={0}>
                    <Circle
                        size={100}
                        fill={data.color}
                        stroke={'#fff'}
                        lineWidth={2}
                    >
                         <Txt text={data.name} fill={'#fff'} fontSize={24} fontFamily={fontFamily} textAlign={'center'} />
                    </Circle>
                 </Layout>
             );
             
             // IMPORTANT: We must store the REF itself, which is a function.
             // But in the loop below we need to CALL it.
             // However, `this.branches` is typed as `Line[]`. 
             // If we push the `line` ref (which is `Reference<Line>`), we can't treat it as `Line` directly in the loop without calling it.
             // BUT, `createRef` returns a function. 
             // Let's store the Reference, and change the loop to call it.
             // OR, just for simplicity in this specific file structure, I will fix the loop usage.
             // Here I am pushing `line as any` to `this.branches`.
             // `this.branches` is defined as `Line[]`. This is a type lie if I push `Reference<Line>`.
             // I should update the type definition of `branches` to `Reference<Line>[]` or just `any[]` to be safe, 
             // OR fix the loop to expect a Reference.
             
             this.branches.push(line as any); 
             this.branchWrappers.push(wrapper as any);
        });
        return els;
    }

    protected *on_play(): ThreadGenerator {
        // --- 1. Reasoning Demo ---
        yield* waitUntil('start_reasoning_demo');
        
        // Show User Question
        yield* this.userBubble().opacity(1, 0.5);
        yield* waitFor(1);

        // Show Thinking Process
        yield* waitUntil('show_thinking_process');
        this.thinkingBox().opacity(1);
        
        // Expand Thinking Box and Type text
        const thinkingContent = "兔子跑步速度为10km/h，乌龟比他慢10倍，则为10/10=1，所以乌龟跑步的速度是1km/h";
        
        // Animate expansion
        yield* this.thinkingBox().height(150, 0.5, easeInOutCubic);
        yield* this.thinkingBox().y(-50, 0.5, easeInOutCubic); // Move up slightly
        
        yield* this.thinkingText().text(thinkingContent, 2); // Typewriter
        
        yield* waitFor(0.5);

        // Show Answer
        this.answerText().text("乌龟跑步的速度是1km/h");
        yield* this.aiBubble().opacity(1, 0.5);

        yield* waitUntil('reasoning_demo_done');

        // --- 2. CoT Family Tree ---
        yield* waitUntil('start_cot_tree');

        // Fade out chat
        yield* this.chatContainer().opacity(0, 0.5);
        
        // Fade in Center Node
        yield* this.treeContainer().opacity(1, 0.5);
        yield* this.cotNode().scale(0, 0).to(1, 0.5, easeInOutCubic);

        yield* waitFor(0.5);

        // Animate Branches
        const branchData = [
            { pos: new Vector2(0, -250) },
            { pos: new Vector2(-300, 0) },
            { pos: new Vector2(300, 0) },
            { pos: new Vector2(0, 250) },
        ];

        // Animate lines extending and nodes appearing
        yield* sequence(0.2, ...this.branches.map((lineRef, i) => {
            // lineRef is a Reference<Line>
            const line = (lineRef as unknown as () => Line)();
            const wrapper = (this.branchWrappers[i] as unknown as () => Layout)();
            
            return all(
                line.opacity(1, 0.1),
                line.points([Vector2.zero, branchData[i].pos], 0.5, easeInOutCubic),
                // Animate corresponding node wrapper
                wrapper.opacity(1, 0.5),
                wrapper.scale(1, 0.5, easeInOutCubic)
            );
        }));
        
        yield* waitUntil('cot_tree_done');

        // --- 3. Summary ---
        yield* waitUntil('start_reasoning_summary');
        
        // Fade out tree
        yield* this.treeContainer().opacity(0, 0.5);
        
        // Fade in Summary
        yield* this.summaryContainer().opacity(1, 0.5);
        
        for(const item of this.summaryItems) {
            yield* item.opacity(1, 0.5);
            yield* waitFor(0.2);
        }
        
        yield* waitFor(2);
    }
}

function makeRef<T>(arr: T[], index: number) {
    return (el: T) => { arr[index] = el; }
}
