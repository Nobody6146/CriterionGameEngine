class ResourceNames {
    static SQUARE = "square";
    static TILE = "tiles";
    static MONOSPACED = "monospaced";
    static Humann = "human";
    static Zombie = "zombie";
}
class RenderLayers {
    static MAP = 0;
    static TILEMAP = 1;
    static MARKERS = 2;
    static ENTITIES = 2;
    static UI = 3;
}
class SpriteSheet {
    texture;
    width;
    height;
    frameWidth;
    frameHeight;
    framesPerRow;
    framesPerColumn;
    constructor(texture, width, height, frameWidth, frameHeight, framesPerRow, framesPerColumn) {
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.frameWidth = frameWidth ?? this.width;
        this.frameHeight = frameHeight ?? this.height;
        this.framesPerColumn = framesPerColumn ?? Math.floor(this.height / this.frameHeight);
        this.framesPerRow = framesPerRow ?? Math.floor(this.width / this.frameWidth);
    }
    getFrameCoordinates(frame) {
        let frameSize = new Vector2f([this.frameWidth / this.width, this.frameHeight / this.height]);
        let start = new Vector2f([(frame % this.framesPerRow) * frameSize.x, Math.floor(frame / this.framesPerRow) * frameSize.y]);
        return {
            start,
            end: new Vector2f([start.x + frameSize.x, start.y + frameSize.y])
        };
    }
}
class Mesh {
    indices;
    vertices;
    uvs;
    normals;
    minVertex;
    maxVertex;
    constructor(indices, vertices = [], minVertex, maxVertex, uvs = [], normals = []) {
        this.indices = indices;
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.minVertex = minVertex;
        this.maxVertex = maxVertex;
    }
}
class AnimationSequence {
    startFrame;
    endFrame;
    frameDuration;
    animatableComponents;
    keyframes;
    //The frame to go to when animation stops/finishes
    finishedFrame;
    //How many times to repeat
    iterations;
    //Whether or not the animation can be interupted
    interruptible;
    constructor(startFrame, endFrame, frameDuration, animatableComponents = [], iterations = -1, keyframes, interruptible = true, finishedFrame = null) {
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.frameDuration = frameDuration;
        this.animatableComponents = animatableComponents;
        this.keyframes = keyframes ?? new Map();
        this.iterations = iterations;
        this.interruptible = interruptible;
        this.finishedFrame = finishedFrame;
    }
}
class FontStyle {
    texture;
    fontSheet;
    constructor(texture, fontSheet) {
        this.texture = texture;
        this.fontSheet = fontSheet;
    }
}
