function MaterialRenderer(scene) {
    TRenderer.call(this, scene);
    this.memmory = this.engine.memmoryManager;    
    this.shader = null;
}
MaterialRenderer.prototype = Object.create(TRenderer.prototype);
MaterialRenderer.prototype.init = function() {
    this.shader = this.scene.engine.resourceManager.getShader(GameShaders.shaders.MATERIAL_SHADER);
}
MaterialRenderer.prototype.getComponents = function() {
    return [TransformComponent, MeshComponent, MaterialComponent, RendererComponent];
}
MaterialRenderer.prototype.getRenderables = function() {
    const objects = this.scene.getEntities(this.getComponents());
    return objects != null ? objects.map(x => x.load()) : null;
}
MaterialRenderer.prototype.getCamera = function() {
    return this.scene.getSystem(ThirdPersonCameraSystem).getCamera();
}
MaterialRenderer.prototype.update = function(renderLayer) {
    
    //Get render items
    let renderables = this.getRenderables().filter(x => x.components.renderer.layer === renderLayer);

    //There's nothing to draw, so skip
    if(renderables.length === 0)
        return;

    //Start shader
    this.memmory.bindShaderProgram(this.shader.shaderProgram);


    let camera = this.getCamera();
    const viewMatrix = camera.components.view.getViewMatrix();
    const projectionMatrix = camera.components.perspective.getProjectionMatrix();
    const sceneTransform = projectionMatrix.multiply(viewMatrix);
    this.engine.gl.uniformMatrix4fv(this.shader.uniforms.projection, false, projectionMatrix.array);
    this.engine.gl.uniformMatrix4fv(this.shader.uniforms.view, false, viewMatrix.array);

    //this.engine.gl.uniform3fv(this.shader.uniforms.cameraPosition, camera.components.transform.position.array); 

    //Render our items
    const system = this;
    renderables.forEach(x => system.render(x, sceneTransform));

    this.memmory.unbindShaderProgram();
}
MaterialRenderer.prototype.render = function(renderable, sceneTransform) {

    //Load transform
    const entityTransform = renderable.components.transform.getTransformationMatrix();
    const tranformation = sceneTransform.multiply(entityTransform);
    //this.engine.gl.uniformMatrix4fv(this.shader.uniforms.transform, false, tranformation.array); 
    this.engine.gl.uniformMatrix4fv(this.shader.uniforms.transform, false, entityTransform.array);

    //Bind mesh
    const mesh = renderable.components.mesh;
    this.memmory.bindVao(mesh.attributesVao);
    Object.values(this.shader.attributes).forEach(x => {
        this.memmory.bindAttribute(x);
    });
    this.memmory.bindVboElements(mesh.indicesVbo);

    //Bind texture
    const material = renderable.components.material;
    if(material.texture != null)
    {
        // Tell WebGL we want to affect texture unit 0
        this.memmory.activateTexture0();
        // Bind the texture to texture unit 0
        this.memmory.bind2DTexture(material.texture);
        // Tell the shader we bound the texture to texture unit 0
        this.engine.gl.uniform1i(this.shader.uniforms.textureSampler, 0);
    }

    const offset = 0;
    this.engine.gl.drawElements(this.engine.gl.TRIANGLES, mesh.indicesCount, this.engine.gl.UNSIGNED_SHORT, offset);

    //Cleanup
    Object.values(this.shader.attributes).forEach(x => {
        this.memmory.unbindAttribute(x);
    });

    this.memmory.unbindVboElements();
    this.memmory.unbindVao();
    this.memmory.unbind2DTexture();
    //this.memmory.deactivateTexture();
}