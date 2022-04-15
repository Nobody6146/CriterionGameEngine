class CameraSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let camera = this.getCamera();
        camera.camera.view = Matrix4f.viewMatrix(camera.transform.position, camera.transform.scale);
    }

    getCamera(){
        return CriterionBlueprint.blueprints(this.scene, CameraBluePrint)[0];
    }
}

class SpriteRendererSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let shader = this.scene.engine.resourceManager.get(RenderableSpriteShader);
        shader.run(this.scene);
    }
}