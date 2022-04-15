class TransformComponent extends CriterionComponent {
    position;
    rotation;
    scale;
    constructor() {
        super();
        this.position = new Vector3f([0, 0, 0]);
        this.rotation = new Vector3f();
        this.scale = new Vector3f([1, 1, 1]);
    }
    get transformation() {
        return Matrix4f.transformation(this.position, this.rotation, this.scale);
    }
}
class RendererComponent extends CriterionComponent {
    layer;
    constructor() {
        super();
        this.layer = 0;
    }
}
class CameraComponent extends CriterionComponent {
    projection;
    view;
    constructor() {
        super();
        this.projection = Matrix4f.identity();
        this.view = Matrix4f.identity();
    }
}
class MeshComponent extends CriterionComponent {
    vertices;
    textureCoordinates;
    normals;
    constructor() {
        super();
        this.vertices = [];
        this.textureCoordinates = [];
        this.normals = [];
    }
    set(mesh) {
        if (typeof mesh === "string")
            mesh = CriterionEngine.instance.resourceManager.get(Mesh, mesh);
        this.vertices = mesh.vertices;
        this.textureCoordinates = mesh.uvs;
        this.normals = mesh.normals;
    }
    transformedVertices(transformation) {
        let results = [];
        for (let vertex of this.vertices) {
            results.push(new Vector3f(transformation.multiplyVector(new Vector4f([...vertex.array, 1])).array));
        }
        return results;
    }
    transformedTextureCoordinates(frameStart, frameSize) {
        let results = [];
        for (let coordinate of this.textureCoordinates) {
            results.push(new Vector2f([frameStart.x + coordinate.x * frameSize.x, frameStart.y + coordinate.y * frameSize.y]));
        }
        return results;
    }
}
class SpriteComponent extends CriterionComponent {
    #spriteSheet;
    #texture;
    #color;
    #currentFrame;
    constructor() {
        super();
        this.#spriteSheet = null;
        this.#texture = null;
        this.#color = new Vector4f([1, 1, 1, 1]);
        this.#currentFrame = 0;
    }
    get spriteSheet() {
        return this.#spriteSheet;
    }
    get texture() {
        return this.#texture;
    }
    get color() {
        return this.#color;
    }
    get currentFrame() {
        return this.#currentFrame;
    }
    get frameOffset() {
        return this.#spriteSheet != null
            ? this.#spriteSheet.getFrame(this.#currentFrame)
            : new Vector2f([0, 0]);
    }
    get frameSize() {
        return this.#spriteSheet != null
            ? new Vector2f([this.#spriteSheet.frameWidth, this.#spriteSheet.frameHeight])
            : new Vector2f([1, 1]);
    }
    setCurrentFrame(frame) {
        this.#currentFrame = frame;
        return frame;
    }
    setTexture(texture) {
        if (typeof texture === "string")
            texture = CriterionEngine.instance.resourceManager.get(WebGLTexture, texture);
        this.#texture = texture;
        this.#color = null;
        this.#spriteSheet = null;
        this.#currentFrame = 0;
        return texture;
    }
    setSpriteSheet(spriteSheet) {
        if (typeof spriteSheet === "string")
            spriteSheet = CriterionEngine.instance.resourceManager.get(SpriteSheet, spriteSheet);
        this.#spriteSheet = spriteSheet;
        this.#texture = null;
        this.#color = null;
        return spriteSheet;
    }
    setColor(color) {
        this.#color = color;
        this.#texture = null;
        this.#spriteSheet = null;
        this.#currentFrame = 0;
        return color;
    }
}
class AnimationComponent extends CriterionComponent {
    #startFrame;
    #endFrame;
    #currentFrame;
    #deltaTime;
    #frameLength;
    #paused;
    #playing;
    constructor() {
        super();
        this.#startFrame = 0;
        this.#endFrame = 0;
        this.#currentFrame = 0;
        this.#deltaTime = 0;
        this.#frameLength = 0;
        this.#paused = false;
        this.#playing = false;
    }
    animate(startFrame, endFrame, frameLength, initialFrame = null) {
        this.#startFrame = startFrame;
        this.#endFrame = endFrame;
        this.#frameLength = frameLength;
        this.#deltaTime = 0;
        this.#paused = false;
        this.#playing = true;
        this.setFrame(initialFrame ?? this.#startFrame);
    }
    pause(toggle) {
        this.#paused = toggle;
    }
    stop() {
        this.#paused = false;
        this.#playing = false;
    }
    setFrame(frame) {
        if (frame < this.#startFrame)
            this.#currentFrame = this.#startFrame;
        else if (frame > this.#endFrame)
            this.#currentFrame = this.#endFrame;
        else
            this.#currentFrame = frame;
    }
    clearTime() {
        this.#deltaTime = 0;
    }
    update(deltaTime) {
        this.#deltaTime += deltaTime;
        while (this.#deltaTime > this.#frameLength) {
            this.#currentFrame = this.#currentFrame < this.#endFrame
                ? this.#currentFrame + 1
                : this.#startFrame;
            this.#deltaTime -= this.#frameLength;
        }
    }
}
