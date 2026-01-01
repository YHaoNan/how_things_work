import { Node } from "@motion-canvas/2d";
import { ThreadGenerator } from "@motion-canvas/core";

export interface Layer {
    /**
     * 获取层的根节点
     */
    readonly root: Node;

    /**
     * 构建层UI
     */
    build_ui(): void;

    /**
     * 开始播放层动画，返回一个motion-canvas的生成器
     */
    play(): ThreadGenerator;

    /**
     * 释放层资源
     */
    release_resource(): void;
}

export abstract class BaseLayer implements Layer {
    public readonly root: Node;

    constructor() {
        this.root = new Node({});
    }

    public build_ui(): void {
        this.on_build_ui();
    }

    /**
     * 子类实现此方法以构建特定的UI
     */
    protected abstract on_build_ui(): void;

    public abstract play(): ThreadGenerator;

    public release_resource(): void {
        this.root.removeChildren();
    }
}
