import { View2D } from "@motion-canvas/2d";
import { ThreadGenerator, createSignal, SimpleSignal, waitFor, all, waitUntil } from "@motion-canvas/core";
import { MindMapLayer } from "./mindmap";
import { AnimLayer, Layer } from "./animLayer"; 
import { MindMapNode } from "./structs";
import { Colors } from "./colors";

export class Director {
    private view: View2D;
    private activeLayers: Set<Layer> = new Set();
    private eventCounter: number = 0;
    private mindmap: MindMapLayer | null = null;

    constructor(view: View2D) {
        this.view = view;
    }

    public useMindMap(data: MindMapNode): MindMapLayer {
        const mapColors = (node: MindMapNode): MindMapNode => {
            let color = node.color;
            if (color && color in Colors) {
                // @ts-ignore
                color = Colors[color];
            }
            return {
                ...node,
                color,
                children: node.children?.map(mapColors)
            };
        };

        const processedData = mapColors(data);
        const mindmap = new MindMapLayer(processedData);
        this.addLayer(mindmap);
        this.mindmap = mindmap;
        
        // Default behavior: Center on root node and set scale to 0.5
        const rootId = processedData.id;
        mindmap.snapTo(rootId, 0.5);

        return mindmap;
    }

    public *centerThenEnter(
        mindmap: MindMapLayer, 
        nodeId: string, 
        LayerClass: new () => AnimLayer,
        duration: number = 0.5
    ): ThreadGenerator {
        // 1. Focus on the node
        yield* mindmap.centerOn(nodeId, 1.5); // Focus duration hardcoded? User said "all animation functions... have duration param". 
        // Maybe we should apply duration to transitions. 
        // Let's keep centerOn duration as is or make it part of config, but here user asked for "duration argument" for the Director functions.
        // Assuming `duration` applies to the transition (fade in/expand).

        yield* waitUntil(`${nodeId} to ${LayerClass.name} ${this.nextEventCounter()}`); 

        // 2. Create Layer and set initial state BEFORE adding to view
        const layer = new LayerClass();
        
        // Ensure layer is ON TOP of the expanded mindmap node and initially invisible
        layer.root.zIndex(1000);
        layer.root.opacity(0); 
        
        // Now add to view (build_ui will be called)
        this.addLayer(layer);

        // 3. Enter Node (Expand MindMap Node)
        yield* mindmap.enter(nodeId, layer, duration); // Pass duration if enter supports it? MindMap.enter signature: enter(id, layer, duration=1.0)
        
        // 4. Fade in layer content
        yield* layer.root.opacity(1, duration);

        // 5. Play Layer Animation
        yield* layer.play();

        // 6. Cleanup
        this.removeLayer(layer);
    }

    /**
     * 纯粹的转场动画：淡入 -> 播放 -> 销毁
     */
    public *playLayer(
        LayerClass: new () => AnimLayer, 
        duration: number = 0.5
    ): ThreadGenerator {
        // Hide mindmap if exists
        if (this.mindmap) {
            yield* this.mindmap.root.opacity(0, duration);
        }

        // 1. Create Layer
        const layer = new LayerClass();
        
        // 2. Initial State
        layer.root.opacity(0);
        layer.root.zIndex(1000); // Ensure it's on top

        // 3. Add to View
        this.addLayer(layer);

        // 4. Fade In
        yield* layer.root.opacity(1, duration);

        // 5. Play
        yield* layer.play();
        
        // 6. Fade Out (Optional? User didn't specify exit behavior for playLayer, but usually we need to clean up cleanly)
        // User said: "mindmaplink is empty, so no leave animation".
        // AnimLayer.play() only does leave if linked.
        // So here we should probably fade out before removing to be smooth.
        yield* layer.root.opacity(0, duration);

        // 7. Cleanup
        this.removeLayer(layer);

        // Show mindmap if exists
        if (this.mindmap) {
            yield* this.mindmap.root.opacity(1, duration);
        }
    }

    private addLayer(layer: Layer) {
        this.view.add(layer.root);
        layer.build_ui();
        this.activeLayers.add(layer);
    }

    private removeLayer(layer: Layer) {
        if (this.activeLayers.has(layer)) {
            layer.release_resource();
            layer.root.remove();
            this.activeLayers.delete(layer);
        }
    }

    nextEventCounter(): number {
        return this.eventCounter++;
    }
}
