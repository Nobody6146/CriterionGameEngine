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
        this.vertices = mesh.vertices;
        this.textureCoordinates = mesh.uvs;
        this.normals = mesh.normals;
        return this;
    }
}
class SpriteComponent extends CriterionComponent {
    spriteSheet;
    texture;
    color;
    currentFrame;
    constructor() {
        super();
        this.spriteSheet = null;
        this.texture = null;
        this.color = new Vector4f([1, 1, 1, 1]);
        this.currentFrame = 0;
    }
    get frameCoordinates() {
        return this.spriteSheet != null
            ? this.spriteSheet.getFrameCoordinates(this.currentFrame)
            : {
                start: new Vector2f([0, 0]),
                end: new Vector2f([1, 1])
            };
    }
    setCurrentFrame(frame) {
        this.currentFrame = frame;
        return frame;
    }
    setTexture(texture) {
        this.texture = texture;
        this.color = null;
        this.spriteSheet = null;
        this.currentFrame = 0;
        return texture;
    }
    setSpriteSheet(spriteSheet) {
        this.spriteSheet = spriteSheet;
        this.texture = null;
        this.color = null;
        return spriteSheet;
    }
    setColor(color) {
        this.color = color;
        this.texture = null;
        this.spriteSheet = null;
        this.currentFrame = 0;
        return color;
    }
}
class AnimatorComponent extends CriterionComponent {
    currentFrame;
    deltaTime;
    animation;
    paused;
    constructor() {
        super();
        this.animation = null;
        this.currentFrame = 0;
        this.deltaTime = 0;
        this.paused = false;
    }
    get playing() {
        return this.animation != null;
    }
    animate(animation) {
        this.animation = animation;
        this.deltaTime = -1;
        this.paused = false;
        this.currentFrame = animation.startFrame;
    }
    pause(toggle) {
        this.paused = toggle;
    }
    stop() {
        this.paused = false;
        this.animation = null;
    }
    setFrame(frame) {
        if (!this.animation)
            return;
        if (frame < this.animation.startFrame)
            this.currentFrame = this.animation.startFrame;
        else if (frame > this.animation.endFrame)
            this.currentFrame = this.animation.endFrame;
        else
            this.currentFrame = frame;
        this.deltaTime = 0;
    }
    clearTime() {
        this.deltaTime = 0;
    }
    update(deltaTime, entity) {
        if (!this.animation)
            return;
        //If the animation just started, trigger any key frames for start frame
        if (this.deltaTime < 0) {
            this.deltaTime = 0;
            this.#executeKeyFrames(0, entity);
            return;
        }
        this.deltaTime += deltaTime;
        while (this.deltaTime > this.animation.frameLength) {
            this.currentFrame = this.currentFrame < this.animation.endFrame
                ? this.currentFrame + 1
                : this.animation.startFrame;
            this.deltaTime -= this.animation.frameLength;
            this.#executeKeyFrames(deltaTime, entity);
        }
    }
    #executeKeyFrames(deltaTime, entity) {
        let keyframe = this.animation.keyframes.get(this.currentFrame);
        if (!keyframe)
            return;
        keyframe.update(deltaTime, entity);
    }
}
