import { Color3, Engine, HemisphericLight, Mesh, MeshBuilder, Node, PhysicsImpostor, Vector3 } from "babylonjs";
import { UFIPlane } from "../objects/UFIPlane";

import BaseScene from "./BaseScene";

import { BoxCollider, JumpCollider } from "../objects/Collider";
import UFICamera from "../objects/UFICamera";
import Player from "../objects/Player";
import { Controller } from "../controllers/Controller";
import PlayerController from "../controllers/PlayerController";
import {
  GRAVITY,
  PLAYER_IDLE,
  canvas,
} from "../globals";
import UFIAnimation from "../time/UFIAnimation";
import AnimatedController from "../controllers/AnimatedController";
import TestController from "../controllers/TestController";
import UFISphere from "../objects/UFISphere";
import EntityObject, { EntityObjectOptions } from "../objects/EntityObject";

export default class TestScene2 extends BaseScene {
  player: Player;
  controller: Controller;
  constructor() {
    super();
    this.addPhysics(GRAVITY);

    //CREATE OBJECTS
    let ball = new UFISphere(this, 100, 0);
    this.gravityPts = [
      ball.position
    ];

    this.player = new Player(this, { width: 1, height: 1 },
      new EntityObjectOptions(
        new Vector3(60, 0, 0),
        Vector3.Left()
      )
    );

    let dummy = new UFIPlane(this, { width: 6, height: 8 },
      {
        position: new Vector3(60, 10, 0),
        up: Vector3.Left(),
        negTarget: this.player.position
      }
    );

    console.log(`this.player.compoundMesh.position:${this.player.compoundMesh.position}`);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light", new Vector3(0, 1, 0), this);

    let camera = new UFICamera(this, canvas, this.player.compoundMesh.position);

    this.player.setCamera(camera);
    this.player.setDynamicTexture();


    this.player.setCollider(
      // new JumpCollider(
      //   this,
      //   this.player.height,
      //   Color3.Blue()
      // )
      new BoxCollider(
        this,
        this.player.width,
        this.player.height,
        .5,
        Color3.Blue()
      )
    );
    //GRAVITATIONAL PTS

    //ENABLE PHYSICS
    this.player.addPhysics(1);
    dummy.addPhysics(1);
    ball.addPhysics(0, 0, 0, PhysicsImpostor.SphereImpostor);
    //CONTROLLER
    this.controller = new TestController(this);

    this.player.drawDynamicTexture(PLAYER_IDLE);
    // this.controller = new PlayerController(this, canvas);
    // this.controller = new AnimatedController(
    //   this,
    //   canvas,
    //   [PLAYER_IDLE],
    //   [
    //     PLAYER_WALKING_F1,
    //     PLAYER_WALKING_F2
    //   ],
    //   [
    //     PLAYER_WALKING_B1,
    //     PLAYER_WALKING_B2
    //   ],
    //   [
    //     PLAYER_WALKING_L1,
    //     PLAYER_WALKING_L2
    //   ],
    //   [
    //     PLAYER_WALKING_R1,
    //     PLAYER_WALKING_R2
    //   ]
    // );
    // const controller = (<AnimatedController>this.controller);
    // this.player.addAnimation([
    //   controller.idleAnim,
    //   controller.walkingFAnim,
    //   controller.walkingBAnim,
    //   controller.walkingLAnim,
    //   controller.walkingRAnim
    // ]);

    this.player.addController(this.controller);
    // console.log(walkingAnim.obj);
  }
}
