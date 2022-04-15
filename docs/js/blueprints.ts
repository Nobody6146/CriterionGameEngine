class PlayerBlueprint extends CriterionBlueprint {
    transform:TransformComponent;
    renderer:RendererComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    #intialize(verticeCount:number) {
        this.transform.position.x = .5;
        this.transform.position.y = .5;
        this.transform.scale.array.set([.5,.5,.5]);
        this.renderer.vao = this.entity.scene.engine.resourceManager.get(WebGLVertexArrayObject, "player");
        this.renderer.verticesCount = verticeCount;
        this.renderer.color.array.set([0,1,0,1]);
        return this;
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, RendererComponent];
    }

    static create(scene: CriterionScene, verticeCount:number): PlayerBlueprint {
        return PlayerBlueprint.createEntity(scene, PlayerBlueprint).#intialize(verticeCount);
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
        this.camera.projection = Matrix4f.orthographic(0, 1, 1, 0, -1, 1);
        return this;
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, CameraComponent];
    }

    static create(scene: CriterionScene): CameraBluePrint {
        return CriterionBlueprint.createEntity(scene, CameraBluePrint).#initialize();
    }
}

class RenderableSpriteBlueprint extends CriterionBlueprint
{
    transform:TransformComponent;
    mesh:MeshComponent;
    sprite:SpriteComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, SpriteComponent];
    }
}