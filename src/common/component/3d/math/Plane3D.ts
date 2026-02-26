import * as THREE from 'three';
import {Surface3D} from './Surface3D';

export interface Plane3DOptions {
  size?: number;
  segments?: number;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  wireframe?: boolean;
  normal?: THREE.Vector3;
  offset?: number;
  showGrid?: boolean;
  gridDivisions?: number;
  gridColorCenterLine?: THREE.ColorRepresentation;
  gridColor?: THREE.ColorRepresentation;
}

export class Plane3D {
  public readonly object: THREE.Group;
  public readonly surface: Surface3D;

  private readonly normal: THREE.Vector3;
  private offset: number;

  constructor(options: Plane3DOptions = {}) {
    const {
      size = 10,
      segments = 10,
      color = 0xffffff,
      opacity = 0.12,
      wireframe = false,
      normal = new THREE.Vector3(0, 1, 0),
      offset = 0,
      showGrid = true,
      gridDivisions = 10,
      gridColorCenterLine = 0x94a3b8,
      gridColor = 0x334155,
    } = options;

    this.object = new THREE.Group();
    this.normal = normal.clone();
    if (this.normal.lengthSq() === 0) this.normal.set(0, 1, 0);
    this.normal.normalize();
    this.offset = offset;

    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.normal);
    this.object.quaternion.copy(q);
    this.object.position.copy(this.normal.clone().multiplyScalar(this.offset));

    if (showGrid) {
      const grid = new THREE.GridHelper(size, gridDivisions, gridColorCenterLine, gridColor);
      this.object.add(grid);
    }

    this.surface = new Surface3D({
      fn: (u, v) => [(u - 0.5) * size, 0, (v - 0.5) * size],
      segmentsU: segments,
      segmentsV: segments,
      color,
      opacity,
      wireframe,
      side: THREE.DoubleSide,
    });
    this.object.add(this.surface.object);
  }

  public setNormal(normal: THREE.Vector3) {
    this.normal.copy(normal);
    if (this.normal.lengthSq() === 0) this.normal.set(0, 1, 0);
    this.normal.normalize();

    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.normal);
    this.object.quaternion.copy(q);
    this.object.position.copy(this.normal.clone().multiplyScalar(this.offset));
  }

  public setOffset(offset: number) {
    this.offset = offset;
    this.object.position.copy(this.normal.clone().multiplyScalar(this.offset));
  }

  public setOpacity(opacity: number) {
    this.surface.setOpacity(opacity);
  }

  public setColor(color: THREE.ColorRepresentation) {
    this.surface.setColor(color);
  }
}

export function makePlane3D(options: Plane3DOptions = {}) {
  return new Plane3D(options);
}
