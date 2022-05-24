// import { CriterionEngineOptions } from "./lib/CriterionEngine/criterion.js";
// import { CrawlerGame } from "./js/crawler.js";
try {
    let options = new CriterionEngineOptions();
    options.renderResolution = new Vector2f([720, 480]);
    options.debugMode = true;
    options.logLevel = 'engine';
    let game = new TurnDeadGame(options);
    game.launch();
}
catch (error) {
    alert(error);
}
//@ts-ignore
