class RenderableSpriteBlueprint extends CriterionBlueprint
{
    transform:TransformComponent;
    mesh:MeshComponent;
    sprite:SpriteComponent;
    renderer:RendererComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent];
    }
}

class PlayerBlueprint extends RenderableSpriteBlueprint {

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    #intialize() {
        this.transform.scale.array.set([.5,.5,.5]);
        this.mesh.set("player");
        this.renderer.layer = 1;
        this.sprite.setTexture("player");
        return this;
    }

    static create(scene: CriterionScene): PlayerBlueprint {
        return PlayerBlueprint.createEntity(scene, PlayerBlueprint).#intialize();
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