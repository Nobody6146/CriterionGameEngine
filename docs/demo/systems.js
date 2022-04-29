class PatrolSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let navigations = this.#getNavigations();
        for (let navigation of navigations) {
            if (!navigation.navigator.navigating || (navigation.patroller.destinations?.length ?? 0) === 0)
                continue;
            //Determine how far we need to travel
            let distance = navigation.navigator.destination.subtract(navigation.transform.position);
            let translation = distance.normalize().scale(deltaTime * navigation.patroller.speed);
            //Check if we've arrived at our destination
            if (distance.magnitudeSquared() < navigation.patroller.tolerance || translation.magnitudeSquared() > distance.magnitudeSquared()) {
                navigation.transform.position = navigation.navigator.destination;
                //Go to the next waypoint
                navigation.patroller.index = (++navigation.patroller.index) % navigation.patroller.destinations.length;
                navigation.navigate();
            }
            else
                navigation.transform.position = navigation.transform.position.add(translation);
        }
    }
    #getNavigations() {
        return CriterionBlueprint.blueprints(this.scene, PatrolLocationBlueprint);
    }
}
//delte everything below here
class TestEvent1 {
}
class TestEvent2 {
}
class ReadTestSytemEvents extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let events = this.scene.system(EventSystem).events();
        for (let event of events)
            console.warn("We found an event", event);
    }
}
