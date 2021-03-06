class TurnDeadGame extends CriterionEngine {
    constructor(options) {
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
        this.registerComponent(UiLayoutComponent);
        this.registerComponent(ProgressComponent);
        this.registerComponent(InventoryComponent);
        //create our shader
        let shaderProgram = BatchRendererShader.create(this);
        this.resourceManager.add(shaderProgram);
        //Generate our mesh
        let mesh = CriterionMeshUtils.createSquare2DMesh();
        this.resourceManager.add(new Mesh(mesh.indices, mesh.vertices, mesh.minVertex, mesh.maxVertex, mesh.uvs, mesh.normals), "square");
        //Load our texture
        let tileTexture = await CriterionTextureUtils.loadTexture(this, "resources/images/tiles.png", "linear");
        this.resourceManager.add(tileTexture.texture, ResourceNames.TILE);
        let markerTexture = await CriterionTextureUtils.loadTexture(this, "resources/images/markers.png", "linear");
        this.resourceManager.add(markerTexture.texture, ResourceNames.MARKERS);
        //Load the spriteshet
        let tileSpriteSheet = new SpriteSheet(tileTexture.texture, tileTexture.image.width, tileTexture.image.height, 64, 32);
        this.resourceManager.add(tileSpriteSheet, ResourceNames.TILE);
        let markerSpriteSheet = new SpriteSheet(markerTexture.texture, markerTexture.image.width, markerTexture.image.height, 64, 32);
        this.resourceManager.add(markerSpriteSheet, ResourceNames.MARKERS);
        //load font
        let fontSheet = await CriterionFontUtils.loadFont("resources/fonts/monospaced.fnt");
        let fontTexture = await CriterionTextureUtils.loadTexture(this, "resources/images/monospaced.png", "linear");
        this.resourceManager.add(fontTexture.texture, ResourceNames.MONOSPACED);
        this.resourceManager.add(new FontStyle(fontTexture.texture, fontSheet), ResourceNames.MONOSPACED);
        this.sceneManager.load(BaseLevelScene);
        return Promise.resolve(true);
    }
}
