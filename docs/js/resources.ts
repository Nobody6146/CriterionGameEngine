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

interface IAnimatableComponent extends CriterionComponent {
    animate(entity:CriterionEntity);
}

class AnimationSequence {
    startFrame:number;
    endFrame:number;
    frameDuration:number;
    animatableComponents:(new (...args) => IAnimatableComponent)[];
    //The frame to go to when animation stops/finishes
    finishedFrame:number;
    //How many times to repeat
    iterations:number;
    //Whether or not the animation can be interupted
    interruptible:boolean;

    constructor(startFrame:number, endFrame:number, frameDuration:number, animatableComponents:(new (...args) => IAnimatableComponent)[] = [], iterations:number = -1, interruptible:boolean = true, finishedFrame:number = null)
    {
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.frameDuration = frameDuration;
        this.animatableComponents = animatableComponents;
        this.iterations = iterations;
        this.interruptible = interruptible;
        this.finishedFrame = finishedFrame;
    }
}