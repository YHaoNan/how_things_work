import {ThreadGenerator} from '@motion-canvas/core';
import * as THREE from 'three';
import {AnimLayer} from '@src/common/animLayer';
import {ThreeView} from './ThreeView';

export interface ThreeAnimLayerOptions {
  size?: [number, number] | ['100%', '100%'];
  clearColor?: THREE.ColorRepresentation;
  clearAlpha?: number;
  fov?: number;
  near?: number;
  far?: number;
  cameraZ?: number;
}

export abstract class ThreeAnimLayer extends AnimLayer {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly view: ThreeView;

  constructor(options: ThreeAnimLayerOptions = {}) {
    super();

    const {
      size = ['100%', '100%'],
      clearColor = 0x000000,
      clearAlpha = 0,
      fov = 45,
      near = 0.1,
      far = 1000,
      cameraZ = 6,
    } = options;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(fov, 1920 / 1080, near, far);
    this.camera.position.set(0, 0, cameraZ);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this.renderer.setClearColor(new THREE.Color(clearColor), clearAlpha);

    this.view = new ThreeView({
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      size,
      clip: true,
    });
  }

  protected on_build_ui(): void {
    this.root.add(this.view);
    this.on_setup_scene();
  }

  protected on_setup_scene(): void {}

  protected abstract on_play_3d(): ThreadGenerator;

  protected *on_play(): ThreadGenerator {
    yield* this.on_play_3d();
  }

  public override release_resource(): void {
    super.release_resource();
    this.view.remove();
    this.view.dispose();
  }
}

