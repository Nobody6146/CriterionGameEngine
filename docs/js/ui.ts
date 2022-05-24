class UiBuilder {
    static addTurnDisplay(scene:CriterionScene) {
        let background = CriterionBlueprint.createEntity(scene, UiBlueprint);
        let resolution = scene.engine.window.renderResolution;
        background.transform.scale = new Vector3f([300, 60, 1]);
        background.uiLayout.offset = new Vector2f([(resolution.x - 300)/2, 0]);
        background.renderer.layer = RenderLayers.UI;
        background.entity.add(SpriteComponent).color = new Vector4f([.2,.2,.2,.5]);
        background.mesh.set(scene.engine.resourceManager.get(Mesh, ResourceNames.SQUARE));
        background.uiLayout.absolute = true;
        let turnDisplay = TurnTrackerDisplayBlueprint.create(scene);
        background.uiLayout.entities.add(turnDisplay.entity.id);
    }

    static addHealthbar(scene:CriterionScene) {
        let background = CriterionBlueprint.createEntity(scene, ProgressbarBlueprint);
        let resolution = scene.engine.window.renderResolution;
        background.transform.scale = new Vector3f([300, 20, 1]);
        background.renderer.layer = RenderLayers.UI;
        background.progress.value = .4;
        background.mesh.set(scene.engine.resourceManager.get(Mesh, ResourceNames.SQUARE));
    }

    static addMenu(scene:CriterionScene, position:Vector2f):UiBlueprint {
        let menu = CriterionBlueprint.createEntity(scene, UiBlueprint);
        menu.transform.position.x = position.x;
        menu.transform.position.y = position.y;
        menu.uiLayout.container = true;
        return menu;
    }

    static addTextButton(scene:CriterionScene, width:number, height:number) {
        let button = ButtonBlueprint.create(scene);
        button.transform.scale = new Vector3f([width, height, 1]);
        button.sprite.color = new Vector4f([.2,.2,.2,.9]);

        let textbox = TextboxBlueprint.create(scene);
        textbox.text.width = width;
        textbox.text.height = height;
        button.add(textbox, new Vector2f([0,0]));

        return {
            button,
            textbox
        };
    }

    static createActionMenu(entity:CriterionEntity) {
        let unit = new UnitBlueprint(entity).load();
        
        let transform = unit.transform;
        let menu = UiBuilder.addMenu(entity.scene, new Vector2f([transform.position.x + transform.scale.x, transform.position.y]));
        let position = new Vector2f();

        let clickoff = UiBuilder.createClickoffButton(entity.scene);
        clickoff.selector.select = (entity:CriterionEntity) => {
            clickoff.dismiss();
            menu.dismiss();
        }

        let button = UiBuilder.addTextButton(entity.scene, 300, 40);
        menu.add(button.button, position);
        button.textbox.text.string = "Interact";
        position.y += 50;
        
        button = UiBuilder.addTextButton(entity.scene, 300, 40);
        menu.add(button.button, position);
        button.textbox.text.string = "Walk";
        position.y += 50;
        
        for(let slot of unit.inventory.weaponSlots) {
            button = UiBuilder.addTextButton(entity.scene, 300, 40);
            menu.add(button.button, position);
            button.textbox.text.string = slot.displayName;
            position.y += 50;
        };
        for(let slot of unit.inventory.itemSlots) {
            button = UiBuilder.addTextButton(entity.scene, 300, 40);
            menu.add(button.button, position);
            button.textbox.text.string = slot.displayName;
            position.y += 50;
        };
        button = UiBuilder.addTextButton(entity.scene, 300, 40);
        menu.add(button.button, position);
        button.textbox.text.string = "Reload";
        position.y += 50;
    }

    static createClickoffButton(scene:CriterionScene) {
        let blueprint = CriterionBlueprint.createEntity(scene, UiBlueprint);
        blueprint.mesh.set(CriterionMeshUtils.createSquare2DMesh());
        let resolution = scene.engine.window.renderResolution;
        blueprint.transform.scale.array.set([resolution.width,resolution.height, 1]);
        blueprint.selector = new SelectorComponent();
        blueprint.uiLayout.absolute = true;
        return blueprint;
    }
}