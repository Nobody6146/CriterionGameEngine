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
        //Animate sprite
        let sprites = this.#getSpriteBlueprints();
        for (let sprite of sprites) {
            if (sprite.animator?.playing === true)
                sprite.sprite.setCurrentFrame(sprite.animator.currentFrame);
        }
        //Render sprites to screen
        let shader = this.scene.engine.resourceManager.get(RenderableSpriteShader);
        shader.run(this.scene);
    }
    #getSpriteBlueprints() {
        return CriterionBlueprint.blueprints(this.scene, RenderableSpriteBlueprint);
    }
}
class AnimatorSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let entities = this.#getAnimators();
        for (let entity of entities) {
            let animator = entity.get(AnimatorComponent);
            animator.update(deltaTime, entity);
        }
    }
    #getAnimators() {
        return this.scene.entities(AnimatorComponent);
    }
}
