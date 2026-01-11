import { Layout, Rect, Txt, Circle, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, sequence, waitFor, waitUntil, easeInOutCubic, Vector2, loop } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class AgentLayer extends AnimLayer {
    // Scene 1: ReAct
    private reactContainer = createRef<Layout>();
    private userBox = createRef<Rect>();
    private modelBox = createRef<Rect>();
    private envBox = createRef<Rect>();
    
    // Arrows
    private arrowUserToModel = createRef<Line>();
    private arrowModelToEnv = createRef<Line>();
    private arrowEnvToModel = createRef<Line>();
    
    // Bubbles
    private thoughtBubble = createRef<Rect>();
    private actionBubble = createRef<Rect>();
    private observationBubble = createRef<Rect>();

    // Scene 2: Training
    private trainingContainer = createRef<Layout>();
    private trainingModel = createRef<Rect>();
    private traces: Layout[] = [];

    // Scene 3: Summary
    private summaryContainer = createRef<Layout>();
    private summaryItems: Txt[] = [];

    protected on_build_ui(): void {
        const fontFamily = '"Microsoft YaHei", "SimHei", sans-serif';

        // --- Scene 1: ReAct ---
        this.root.add(
            <Layout ref={this.reactContainer} y={-50}>
                {/* User */}
                <Rect
                    ref={this.userBox}
                    x={-500}
                    y={-200}
                    width={200}
                    height={100}
                    fill={Colors.orange}
                    radius={16}
                >
                    <Txt text="User" fill={'#fff'} fontSize={32} fontFamily={fontFamily} />
                </Rect>

                {/* Model */}
                <Rect
                    ref={this.modelBox}
                    x={500}
                    y={-200}
                    width={200}
                    height={200}
                    fill={Colors.green}
                    radius={16}
                >
                    <Txt text="Model" fill={'#fff'} fontSize={32} fontFamily={fontFamily} />
                </Rect>

                {/* Environment */}
                <Rect
                    ref={this.envBox}
                    x={0}
                    y={300}
                    width={800}
                    height={100}
                    fill={Colors.brown}
                    radius={16}
                >
                    <Txt text="Framework / Environment" fill={'#fff'} fontSize={32} fontFamily={fontFamily} />
                </Rect>

                {/* Arrows */}
                <Line
                    ref={this.arrowUserToModel}
                    points={[new Vector2(-400, -200), new Vector2(400, -200)]}
                    stroke={'#fff'}
                    lineWidth={4}
                    endArrow={true}
                    opacity={0}
                />
                 <Line
                    ref={this.arrowModelToEnv}
                    points={[new Vector2(500, -100), new Vector2(500, 250)]} // Model Bottom to Env Right (ish)
                    stroke={'#fff'}
                    lineWidth={4}
                    endArrow={true}
                    opacity={0}
                />
                 <Line
                    ref={this.arrowEnvToModel}
                    points={[new Vector2(-500, 250), new Vector2(-500, 0), new Vector2(400, 0)]} // Env Left to Model Left (loop back) - Simplified
                    // Actually, let's make it go from Env Center to Model Bottom-Left?
                    // Script: "Loop arrow". 
                    // Let's do: Model -> Env (Action), Env -> Model (Observation).
                    stroke={'#fff'}
                    lineWidth={4}
                    endArrow={true}
                    opacity={0}
                />
                
                {/* Bubbles */}
                <Rect
                    ref={this.thoughtBubble}
                    x={200}
                    y={-350}
                    fill={'#333'}
                    radius={16}
                    padding={20}
                    opacity={0}
                    maxWidth={400}
                >
                    <Txt text="Thinking..." fill={'#aaa'} fontSize={24} fontFamily={fontFamily} textWrap={true} />
                </Rect>
                 <Rect
                    ref={this.actionBubble}
                    x={500}
                    y={50}
                    fill={'#333'}
                    radius={16}
                    padding={20}
                    opacity={0}
                >
                    <Txt text="Action JSON" fill={Colors.yellow} fontSize={24} fontFamily={fontFamily} />
                </Rect>
                 <Rect
                    ref={this.observationBubble}
                    x={0}
                    y={150}
                    fill={'#333'}
                    radius={16}
                    padding={20}
                    opacity={0}
                >
                    <Txt text="Observation" fill={Colors.green} fontSize={24} fontFamily={fontFamily} />
                </Rect>
            </Layout>
        );

        // --- Scene 2: Training (Internalization) ---
        this.root.add(
            <Layout ref={this.trainingContainer} opacity={0}>
                 <Rect
                    ref={this.trainingModel}
                    width={300}
                    height={300}
                    fill={'#222'}
                    stroke={Colors.green}
                    lineWidth={4}
                    radius={20}
                >
                     <Txt text="Agent Model" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={-100} />
                     {/* Internal network placeholder */}
                     <Circle size={20} fill={'#444'} x={-50} y={0} />
                     <Circle size={20} fill={'#444'} x={50} y={0} />
                     <Circle size={20} fill={'#444'} x={0} y={50} />
                     <Line points={[new Vector2(-50,0), new Vector2(50,0)]} stroke={'#444'} lineWidth={2} />
                     <Line points={[new Vector2(-50,0), new Vector2(0,50)]} stroke={'#444'} lineWidth={2} />
                     <Line points={[new Vector2(50,0), new Vector2(0,50)]} stroke={'#444'} lineWidth={2} />
                </Rect>
                {this.buildTraces(fontFamily)}
            </Layout>
        );

        // --- Scene 3: Summary ---
        this.root.add(
            <Layout ref={this.summaryContainer} opacity={0}>
                <Rect width={900} height={500} fill={'rgba(0,0,0,0.9)'} radius={20} stroke={Colors.green} lineWidth={2} />
                <Txt text="构建Agent产品的挑战" y={-200} fill={Colors.green} fontSize={48} fontFamily={fontFamily} />
                <Layout y={-100} x={-400}>
                     <Txt text="1. 交互模式 (ReAct/LangChain)" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={0} opacity={0} ref={makeRef(this.summaryItems, 0)} />
                     <Txt text="2. 复杂轨迹描述 (Browser/Delay)" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={60} opacity={0} ref={makeRef(this.summaryItems, 1)} />
                     <Txt text="3. 轨迹收集与生成 (Nex-N1/Auto-Gen)" fill={'#fff'} fontSize={32} fontFamily={fontFamily} y={120} opacity={0} ref={makeRef(this.summaryItems, 2)} />
                </Layout>
            </Layout>
        );
    }

    private buildTraces(fontFamily: string) {
        const els: any[] = [];
        // Create 5 traces floating around
        for (let i = 0; i < 5; i++) {
             const trace = createRef<Layout>();
             els.push(
                 <Layout ref={trace} x={-600} y={(i-2)*100} opacity={0}>
                     <Rect fill={'#333'} radius={8} padding={10}>
                         <Txt text="Think-Act-Obs" fill={'#aaa'} fontSize={16} fontFamily={fontFamily} />
                     </Rect>
                 </Layout>
             );
             // Store the REF itself (function), not cast to Layout.
             // We will handle the type casting in the loop where we use it.
             this.traces.push(trace as any); 
        }
        return els;
    }

    protected *on_play(): ThreadGenerator {
        // --- 1. ReAct Demo ---
        yield* waitUntil('start_react_demo');

        // Show User Request
        yield* this.arrowUserToModel().opacity(1, 0.5);
        yield* this.thoughtBubble().opacity(1, 0.5);
        yield* (this.thoughtBubble().children()[0] as Txt).text("思考：编写爱心程序 -> write_file", 1);
        
        yield* waitFor(0.5);
        
        // Action
        yield* this.arrowModelToEnv().opacity(1, 0.5);
        yield* this.actionBubble().opacity(1, 0.5);
        yield* (this.actionBubble().children()[0] as Txt).text('{"action": "write_file"...}', 1);

        yield* waitFor(0.5);

        // Observation
        yield* this.arrowEnvToModel().points([new Vector2(0, 300), new Vector2(0, 0), new Vector2(400, 0)], 0); // Reset points for cleaner anim if needed, but simple is fine
        // Let's just use a direct line from Env to Model
        // My arrowEnvToModel points were: Env Left -> Model Left.
        // Let's animate it appearing.
        this.arrowEnvToModel().points([new Vector2(0, 250), new Vector2(0, 0), new Vector2(400, 0)]); // Adjust path: Env Top Center -> Up -> Right -> Model Left
        // Actually points are relative to parent? No, local to Line.
        // Line is in reactContainer (y=-50).
        // Env is at (0, 300). Model at (500, -200).
        // Let's make points: (0, 250) -> (0, -200) -> (400, -200).
        this.arrowEnvToModel().points([new Vector2(0, 250), new Vector2(0, -200), new Vector2(400, -200)]);
        
        yield* this.arrowEnvToModel().opacity(1, 0.5);
        yield* this.observationBubble().opacity(1, 0.5);
        yield* (this.observationBubble().children()[0] as Txt).text("Observe: OK", 1);
        
        yield* waitUntil('react_demo_done');

        // --- 2. Training (Internalization) ---
        yield* waitUntil('start_agent_training');
        
        // Hide ReAct
        yield* this.reactContainer().opacity(0, 0.5);
        
        // Show Training Model
        yield* this.trainingContainer().opacity(1, 0.5);
        
        // Animate Traces flying in
        yield* sequence(0.2, ...this.traces.map((traceRef) => {
            // traceRef is Reference<Layout>
            const trace = (traceRef as unknown as () => Layout)();
            return all(
                trace.opacity(1, 0.1),
                trace.position(new Vector2(0, 0), 1, easeInOutCubic),
                trace.scale(0.1, 1),
                trace.opacity(0, 1) // Fade out as they merge
            );
        }));

        // Glow Model
        yield* this.trainingModel().stroke(Colors.yellow, 0.5).to(Colors.green, 0.5);
        yield* this.trainingModel().fill('#333', 0.5).to('#222', 0.5);

        yield* waitUntil('agent_training_done');

        // --- 3. Summary ---
        yield* waitUntil('start_agent_summary');

        yield* this.trainingContainer().opacity(0, 0.5);
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
