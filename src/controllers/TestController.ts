import { GRAVITY, canvas } from "../globals";
import BaseScene from "../scenes/BaseScene";
import { Controller } from "./Controller";
import { Scene, IPhysicsEnginePlugin, Vector3, KeyboardInfo, Vector2, Quaternion } from "babylonjs";
export default class TestController extends Controller {
  mousePos: Vector2 = Vector2.Zero();
  constructor(scene: Scene) {
    super(scene, [
      " "
    ]);
    this.command.test = true;
  }
  //https://www.babylonjs-playground.com/#3EDS3A#96
  managePointerLock() {
    // Pointer lock
    let isLocked = false;
    this.scene.onPointerDown = (evt) => {
      if (!isLocked) {
        this.mousePos = new Vector2(evt.x, evt.y);

        canvas.requestPointerLock =
          canvas.requestPointerLock ||
          canvas.msRequestPointerLock ||
          canvas.mozRequestPointerLock ||
          canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
          canvas.requestPointerLock();
          return;
        }
      }
    };

    const pointerlockchange = () => {
      // @ts-ignore
      const controlEnabled =
        document.mozPointerLockElement ||
        document.webkitPointerLockElement ||
        document.msPointerLockElement ||
        document.pointerLockElement ||
        null;
      if (!controlEnabled) {
        isLocked = false;
      } else {
        isLocked = true;
      }
    };
    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mspointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener(
      "webkitpointerlockchange",
      pointerlockchange,
      false
    );
  }

  addCameraControls() {
    canvas.addEventListener("mousemove", (event: MouseEvent) => {
      const currMousePos = new Vector2(event.x, event.y);
      const deltaMousePos = currMousePos.subtract(this.mousePos);
    })
  }

  listenInput(inputMap: object) {
    if (inputMap["w"]) {
      this.command.displacement.addInPlace(Vector3.Forward());
    }
    if (inputMap["a"]) {
      this.command.displacement.addInPlace(Vector3.Left());
    }
    if (inputMap["s"]) {
      this.command.displacement.addInPlace(Vector3.Backward());
    }
    if (inputMap["d"]) {
      this.command.displacement.addInPlace(Vector3.Right());
    }
    if (inputMap[" "]) {
      this.command.displacement.addInPlace(Vector3.Up());
    }
    if (inputMap["AltGraph"]) {
      this.command.displacement.addInPlace(Vector3.Down());
    }
    if (inputMap["g"]) {
      this.entityObject.calcGravity_ = !this.entityObject.calcGravity_;
    }
  };
}
