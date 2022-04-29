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
