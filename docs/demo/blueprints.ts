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