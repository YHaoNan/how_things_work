import {Layout, LayoutProps} from '@motion-canvas/2d';
import {Vector2} from '@motion-canvas/core';
import * as THREE from 'three';

export interface ThreeViewProps extends LayoutProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
}

export class ThreeView extends Layout {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.Camera;
  public readonly renderer: THREE.WebGLRenderer;

  private lastSize = new Vector2(0, 0);

  constructor({scene, camera, renderer, ...props}: ThreeViewProps) {
    super(props);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
  }

  protected draw(context: CanvasRenderingContext2D): void {
    if (this.clip()) {
      const size = this.size();
      if (size.x === 0 || size.y === 0) {
        return;
      }
      context.beginPath();
      context.rect(size.x / -2, size.y / -2, size.x, size.y);
      context.closePath();
      context.clip();
    }

    const size = this.size();
    const width = Math.max(1, Math.round(size.x));
    const height = Math.max(1, Math.round(size.y));

    if (width !== this.lastSize.x || height !== this.lastSize.y) {
      this.lastSize = new Vector2(width, height);

      const pixelRatio =
        typeof window !== 'undefined' && window.devicePixelRatio
          ? window.devicePixelRatio
          : 1;
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(width, height, false);

      if (this.camera instanceof THREE.PerspectiveCamera) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }
    }

    this.renderer.render(this.scene, this.camera);
    context.drawImage(this.renderer.domElement, width / -2, height / -2, width, height);

    this.drawChildren(context);
  }

  public dispose(): void {
    super.dispose();
    this.renderer.dispose();
    (this.renderer as any).forceContextLoss?.();
  }
}

