import { CannonJSPlugin, Engine, IPhysicsEnginePlugin, Mesh, Node, Scene, Vector3 } from "babylonjs";
import TestController from "../controllers/TestController";
import Player from "../objects/Player";
import * as CANNON from "cannon";
import EntityObject from "../objects/EntityObject";
import { TIME_STEP_, engine } from "../globals";
import Debug from "../objects/Debug";
export default class BaseScene extends Scene {
  pass: number = 1;
  physEngine: IPhysicsEnginePlugin = undefined;
  gravityMagnitude: number = undefined;
  //entity objects with compund meshes
  entityObjects: Map<string, EntityObject> = new Map();
  gravityPts: Vector3[];
  debug: Debug;
  constructor(gravity: number) {
    super(engine);
    this.physicsEnabled = false;
    this.gravityMagnitude = gravity;
    this.debug = new Debug();
  }
  addPhysics() {
    this.physEngine = new CannonJSPlugin(true, 10, CANNON);
    this.physicsEnabled = true;
    this.physEngine.setTimeStep(TIME_STEP_);
    this.enablePhysics(Vector3.Zero(), this.physEngine);
  }
}
