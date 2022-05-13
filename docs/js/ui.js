class UiBuilder {
    static addTurnDisplay(scene) {
        let background = CriterionBlueprint.createEntity(scene, UiBlueprint);
        let resolution = scene.engine.window.renderResolution;
        background.transform.scale = new Vector3f([300, 60, 1]);
        background.uiLayout.offset = new Vector2f([(resolution.x - 300) / 2, 0]);
        background.renderer.layer = RenderLayers.UI;
        background.entity.add(SpriteComponent).color = new Vector4f([.2, .2, .2, .5]);
        background.mesh.set(scene.engine.resourceManager.get(Mesh, ResourceNames.SQUARE));
        background.uiLayout.absolute = true;
        let turnDisplay = TurnTrackerDisplayBlueprint.create(scene);
        background.uiLayout.entities.add(turnDisplay.entity.id);
    }
    static addHealthbar(scene) {
        let background = CriterionBlueprint.createEntity(scene, ProgressbarBlueprint);
        let resolution = scene.engine.window.renderResolution;
        background.transform.scale = new Vector3f([300, 20, 1]);
        background.renderer.layer = RenderLayers.UI;
        background.progress.value = .4;
        background.mesh.set(scene.engine.resourceManager.get(Mesh, ResourceNames.SQUARE));
    }
    static addMenu(scene, position) {
        let menu = CriterionBlueprint.createEntity(scene, UiBlueprint);
        menu.transform.position.x = position.x;
        menu.transform.position.y = position.y;
        return menu;
    }
    static addTextButton(scene, width, height) {
        let button = ButtonBlueprint.create(scene);
        button.transform.scale = new Vector3f([width, height, 1]);
        button.sprite.color = new Vector4f([.2, .2, .2, .9]);
        let textbox = TextboxBlueprint.create(scene);
        textbox.text.width = width;
        textbox.text.height = height;
        button.add(textbox, new Vector2f([0, 0]));
        return {
            button,
            textbox
        };
    }
}
