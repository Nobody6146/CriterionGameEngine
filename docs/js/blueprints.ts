class RenderableSpriteBlueprint extends CriterionBlueprint
{
    //Required components
    transform:TransformComponent;
    mesh:MeshComponent;
    sprite:SpriteComponent;
    renderer:RendererComponent;
    //optional components
    animator:AnimatorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent];
    }

    transformedVertices():Vector3f[] {
        let results:Vector3f[] = [];
        let transformation = this.transform.transformation;
        for(let vertex of this.mesh.vertices) {
            results.push(vertex.transform(transformation));
        }
        return results;
    }

    transformedTextureCoordinates():Vector2f[] {
        let results:Vector2f[] = [];
        let frame = this.sprite.frameCoordinates;
        let frameSize = new Vector2f([frame.end.x - frame.start.x, frame.end.y - frame.start.y])
        for(let coordinate of this.mesh.textureCoordinates) {
            results.push(new Vector2f([frame.start.x + frameSize.x * coordinate.x, frame.start.y + frameSize.y * coordinate.y]));
        }
        return results;
    }
}

class RenderableTextBlueprint extends CriterionBlueprint
{
    //Required components
    transform:TransformComponent;
    mesh:MeshComponent;
    text:TextComponent;
    font:FontComponent;
    renderer:RendererComponent;
    //optional components
    animator:AnimatorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    #intialize(engine:CriterionEngine) {
        this.transform.scale.array.set([.5,.5,.5]);
        this.mesh.set(CriterionMeshUtils.squareMesh());
        this.renderer.layer = 2;
        this.font.fontStyle = engine.resourceManager.get(FontStyle, "monospaced");
        return this;
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, TextComponent, FontComponent, RendererComponent];
    }

    static create(scene: CriterionScene): RenderableTextBlueprint {
        return RenderableTextBlueprint.createEntity(scene, RenderableTextBlueprint).#intialize(scene.engine);
    }
}

class PlayerBlueprint extends RenderableSpriteBlueprint {

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return super.requiredComponents().concat([AnimatorComponent]);
    }

    #intialize(engine:CriterionEngine) {
        this.transform.scale.array.set([.5,.5,.5]);
        let mesh = engine.resourceManager.get(Mesh, "player");
        this.mesh.set(mesh);
        this.renderer.layer = 1;
        this.sprite.setSpriteSheet(engine.resourceManager.get(SpriteSheet, "player"));
        return this;
    }

    static create(scene: CriterionScene): PlayerBlueprint {
        return PlayerBlueprint.createEntity(scene, PlayerBlueprint).#intialize(scene.engine);
    }
}

class CameraBluePrint extends CriterionBlueprint
{
    transform:TransformComponent;
    camera:CameraComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    #initialize() {
        this.transform.scale.y = -1;
        this.camera.projection = Matrix4f.orthographic(-1, 1, 1, -1, -1, 1);
        return this;
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, CameraComponent];
    }

    static create(scene: CriterionScene): CameraBluePrint {
        return CriterionBlueprint.createEntity(scene, CameraBluePrint).#initialize();
    }
}

class PatrolLocationBlueprint extends CriterionBlueprint {

    navigator:NavigatorComponent;
    transform:TransformComponent;
    patroller:PatrollerComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, NavigatorComponent, PatrollerComponent];
    }

    patrol(speed:number, destinations:Vector3f[], tolerance:number = .001):void {
        this.patroller.patrol(speed, destinations, tolerance);
        this.navigate();
    }

    navigate() {
        this.navigator.navigate(this.transform.position, this.patroller.destination);
    }
}