class TestScene extends CriterionScene
{
    async prepare() {
        this.registerComponent(TransformComponent);
        this.registerComponent(MeshComponent);
        this.registerComponent(SpriteComponent);
        this.registerComponent(RendererComponent);
        this.registerComponent(CameraComponent);
        this.registerComponent(AnimatorComponent);

        //create our shader
        let shaderProgram = RenderableSpriteShader.create(this.engine);
        this.engine.resourceManager.add(shaderProgram);

        //Generate our mesh
        let mesh = CriterionMeshUtils.squareMesh();
        this.engine.resourceManager.add(new Mesh(mesh.vertices, mesh.uv, mesh.normals), "player");

        //Load our texture
        let texture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/tile.png");
        this.engine.resourceManager.add(texture.texture, "player");

        //Load the spriteshet
        let spriteSheet = new SpriteSheet(texture.texture, texture.image.width, texture.image.height, 32, 32);
        this.engine.resourceManager.add(spriteSheet, "player");

        //Add systems
        this.addSystem(CameraSystem);
        this.addSystem(AnimatorSystem);
        this.addSystem(SpriteRendererSystem);

        //Create camera
        let camera = CameraBluePrint.create(this);

        //Create player
        let player = PlayerBlueprint.create(this);
        player.animator = new AnimatorComponent();
        let keyframes:Map<number, AnimationKeyFrame> = new Map();
        keyframes.set(3, {
            update(deltaTime:number,entity:CriterionEntity) {
                console.log("Animation Completed!");
            }
        });
        let animation = new AnimationSequence(0, 3, .75, keyframes);
        player.animator.animate(animation);

        let player2 = PlayerBlueprint.create(this);
        player2.transform.position.x += .25;
        player2.sprite.setColor(new Vector4f([1, 0, 0, 1]));
    }

    cleanup() {

    }
}