class PlayerBlueprint extends CriterionBlueprint {
    transform;
    renderer;
    constructor(entity) {
        super(entity);
    }
    #intialize(verticeCount) {
        this.transform.position.x = .5;
        this.transform.position.y = .5;
        this.transform.scale.array.set([.5, .5, .5]);
        this.renderer.vao = this.entity.scene.engine.resourceManager.get("player", WebGLVertexArrayObject);
        this.renderer.verticesCount = verticeCount;
        this.renderer.color.array.set([0, 1, 0, 1]);
        return this;
    }
    requiredComponents() {
        return [TransformComponent, RendererComponent];
    }
    static create(scene, verticeCount) {
        return PlayerBlueprint.createEntity(scene, PlayerBlueprint).#intialize(verticeCount);
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
class RenderableSpriteBlueprint extends CriterionBlueprint {
    transform;
    mesh;
    sprite;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, SpriteComponent];
    }
}
