class TestScene extends CriterionScene
{
    async prepare() {
        this.registerComponent(CleanupComponent);
        this.registerComponent(TransformComponent);
        this.registerComponent(MeshComponent);
        this.registerComponent(SpriteComponent);
        this.registerComponent(RendererComponent);
        this.registerComponent(CameraComponent);
        this.registerComponent(AnimatorComponent);
        this.registerComponent(FontComponent);
        this.registerComponent(TextComponent);

        //create our shader
        let shaderProgram = BatchRendererShader.create(this.engine);
        this.engine.resourceManager.add(shaderProgram);

        //Generate our mesh
        let mesh = CriterionMeshUtils.createSquare2DMesh();
        this.engine.resourceManager.add(new Mesh(mesh.indices, mesh.vertices, mesh.uvs, mesh.normals), "player");

        //Load our texture
        let texture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/markers.png", "linear");
        this.engine.resourceManager.add(texture.texture, "player");

        //Load the spriteshet
        let spriteSheet = new SpriteSheet(texture.texture, texture.image.width, texture.image.height, 64, 32);
        this.engine.resourceManager.add(spriteSheet, "player");
        this.engine.resourceManager.add(spriteSheet, ResourceNames.TILE_SPRITE_SHEET);

        //load font
        let fontSheet = await CriterionFontUtils.loadFont("resources/fonts/monospaced.fnt")
        let fontTexture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/monospaced.png", "linear");
        this.engine.resourceManager.add(fontTexture.texture, "monospaced");
        this.engine.resourceManager.add(new FontStyle(fontTexture.texture, fontSheet), "monospaced");

        //Add systems
        this.addSystem(WindowResizerSystem);
        this.addSystem(PlayerController);
        this.addSystem(CameraSystem);
        this.addSystem(AnimatorSystem);
        this.addSystem(SpriteBatcherSystem);
        this.addSystem(TextBatcher);
        this.addSystem(TileSystem);
        this.addSystem(BatchRendererSystem);
        this.addSystem(EntityCleanupSystem);
        this.addSystem(EventSystem);

        //Create camera
        let camera = CameraBlueprint.create(this);

        let textbox = RenderableTextBlueprint.create(this);
        //texbox.entity.add(SpriteComponent);
        //textbox.transform.scale = new Vector3f([50, 50,50]);
        //textbox.transform.position = new Vector3f([50,50,0]);
        textbox.text.string = "Hello world because there is a boy here doing his best";
        textbox.text.width = 100;
        textbox.text.height = 100;

        // for(let i = 0; i < 4; i++ ) {
        //     let tile = PlayerBlueprint.create(this);
        //     tile.transform.position = new Vector3f([32 + i*16, 32 + i*16, 0]);;
        //     tile.transform.scale = new Vector3f([32,32,32]);
        // }
        
    }

    cleanup() {

    }
}