class DemoTestScene extends CriterionScene
{
    async prepare() {
        this.engine.registerComponent(CleanupComponent);
        this.engine.registerComponent(TransformComponent);
        this.engine.registerComponent(MeshComponent);
        this.engine.registerComponent(SpriteComponent);
        this.engine.registerComponent(RendererComponent);
        this.engine.registerComponent(CameraComponent);
        this.engine.registerComponent(AnimatorComponent);
        this.engine.registerComponent(NavigatorComponent);
        this.engine.registerComponent(PatrollerComponent);
        this.engine.registerComponent(FontComponent);
        this.engine.registerComponent(TextComponent);

        //create our shader
        let shaderProgram = BatchRendererShader.create(this.engine);
        this.engine.resourceManager.add(shaderProgram);

        //Generate our mesh
        let mesh = CriterionMeshUtils.createSquare2DMesh();
        this.engine.resourceManager.add(new Mesh(mesh.indices, mesh.vertices, mesh.minVertex, mesh.maxVertex, mesh.uvs, mesh.normals), "player");

        //Load our texture
        let texture = await CriterionTextureUtils.loadTexture(this.engine, "../resources/images/markers.png", "linear");
        this.engine.resourceManager.add(texture.texture, "player");

        //Load the spriteshet
        let spriteSheet = new SpriteSheet(texture.texture, texture.image.width, texture.image.height, 64, 32);
        this.engine.resourceManager.add(spriteSheet, "player");
        this.engine.resourceManager.add(spriteSheet, "player");

        //load font
        let fontSheet = await CriterionFontUtils.loadFont("../resources/fonts/monospaced.fnt")
        let fontTexture = await CriterionTextureUtils.loadTexture(this.engine, "../resources/images/monospaced.png", "linear");
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
        let camera = CameraBlueprint.create(this);

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
        player.transform.scale = new Vector3f([50, 50,50]);
        //player.sprite.setColor(new Vector4f([1,1,1,1]));

        let player2 = PlayerBlueprint.create(this);
        player2.transform.position.x += .25;
        player2.sprite.setColor(new Vector4f([1, 0, 0, 1]));
        player2.entity.add(CleanupComponent)
        //Make the player delete itself after 5 seconds
        let keyframes = new Map<number, AnimationKeyframe>();
        keyframes.set(0, {
            animate(entity:CriterionEntity) {
                console.log("animation began!");
                entity.scene.system(EventSystem).raise(TestEvent1, new TestEvent1());
            }
        });
        player2.transform.scale = new Vector3f([50, 50,50]);
        player2.transform.position = new Vector3f([50,50,0]);
        player2.animator.animate(new AnimationSequence(0,0, 5, [CleanupComponent], 1, keyframes));

        let textbox = RenderableTextBlueprint.create(this);
        //texbox.entity.add(SpriteComponent);
        //textbox.transform.scale = new Vector3f([50, 50,50]);
        //textbox.transform.position = new Vector3f([50,50,0]);
        textbox.text.string = "Hello world";
        textbox.text.width = 100;
        textbox.text.height = 100;
        patroller = CriterionBlueprint.createEntity(textbox.entity, PatrolLocationBlueprint);
        patroller.patrol(50, [ 
            new Vector3f([25, 25, 0]),
            new Vector3f([25, 50, 0]),
            new Vector3f([50, 50, 0]),
            new Vector3f([50, 25, 0])
        ]);

        // for(let i = 0; i < 4; i++ ) {
        //     let tile = PlayerBlueprint.create(this);
        //     tile.transform.position = new Vector3f([32 + i*16, 32 + i*16, 0]);;
        //     tile.transform.scale = new Vector3f([32,32,32]);
        // }
        
    }

    cleanup() {

    }
}