class CleanupComponent {
    destroy;
    constructor() {
        this.destroy = false;
    }
    animate(entity) {
        let animator = entity.get(AnimatorComponent);
        if (animator?.finished === true)
            this.destroy = true;
    }
}
class TransformComponent {
    position;
    rotation;
    scale;
    constructor() {
        this.position = new Vector3f([0, 0, 0]);
        this.rotation = new Vector3f();
        this.scale = new Vector3f([1, 1, 1]);
    }
    get transformation() {
        return Matrix4f.transformation(this.position, this.rotation, this.scale);
    }
}
class RendererComponent {
    layer;
    constructor() {
        this.layer = 0;
    }
}
class CameraComponent {
    projection;
    view;
    constructor() {
        this.projection = Matrix4f.identity();
        this.view = Matrix4f.identity();
    }
}
class MeshComponent {
    vertices;
    textureCoordinates;
    normals;
    constructor() {
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
class SpriteComponent {
    spriteSheet;
    texture;
    color;
    frame;
    constructor() {
        this.spriteSheet = null;
        this.texture = null;
        this.color = new Vector4f([1, 1, 1, 1]);
        this.frame = 0;
    }
    get frameCoordinates() {
        return this.spriteSheet != null
            ? this.spriteSheet.getFrameCoordinates(this.frame)
            : {
                start: new Vector2f([0, 0]),
                end: new Vector2f([1, 1])
            };
    }
    setCurrentFrame(frame) {
        this.frame = frame;
        return frame;
    }
    setTexture(texture) {
        this.texture = texture;
        this.color = null;
        this.spriteSheet = null;
        this.frame = 0;
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
        this.frame = 0;
        return color;
    }
    animate(entity) {
        let animator = entity.get(AnimatorComponent);
        if (animator == null)
            return;
        this.frame = animator.frame;
    }
}
class AnimatorComponent {
    frame;
    iteration;
    deltaTime;
    animation;
    paused;
    playing;
    constructor() {
        this.animation = null;
        this.frame = 0;
        this.iteration = 0;
        this.deltaTime = 0;
        this.paused = false;
        this.playing = false;
    }
    get finished() {
        return this.animation != null && !this.playing;
    }
    animate(animation) {
        if (this.animation?.interruptible === false)
            return;
        this.animation = animation;
        this.deltaTime = -1;
        this.iteration = 1;
        this.paused = false;
        this.playing = true;
        this.frame = animation.startFrame;
    }
    pause(toggle) {
        this.paused = toggle;
    }
    stop() {
        this.paused = false;
        this.playing = false;
        this.animation = null;
    }
    setFrame(frame) {
        if (!this.animation)
            return;
        if (frame < this.animation.startFrame)
            this.frame = this.animation.startFrame;
        else if (frame > this.animation.endFrame)
            this.frame = this.animation.endFrame;
        else
            this.frame = frame;
        this.deltaTime = -1;
    }
    clearTime() {
        this.deltaTime = -1;
    }
}
class FontComponent {
    fontStyle;
    // bold:boolean;
    // italic:boolean;
    // size:number;
    // color:Vector4f;
    constructor() {
        this.fontStyle = null;
    }
}
class TextComponent {
    string;
    leftPaddig;
    rightPadding;
    topPadding;
    bottomPadding;
    lineSpacing;
    horizontalAlignment;
    verticalAlignment;
    constructor() {
        this.string = null;
        this.leftPaddig = 0;
        this.rightPadding = 0;
        this.topPadding = 0;
        this.bottomPadding = 0;
        this.lineSpacing = 0;
        this.horizontalAlignment = "left";
        this.verticalAlignment = "top";
    }
}
class NavigatorComponent {
    start;
    destination;
    navigating;
    constructor() {
        this.destination = null;
        this.navigating = false;
        this.start = null;
    }
    navigate(start, destination) {
        this.destination = destination;
        this.start = start;
        this.navigating = true;
    }
    stop() {
        this.navigating = false;
    }
}
class PatrollerComponent {
    destinations;
    index;
    speed;
    tolerance;
    constructor() {
        this.destinations = [];
        this.index = 0;
        this.speed = 0;
        this.tolerance = 0;
    }
    get destination() {
        return this.destinations[this.index];
    }
    patrol(speed, destinations, tolerance) {
        this.destinations = destinations;
        this.index = 0;
        this.speed = speed;
        this.tolerance = tolerance;
    }
}
