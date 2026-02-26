import * as THREE from 'three';

export type Curve3DFunction = (t: number) => THREE.Vector3 | [number, number, number];

export interface Curve3DOptions {
  fn?: Curve3DFunction;
  tMin?: number;
  tMax?: number;
  segments?: number;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
}

export class Curve3D {
  public readonly object: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial | THREE.LineDashedMaterial>;

  private readonly geometry: THREE.BufferGeometry;
  private fn: Curve3DFunction;
  private tMin: number;
  private tMax: number;
  private segments: number;

  constructor(options: Curve3DOptions = {}) {
    const {
      fn = (t: number) => [t, 0, 0],
      tMin = 0,
      tMax = 1,
      segments = 64,
      color = 0xffffff,
      opacity = 1,
      dashed = false,
      dashSize = 0.2,
      gapSize = 0.15,
    } = options;

    this.fn = fn;
    this.tMin = tMin;
    this.tMax = tMax;
    this.segments = Math.max(1, Math.floor(segments));

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((this.segments + 1) * 3), 3));

    const transparent = opacity < 1;
    const material = dashed
      ? new THREE.LineDashedMaterial({
          color,
          transparent,
          opacity,
          dashSize,
          gapSize,
        })
      : new THREE.LineBasicMaterial({
          color,
          transparent,
          opacity,
        });

    this.object = new THREE.Line(this.geometry, material);
    this.update();
  }

  public setFunction(fn: Curve3DFunction) {
    this.fn = fn;
    this.update();
  }

  public setRange(tMin: number, tMax: number) {
    this.tMin = tMin;
    this.tMax = tMax;
    this.update();
  }

  public setSegments(segments: number) {
    const next = Math.max(1, Math.floor(segments));
    if (next === this.segments) return;
    this.segments = next;
    this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((this.segments + 1) * 3), 3));
    this.update();
  }

  public setColor(color: THREE.ColorRepresentation) {
    (this.object.material as any).color = new THREE.Color(color);
  }

  public setOpacity(opacity: number) {
    const m = this.object.material as any;
    m.transparent = opacity < 1;
    m.opacity = opacity;
    m.needsUpdate = true;
  }

  public update() {
    const attr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const array = attr.array as Float32Array;

    for (let i = 0; i <= this.segments; i++) {
      const k = i / this.segments;
      const t = this.tMin + (this.tMax - this.tMin) * k;
      const p = this.fn(t);
      const v = Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p;
      const idx = i * 3;
      array[idx] = v.x;
      array[idx + 1] = v.y;
      array[idx + 2] = v.z;
    }

    attr.needsUpdate = true;
    this.geometry.computeBoundingSphere();

    if ((this.object.material as THREE.LineDashedMaterial).isLineDashedMaterial) {
      this.object.computeLineDistances();
    }
  }
}

