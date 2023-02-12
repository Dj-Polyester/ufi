import { MeshBuilder, Vector3, Scene, Mesh } from "babylonjs";

import EntityObject, { EntityObjectOptions } from "./EntityObject";

export interface UFIPlaneOptions {
  width: number;
  height: number;
}

export class UFIPlane extends EntityObject {
  scene: Scene;
  width: number;
  height: number;

  constructor(
    scene: Scene,
    options: UFIPlaneOptions,
    entityObjectOptions = new EntityObjectOptions(),
  ) {
    super(scene, "plane", entityObjectOptions);
    this.width = options.width;
    this.height = options.height;
    this.createMesh();
  }
  createMesh() {
    this.mesh = MeshBuilder.CreatePlane(this.name, {
      width: this.width,
      height: this.height
    });

    this.createCompundMesh();
  }
}
