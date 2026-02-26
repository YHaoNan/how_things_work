import * as THREE from 'three';
import {Curve3D} from './Curve3D';

export interface Line3DOptions {
  start?: THREE.Vector3;
  end?: THREE.Vector3;
  color?: THREE.ColorRepresentation;
  opacity?: number;
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
}

export class Line3D {
  public readonly object: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial | THREE.LineDashedMaterial>;

  private readonly curve: Curve3D;
  private start: THREE.Vector3;
  private end: THREE.Vector3;

  constructor(options: Line3DOptions = {}) {
    const {
      start = new THREE.Vector3(0, 0, 0),
      end = new THREE.Vector3(1, 0, 0),
      color = 0xffffff,
      opacity = 1,
      dashed = false,
      dashSize = 0.2,
      gapSize = 0.15,
    } = options;

    this.start = start.clone();
    this.end = end.clone();
    this.curve = new Curve3D({
      fn: (t) => this.start.clone().lerp(this.end, t),
      segments: 1,
      color,
      opacity,
      dashed,
      dashSize,
      gapSize,
    });
    this.object = this.curve.object;
  }

  public setStartEnd(start: THREE.Vector3, end: THREE.Vector3) {
    this.start.copy(start);
    this.end.copy(end);
    this.curve.update();
  }

  public setColor(color: THREE.ColorRepresentation) {
    this.curve.setColor(color);
  }

  public setOpacity(opacity: number) {
    this.curve.setOpacity(opacity);
  }
}

export function makeLine3D(options: Line3DOptions = {}) {
  return new Line3D(options);
}
