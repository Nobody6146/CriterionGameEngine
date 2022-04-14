class TestScene extends CriterionScene
{
    async init() {
        this.registerComponent(TransformComponent);
        this.registerComponent(CameraComponent);
        this.registerComponent(RendererComponent);
        this.registerComponent(SpriteComponent);

        this.engine.window.enableAlphaBlending(true);

        const vertices = [
            -0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, 0.5, 0,
            -0.5, 0.5, 0
        ];
        const textureCoords = [
            0,1,
            0,0,
            1,0,
            1,0,
            1,1,
            0,1
        ];
        let model = CriterionModelUtils.buildModel(this.engine, [
            {data: vertices, dimension: 3},
            {data: textureCoords, dimension: 2}
        ]);
        let solidShader = CriterionShaderProgramUtils.createSolidFillShaderProgram(this.engine);
        let texturedShader = CriterionShaderProgramUtils.createTextureShaderProgram(this.engine);

        let texture = this.engine.memoryManager.createTexture();
        this.engine.memoryManager.bindTexture(texture);
        let image = await CriterionTextureUtils.loadImage("resources/images/tile.png");
        this.engine.memoryManager.bufferTexture(0, image.width, image.height, image);

        //Add the player model
        this.engine.resourceManager.add("player", model);

        //Add systems
        this.addSystem(CameraSystem);
        this.addSystem(new RendererSystem(this, solidShader.shaderProgram, solidShader.uniformLocations));
        this.addSystem(new TextureRendererSystem(this, texturedShader.shaderProgram, texturedShader.uniformLocations));

        //Create camera
        let camera = CameraBluePrint.create(this);

        //Create player
        let player = PlayerBlueprint.create(this, vertices.length /3);

        let player2 = PlayerBlueprint.create(this, vertices.length/3);
        let sprite = player.entity.add(SpriteComponent);
        sprite.setTexture(texture);
        player2.transform.position.x += .25;
        player2.renderer.color.array.set([1, 0, 0, 1]);
    }

    release() {

    }
}