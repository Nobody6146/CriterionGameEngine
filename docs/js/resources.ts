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

interface SystemEvent {
    
}

class SpriteSheet {
    texture:WebGLTexture;
    width:number;
    height:number;
    frameWidth:number;
    frameHeight:number;
    framesPerRow:number;
    framesPerColumn:number;

    constructor(texture:WebGLTexture, width:number, height:number, frameWidth?:number, frameHeight?:number, framesPerRow?:number, framesPerColumn?:number,) {
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.frameWidth = frameWidth ?? this.width;
        this.frameHeight = frameHeight ?? this.height;
        this.framesPerColumn = framesPerColumn ?? Math.floor(this.height / this.frameHeight);
        this.framesPerRow = framesPerRow ?? Math.floor(this.width / this.frameWidth);
    }

    getFrameCoordinates(frame:number): {start:Vector2f, end:Vector2f} {
        let frameSize = new Vector2f([this.frameWidth/this.width, this.frameHeight/this.height]);
        let start = new Vector2f([(frame % this.framesPerRow) * frameSize.x, Math.floor(frame / this.framesPerRow) * frameSize.y]);
        return {
            start,
            end: new Vector2f([start.x + frameSize.x, start.y + frameSize.y])
        };
    }
}

class Mesh {
    indices:number[];
    vertices:Vector3f[];
    uvs:Vector2f[];
    normals:Vector3f[];
    minVertex:Vector3f;
    maxVertex:Vector3f;

    constructor(indices:number[], vertices:Vector3f[] = [], minVertex:Vector3f, maxVertex:Vector3f, uvs:Vector2f[] = [], normals:Vector3f[] = []) {
        this.indices = indices;
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.minVertex = minVertex;
        this.maxVertex = maxVertex;
    }
}

interface IAnimatableComponent extends CriterionComponent {
    animate(entity:CriterionEntity);
}

interface AnimationKeyframe {
    animate(entity:CriterionEntity);
}

class AnimationSequence {
    startFrame:number;
    endFrame:number;
    frameDuration:number;
    animatableComponents:(new (...args) => IAnimatableComponent)[];
    keyframes:Map<number, AnimationKeyframe>;
    //The frame to go to when animation stops/finishes
    finishedFrame:number;
    //How many times to repeat
    iterations:number;
    //Whether or not the animation can be interupted
    interruptible:boolean;

    constructor(startFrame:number, endFrame:number, frameDuration:number, animatableComponents:(new (...args) => IAnimatableComponent)[] = [], iterations:number = -1, keyframes?:Map<number, AnimationKeyframe>, interruptible:boolean = true, finishedFrame:number = null)
    {
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

type HorizontalAlignment = "left" | "center" | "right";
type VeriticalAlignment = "top" | "center" | "bottom";

class FontStyle {
    texture:WebGLTexture;
    fontSheet:FontSheet;

    constructor(texture:WebGLTexture, fontSheet:FontSheet) {
        this.texture = texture;
        this.fontSheet = fontSheet;
    }
}