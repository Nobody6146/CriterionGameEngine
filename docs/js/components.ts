class TransformComponent extends CriterionComponent {
    position:Vector3f;
    rotation:Vector3f;
    scale:Vector3f;

    constructor() {
        super();
        this.position = new Vector3f([0,0,0]);
        this.rotation = new Vector3f();
        this.scale = new Vector3f([1,1,1]);
    }

    get transformation():Matrix4f {
        return Matrix4f.transformation(this.position, this.rotation, this.scale);
    }
}

class RendererComponent extends CriterionComponent
{
    layer:number;

    constructor() {
        super();
        this.layer = 0;
    }
}

class CameraComponent extends CriterionComponent 
{
    projection:Matrix4f;
    view:Matrix4f;

    constructor() {
        super();
        this.projection = Matrix4f.identity();
        this.view = Matrix4f.identity();
    }
}

class MeshComponent extends CriterionComponent
{
    vertices:Vector3f[];
    textureCoordinates:Vector2f[];
    normals:Vector3f[];

    constructor() {
        super();
        this.vertices = [];
        this.textureCoordinates = [];
        this.normals = [];
    }

    set(mesh:Mesh):this {
        this.vertices = mesh.vertices;
        this.textureCoordinates = mesh.uvs;
        this.normals = mesh.normals;
        return this;
    }
}

class SpriteComponent extends CriterionComponent {
    spriteSheet:SpriteSheet;
    texture:WebGLTexture;
    color:Vector4f;
    currentFrame:number;

    constructor() {
        super();
        this.spriteSheet = null;
        this.texture = null;
        this.color = new Vector4f([1,1,1,1]);
        this.currentFrame = 0;
    }

    get frameCoordinates():{start:Vector2f, end:Vector2f} {
        return this.spriteSheet != null
            ? this.spriteSheet.getFrameCoordinates(this.currentFrame)
            : {
                start: new Vector2f([0,0]),
                end: new Vector2f([1,1])
            };
    }

    setCurrentFrame(frame:number):number {
        this.currentFrame = frame;
        return frame;
    }

    setTexture(texture:WebGLTexture):WebGLTexture {
        this.texture = texture;
        this.color = null;
        this.spriteSheet = null;
        this.currentFrame = 0;
        return texture;
    }

    setSpriteSheet(spriteSheet:SpriteSheet):SpriteSheet {
        this.spriteSheet = spriteSheet;
        this.texture = null;
        this.color = null;
        return spriteSheet;
    }

    setColor(color:Vector4f): Vector4f {
        this.color = color;
        this.texture = null;
        this.spriteSheet = null;
        this.currentFrame = 0;
        return color;
    }
}

class AnimatorComponent extends CriterionComponent {
    
    currentFrame:number;
    deltaTime:number;
    animation:AnimationSequence;

    paused:boolean;

    constructor() {
        super();
        this.animation = null;
        this.currentFrame = 0;
        this.deltaTime = 0;

        this.paused = false;
    }

    get playing():boolean {
        return this.animation != null;
    }

    animate(animation:AnimationSequence):void {
        this.animation = animation;
        this.deltaTime = -1;
        this.paused = false;
        this.currentFrame = animation.startFrame;
    }

    pause(toggle:boolean):void {
        this.paused = toggle;
    }

    stop():void {
        this.paused = false;
        this.animation = null;
    }

    setFrame(frame:number) {
        if(!this.animation)
            return;
        if(frame < this.animation.startFrame)
            this.currentFrame = this.animation.startFrame;
        else if(frame > this.animation.endFrame)
            this.currentFrame = this.animation.endFrame;
        else
            this.currentFrame = frame;
        this.deltaTime = 0;
    }

    clearTime() {
        this.deltaTime = 0;
    }

    update(deltaTime:number, entity:CriterionEntity) {
        if(!this.animation)
            return;

        //If the animation just started, trigger any key frames for start frame
        if(this.deltaTime < 0) {
            this.deltaTime = 0;
            this.#executeKeyFrames(0, entity);
            return;
        }

        this.deltaTime += deltaTime;
        
        while(this.deltaTime > this.animation.frameLength)
        {
            this.currentFrame = this.currentFrame < this.animation.endFrame
                ? this.currentFrame + 1
                : this.animation.startFrame;
            this.deltaTime -= this.animation.frameLength;
            this.#executeKeyFrames(deltaTime, entity);
        }       
    }

    #executeKeyFrames(deltaTime:number, entity:CriterionEntity) {
        let keyframe = this.animation.keyframes.get(this.currentFrame);
        if(!keyframe)
            return;
        keyframe.update(deltaTime, entity);
    }
}