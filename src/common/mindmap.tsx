import { Node, Rect, Txt, Line, Circle } from "@motion-canvas/2d";
import { ThreadGenerator, createRef, all, easeOutExpo, easeInOutCubic, easeInOutExpo } from "@motion-canvas/core";
import { BaseLayer, Layer } from "./layer";
import { MindMapNode } from "./structs";
import { computeTreeLayout } from "@src/utils/treeLayout";
import { Colors } from "./colors";

export class MindMapLayer extends BaseLayer {
    private mindmapData: MindMapNode;
    private nodeRefs = new Map<string, ReturnType<typeof createRef<Rect>>>();
    private txtRefs = new Map<string, ReturnType<typeof createRef<Txt>>>();
    private currentNodeId: string | null = null;
    
    // Config
    private readonly nodeWidth = 400;
    private readonly nodeHeight = 240;
    private readonly hGap = 400;
    private readonly vGap = 150;

    constructor(mindmapData: MindMapNode) {
        super();
        this.mindmapData = mindmapData;
    }

    protected on_build_ui(): void {
        const layout = computeTreeLayout(this.mindmapData, {
            nodeWidth: this.nodeWidth,
            nodeHeight: this.nodeHeight,
            hGap: this.hGap,
            vGap: this.vGap,
        });

        // 1. Draw Edges
        this.root.add(
            <Node>
                {layout.edges.map((e, i) => {
                    const fromNode = layout.nodes.find(n => n.id === e.from)!;
                    const toNode = layout.nodes.find(n => n.id === e.to)!;
                    
                    const startX = fromNode.x + fromNode.width / 2;
                    const startY = fromNode.y;
                    const endX = toNode.x - toNode.width / 2;
                    const endY = toNode.y;
                    
                    const midX = (startX + endX) / 2;
                    
                    return (
                        <Line
                            key={`edge-${i}`}
                            points={[
                                [startX, startY],
                                [midX, startY],
                                [midX, endY],
                                [endX, endY]
                            ]}
                            radius={40}
                            stroke={'#666'}
                            lineWidth={4}
                            endArrow
                            arrowSize={12}
                            zIndex={0}
                        />
                    );
                })}
            </Node>
        );

        // 2. Draw Nodes
        layout.nodes.forEach(n => {
            const rectRef = createRef<Rect>();
            const txtRef = createRef<Txt>();
            this.nodeRefs.set(n.id, rectRef);
            this.txtRefs.set(n.id, txtRef);

            this.root.add(
                <Rect
                    ref={rectRef}
                    position={[n.x, n.y]}
                    width={n.width}
                    height={n.height}
                    fill={n.color}
                    radius={24}
                    stroke={'#333'}
                    lineWidth={0}
                    zIndex={1}
                >
                    <Txt
                        ref={txtRef}
                        text={n.name}
                        fill={'#ffffff'}
                        fontFamily={'Arial, sans-serif'}
                        fontSize={32}
                        zIndex={2}
                    />
                </Rect>
            );
        });
    }

    public *play(): ThreadGenerator {
        yield;
    }

    /**
     * Snap to a specific node instantly (no animation)
     */
    public snapTo(id: string, scale: number = 1.0) {
        const nodeRef = this.nodeRefs.get(id);
        if (!nodeRef) {
            console.warn(`Node ${id} not found`);
            return;
        }
        
        this.currentNodeId = id;
        const node = nodeRef();
        
        // Set scale first
        this.root.scale(scale);
        
        // Calculate position
        // RootPos = -NodePos * Scale
        const targetPos = node.position().mul(scale).mul(-1);
        this.root.position(targetPos);
    }

