import { Vector3, Scene, ActionManager, ExecuteCodeAction, IPhysicsEnginePlugin, KeyboardInfo } from "babylonjs";
export class UFICommand {
  displacement: Vector3 = Vector3.Zero();
  test: boolean = false;
}
import Player from "../objects/Player";
import BaseScene from "../scenes/BaseScene";
export abstract class Controller {

  command: UFICommand;
  entityObject: Player;
  inputMapQueue: Array<object> = [{}, {}];
  singleTypeKeys: Array<string>
  scene: Scene;

  constructor(scene: Scene, singleTypeKeys: Array<string>) {
    this.scene = scene;
    this.command = new UFICommand();
    this.singleTypeKeys = singleTypeKeys;
    scene.actionManager = new ActionManager(scene);

    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {

        const srcEvt = evt.sourceEvent;
        const key = srcEvt.key;

        const inputMapOld = this.inputMapQueue.pop();
        const inputMap = structuredClone(this.inputMapQueue[0]);

        // if (this.singleTypeKeys.indexOf(key) !== -1) {
        //   inputMap[key] = false;
        //   if (inputMap[key] === undefined && inputMapOld[key] === undefined) {
        //     inputMap[key] = true;
        //     console.log(inputMap);
        //   }
        // }
        // else {
        //   inputMap[key] = srcEvt.type === "keydown";
        // }
        inputMap[key] = true;

        this.inputMapQueue.unshift(inputMap);
      })
    );
    scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
        // console.log(`evt.sourceEvent.type: ${evt.sourceEvent.type}`);
        this.inputMapQueue.pop();
        const inputMap = structuredClone(this.inputMapQueue[0]);

        inputMap[evt.sourceEvent.key] = false;
        // inputMap[evt.sourceEvent.key] = evt.sourceEvent.type === "keydown";
        this.inputMapQueue.unshift(inputMap);
      })
    );
    //https://www.sitepoint.com/community/t/disable-different-keyboard-short-cuts-and-clicks-using-javascript-and-jquery/277794/3
    //Disable the context menu
    // document.addEventListener('contextmenu', event => {
    //   event.preventDefault();
    // })
    // //Disable essential hotkeys (ctrl+qcvxswpuaz)
    // document.body.addEventListener('keydown', event => {
    //   console.log(event.key, event.ctrlKey);
    //   if (event.ctrlKey && 'qcvxswpuaz'.indexOf(event.key) !== -1) {
    //     event.preventDefault();
    //     event.stopPropagation();
    //   }
    // })
  }
  listen() {
    const inputMap = this.inputMapQueue[0];
    this.command.displacement = Vector3.Zero();
    this.listenInput(inputMap);
    this.inputMapQueue.unshift(inputMap);
  }
  // children should implement these
  setNegTarget() { }
  calcUpVector() { }
  listenInput(inputMap: object) { }
  addCameraControls() { }
}
