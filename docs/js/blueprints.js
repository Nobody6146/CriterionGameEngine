class RenderableSpriteBlueprint extends CriterionBlueprint {
    //Required components
    transform;
    mesh;
    sprite;
    renderer;
    //optional components
    animator;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent];
    }
    transformedVertices() {
        let results = [];
        let transformation = this.transform.transformation;
        for (let vertex of this.mesh.vertices) {
            results.push(vertex.transform(transformation));
        }
        return results;
    }
    transformedTextureCoordinates() {
        let results = [];
        let frame = this.sprite.frameCoordinates;
        let frameSize = new Vector2f([frame.end.x - frame.start.x, frame.end.y - frame.start.y]);
        for (let coordinate of this.mesh.textureCoordinates) {
            results.push(new Vector2f([frame.start.x + frameSize.x * coordinate.x, frame.start.y + frameSize.y * coordinate.y]));
        }
        return results;
    }
}
class RenderableTextBlueprint extends CriterionBlueprint {
    //Required components
    transform;
    mesh;
    text;
    font;
    renderer;
    //optional components
    animator;
    constructor(entity) {
        super(entity);
    }
    #intialize(engine) {
        this.renderer.layer = 2;
        this.font.fontStyle = engine.resourceManager.get(FontStyle, "monospaced");
        return this;
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, TextComponent, FontComponent, RendererComponent];
    }
    static create(scene) {
        return RenderableTextBlueprint.createEntity(scene, RenderableTextBlueprint).#intialize(scene.engine);
    }
}
class PlayerBlueprint extends RenderableSpriteBlueprint {
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return super.requiredComponents().concat([AnimatorComponent]);
    }
    #intialize(engine) {
        this.transform.scale.array.set([.5, .5, .5]);
        let mesh = engine.resourceManager.get(Mesh, "player");
        this.mesh.set(mesh);
        this.renderer.layer = 1;
        this.sprite.setSpriteSheet(engine.resourceManager.get(SpriteSheet, "player"));
        return this;
    }
    static create(scene) {
        return PlayerBlueprint.createEntity(scene, PlayerBlueprint).#intialize(scene.engine);
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
        let resolution = this.entity.scene.engine.window.renderResolution;
        this.camera.projection = Matrix4f.orthographic(0, resolution.width, resolution.height, 0, -1, 1);
        return this;
    }
    requiredComponents() {
        return [TransformComponent, CameraComponent];
    }
    static create(scene) {
        return CriterionBlueprint.createEntity(scene, CameraBluePrint).#initialize();
    }
}
