// import { CriterionEngine, CriterionEngineOptions } from "../lib/CriterionEngine/criterion.js";
class CrawlerGame extends CriterionEngine {
    constructor(options) {
        super(options);
    }
    init() {
        this.sceneManager.load(TestScene);
        return Promise.resolve(true);
    }
}
