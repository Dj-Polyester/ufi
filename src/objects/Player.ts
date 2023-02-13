import {
  ArcRotateCamera,
  Vector3,
  Scene,
  Tools,
  Ray,
  RayHelper,
} from "babylonjs";
import { Controller, UFICommand } from "../controllers/Controller";
import PlayerController from "../controllers/PlayerController";
import { UFIPlane, UFIPlaneOptions } from "./UFIPlane";
import { EntityObjectOptions } from "./EntityObject";

export default class Player extends UFIPlane {
  constructor(
    scene: Scene,
    options: UFIPlaneOptions = { width: 1, height: 1 },
    entityObjectOptions = new EntityObjectOptions(),
    speed: number = 10,
    jumpSpeed: number = speed,
    jumpCount: number = 2
  ) {
    super(scene, options, entityObjectOptions);
    // console.log(`url: ${url}`);
    //units per second
    this.speed = speed;
    this.jumpSpeed = jumpSpeed;
    this.jumpCount = jumpCount;
    this.mesh.isPickable = false;
  }
  addController(controller: Controller) {
    this.controller = controller;
    controller.entityObject = this;
    const playerController = <PlayerController>controller;
    if (
      playerController.managePointerLock !== undefined &&
      playerController.managePointerLock !== null
    ) {
      playerController.managePointerLock();
    }
  }
}
