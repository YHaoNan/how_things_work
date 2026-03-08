import { Layout, Txt, Icon, Circle, Line } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, easeOutCubic, sequence, waitUntil } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";

export class ConclusionLayer extends AnimLayer {
    private title = createRef<Txt>();
    private group1 = createRef<Layout>();
    private group2 = createRef<Layout>();
    
    protected on_build_ui(): void {
        this.root.add(
            <Layout>
                <Txt
                    ref={this.title}
                    text="总结"
                    y={-300}
                    fill={Colors.yellow}
                    fontSize={80}
                    fontFamily={'JetBrains Mono'}
                    opacity={0}
                    y={-400}
                />
                
                <Layout ref={this.group1} opacity={0} x={-400}>
                    <Circle size={200} fill={'#222'} stroke={Colors.orange} lineWidth={4} />
                    <Txt text="⚖️" fontSize={80} y={-20} />
                    <Txt text="性能 vs 画质" fill={Colors.orange} fontSize={40} fontFamily={'JetBrains Mono'} y={140}/>
                    <Txt text="鱼和熊掌兼得" fill={'#fff'} fontSize={32} fontFamily={'JetBrains Mono'} y={190}/>
                </Layout>

                <Layout ref={this.group2} opacity={0} x={400}>
                    <Circle size={200} fill={'#222'} stroke={Colors.green} lineWidth={4} />
                    <Txt text="🧠" fontSize={80} y={-20} />
                    <Txt text="更多知识" fill={Colors.green} fontSize={40} fontFamily={'JetBrains Mono'} y={140}/>
                    <Layout y={200}>
                        <Txt text="• 帧生成技术" fill={'#fff'} fontSize={28} fontFamily={'JetBrains Mono'} y={0}/>
                        <Txt text="• AI驱动的FSR" fill={'#fff'} fontSize={28} fontFamily={'JetBrains Mono'} y={40}/>
                    </Layout>
                </Layout>
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // 04:22: "In this episode..."
        yield* all(
            this.title().opacity(1, 1),
            this.title().y(-300, 1, easeOutCubic)
        );
        
        // 04:27: "Tradeoff... impossible brothers"
        yield* all(
            this.group1().opacity(1, 1),
            this.group1().x(-300, 1, easeOutCubic)
        );
        
        // 04:33: "DLSS/FSR make it possible"
        
        // 04:38: "Iterated many versions... Frame Gen... FSR 4.0 AI"
        yield* waitUntil('more_knowledge');
        yield* all(
            this.group2().opacity(1, 1),
            this.group2().x(300, 1, easeOutCubic)
        );
        
        // 04:49: "Beyond this video"
        
        // 04:54: Outro
        yield* waitFor(5);
    }
}
