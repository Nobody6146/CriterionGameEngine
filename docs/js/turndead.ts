class TurnDeadGame extends CriterionEngine {
    constructor(options: CriterionEngineOptions) {
        super(options);
    }

    init() {
        this.sceneManager.load(TestScene);

        return Promise.resolve(true);
    }
}