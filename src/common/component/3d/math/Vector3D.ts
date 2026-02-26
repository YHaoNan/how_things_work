import * as THREE from 'three';

export interface Vector3DOptions {
  from?: THREE.Vector3;
  to?: THREE.Vector3;
  color?: THREE.ColorRepresentation;
  headLength?: number;
  headRadius?: number;
  shaftRadius?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  showTail?: boolean;
  tailRadius?: number;
}

export class Vector3D {
  public readonly object: THREE.Group;
  public readonly shaft: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
  public readonly head: THREE.Mesh<THREE.ConeGeometry, THREE.MeshStandardMaterial>;
  public readonly tail?: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;

  private readonly from: THREE.Vector3;
  private readonly to: THREE.Vector3;
  private headLength?: number;
  private headRadius?: number;
  private shaftRadius?: number;
  private tailRadius?: number;
  private length: number;
  private readonly color: THREE.Color;
  private readonly emissive: THREE.Color;
  private emissiveIntensity: number;
  private readonly material: THREE.MeshStandardMaterial;

  constructor(options: Vector3DOptions = {}) {
    const {
      from = new THREE.Vector3(0, 0, 0),
      to = new THREE.Vector3(1, 0, 0),
      color = 0xffffff,
      emissive = color,
      emissiveIntensity = 0.75,
      headLength,
      headRadius,
      shaftRadius,
      showTail = true,
      tailRadius,
    } = options;

    this.headLength = headLength;
    this.headRadius = headRadius;
    this.shaftRadius = shaftRadius;
    this.tailRadius = tailRadius;
    this.color = new THREE.Color(color);
    this.emissive = new THREE.Color(emissive);
    this.emissiveIntensity = emissiveIntensity;
    this.from = from.clone();
    this.to = to.clone();

    const dir = to.clone().sub(from);
    const len = dir.length();
    this.length = len;

    const resolvedHeadLength = this.headLength ?? Math.max(0.09, len * 0.11);
    const resolvedHeadRadius = this.headRadius ?? Math.max(0.035, resolvedHeadLength * 0.28);
    const resolvedShaftRadius = this.shaftRadius ?? Math.max(0.012, resolvedHeadRadius * 0.22);
    const resolvedTailRadius = this.tailRadius ?? Math.max(0.02, resolvedShaftRadius * 1.2);

    this.object = new THREE.Group();

    this.material = new THREE.MeshStandardMaterial({
      color: this.color,
      emissive: this.emissive,
      emissiveIntensity: this.emissiveIntensity,
      metalness: 0.1,
      roughness: 0.35,
    });

    this.shaft = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 16), this.material);
    this.head = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 20), this.material);

    this.object.add(this.shaft);
    this.object.add(this.head);

    if (showTail) {
      this.tail = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), this.material);
      this.object.add(this.tail);
      this.tail.scale.set(resolvedTailRadius, resolvedTailRadius, resolvedTailRadius);
    }

    this.shaft.scale.set(resolvedShaftRadius, 0.0001, resolvedShaftRadius);
    this.head.scale.set(resolvedHeadRadius, resolvedHeadLength, resolvedHeadRadius);

    this.setFromTo(from, to);
  }

  public setFromTo(from: THREE.Vector3, to: THREE.Vector3) {
    this.from.copy(from);
    this.to.copy(to);

    const dir = to.clone().sub(from);
    const len = dir.length();
    this.length = len;

    const resolvedHeadLength = this.headLength ?? Math.max(0.09, len * 0.11);
    const resolvedHeadRadius = this.headRadius ?? Math.max(0.035, resolvedHeadLength * 0.28);
    const resolvedShaftRadius = this.shaftRadius ?? Math.max(0.012, resolvedHeadRadius * 0.22);
    const resolvedTailRadius = this.tailRadius ?? Math.max(0.02, resolvedShaftRadius * 1.2);

    const headLen = Math.min(resolvedHeadLength, len);
    const shaftLen = Math.max(0, len - headLen);

    const safeDir = len > 0 ? dir.clone().divideScalar(len) : new THREE.Vector3(1, 0, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), safeDir);

    this.object.position.copy(from);
    this.object.quaternion.copy(q);

    this.shaft.visible = shaftLen > 1e-4;
    this.head.visible = headLen > 1e-4;

    this.shaft.scale.set(resolvedShaftRadius, Math.max(shaftLen, 1e-4), resolvedShaftRadius);
    this.shaft.position.set(0, shaftLen / 2, 0);

    this.head.scale.set(resolvedHeadRadius, Math.max(headLen, 1e-4), resolvedHeadRadius);
    this.head.position.set(0, shaftLen + headLen / 2, 0);

    if (this.tail) {
      this.tail.visible = true;
      this.tail.scale.set(resolvedTailRadius, resolvedTailRadius, resolvedTailRadius);
      this.tail.position.set(0, 0, 0);
    }
  }

  public setColor(color: THREE.ColorRepresentation) {
    this.color.set(color);
    this.material.color.copy(this.color);
  }

  public setEmissive(color: THREE.ColorRepresentation, intensity?: number) {
    this.emissive.set(color);
    this.material.emissive.copy(this.emissive);
    if (intensity !== undefined) {
      this.emissiveIntensity = intensity;
      this.material.emissiveIntensity = intensity;
    }
  }

  public setHeadSize(headLength: number, headRadius?: number) {
    this.headLength = headLength;
    this.headRadius = headRadius;
    this.setFromTo(this.from, this.to);
  }

  public setShaftRadius(shaftRadius: number) {
    this.shaftRadius = shaftRadius;
    this.setFromTo(this.from, this.to);
  }
}
