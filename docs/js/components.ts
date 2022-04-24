class CleanupComponent implements CriterionComponent, IAnimatableComponent {
    destroy:boolean;

    constructor() {
        this.destroy = false;
    }

    animate(entity: CriterionEntity) {
        let animator = entity.get(AnimatorComponent);
        if(animator?.finished === true)
            this.destroy = true;   
    }
}

class TransformComponent implements CriterionComponent {
    position:Vector3f;
    rotation:Vector3f;
    scale:Vector3f;

    constructor() {
        this.position = new Vector3f([0,0,0]);
        this.rotation = new Vector3f();
        this.scale = new Vector3f([1,1,1]);
    }

    get transformation():Matrix4f {
        return Matrix4f.transformation(this.position, this.rotation, this.scale);
    }
}

class RendererComponent implements CriterionComponent
{
    layer:number;

    constructor() {
        this.layer = 0;
    }
}

class CameraComponent implements CriterionComponent 
{
    projection:Matrix4f;
    view:Matrix4f;

    constructor() {
        this.projection = Matrix4f.identity();
        this.view = Matrix4f.identity();
    }
}

class MeshComponent implements CriterionComponent
{
    vertices:Vector3f[];
    textureCoordinates:Vector2f[];
    normals:Vector3f[];

    constructor() {
        this.vertices = [];
        this.textureCoordinates = [];
        this.normals = [];
    }

    clear() {
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

class SpriteComponent implements IAnimatableComponent, CriterionComponent {
    spriteSheet:SpriteSheet;
    texture:WebGLTexture;
    color:Vector4f;
    frame:number;

    constructor() {
        this.spriteSheet = null;
        this.texture = null;
        this.color = new Vector4f([1,1,1,1]);
        this.frame = 0;
    }

    get frameCoordinates():{start:Vector2f, end:Vector2f} {
        return this.spriteSheet != null
            ? this.spriteSheet.getFrameCoordinates(this.frame)
            : {
                start: new Vector2f([0,0]),
                end: new Vector2f([1,1])
            };
    }

    setCurrentFrame(frame:number):number {
        this.frame = frame;
        return frame;
    }

    setTexture(texture:WebGLTexture):WebGLTexture {
        this.texture = texture;
        this.color = null;
        this.spriteSheet = null;
        this.frame = 0;
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
        this.frame = 0;
        return color;
    }

    animate(entity:CriterionEntity) {
        let animator = entity.get(AnimatorComponent);
        if(animator == null)
            return;
        this.frame = animator.frame;
    }
}

class AnimatorComponent implements CriterionComponent {
    
    frame:number;
    iteration:number;
    deltaTime:number;
    animation:AnimationSequence;

    paused:boolean;
    playing:boolean;

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

    animate(animation:AnimationSequence):void {
        if(this.animation?.interruptible === false)
            return;
        this.animation = animation;
        this.deltaTime = -1;
        this.iteration = 1;
        this.paused = false;
        this.playing = true;
        this.frame = animation.startFrame;
    }

    pause(toggle:boolean):void {
        this.paused = toggle;
    }

    stop():void {
        this.paused = false;
        this.playing = false;
        this.animation = null;
    }

    setFrame(frame:number) {
        if(!this.animation)
            return;
        if(frame < this.animation.startFrame)
            this.frame = this.animation.startFrame;
        else if(frame > this.animation.endFrame)
            this.frame = this.animation.endFrame;
        else
            this.frame = frame;
        this.deltaTime = -1;
    }

    clearTime() {
        this.deltaTime = -1;
    }
}

class FontComponent implements CriterionComponent {
    
    fontStyle:FontStyle;
    // bold:boolean;
    // italic:boolean;
    // size:number;
    // color:Vector4f;

    constructor() {
        this.fontStyle = null;
    }
}

class TextComponent implements CriterionComponent {
    string:string;
    // leftPaddig:number;
    // rightPadding:number;
    // topPadding:number;
    // bottomPadding:number;
    // lineSpacing:number;
    width:number;
    height:number;
    horizontalAlignment:HorizontalAlignment;
    verticalAlignment:VeriticalAlignment;

    constructor() {
        this.string = null;
        // this.leftPaddig = 0;
        // this.rightPadding = 0;
        // this.topPadding = 0;
        // this.bottomPadding = 0;
        // this.lineSpacing = 0;
        this.width = 1;
        this.height = 1;
        this.horizontalAlignment = "left";
        this.verticalAlignment = "top";
    }
}

class NavigatorComponent implements CriterionComponent {

    start:Vector3f;
    destination:Vector3f;
    navigating:boolean;

    constructor() {
        this.destination = null;
        this.navigating = false;
        this.start = null;
    }

    navigate(start:Vector3f, destination:Vector3f) {
        this.destination = destination;
        this.start = start;
        this.navigating = true;
    }

    stop() {
        this.navigating = false;
    }
}

class PatrollerComponent implements CriterionComponent {

    destinations:Vector3f[];
    index:number;
    speed:number;
    tolerance:number;

    constructor() {
        this.destinations = [];
        this.index = 0;
        this.speed = 0;
        this.tolerance = 0;
    }

    get destination():Vector3f {
        return this.destinations[this.index];
    }

    patrol(speed:number, destinations:Vector3f[], tolerance:number):void {
        this.destinations = destinations;
        this.index = 0;
        this.speed = speed;
        this.tolerance = tolerance;
    }
}