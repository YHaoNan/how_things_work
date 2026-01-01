import { Layout, Rect, Txt, Circle, Line, Spline } from '@motion-canvas/2d';
import { makeScene2D } from '@motion-canvas/2d';
import { createRef, all, waitFor, easeOutExpo, easeInOutCubic, sequence, Vector2, delay, createSignal, chain, easeOutBack, easeInExpo, easeOutCirc } from '@motion-canvas/core';
import { Colors } from '../common/colors';

export default makeScene2D(function* (view) {
    const mainLayout = createRef<Layout>();
    const text1 = createRef<Txt>(); // 好奇
    const text2 = createRef<Txt>(); // 的事
    const lineRef = createRef<Line>();
    const circleRef = createRef<Circle>();
    const transitionCircle = createRef<Circle>();

    view.add(
        <Rect width={'100%'} height={'100%'} fill={'#111'}>
            <Layout ref={mainLayout}>
                {/* Dynamic Line */}
                <Line 
                    ref={lineRef}
                    points={[new Vector2(-600, 0), new Vector2(600, 0)]}
                    stroke={Colors.yellow}
                    lineWidth={0}
                    lineDash={[20, 20]}
                    end={0}
                />

                {/* Central Circle */}
                <Circle 
                    ref={circleRef}
                    size={0}
                    stroke={'#fff'}
                    lineWidth={2}
                    opacity={0.5}
                />

                {/* Text Container */}
                <Layout>
                    <Txt 
                        ref={text1}
                        text={'好奇'}
                        x={-100}
                        fontSize={140}
                        fontFamily={'JetBrains Mono'}
                        fontWeight={200} // Thinner
                        fill={'#fff'}
                        opacity={0}
                        scale={0.8}
                        letterSpacing={-10} // Compressed initially
                    />
                    <Txt 
                        ref={text2}
                        text={'的事'}
                        x={100}
                        fontSize={140}
                        fontFamily={'JetBrains Mono'}
                        fontWeight={200} // Thinner
                        fill={Colors.yellow}
                        opacity={0}
                        scale={0.8}
                        letterSpacing={-10}
                    />
                </Layout>
            </Layout>

            {/* Transition Wipe Element */}
            <Circle 
                ref={transitionCircle}
                size={0}
                fill={Colors.background} // Transition to Main BG
                zIndex={100}
            />
        </Rect>
    );

    // --- Animation ---

    // 1. Line Zip
    yield* lineRef().lineWidth(4, 0);
    yield* lineRef().end(1, 0.6, easeInOutCubic);
    yield* lineRef().opacity(0, 0.3);

    // 2. Circle Pop
    yield* circleRef().size(600, 0.8, easeOutBack);
    yield* circleRef().lineWidth(0, 0.5); // Fade stroke out by thinning
    
    // 3. Text Reveal (Elegant)
    yield* all(
        text1().opacity(1, 0.6),
        text1().x(-160, 0.8, easeOutCirc), // Move slightly left
        text1().scale(1, 0.8, easeOutBack),
        text1().letterSpacing(0, 0.8, easeOutCirc),
        
        delay(0.1, all(
            text2().opacity(1, 0.6),
            text2().x(160, 0.8, easeOutCirc), // Move slightly right
            text2().scale(1, 0.8, easeOutBack),
            text2().letterSpacing(0, 0.8, easeOutCirc),
        ))
    );

    // 4. Subtle Float
    yield* all(
        text1().y(-10, 2, easeInOutCubic),
        text2().y(10, 2, easeInOutCubic),
    );

    // 5. Transition Out
    // Explode transition circle
    yield* transitionCircle().size(3000, 0.8, easeInExpo);
});
