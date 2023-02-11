import { AssetsManager, Camera, ComputeBindingType, DynamicTexture, Engine, ISpriteJSONAtlas, Material, Matrix, Mesh, PhysicsImpostor, Quaternion, SpriteMap, StandardMaterial, TextFileAssetTask, Texture, Vector2 } from "babylonjs";
import { Scene, Vector3 } from "babylonjs";
import Player from "./Player";
import { BoxCollider, Collider, JumpCollider } from "./Collider";
import UFICamera from "./UFICamera";
import { FPS_COUNT_ } from "../globals";
import { UFICommand } from "../controllers/Controller";
import BaseScene from "../scenes/BaseScene";
import UFITimer from "../time/UFITimer";
import UFIAnimation from "../time/UFIAnimation";
// All EntityObject instances can move
export default class EntityObject {
  mesh: Mesh = undefined;
  compoundMesh: Mesh = undefined;
  cam: UFICamera = undefined;
  camMesh: Mesh = undefined;
  collider: Collider = undefined;
  texture: Texture = undefined;
  material: Material = undefined;
  spriteMap: SpriteMap = undefined;

  name: string;
  static index = 0;
  scene: Scene;
  //v is the unit up vector
  //frame times in seconds
  frameTime: number = undefined;
  prevFrameTime: number = undefined;
  //speed 
  speed: number = undefined;
  jumpSpeed: number = undefined;
  jumpCount: number = undefined;
  jumpsLeft: number = undefined;
  //
  position: Vector3 = undefined;
  negTarget: Vector3;
  up: Vector3;
  u: Vector3;
  v: Vector3;
  w: Vector3;
  //physics
  //https://grideasy.github.io/tutorials/Using_The_Physics_Engine#impostors
  static GROUND_HEIGHT: number = 0;
  calcGravity: boolean = true;
  gravity: Vector3 = undefined;
  supportsPhysics: boolean = false;
  //animation
  animations: Array<UFIAnimation> = [];
  constructor(
    scene: Scene,
    prefix: string,
    position: Vector3 = Vector3.Zero(),
    up: Vector3 = Vector3.Up(),
    negTarget: Vector3 = Vector3.Forward()
  ) {
    this.scene = scene;
    (<BaseScene>this.scene).entityObjects.push(this);
    this.name = `${prefix}${++EntityObject.index}`;
    this.position = position;
    this.up = up;
    this.negTarget = negTarget;
  }
  createCompundMesh() {
    this.compoundMesh = new Mesh(`compoundMesh${EntityObject.index}`, this.scene);
    this.compoundMesh.position = this.position;
    this.compoundMesh.addChild(this.mesh);
    this.mesh.position = Vector3.Zero();
    // this.mesh.rotationQuaternion = Quaternion.Identity();
  }
  setCamera(camera: UFICamera) {
    this.cam = camera;
    this.cam.obj = this;
    this.camMesh = new Mesh(`camMesh${EntityObject.index}`, this.scene);
    this.compoundMesh.addChild(this.camMesh);
    this.camMesh.position = Vector3.Zero();
    // this.camMesh.rotationQuaternion = Quaternion.Identity();
    this.cam.camObj.lockedTarget = this.camMesh;
    //this.cam.camObj.updateUpVectorFromRotation = true;
  }
  setDynamicTexture(
    width: number = 64,
    height: number = width,
    generateMipMaps: boolean = true,
    samplingMode: number = Texture.NEAREST_NEAREST
  ) {
    this.material = new StandardMaterial(
      `${this.name}Material`,
      this.scene
    );

    this.texture = new DynamicTexture(
      `${this.name}Texture`,
      { width: width, height: height },
      this.scene,
      generateMipMaps,
      samplingMode
    );
    const stdMat = <StandardMaterial>this.material;
    stdMat.diffuseTexture = this.texture;
    stdMat.diffuseTexture.hasAlpha = true;
    // stdMat.backFaceCulling = true;
    this.mesh.material = stdMat;
  }
  drawDynamicTexture(url: string) {
    // console.log(url);
    const dynamicTexture = <DynamicTexture>this.texture

    var ctx = dynamicTexture.getContext();
    var img = new Image();
    img.src = url;
    // console.log(img, url);
    const self = this;
    img.onload = function () {
      const txtSize = self.texture.getSize()
      ctx.clearRect(0, 0, txtSize.width, txtSize.height);
      ctx.drawImage(this, 0, 0);
      dynamicTexture.update();
    }
  }
  setCollider(collider: Collider, isFacingCamera: boolean = true) {
    this.collider = collider;
    this.collider.obj = this;
    this.collider.createMesh();
    if (this.collider.mesh !== undefined) {
      this.compoundMesh.addChild(this.collider.mesh);
      if (isFacingCamera) {
        this.compoundMesh.billboardMode = Mesh.BILLBOARDMODE_ALL;
      }
      this.collider.activate();
    }
  }
  addAnimation(animation: UFIAnimation | object) {
    if (animation instanceof (UFIAnimation)) {
      animation.obj = this;
      this.animations.push(animation);
    }
    else if (animation instanceof (Array)) {
      for (const anim of animation) {
        anim.obj = this;
      }
      this.animations = animation;
    }
  }
  stopAllAnimationsExcept(anim: UFIAnimation) {
    for (const animation of this.animations) {
      this.startIfEqual(anim, animation);
    }
  }
  startIfEqual(anim1: UFIAnimation, anim2: UFIAnimation) {
    if (anim1 === anim2) {
      anim2.start()
    }
    else {
      anim2.stop()
    }
  }
  addPhysics(
    mass: number = 0,
    restitution: number = 0,
    friction: number = 0,
    impostorType: number = PhysicsImpostor.BoxImpostor
  ) {
    this.mesh.physicsImpostor = new PhysicsImpostor(
      this.mesh,
      impostorType,
      { mass: 0, restitution: 0 }
    );
    if (this.collider !== undefined && this.collider.mesh !== undefined) {
      this.collider.mesh.physicsImpostor = new PhysicsImpostor(
        this.collider.mesh,
        impostorType,
        { mass: 0, restitution: 0 }
      );
    }
    this.compoundMesh.physicsImpostor = new PhysicsImpostor(
      this.compoundMesh,
      impostorType,
      { mass: mass, restitution: restitution, friction: friction }
    );
    //this removes the shaky behavior
    this.compoundMesh.physicsImpostor.physicsBody.angularDamping = 1;
  }
  calcBackwardVector(projectOrthogonal: boolean = false) {
    const resVec: Vector3 = this.negTarget.subtract(this.compoundMesh.position);
    // if (projectOrthogonal) {
    //   const costheta: number = Vector3.Dot(resVec, this.v);
    //   resVec.subtractInPlace(
    //     this.v.multiplyByFloats(
    //       costheta,
    //       costheta,
    //       costheta
    //     )
    //   );
    // }
    return resVec.normalize();
  }
  calcRightVector(): Vector3 {
    return Vector3.Cross(this.v, this.w);
  }
  calcAnOrthogonal(forwardVector: Vector3) {
    const resVec: Vector3 = Vector3.Zero(),
      unitResVec: Vector3 = Vector3.Zero();
    resVec.x = forwardVector.z;
    resVec.y = 0;
    resVec.z = -forwardVector.x;
    resVec.normalizeToRef(unitResVec);
    return unitResVec;
  }
  calcAxesRef() {
    this.v = this.calcUpVector()
    this.w = this.calcBackwardVector();
    this.u = this.calcRightVector();
  }
  calcVelocityOnUWPlane(displacement: Vector3) {
    const directionLeft: Vector3 = this.u.multiplyByFloats(
      displacement.x,
      displacement.x,
      displacement.x
    );
    const directionBackward: Vector3 = this.w.multiplyByFloats(
      displacement.z,
      displacement.z,
      displacement.z
    );
    return directionLeft.add(directionBackward).negate().normalize().multiplyByFloats(
      this.speed,
      this.speed,
      this.speed
    );
  }
  calcVelocityOnV(displacement: Vector3) {
    const directionUp: Vector3 = this.v.multiplyByFloats(
      displacement.y,
      displacement.y,
      displacement.y
    )
    return directionUp.multiplyByFloats(
      this.jumpSpeed,
      this.jumpSpeed,
      this.jumpSpeed
    )
  }
  setPosition() {
    this.position = this.compoundMesh.position;
  }
  setNegTarget() {
    this.negTarget = Vector3.Zero();
    this.negTarget.copyFrom(this.cam.camObj.position);
  }
  calcUpVector() {
    return (!this.scene.physicsEnabled || (<BaseScene>this.scene).gravityMagnitude === 0) ? this.up : this.gravity.negate().normalize();
  }
  once: boolean = true;
  once2: boolean = true;
  update() {
    this.setPosition();
    this.setNegTarget();
    this.calcAxesRef();
    if (this.once) {
      console.log(`u:${this.u}`);
      console.log(`v:${this.v}`);
      console.log(`w:${this.w}`);
      this.once = false;
    }
    this.align();
  }
  align() {
    this.cam.camObj.upVector = this.v;
    // this.compoundMesh.rotationQuaternion = this.alignMatrix();
  }
  alignMatrix() {
    const target = this.position.multiplyByFloats(2, 2, 2).subtract(this.negTarget);

    return Quaternion.FromRotationMatrix(
      Matrix.LookAtRH(this.position, this.negTarget, this.v)
    );
  }
  alignAndMove(command: UFICommand) {
    this.update();
    this.move(command);
  }
  move(command: UFICommand) {
    const velocityOnUWPlane = this.calcVelocityOnUWPlane(command.displacement);
    const velocityOnV = this.calcVelocityOnV(command.displacement);

    if (!this.scene.physicsEnabled) {
      throw Error("Physics are not enabled.")
    }

    const jumpCollider: JumpCollider = <JumpCollider>this.collider;
    if (jumpCollider === undefined) {
      throw Error("jumpCollider is undefined");
    }
    if (jumpCollider.onObject || (command.test && (<BaseScene>this.scene).gravityMagnitude === 0)) {
      this.jumpsLeft = this.jumpCount;
    }
    if (this.jumpsLeft > 0 && command.displacement.y !== 0) {
      --this.jumpsLeft;
      this.compoundMesh.physicsImpostor.wakeUp();
      this.compoundMesh.physicsImpostor.setLinearVelocity(velocityOnV);
      jumpCollider.onObject = false;
    }
    else if (command.displacement.x !== 0 || command.displacement.z !== 0) {
      this.compoundMesh.physicsImpostor.wakeUp();
      const currVelocity = this.compoundMesh.physicsImpostor.getLinearVelocity();
      currVelocity.x = 0;
      currVelocity.z = 0;
      this.compoundMesh.physicsImpostor.setLinearVelocity(velocityOnUWPlane.add(currVelocity));
    }
    else {
      if (jumpCollider.onObject || (command.test && (<BaseScene>this.scene).gravityMagnitude === 0)) {
        this.compoundMesh.physicsImpostor.sleep();
      }
      else if (command.test && (<BaseScene>this.scene).gravityMagnitude !== 0) {
        this.compoundMesh.physicsImpostor.wakeUp();
      }
      const currVelocity = this.compoundMesh.physicsImpostor.getLinearVelocity();
      currVelocity.x = 0;
      currVelocity.z = 0;
      this.compoundMesh.physicsImpostor.setLinearVelocity(currVelocity);
    }

  }
}