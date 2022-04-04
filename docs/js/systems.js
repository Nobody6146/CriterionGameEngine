class CameraSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let camera = this.getCamera();
        camera.camera.view = Matrix4f.viewMatrix(camera.transform.position, camera.transform.scale);
    }
    getCamera() {
        return CriterionBlueprint.blueprints(this.scene, CameraBluePrint)[0];
    }
}
class RendererSystem extends CriterionSystem {
    shader;
    uniformLocations;
    constructor(scene, shader, uniformLocations) {
        super(scene);
        this.shader = shader;
        this.uniformLocations = uniformLocations;
    }
    update(deltaTime) {
        let memoryManager = this.scene.engine.memoryManager;
        let gl = this.scene.engine.gl;
        memoryManager.startShaderProgram(this.shader);
        let camera = this.getCamera();
        memoryManager.setUniform(this.uniformLocations.get("viewMatrix"), camera.view);
        memoryManager.setUniform(this.uniformLocations.get("projectionMatrix"), camera.projection);
        //Draw
        for (let entity of this.scene.entities(...[TransformComponent, RendererComponent]).values()) {
            let renderer = entity.get(RendererComponent);
            let transform = entity.get(TransformComponent);
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
        return this.scene.system(CameraSystem).getCamera().camera;
    }
}
