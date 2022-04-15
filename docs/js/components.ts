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

    set(mesh: Mesh | string) {
        if(typeof mesh === "string")
            mesh = CriterionEngine.instance.resourceManager.get(Mesh, mesh);
        this.vertices = mesh.vertices;
        this.textureCoordinates = mesh.uvs;
        this.normals = mesh.normals
    }

    transformedVertices(transformation:Matrix4f):Vector3f[] {
        let results:Vector3f[] = [];
        for(let vertex of this.vertices) {
            results.push(new Vector3f(transformation.multiplyVector(new Vector4f([...vertex.array, 1])).array));
        }
        return results;
    }

    transformedTextureCoordinates(frameStart:Vector2f, frameSize:Vector2f):Vector2f[] {
        let results:Vector2f[] = [];
        for(let coordinate of this.textureCoordinates) {
            results.push(new Vector2f([frameStart.x + coordinate.x * frameSize.x, frameStart.y + coordinate.y * frameSize.y]));
        }
        return results;
    }
}

class SpriteComponent extends CriterionComponent {
    #spriteSheet:SpriteSheet;
    #texture:WebGLTexture;
    #color:Vector4f;
    #currentFrame:number;

    constructor() {
        super();
        this.#spriteSheet = null;
        this.#texture = null;
        this.#color = new Vector4f([1,1,1,1]);
        this.#currentFrame = 0;
    }

    get spriteSheet():SpriteSheet {
        return this.#spriteSheet;
    }
    get texture():WebGLTexture {
        return this.#texture;
    }
    get color():Vector4f {
        return this.#color;
    }
    get currentFrame():number {
        return this.#currentFrame;
    }
    get frameOffset():Vector2f {
        return this.#spriteSheet != null
            ? this.#spriteSheet.getFrame(this.#currentFrame)
            : new Vector2f([0, 0]);
    }
    get frameSize():Vector2f {
        return this.#spriteSheet != null
            ? new Vector2f([this.#spriteSheet.frameWidth, this.#spriteSheet.frameHeight])
            : new Vector2f([1, 1]);
    }

    setCurrentFrame(frame:number):number {
        this.#currentFrame = frame;
        return frame;
    }

    setTexture(texture:WebGLTexture | string):WebGLTexture {
        if(typeof texture === "string")
            texture = CriterionEngine.instance.resourceManager.get(WebGLTexture, texture);
        this.#texture = texture;
        this.#color = null;
        this.#spriteSheet = null;
        this.#currentFrame = 0;
        return texture;
    }

    setSpriteSheet(spriteSheet:SpriteSheet | string):SpriteSheet {
        if(typeof spriteSheet === "string")
            spriteSheet = CriterionEngine.instance.resourceManager.get(SpriteSheet, spriteSheet);
        this.#spriteSheet = spriteSheet;
        this.#texture = null;
        this.#color = null;
        return spriteSheet;
    }

    setColor(color:Vector4f): Vector4f {
        this.#color = color;
        this.#texture = null;
        this.#spriteSheet = null;
        this.#currentFrame = 0;
        return color;
    }
}

class AnimationComponent extends CriterionComponent {
    #startFrame:number;
    #endFrame:number;
    #currentFrame:number;
    #deltaTime:number;
    #frameLength:number;

    #paused:boolean;
    #playing:boolean;

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

    animate(startFrame:number, endFrame:number, frameLength:number, initialFrame:number = null):void {
        this.#startFrame = startFrame;
        this.#endFrame = endFrame;
        this.#frameLength = frameLength;

        this.#deltaTime = 0;
        this.#paused = false;
        this.#playing = true;

        this.setFrame(initialFrame ?? this.#startFrame);
    }

    pause(toggle:boolean):void {
        this.#paused = toggle;
    }

    stop():void {
        this.#paused = false;
        this.#playing = false;
    }

    setFrame(frame:number) {
        if(frame < this.#startFrame)
            this.#currentFrame = this.#startFrame;
        else if(frame > this.#endFrame)
            this.#currentFrame = this.#endFrame;
        else
            this.#currentFrame = frame;
    }

    clearTime() {
        this.#deltaTime = 0;
    }

    update(deltaTime:number) {
        this.#deltaTime += deltaTime;
        while(this.#deltaTime > this.#frameLength)
        {
            this.#currentFrame = this.#currentFrame < this.#endFrame
                ? this.#currentFrame + 1
                : this.#startFrame;
            this.#deltaTime -= this.#frameLength;
        }       
    }
}