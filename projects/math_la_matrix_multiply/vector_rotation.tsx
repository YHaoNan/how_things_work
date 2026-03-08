import { ThreadGenerator, createRef, Vector2, all, waitFor, tween, easeInOutCubic, createSignal, Reference } from '@motion-canvas/core';
import { Txt, Layout, Node, Rect } from '@motion-canvas/2d';
import { AnimLayer } from '@src/common/animLayer';
import { Axes2D, Vector2D } from '@src/common/component/2d/math';
import { Colors } from '@src/common/colors';
import { LatexText } from '@src/common/component/2d/math/LatexText';

/**
 * 渲染一个简单的向量标签 (x, y)
 */
function* showVectorLabel(parent: Node, pos: Vector2, v: Vector2, color: string) {
  const container = createRef<Layout>();
  const text = createRef<Txt>();
  parent.add(
    <Layout ref={container} position={pos.add(new Vector2(10, -20))} opacity={0} zIndex={10}>
      <Txt
        ref={text}
        text={`(${v.x.toFixed(1)}, ${v.y.toFixed(1)})`}
        fill={color}
        fontSize={28}
        fontFamily={'Consolas, monospace'}
        fontWeight={700}
        shadowColor={'rgba(0,0,0,0.8)'}
        shadowBlur={10}
        shadowOffset={new Vector2(2, 2)}
      />
    </Layout>
  );
  yield* container().opacity(1, 0.5);
  return { container, text };
}

/**
 * 向量旋转动画生成器函数
 * 
 * @param parent 挂载节点
 * @param v 输入向量 (数值单位)
 * @param duration 旋转时长
 * @returns 返回旋转后的向量引用和数值，以便后续进行数乘等操作
 */
export function* animateVectorRotation(
  parent: Node, 
  v: Vector2, 
  duration: number = 1.5
){
  const scale = 100; // 1单位 = 100像素
  const vOrig = createRef<Vector2D>();
  const vRot = createRef<Vector2D>();

  // 1. 伸出原始向量
  parent.add(
    <Vector2D
      ref={vOrig}
      from={new Vector2(0, 0)}
      to={new Vector2(0, 0)}
      color={Colors.red}
      lineWidth={6}
      zIndex={5}
    />
  );
  
  yield* vOrig().to(v.scale(scale), 1, easeInOutCubic);
  const origLabel = yield* showVectorLabel(parent, v.scale(scale), v, Colors.red);

  yield* waitFor(1);

  // 2. 创建旋转向量 (初始覆盖在原始向量上)
  parent.add(
    <Vector2D
      ref={vRot}
      from={new Vector2(0, 0)}
      to={v.scale(scale)}
      color={Colors.green}
      lineWidth={6}
      zIndex={6}
    />
  );

  // 3. 顺时针旋转 90 度 (x, y) -> (-y, x)
  const targetV = new Vector2(-v.y, v.x);
  yield* vRot().to(targetV.scale(scale), duration, easeInOutCubic);

  // 4. 显示旋转后的数值
  const labelRefs = yield* showVectorLabel(parent, targetV.scale(scale), targetV, Colors.green);
  
  return { vector: vRot, value: targetV, label: labelRefs.container, labelText: labelRefs.text };
}

/**
 * 向量数乘动画生成器函数
 * 
 * @param vectorRef 向量引用
 * @param labelRef 标签引用 (可选，用于更新数值)
 * @param startV 当前向量数值
 * @param multiplier 数乘倍数
 * @param duration 动画时长
 */
