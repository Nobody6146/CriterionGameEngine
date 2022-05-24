class BaseLevelScene extends CriterionScene
{
    async prepare() {
        //Add systems
        this.addSystem(WindowResizerSystem);
        this.addSystem(CameraSystem);
        this.addSystem(UiControllerSystem);
        this.addSystem(PlayerController);
        this.addSystem(TurnController);
        this.addSystem(AnimatorSystem);
        this.addSystem(SpriteBatcherSystem);
        this.addSystem(ProgressbarBatcher);
        this.addSystem(TextBatcher);
        this.addSystem(TileSystem);
        this.addSystem(BatchRendererSystem);
        this.addSystem(EntityCleanupSystem);
        this.addSystem(EventSystem);

        //Create camera
        let camera = CameraBlueprint.create(this);

        UiBuilder.addTurnDisplay(this);
        UiBuilder.addHealthbar(this);

        // let textbox = RenderableTextBlueprint.create(this);
        // //texbox.entity.add(SpriteComponent);
        // //textbox.transform.scale = new Vector3f([50, 50,50]);
        // //textbox.transform.position = new Vector3f([50,50,0]);
        // textbox.text.string = "Hello world because there is a boy here doing his best";
        // textbox.text.width = 100;
        // textbox.text.height = 100;

        let playerUnit = UnitBlueprint.create(this);
        playerUnit.moveToTile(new Vector2f([2,2]));

        playerUnit = UnitBlueprint.create(this);
        playerUnit.moveToTile(new Vector2f([3,6]));

        // for(let i = 0; i < 4; i++ ) {
        //     let tile = PlayerBlueprint.create(this);
        //     tile.transform.position = new Vector3f([32 + i*16, 32 + i*16, 0]);;
        //     tile.transform.scale = new Vector3f([32,32,32]);
        // }
        
    }

    cleanup() {

    }
}