// import { CriterionEngine, CriterionEngineOptions } from "../lib/CriterionEngine/criterion.js";

class CrawlerGame extends CriterionEngine {
    constructor(options: CriterionEngineOptions) {
        super(options);
    }

    init() {
        this.sceneManager.load(TestScene);

        return Promise.resolve(true);
    }
}

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
}

class RendererComponent extends CriterionComponent
{
    color:Vector4f;
    vao:WebGLVertexArrayObject;
    verticesCount:number;

    constructor() {
        super();
        this.color = new Vector4f([1,1,1,1]);
        this.vao = null;
        this.verticesCount = 0;
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

class PlayerBlueprint extends CriterionBlueprint {
    static components(): (new () => CriterionComponent)[] {
        return [TransformComponent, RendererComponent];
    }

    static intialize(entity: CriterionEntity, verticeCount:number) {
        let renderer = entity.component(RendererComponent);
        let transform = entity.component(TransformComponent);

        transform.position.x = .5;
        transform.position.y = .5;
        transform.scale.array.set([.5,.5,.5]);
        renderer.vao = entity.scene.engine.resourceManager.get("player", WebGLVertexArrayObject);
        renderer.verticesCount = verticeCount;
        renderer.color.array.set([0,1,0,1]);
    }
}

class CameraBluePrint extends CriterionBlueprint
{
   static components(): (new () => CriterionComponent)[] {
       return [TransformComponent, CameraComponent];
   }

   static initialize(entity: CriterionEntity) {
        let transform = entity.component(TransformComponent);
        let camera = entity.component(CameraComponent);
        transform.scale.y = -1;
        camera.projection = Matrix4f.orthographic(0, 1, 1, 0, -1, 1);
    }
}

class CameraSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let entity = this.getCamera();
        let transform = entity.get(TransformComponent) as TransformComponent;
        let camera = entity.get(CameraComponent) as CameraComponent;
        camera.view = Matrix4f.viewMatrix(transform.position, transform.scale);
    }

    getCamera(){
        return [...CameraBluePrint.entities(this.scene).values()][0];
    }
}

class RendererSystem extends CriterionSystem
{
    shader:WebGLProgram;
    uniformLocations:Map<string, WebGLUniformLocation>;

    constructor(scene:CriterionScene, shader:WebGLProgram, uniformLocations:Map<string, WebGLUniformLocation>)
    {
        super(scene);
        this.shader = shader;
        this.uniformLocations = uniformLocations;
    }

    update(deltaTime:number) {
        let memoryManager = this.scene.engine.memoryManager;
        let gl = this.scene.engine.gl;

        memoryManager.startShaderProgram(this.shader);
        let camera = this.getCamera();
        memoryManager.setUniform(this.uniformLocations.get("viewMatrix"), camera.view);
        memoryManager.setUniform(this.uniformLocations.get("projectionMatrix"), camera.projection);

        //Draw
        for(let entity of this.scene.entities(...[TransformComponent, RendererComponent]).values())
        {
            let renderer = entity.get(RendererComponent) as RendererComponent;
            let transform = entity.get(TransformComponent) as TransformComponent;
            let transformationMatrix = Matrix4f.transformation(transform.position, transform.rotation, transform.scale);
            memoryManager.bindArray(renderer.vao);
            memoryManager.enableAttribute(0);
            memoryManager.setUniform(this.uniformLocations.get("color"), renderer.color);
            memoryManager.setUniform(this.uniformLocations.get("transformMatrix"), transformationMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, renderer.verticesCount);
            memoryManager.disableAttribute(0);
            memoryManager.unbindArray();
        }
        
        memoryManager.stopShaderProgram();
    }

    getCamera() {
        return this.scene.system(CameraSystem).getCamera().get(CameraComponent) as CameraComponent;
    }
}

class TestScene extends CriterionScene
{
    init() {
        const vertices = [
            -0.5, 0.5, 0,
            -0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, -0.5, 0,
            0.5, 0.5, 0,
            -0.5, 0.5, 0
        ];
        let model = CriterionModelUtils.buildModel(this.engine, [{data: vertices, dimension: 3}]);
        let shader = CriterionShaderProgramUtils.createSolidFillShaderProgram(this.engine);

        //Add the player model
        this.engine.resourceManager.add("player", model);

        //Add systems
        this.addSystem(CameraSystem);
        this.addSystem(new RendererSystem(this, shader.shaderProgram, shader.uniformLocations));

        //Create camera
        let camera = this.createEntity();
        CameraBluePrint.createEntity(camera);
        CameraBluePrint.initialize(camera);

        //Create player
        let player = this.createEntity();
        PlayerBlueprint.createEntity(player);
        PlayerBlueprint.intialize(player, vertices.length /3);

        let player2 = this.createEntity();
        PlayerBlueprint.createEntity(player2);
        PlayerBlueprint.intialize(player2, vertices.length /3);
        player2.component(TransformComponent).position.x += .25;
        player2.component(RendererComponent).color.array.set([1, 0, 0, 1]);
    }

    release() {

    }
}