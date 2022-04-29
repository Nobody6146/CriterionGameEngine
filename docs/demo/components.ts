class NavigatorComponent implements CriterionComponent {

    start:Vector3f;
    destination:Vector3f;
    navigating:boolean;

    constructor() {
        this.destination = null;
        this.navigating = false;
        this.start = null;
    }

    navigate(start:Vector3f, destination:Vector3f) {
        this.destination = destination;
        this.start = start;
        this.navigating = true;
    }

    stop() {
        this.navigating = false;
    }
}

class PatrollerComponent implements CriterionComponent {

    destinations:Vector3f[];
    index:number;
    speed:number;
    tolerance:number;

    constructor() {
        this.destinations = [];
        this.index = 0;
        this.speed = 0;
        this.tolerance = 0;
    }

    get destination():Vector3f {
        return this.destinations[this.index];
    }

    patrol(speed:number, destinations:Vector3f[], tolerance:number):void {
        this.destinations = destinations;
        this.index = 0;
        this.speed = speed;
        this.tolerance = tolerance;
    }
}