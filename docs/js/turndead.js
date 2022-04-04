class TurnDeadGame extends CriterionEngine {
    constructor(options) {
        super(options);
    }
    init() {
        this.sceneManager.load(TestScene);
        return Promise.resolve(true);
    }
}
