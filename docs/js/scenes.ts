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
        let texture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/tile.png");
        this.engine.resourceManager.add(texture.texture, "player");

        //Load the spriteshet
        let spriteSheet = new SpriteSheet(texture.texture, texture.image.width, texture.image.height, 32, 32);
        this.engine.resourceManager.add(spriteSheet, "player");

        //load font
        let fontSheet = await CriterionFontUtils.loadFont("resources/fonts/monospaced.fnt")
        let fontTexture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/monospaced.png");
        this.engine.resourceManager.add(fontTexture.texture, "monospaced");
        this.engine.resourceManager.add(new FontStyle(fontTexture.texture, fontSheet), "monospaced");

        //Add systems
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

        //Create player
        let player = PlayerBlueprint.create(this);
        player.animator = new AnimatorComponent();
        let animation = new AnimationSequence(0, 3, .75, [SpriteComponent]);
        player.animator.animate(animation);
        let patroller = CriterionBlueprint.createEntity(player.entity, PatrolLocationBlueprint);
        patroller.patrol(.5, [ 
            new Vector3f([-.5, -.5, 0]),
            new Vector3f([-.5, .5, 0]),
            new Vector3f([.5, .5, 0]),
            new Vector3f([.5, -.5, 0])
        ]);

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
        player2.animator.animate(new AnimationSequence(0,0, 5, [CleanupComponent], 1, keyframes));

        // let texbox = RenderableTextBlueprint.create(this);
        // texbox.entity.add(SpriteComponent);
        // texbox.text.string = "Hi";
    }

    cleanup() {

    }
}