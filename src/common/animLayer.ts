import { ThreadGenerator, all } from "@motion-canvas/core";
import { BaseLayer } from "./layer";

/**
 * 带有自动弹出动画的层
 */
export abstract class AnimLayer extends BaseLayer {
    protected mindMapLayer?: any; // Avoid circular dependency type issues or use interface
    protected nodeId?: string;

    /**
     * 设置关联的思维导图层和节点ID，用于弹出动画
     */
    public setMindMapLink(mindMapLayer: any, nodeId: string) {
        this.mindMapLayer = mindMapLayer;
        this.nodeId = nodeId;
    }

    public *play(): ThreadGenerator {
        yield* this.on_play();
        
        // Auto leave if linked
        if (this.mindMapLayer && this.nodeId) {
            // First fade out content
            yield* this.root.opacity(0, 0.5);
            // Then shrink the card back
            yield* this.mindMapLayer.leave(this.nodeId);
        }
    }

    protected abstract on_play(): ThreadGenerator;
}
