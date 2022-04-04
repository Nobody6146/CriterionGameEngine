class TestScene extends CriterionScene {
    init() {
        this.registerComponent(TransformComponent);
        this.registerComponent(CameraComponent);
        this.registerComponent(RendererComponent);
        const vertices = [
            -0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, 0.5, 0,
            -0.5, 0.5, 0
        ];
        let model = CriterionModelUtils.buildModel(this.engine, [{ data: vertices, dimension: 3 }]);
        let shader = CriterionShaderProgramUtils.createSolidFillShaderProgram(this.engine);
        //Add the player model
        this.engine.resourceManager.add("player", model);
        //Add systems
        this.addSystem(CameraSystem);
        this.addSystem(new RendererSystem(this, shader.shaderProgram, shader.uniformLocations));
        //Create camera
        let camera = CameraBluePrint.create(this);
        //Create player
        let player = PlayerBlueprint.create(this, vertices.length / 3);
        let player2 = PlayerBlueprint.create(this, vertices.length / 3);
        player2.transform.position.x += .25;
        player2.renderer.color.array.set([1, 0, 0, 1]);
    }
    release() {
    }
}
