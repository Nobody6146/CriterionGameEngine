class CameraSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let camera = this.getCamera();
        camera.camera.view = Matrix4f.viewMatrix(camera.transform.position, camera.transform.scale);
    }
    getCamera() {
        return CriterionBlueprint.blueprints(this.scene, CameraBluePrint)[0];
    }
}
class SpriteRendererSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let shader = this.scene.engine.resourceManager.get(RenderableSpriteShader);
        shader.run(this.scene);
    }
}
