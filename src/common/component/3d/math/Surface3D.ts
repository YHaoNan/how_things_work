import * as THREE from 'three';

export type Surface3DFunction = (u: number, v: number) => THREE.Vector3 | [number, number, number];

export interface Surface3DOptions {
  fn?: Surface3DFunction;
  uMin?: number;
  uMax?: number;
  vMin?: number;
  vMax?: number;
  segmentsU?: number;
  segmentsV?: number;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  wireframe?: boolean;
  side?: THREE.Side;
}

export class Surface3D {
  public readonly object: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;

  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.MeshStandardMaterial;

  private fn: Surface3DFunction;
  private uMin: number;
  private uMax: number;
  private vMin: number;
  private vMax: number;
  private segmentsU: number;
  private segmentsV: number;

  constructor(options: Surface3DOptions = {}) {
    const {
      fn = (u: number, v: number) => [u, 0, v],
      uMin = 0,
      uMax = 1,
      vMin = 0,
      vMax = 1,
      segmentsU = 20,
      segmentsV = 20,
      color = 0xffffff,
      opacity = 0.12,
      wireframe = false,
      side = THREE.DoubleSide,
    } = options;

    this.fn = fn;
    this.uMin = uMin;
    this.uMax = uMax;
    this.vMin = vMin;
    this.vMax = vMax;
    this.segmentsU = Math.max(1, Math.floor(segmentsU));
    this.segmentsV = Math.max(1, Math.floor(segmentsV));

    this.geometry = new THREE.BufferGeometry();
    this.rebuildGeometry();

    this.material = new THREE.MeshStandardMaterial({
      color,
      transparent: opacity < 1,
      opacity,
      wireframe,
      side,
      metalness: 0,
      roughness: 1,
    });

    this.object = new THREE.Mesh(this.geometry, this.material);
    this.update();
  }

  public setFunction(fn: Surface3DFunction) {
    this.fn = fn;
    this.update();
  }

  public setRange(uMin: number, uMax: number, vMin: number, vMax: number) {
    this.uMin = uMin;
    this.uMax = uMax;
    this.vMin = vMin;
    this.vMax = vMax;
    this.update();
  }

  public setSegments(segmentsU: number, segmentsV: number) {
    const u = Math.max(1, Math.floor(segmentsU));
    const v = Math.max(1, Math.floor(segmentsV));
    if (u === this.segmentsU && v === this.segmentsV) return;
    this.segmentsU = u;
    this.segmentsV = v;
    this.rebuildGeometry();
    this.update();
  }

  public setOpacity(opacity: number) {
    this.material.transparent = opacity < 1;
    this.material.opacity = opacity;
    this.material.needsUpdate = true;
  }

  public setColor(color: THREE.ColorRepresentation) {
    this.material.color = new THREE.Color(color);
  }

  private rebuildGeometry() {
    const vertexCount = (this.segmentsU + 1) * (this.segmentsV + 1);
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);

    const indices = new Uint32Array(this.segmentsU * this.segmentsV * 6);
    let idx = 0;

    for (let v = 0; v < this.segmentsV; v++) {
      for (let u = 0; u < this.segmentsU; u++) {
        const a = v * (this.segmentsU + 1) + u;
        const b = a + 1;
        const c = a + (this.segmentsU + 1);
        const d = c + 1;

        indices[idx++] = a;
        indices[idx++] = c;
        indices[idx++] = b;
        indices[idx++] = b;
        indices[idx++] = c;
        indices[idx++] = d;
      }
    }

    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  public update() {
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const uvAttr = this.geometry.getAttribute('uv') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const uvs = uvAttr.array as Float32Array;

    let pIdx = 0;
    let uvIdx = 0;

    for (let j = 0; j <= this.segmentsV; j++) {
      const sv = j / this.segmentsV;
      const v = this.vMin + (this.vMax - this.vMin) * sv;

      for (let i = 0; i <= this.segmentsU; i++) {
        const su = i / this.segmentsU;
        const u = this.uMin + (this.uMax - this.uMin) * su;

        const p = this.fn(u, v);
        const vv = Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p;

        positions[pIdx++] = vv.x;
        positions[pIdx++] = vv.y;
        positions[pIdx++] = vv.z;

        uvs[uvIdx++] = su;
        uvs[uvIdx++] = sv;
      }
    }

    posAttr.needsUpdate = true;
    uvAttr.needsUpdate = true;
    this.geometry.computeVertexNormals();
    this.geometry.computeBoundingSphere();
  }
}

