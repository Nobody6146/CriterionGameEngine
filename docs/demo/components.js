class NavigatorComponent {
    start;
    destination;
    navigating;
    constructor() {
        this.destination = null;
        this.navigating = false;
        this.start = null;
    }
    navigate(start, destination) {
        this.destination = destination;
        this.start = start;
        this.navigating = true;
    }
    stop() {
        this.navigating = false;
    }
}
class PatrollerComponent {
    destinations;
    index;
    speed;
    tolerance;
    constructor() {
        this.destinations = [];
        this.index = 0;
        this.speed = 0;
        this.tolerance = 0;
    }
    get destination() {
        return this.destinations[this.index];
    }
    patrol(speed, destinations, tolerance) {
        this.destinations = destinations;
        this.index = 0;
        this.speed = speed;
        this.tolerance = tolerance;
    }
}
