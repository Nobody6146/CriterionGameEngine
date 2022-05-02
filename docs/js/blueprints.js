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
        this.renderer.layer = RenderLayers.UI;
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
class CameraBlueprint extends CriterionBlueprint {
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
        return CriterionBlueprint.createEntity(scene, CameraBlueprint).#initialize();
    }
}
class UnitBlueprint extends CriterionBlueprint {
    transform;
    mesh;
    sprite;
    renderer;
    //optional components
    animator;
    selector;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent, AnimatorComponent, SelectorComponent];
    }
    intialize(engine) {
        this.transform.scale.array.set([Tile.SIZE.width / 2, Tile.SIZE.height * 2, 1]);
        let mesh = engine.resourceManager.get(Mesh, ResourceNames.SQUARE);
        this.mesh.set(mesh);
        this.renderer.layer = RenderLayers.ENTITIES;
        //this.sprite.setSpriteSheet(engine.resourceManager.get(SpriteSheet, ResourceNames.Humann));
        this.sprite.color = new Vector4f([0, .5, .5, 1]);
        this.selector.highlight = (entity) => {
            let blueprint = new UnitBlueprint(entity).load();
            blueprint.sprite.color = new Vector4f([0, 1, 1, 1]);
            // entity.scene.system(BatchRendererSystem).renderBatcher.buffer({
            //     indicies: blueprint.mesh.indices,
            //     vertices: blueprint.mesh.vertices,
            //     textureCoordinates: blueprint.mesh.textureCoordinates,
            //     color: blueprint.col,
            //     texture: blueprint.font.fontStyle.texture,
            //     layer: blueprint.renderer.layer,
            // });
        };
        this.selector.unhighlight = (entity) => {
            let blueprint = new UnitBlueprint(entity).load();
            blueprint.sprite.color = new Vector4f([0, .5, .5, 1]);
        };
        this.selector.select = (entity) => {
            console.log("Clicked: " + entity.id);
        };
        return this;
    }
    static create(scene) {
        return UnitBlueprint.createEntity(scene, UnitBlueprint).intialize(scene.engine);
    }
    getScreenPosition(tilePosition) {
        return Tile.getEntityPosition(tilePosition, this.transform.scale);
    }
    moveToTile(tilePosition) {
        let position = this.getScreenPosition(tilePosition);
        this.transform.position.x = position.x;
        this.transform.position.y = position.y;
    }
}
class SelectableBlueprint extends CriterionBlueprint {
    transform;
    mesh;
    renderer;
    selector;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, RendererComponent, SelectorComponent];
    }
    contains(position) {
        let transformation = this.transform.transformation;
        let start = this.mesh.minVertex.transform(transformation);
        let end = this.mesh.maxVertex.transform(transformation);
        return new Vector4f([start.x, start.y, end.x - start.x, end.y - start.y]).contains(position);
    }
}
class TurnTrackerDisplayBlueprint extends CriterionBlueprint {
    transform;
    mesh;
    renderer;
    selector;
    text;
    font;
    turnTracker;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, MeshComponent, RendererComponent, SelectorComponent, TextComponent, FontComponent, TurnTrackerComponent];
    }
    intialize(engine) {
        //this.transform.scale.array.set([Tile.SIZE.width / 2, Tile.SIZE.height * 2, 1]);
        let mesh = engine.resourceManager.get(Mesh, ResourceNames.SQUARE);
        this.mesh.set(mesh);
        this.renderer.layer = RenderLayers.UI;
        this.font.fontStyle = engine.resourceManager.get(FontStyle, "monospaced");
        this.text.width = 300;
        this.text.height = 60;
        this.text.horizontalAlignment = "center";
        //this.sprite.setSpriteSheet(engine.resourceManager.get(SpriteSheet, ResourceNames.Humann));
        this.selector.highlight = (entity) => {
            console.log("highlighting");
        };
        this.selector.unhighlight = (entity) => {
        };
        this.selector.select = (entity) => {
            console.log("Ending Turn: " + entity.id);
        };
        return this;
    }
    static create(scene) {
        return TurnTrackerDisplayBlueprint.createEntity(scene, TurnTrackerDisplayBlueprint).intialize(scene.engine);
    }
}