export function* animateVectorScale(
  parent: Node,
  vectorRef: Reference<Vector2D>,
  labelRef: Reference<Layout>,
  labelTextRef: Reference<Txt>,
  startV: Vector2,
  multiplier: number,
  duration: number = 1.5
): ThreadGenerator {
  const scale = 100;
  const targetV = startV.scale(multiplier);
  const multiplierLabel = createRef<Txt>();

  // Add a temporary multiplier label (e.g., "x1.5")
  parent.add(
    <Txt
      ref={multiplierLabel}
      text={`x1.0`}
      fill={Colors.yellow}
      fontSize={42}
      fontFamily={'Consolas, monospace'}
      fontWeight={700}
      opacity={0}
      zIndex={20}
      shadowColor={'rgba(0,0,0,0.8)'}
      shadowBlur={15}
      shadowOffset={new Vector2(3, 3)}
      // Fix: position it at the midpoint of the CURRENT vector initially
      position={startV.scale(scale * 0.5).add(new Vector2(40, 0))}
    />
  );

  yield* multiplierLabel().opacity(1, 0.3);

  yield* all(
    // 向量伸缩动画
    vectorRef().to(targetV.scale(scale), duration, easeInOutCubic),
    // 标签位置跟随与数值更新动画
    tween(duration, (t) => {
      const progress = easeInOutCubic(t);
      const currentV = startV.lerp(targetV, progress);
      const currentMultiplier = 1.0 + (multiplier - 1.0) * progress;
      
      // 更新倍率文字
      multiplierLabel().text(`x${currentMultiplier.toFixed(1)}`);
      // 倍率文字位置稍微跟随
      multiplierLabel().position(currentV.scale(scale * 0.5).add(new Vector2(40, 0)));

      // 更新坐标标签位置
      labelRef().position(currentV.scale(scale).add(new Vector2(10, -20)));
      // 更新坐标标签文本
      labelTextRef().text(`(${currentV.x.toFixed(1)}, ${currentV.y.toFixed(1)})`);
    })
  );

  yield* waitFor(0.5);
  yield* multiplierLabel().opacity(0, 0.5);
  multiplierLabel().remove();
}

/**
 * 向量旋转与数乘演示层
 */
export class RotationLayer extends AnimLayer {
  protected override on_build_ui(): void {
    this.root.add(
      <Layout>
        <Rect
          width={'100%'}
          height={'100%'}
          fill={Colors.background}
          zIndex={-100}
        />
        <Axes2D 
          xRange={[-960, 960]} 
          yRange={[-540, 540]} 
          step={100} 
          showGrid 
          gridOpacity={0.2} 
          gridColor={'#444'}
        />
        {/* LaTeX: 显示一个列向量 */}
        <LatexText
          segments={[
            { tex: '\\begin{bmatrix}', },
            { tex: '3', color: Colors.yellow },
            { tex: '\\\\', },
            { tex: '2', color: Colors.green },
            { tex: '\\end{bmatrix}', },
          ]}
          fontSize={48}
          x={-700}
          y={-200}
        />
        {/* LaTeX: 显示一个旋转矩阵 */}
        <LatexText
          segments={[
            { tex: 'R', color: Colors.orange },
            { tex: ' = ' },
            { tex: '\\begin{bmatrix}' },
            { tex: '0', color: '#fff' },
            { tex: '&' },
            { tex: '-1', color: Colors.red },
            { tex: '\\\\' },
            { tex: '1', color: Colors.green },
            { tex: '&' },
            { tex: '0', color: '#fff' },
            { tex: '\\end{bmatrix}' },
          ]}
          fontSize={48}
          x={-700}
          y={-100}
        />
        {/* LaTeX: 演示按字设置颜色（简单表达式） */}
        <LatexText
          tex={'v=Ru'}
          charColors={[Colors.yellow, '#fff', Colors.orange, Colors.green]}
          fontSize={48}
          x={-700}
          y={0}
        />
      </Layout>
    );
  }

  protected override *on_play(): ThreadGenerator {
    const testVector = new Vector2(3, 2);
    
    // 1. 旋转演示
    const result = yield* animateVectorRotation(this.root, testVector);
    
    yield* waitFor(1.5);

    // 2. 数乘演示 (放大 1.5 倍)
    yield* animateVectorScale(
      this.root,
      result.vector, 
      result.label, 
      result.labelText,
      result.value, 
      1.5
    );
    
    yield* waitFor(2);
  }
}
