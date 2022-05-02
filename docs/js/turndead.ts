class TurnDeadGame extends CriterionEngine {
    constructor(options: CriterionEngineOptions) {
        super(options);
    }

    async init() {
        this.registerComponent(CleanupComponent);
        this.registerComponent(TransformComponent);
        this.registerComponent(MeshComponent);
        this.registerComponent(SpriteComponent);
        this.registerComponent(RendererComponent);
        this.registerComponent(CameraComponent);
        this.registerComponent(AnimatorComponent);
        this.registerComponent(FontComponent);
        this.registerComponent(TextComponent);
        this.registerComponent(SelectorComponent);
        this.registerComponent(TurnTrackerComponent);

        //create our shader
        let shaderProgram = BatchRendererShader.create(this);
        this.resourceManager.add(shaderProgram);

        //Generate our mesh
        let mesh = CriterionMeshUtils.createSquare2DMesh();
        this.resourceManager.add(new Mesh(mesh.indices, mesh.vertices, mesh.minVertex, mesh.maxVertex, mesh.uvs, mesh.normals), "square");

        //Load our texture
        let texture = await CriterionTextureUtils.loadTexture(this, "resources/images/markers.png", "linear");
        this.resourceManager.add(texture.texture, ResourceNames.TILE);
        //Load the spriteshet
        let spriteSheet = new SpriteSheet(texture.texture, texture.image.width, texture.image.height, 64, 32);
        this.resourceManager.add(spriteSheet, ResourceNames.TILE);

        //load font
        let fontSheet = await CriterionFontUtils.loadFont("resources/fonts/monospaced.fnt")
        let fontTexture = await CriterionTextureUtils.loadTexture(this, "resources/images/monospaced.png", "linear");
        this.resourceManager.add(fontTexture.texture, ResourceNames.MONOSPACED);
        this.resourceManager.add(new FontStyle(fontTexture.texture, fontSheet), ResourceNames.MONOSPACED);

        this.sceneManager.load(BaseLevelScene);

        return Promise.resolve(true);
    }
}