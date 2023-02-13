import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  Color3,
  StandardMaterial,
  Ray,
  RayHelper,
  Quaternion,
} from "babylonjs";
import EntityObject, { EntityObjectOptions } from "./EntityObject";
import Player from "./Player";
import Debug from "./Debug";

export class Collider extends EntityObject {
  obj: EntityObject;
  //4 Physics
  collided: boolean = false;
  highlightColor: Color3;
  constructor(
    scene: Scene,
    highlightColor: Color3 = null,
    entityObjectOptions = new EntityObjectOptions()
  ) {
    super(scene, "collider", entityObjectOptions);
    this.highlightColor = highlightColor;
  }
  createMaterialIfNull() {
    if (this.mesh.material === undefined || this.mesh.material === null) {
      const colliderMat = new StandardMaterial(`MeshMaterial${EntityObject.index}`, this.scene);
      if (this.highlightColor === null) {
        colliderMat.alpha = 0;
      }
      else {
        colliderMat.diffuseColor = this.highlightColor;
        colliderMat.alpha = 0.1;
        colliderMat.wireframe = true;
      }
      this.mesh.material = colliderMat;
    }
  }
  setPosition() {
    this.mesh.position = this.position;
  }
  activate() {
    this.setPosition();
    this.createMaterialIfNull();
  }
  createMesh() { }
}

export class JumpCollider extends Collider {
  ray: Ray;
  rayHelper: RayHelper;
  height: number;
  onObject: boolean = false;
  static LAMBDA = 0.1;
  //
  debug = new Debug();

  constructor(
    scene: Scene,
    height: number,
    highlightColor: Color3 = null,
    entityObjectOptions = new EntityObjectOptions()
  ) {
    super(scene, highlightColor, entityObjectOptions);
    this.height = height;
  }

  addRayDown() {
    this.ray = new Ray();
    this.rayHelper = new RayHelper(this.ray);

    this.rayHelper.attachToMesh(
      this.obj.mesh,
      Vector3.Down(),
      Vector3.Zero(),
      (this.height / 2) + JumpCollider.LAMBDA
    );

    if (this.highlightColor !== null) {
      this.rayHelper.show(this.scene, this.highlightColor);
    }

    this.scene.onBeforeRenderObservable.add(() => {
      const pick = this.scene.pickWithRay(this.ray);
      if (pick) {
        this.onObject = pick.hit;
        console.log(`this.onObject: ${this.onObject}`);
      }
    });
  }
  createMesh() {
    this.addRayDown();
  }
}

export class BoxCollider extends JumpCollider {
  width: number;
  depth: number;

  constructor(
    scene: Scene,
    width: number,
    height: number,
    depth: number,
    highlightColor: Color3 = null,
    entityObjectOptions = new EntityObjectOptions()
  ) {
    super(scene, height, highlightColor, entityObjectOptions);

    this.width = width;
    this.depth = depth;
  }
  createMesh() {
    super.createMesh();
    this.mesh = MeshBuilder.CreateBox(this.name, {
      width: this.width,
      height: this.height,
      depth: this.depth
    });

    this.mesh.isPickable = false;
  }
}
