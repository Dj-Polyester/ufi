import { CannonJSPlugin, Engine, IPhysicsEnginePlugin, Mesh, Node, Scene, Vector3 } from "babylonjs";
import TestController from "../controllers/TestController";
import Player from "../objects/Player";
import * as CANNON from "cannon";
import EntityObject from "../objects/EntityObject";
import { TIME_STEP_, engine } from "../globals";
export default class BaseScene extends Scene {
  pass: number = 1;
  physEngine: IPhysicsEnginePlugin = undefined;
  gravityMagnitude: number = undefined;
  entityObjects: EntityObject[] = [];
  gravityPts: Vector3[];

  constructor() {
    super(engine);
    this.physicsEnabled = false;
  }
  addPhysics(gravity: number) {
    console.log(`GRAVITY: ${gravity}`);
    this.physEngine = new CannonJSPlugin(true, 10, CANNON);
    this.physicsEnabled = true;
    this.physEngine.setTimeStep(TIME_STEP_);
    this.gravityMagnitude = gravity;
    this.enablePhysics(Vector3.Zero(), this.physEngine);
  }
}
