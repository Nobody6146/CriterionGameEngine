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