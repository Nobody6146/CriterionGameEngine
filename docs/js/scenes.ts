class TestScene extends CriterionScene
{
    async prepare() {
        this.registerComponent(TransformComponent);
        this.registerComponent(MeshComponent);
        this.registerComponent(SpriteComponent);
        this.registerComponent(RendererComponent);
        this.registerComponent(CameraComponent);

        //create our shader
        let shaderProgram = RenderableSpriteShader.create(this.engine);
        this.engine.resourceManager.add(shaderProgram);

        //Generate our mesh
        let mesh = CriterionMeshUtils.squareMesh();
        this.engine.resourceManager.add(new Mesh(mesh.vertices, mesh.uv, mesh.normals), "player");

        //Load our texture
        let texture = await CriterionTextureUtils.loadTexture(this.engine, "resources/images/tile.png");
        this.engine.resourceManager.add(texture.texture, "player");

        //Add systems
        this.addSystem(CameraSystem);
        this.addSystem(new SpriteRendererSystem(this));

        //Create camera
        let camera = CameraBluePrint.create(this);

        //Create player
        let player = PlayerBlueprint.create(this);

        let player2 = PlayerBlueprint.create(this);
        player2.transform.position.x += .25;
        player2.sprite.setColor(new Vector4f([1, 0, 0, 1]));
    }

    cleanup() {

    }
}