    /**
     * Focus on a specific node (move the whole layer)
     */
    public *centerOn(id: string, duration: number = 1): ThreadGenerator {
        const nodeRef = this.nodeRefs.get(id);
        if (!nodeRef) {
            console.warn(`Node ${id} not found`);
            return;
        }
        
        this.currentNodeId = id;
        const node = nodeRef();
        
        const currentScale = this.root.scale().x;
        const targetPos = node.position().mul(currentScale).mul(-1);

        yield* this.root.position(targetPos, duration, easeInOutCubic);
    }

    /**
     * Scale the whole mindmap
     */
    public *scale(value: number, duration: number = 1): ThreadGenerator {
        if (this.currentNodeId) {
            const nodeRef = this.nodeRefs.get(this.currentNodeId);
            if (nodeRef) {
                const node = nodeRef();
                // Target position for root to keep node centered:
                // RootPos = -NodePos * NewScale
                const targetPos = node.position().mul(value).mul(-1);
                
                yield* all(
                    this.root.scale(value, duration, easeInOutCubic),
                    this.root.position(targetPos, duration, easeInOutCubic)
                );
                return;
            }
        }
        yield* this.root.scale(value, duration, easeInOutCubic);
    }

    /**
     * Enter a node: expand to fill screen, hide text, change color to bg
     */
    public *enter(id: string, targetLayer: Layer, duration: number = 1.0): ThreadGenerator {
        const nodeRef = this.nodeRefs.get(id);
        const txtRef = this.txtRefs.get(id);
        
        if (!nodeRef || !txtRef) {
            console.warn(`Node ${id} not found`);
            return;
        }

        const node = nodeRef();
        const txt = txtRef();
        
        // Ensure the node is on top
        node.zIndex(100);

        // Link the target layer to this mindmap for auto-leave
        if (targetLayer && 'setMindMapLink' in targetLayer) {
            (targetLayer as any).setMindMapLink(this, id);
        }

        // Ripple Effect
        const ripple = createRef<Circle>();
        node.add(
            <Circle
                ref={ripple}
                size={0}
                fill={'rgba(255, 255, 255, 0.5)'}
                zIndex={10}
            />
        );
        
        yield* ripple().size(200, 0.3).to(200, 0);
        yield* ripple().opacity(0, 0.3);
        ripple().remove();

        const ease = easeInOutExpo;
        const currentScale = this.root.scale().x;
        const targetPos = node.position().mul(currentScale).mul(-1);

        // Expand Animation
        yield* all(
            // 1. Center the node by moving root
            this.root.position(targetPos, duration, ease),
            
            // 2. Expand the node rect
            node.size([1920 / currentScale * 1.5, 1080 / currentScale * 1.5], duration, ease), 
            node.radius(0, duration, ease), 
            
            // 3. Fade out text
            txt.opacity(0, duration * 0.5),

            // 4. Change color to background
            node.fill(Colors.background, duration, ease), 
        );
    }

    /**
     * Leave a node: shrink back to original size, show text, restore color
     */
    public *leave(id: string, duration: number = 1.0): ThreadGenerator {
        const nodeRef = this.nodeRefs.get(id);
        const txtRef = this.txtRefs.get(id);
        
        if (!nodeRef || !txtRef) {
            console.warn(`Node ${id} not found`);
            return;
        }

        const node = nodeRef();
        const txt = txtRef();
        
        const nodeData = this.findNodeData(id);
        const originalColor = nodeData?.color || Colors.background;
        const ease = easeInOutExpo;

        yield* all(
            // Restore size
            node.size([this.nodeWidth, this.nodeHeight], duration, ease),
            node.radius(24, duration, ease),
            
            // Restore text
            txt.opacity(1, duration),
            
            // Restore color
            node.fill(originalColor, duration, ease),
        );
        
        node.zIndex(1);
    }

    private findNodeData(id: string, root: MindMapNode = this.mindmapData): MindMapNode | null {
        if (root.id === id) return root;
        if (root.children) {
            for (const child of root.children) {
                const found = this.findNodeData(id, child);
                if (found) return found;
            }
        }
        return null;
    }
}
