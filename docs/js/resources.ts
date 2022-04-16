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
    vertices:Vector3f[];
    uvs:Vector2f[];
    normals:Vector3f[];

    constructor(vertices:Vector3f[] = [], uvs:Vector2f[] = [], normals:Vector3f[] = []) {
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
    }
}

class AnimationSequence {
    startFrame:number;
    endFrame:number;
    frameLength:number;
    keyframes:Map<number, AnimationKeyFrame>;
    //The frame to go to when animation stops
    stoppedFrame:number;
    //How many times to repeat
    repetitions:number;
    //Whether or not the animation can be interupted
    canInterupt:boolean;

    constructor(startFrame:number, endFrame:number, frameLength:number, keyframes?:Map<number, AnimationKeyFrame>, repetitions:number = -1)
    {
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.frameLength = frameLength;
        this.keyframes = keyframes ?? new Map();
        this.repetitions = repetitions;
        this.stoppedFrame = null;
        this.canInterupt = true;
    }
}

interface AnimationKeyFrame {
    update(deltaTime:number, entity:CriterionEntity);
}