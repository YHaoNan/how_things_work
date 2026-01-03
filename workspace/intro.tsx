import { Layout, Txt, Video } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, waitFor, easeOutCubic, sequence } from "@motion-canvas/core";
import { AnimLayer } from "@src/common/animLayer";
import { Colors } from "@src/common/colors";
import ns2Video from "./assets/Nintendo Switch 2宣传片.mp4";

export class IntroLayer extends AnimLayer {
    private video = createRef<Video>();
    private termGroup = createRef<Layout>();
    private titleText = createRef<Txt>();

    protected on_build_ui(): void {
        this.root.add(
            <Layout>
                <Video
                    ref={this.video}
                    src={ns2Video}
                    width={1920}
                    height={1080}
                    opacity={0}
                    loop={true}
                    start={0}
                />
                <Layout ref={this.termGroup} />
                <Txt
                    ref={this.titleText}
                    text="好奇的事：超分技术"
                    y={0}
                    fill={Colors.yellow}
                    fontSize={120}
                    fontFamily={'JetBrains Mono'}
                    fontWeight={900}
                    opacity={0}
                    scale={2}
                    shadowBlur={20}
                    shadowColor={'rgba(0,0,0,0.8)'}
                />
            </Layout>
        );
    }

    protected *on_play(): ThreadGenerator {
        // SRT: 00:00 - 00:02 "最近购买了一台NS2"
        this.video().play();
        yield* this.video().opacity(0.4, 2);
        
        // SRT: 00:02 - 00:08 "DLSS、FSR等术语暴风般的出现在我的推荐视频中"
        
        const terms = ["DLSS", "FSR", "Super Resolution", "Upscaling", "4K", "60FPS"];
        // Spread 6 terms over ~6 seconds
        yield* sequence(0.8, ...terms.map(term => {
            const txt = createRef<Txt>();
            const x = (Math.random() - 0.5) * 1200;
            const y = (Math.random() - 0.5) * 600;
            const fontSize = 40 + Math.random() * 40;
            
            this.termGroup().add(
                <Txt
                    ref={txt}
                    text={term}
                    x={x}
                    y={y}
                    fill={Colors.yellow}
                    fontSize={fontSize}
                    fontFamily={'JetBrains Mono'}
                    opacity={0}
                    scale={0}
                    shadowBlur={10}
                    shadowColor={'rgba(0,0,0,0.5)'}
                />
            );
            
            return all(
                txt().opacity(1, 0.5),
                txt().scale(1, 0.5, easeOutCubic)
            );
        }));

        // Current time: ~8s.
        // SRT: 00:08 - 00:19 "听起来... 运行3A大作"
        // Keep terms floating or slight movement
        yield* waitFor(11); // Wait until 00:19

        // SRT: 00:19 - 00:23 "今天的“好奇的事”..."
        yield* all(
            this.termGroup().opacity(0, 1),
            this.video().opacity(0.2, 1),
            this.titleText().opacity(1, 1),
            this.titleText().scale(1, 1, easeOutCubic)
        );
        
        yield* waitFor(4); // 00:23
        
        // Transition out
        yield* this.root.opacity(0, 1);
    }
}
