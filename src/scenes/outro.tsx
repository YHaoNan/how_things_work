import { Layout, Rect, Txt, Circle, Line, Icon, Img } from '@motion-canvas/2d';
import { makeScene2D } from '@motion-canvas/2d';
import { createRef, all, waitFor, easeOutExpo, easeOutBack, sequence, Vector2, delay, createSignal, chain, easeInOutCubic, easeInExpo } from '@motion-canvas/core';
import { Colors } from '../common/colors';

export default makeScene2D(function* (view) {
    // Refs for Interaction Part
    const interactionLayout = createRef<Layout>();
    const like = createRef<Circle>();
    const coin = createRef<Circle>();
    const fav = createRef<Circle>();
    const share = createRef<Circle>();
    const follow = createRef<Rect>(); // Pill shape

    // Refs for Reference Part
    const referenceLayout = createRef<Layout>();
    const scrollContent = createRef<Layout>();
    
    // Transition Overlay (In)
    const inOverlay = createRef<Circle>();

    view.add(
        <Rect width={'100%'} height={'100%'} fill={'#111'}>
            
            {/* Transition Overlay (In) */}
            <Circle
                ref={inOverlay}
                size={3000} // Start full screen
                fill={Colors.red} // Match Main Out
                zIndex={1000}
            />

            {/* Part 1: Interaction */}
            <Layout ref={interactionLayout}>
                <Txt 
                    text={'喜欢就三连一下吧！'} 
                    y={-250} 
                    fill={'#fff'} 
                    fontSize={60} 
                    fontFamily={'JetBrains Mono'} 
                    fontWeight={900}
                />
                
                <Layout y={50} gap={100}>
                    {/* Like */}
                    <Circle ref={like} size={150} fill={'#333'} scale={0}>
                         <Txt text={'👍'} fontSize={80} fill={'#fff'} />
                    </Circle>
                    
                    {/* Coin */}
                    <Circle ref={coin} size={150} fill={'#333'} scale={0}>
                         <Txt text={'🪙'} fontSize={80} fill={'#fff'} />
                    </Circle>

                    {/* Fav */}
                    <Circle ref={fav} size={150} fill={'#333'} scale={0}>
                         <Txt text={'⭐'} fontSize={80} fill={'#fff'} />
                    </Circle>
                </Layout>

                <Layout y={250} gap={50}>
                     {/* Share */}
                    <Circle ref={share} size={100} fill={'#333'} scale={0}>
                         <Txt text={'↗️'} fontSize={50} fill={'#fff'} />
                    </Circle>
                     {/* Follow */}
                    <Rect ref={follow} width={250} height={100} fill={Colors.red} radius={50} scale={0}>
                         <Txt text={'+ 关注'} fontSize={40} fill={'#fff'} fontWeight={900} />
                    </Rect>
                </Layout>
            </Layout>

            {/* Part 2: Reference */}
            <Layout ref={referenceLayout} y={1080} opacity={0}>
                <Txt 
                    text={'参考资料 & 引用'} 
                    y={-400} 
                    fill={'#fff'} 
                    fontSize={48} 
                    fontFamily={'JetBrains Mono'} 
                    fontWeight={700}
                />
                
                {/* Scroll Container */}
                <Rect width={1200} height={800} clip>
                    <Layout ref={scrollContent} y={400}> 
                         {/* Dummy List */}
                         {[
                            "1. Nvidia DLSS 2.0 Whitepaper",
                            "2. AMD FidelityFX Super Resolution Architecture",
                            "3. Real-Time Rendering 4th Edition",
                            "4. Checkerboard Rendering for Real-Time Upscaling",
                            "5. Motion Vectors in Temporal Anti-Aliasing",
                            "6. Neural Networks for Image Super-Resolution",
                            "7. Digital Foundry: Tech Analysis",
                            "8. GDC 2021: Advanced Graphics Techniques",
                            "9. Unreal Engine 5 Nanite & Lumen",
                            "10. Wikipedia: Super-resolution imaging"
                         ].map((item, i) => (
                             <Txt 
                                text={item} 
                                y={i * 80} 
                                fill={'#ccc'} 
                                fontSize={32} 
                                fontFamily={'JetBrains Mono'} 
                                textAlign={'left'}
                                width={1000}
                             />
                         ))}
                    </Layout>
                </Rect>
            </Layout>

        </Rect>
    );

    // --- Animation Sequence ---

    // 0. Transition In
    yield* inOverlay().size(0, 1, easeOutExpo);

    // 1. Enter Icons
    yield* sequence(0.1,
        like().scale(1, 0.5, easeOutBack),
        coin().scale(1, 0.5, easeOutBack),
        fav().scale(1, 0.5, easeOutBack),
        share().scale(1, 0.5, easeOutBack),
        follow().scale(1, 0.5, easeOutBack),
    );

    yield* waitFor(0.5);

    // 2. Click Interactions (Simulate User Action)
    
    // Like
    yield* like().scale(0.8, 0.1);
    yield* all(
        like().fill(Colors.red, 0.1),
        like().scale(1.2, 0.3, easeOutBack)
    );
    yield* like().scale(1, 0.2);

    yield* waitFor(0.2);

    // Coin
    yield* coin().scale(0.8, 0.1);
    yield* all(
        coin().fill(Colors.yellow, 0.1),
        coin().scale(1.2, 0.3, easeOutBack)
    );
    yield* coin().scale(1, 0.2);

    yield* waitFor(0.2);

    // Fav
    yield* fav().scale(0.8, 0.1);
    yield* all(
        fav().fill(Colors.orange, 0.1),
        fav().scale(1.2, 0.3, easeOutBack)
    );
    yield* fav().scale(1, 0.2);

    yield* waitFor(0.5);

    // Follow
    yield* follow().scale(0.9, 0.1);
    yield* all(
        follow().fill('#555', 0.1), // Grayed out meaning 'Followed'
        follow().scale(1.1, 0.3, easeOutBack),
    );
    // Change text maybe? Text is child, hard to access without ref. 
    // Just color change implies action.
    yield* follow().scale(1, 0.2);

    yield* waitFor(1);

    // 3. Transition to Reference
    yield* all(
        interactionLayout().y(-1080, 1, easeInOutCubic),
        interactionLayout().opacity(0, 1),
        referenceLayout().y(0, 1, easeInOutCubic),
        referenceLayout().opacity(1, 1),
    );

    // 4. Scroll Reference
    // Content height is approx 10 items * 80 = 800.
    // Container is 800. Center is 0. 
    // Content starts at y=400 (Top of content at 0).
    // We want to scroll up so bottom of content is visible.
    // Let's just scroll up by some amount.
    yield* scrollContent().y(-200, 3, easeInOutCubic); // Slow scroll

    yield* waitFor(2);
});
