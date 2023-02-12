import { Scene, MeshBuilder, Vector3 } from "babylonjs";
import EntityObject, { EntityObjectOptions } from "./EntityObject";
export default class UFISphere extends EntityObject {
    scene: Scene;
    diameter: number;
    segments: number;

    constructor(
        scene: Scene,
        diameter: number = undefined,
        segments: number = undefined,
        entityObjectOptions = new EntityObjectOptions()
    ) {
        super(scene, "sphere", entityObjectOptions);
        this.diameter = diameter;
        this.segments = segments;
        this.createMesh();
    }
    createMesh() {
        this.mesh = MeshBuilder.CreateSphere(
            this.name,
            { diameter: this.diameter, segments: this.segments },
            this.scene
        );

        this.createCompundMesh();
    }
}
