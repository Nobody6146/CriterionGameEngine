class PatrolLocationBlueprint extends CriterionBlueprint {
    navigator;
    transform;
    patroller;
    constructor(entity) {
        super(entity);
    }
    requiredComponents() {
        return [TransformComponent, NavigatorComponent, PatrollerComponent];
    }
    patrol(speed, destinations, tolerance = .001) {
        this.patroller.patrol(speed, destinations, tolerance);
        this.navigate();
    }
    navigate() {
        this.navigator.navigate(this.transform.position, this.patroller.destination);
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
