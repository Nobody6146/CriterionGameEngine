class RenderableSpriteBlueprint extends CriterionBlueprint {
    transform;
    mesh;
    sprite;
    renderer;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent];
    }
}
class PlayerBlueprint extends RenderableSpriteBlueprint {
    constructor(entity) {
        super(entity);
    }
    #intialize() {
        this.transform.scale.array.set([.5, .5, .5]);
        this.mesh.set("player");
        this.renderer.layer = 1;
        this.sprite.setTexture("player");
        return this;
    }
    static create(scene) {
        return PlayerBlueprint.createEntity(scene, PlayerBlueprint).#intialize();
    }
}
class CameraBluePrint extends CriterionBlueprint {
    transform;
    camera;
    constructor(entity) {
        super(entity);
    }
    #initialize() {
        this.transform.scale.y = -1;
        this.camera.projection = Matrix4f.orthographic(0, 1, 1, 0, -1, 1);
        return this;
    }
    requiredComponents() {
        return [TransformComponent, CameraComponent];
    }
    static create(scene) {
        return CriterionBlueprint.createEntity(scene, CameraBluePrint).#initialize();
    }
}
