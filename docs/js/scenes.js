class TestScene extends CriterionScene {
    async prepare() {
        this.registerComponent(CleanupComponent);
        this.registerComponent(TransformComponent);
        this.registerComponent(MeshComponent);
        this.registerComponent(SpriteComponent);
        this.registerComponent(RendererComponent);
        this.registerComponent(CameraComponent);
        this.registerComponent(AnimatorComponent);
        this.registerComponent(NavigatorComponent);
        this.registerComponent(PatrollerComponent);
        this.registerComponent(FontComponent);
        this.registerComponent(TextComponent);
        //create our shader
        let shaderProgram = BatchRendererShader.create(this.engine);
        this.engine.resourceManager.add(shaderProgram);
        //Generate our mesh
        let mesh = CriterionMeshUtils.squareMesh();
        this.engine.resourceManager.add(new Mesh(mesh.vertices, mesh.uvs, mesh.normals), "player");
        //Load our texture
        let texture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/tile.png", "linear");
        this.engine.resourceManager.add(texture.texture, "player");
        //Load the spriteshet
        let spriteSheet = new SpriteSheet(texture.texture, texture.image.width, texture.image.height, 32, 32);
        this.engine.resourceManager.add(spriteSheet, "player");
        //load font
        let fontSheet = await CriterionFontUtils.loadFont("resources/fonts/monospaced.fnt");
        let fontTexture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/monospaced.png", "linear");
        this.engine.resourceManager.add(fontTexture.texture, "monospaced");
        this.engine.resourceManager.add(new FontStyle(fontTexture.texture, fontSheet), "monospaced");
        //Add systems
        this.addSystem(WindowResizerSystem);
        this.addSystem(ReadTestSytemEvents);
        this.addSystem(CameraSystem);
        this.addSystem(AnimatorSystem);
        this.addSystem(PatrolSystem);
        this.addSystem(SpriteBatcherSystem);
        this.addSystem(TextBatcher);
        this.addSystem(BatchRendererSystem);
        this.addSystem(EntityCleanupSystem);
        this.addSystem(EventSystem);
        //Create camera
        let camera = CameraBluePrint.create(this);
        camera.camera.projection = Matrix4f.orthographic(0, 100, 100, 0, -1, 1);
        //Create player
        let player = PlayerBlueprint.create(this);
        player.animator = new AnimatorComponent();
        let animation = new AnimationSequence(0, 3, .75, [SpriteComponent]);
        player.animator.animate(animation);
        let patroller = CriterionBlueprint.createEntity(player.entity, PatrolLocationBlueprint);
        patroller.patrol(50, [
            new Vector3f([25, 25, 0]),
            new Vector3f([25, 50, 0]),
            new Vector3f([50, 50, 0]),
            new Vector3f([50, 25, 0])
        ]);
        player.transform.scale = new Vector3f([50, 50, 50]);
        //player.sprite.setColor(new Vector4f([1,1,1,1]));
        let player2 = PlayerBlueprint.create(this);
        player2.transform.position.x += .25;
        player2.sprite.setColor(new Vector4f([1, 0, 0, 1]));
        player2.entity.add(CleanupComponent);
        //Make the player delete itself after 5 seconds
        let keyframes = new Map();
        keyframes.set(0, {
            animate(entity) {
                console.log("animation began!");
                entity.scene.system(EventSystem).raise(TestEvent1, new TestEvent1());
            }
        });
        player2.transform.scale = new Vector3f([50, 50, 50]);
        player2.transform.position = new Vector3f([50, 50, 0]);
        player2.animator.animate(new AnimationSequence(0, 0, 5, [CleanupComponent], 1, keyframes));
        let textbox = RenderableTextBlueprint.create(this);
        //texbox.entity.add(SpriteComponent);
        //textbox.transform.scale = new Vector3f([50, 50,50]);
        //textbox.transform.position = new Vector3f([50,50,0]);
        textbox.text.string = "Hello world";
        textbox.text.width = 100;
        textbox.text.height = 100;
        // patroller = CriterionBlueprint.createEntity(textbox.entity, PatrolLocationBlueprint);
        // patroller.patrol(50, [ 
        //     new Vector3f([25, 25, 0]),
        //     new Vector3f([25, 50, 0]),
        //     new Vector3f([50, 50, 0]),
        //     new Vector3f([50, 25, 0])
        // ]);
    }
    cleanup() {
    }
}
