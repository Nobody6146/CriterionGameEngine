//============== Data types
function TModel(indicesCount, indicesVbo, attributesVao, attributesVbos, data) {
    this.indicesCount = indicesCount;
    this.indicesVbo = indicesVbo;
    this.attributesVao = attributesVao;
    this.attributesVbos = attributesVbos;
    this.data = data;
}
TModel.attributes = {
    VERTICES_INDEX: 0,
    UV_COORDINATES_INDEX: 1,
    NORMALS_INDEX: 2
}
TModel.buildModel = function(engine, data) {
    //Store indices
    let indicesVbo = engine.memmoryManager.createVbo();
    engine.memmoryManager.bindVboElements(indicesVbo);
    engine.memmoryManager.bufferStaticUnsignedElements(data.indices);
    engine.memmoryManager.unbindVboElements();
    let vao = engine.memmoryManager.createVao();
    engine.memmoryManager.bindVao(vao);

    //Create memory to store model metadata
    let attributeVbos = new Map();
    let addAttribute = function (data, index, size = 3) {
        if(data == null)
            return;
        let vbo = engine.memmoryManager.createVbo();
        engine.memmoryManager.bindVboArray(vbo);
        engine.memmoryManager.bufferStaticFloatData(data);
        engine.memmoryManager.createFloatAttributePointer(index, size);
        attributeVbos.set(index, vbo);
    }

    //Store model attributes
    addAttribute(data.vertices, TModel.attributes.VERTICES_INDEX);
    addAttribute(data.uvCoordinates, TModel.attributes.UV_COORDINATES_INDEX, 2);
    addAttribute(data.normals, TModel.attributes.NORMALS_INDEX);

    //Close out our bound memmory
    engine.memmoryManager.unbindVboArray();
    engine.memmoryManager.unbindVao();

    return new TModel(data.indices.length, indicesVbo, vao, attributeVbos, data);
}
TModel.createSquare = function(engine) {
    let data = {
        vertices: [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0],
        uvCoordinates: [0, 0, 0, 1, 1, 1, 1, 0],
        normals: [0,0,0 ,0,0,0 ,0,0,0 ,0,0,0],
        indices: [0,1,3 ,3,1,2]
    }
    return TModel.buildModel(engine, data);
}
TModel.createCube = function(engine) {
    let data = {
        verticies: [1, -1, 1, -1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, -1, -1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1],
        uvCoordinates: [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 6, 12, 7, 13, 14, 15, 16, 17, 0, 18, 1, 3, 19, 4, 8, 20, 9, 11, 21, 6, 7, 22, 13, 15, 23, 16],
        normals: [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
        indices: [0, -1, -0, 0, -1, -0, 0, -1, -0, -0, 1, 0, -0, 1, 0, -0, 1, 0, -0, -0, 1, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -0, -0, 1, -0, -0, 1, -1, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, -1, -0, -0, 1, 0, 1, 0, 0, -0, -0, 1, -1, 0, 0, 0, 0, -1]
    }
    return TModel.buildModel(engine, data);
}

function TShaderProgram(vertextShader, fragmentShader, shaderProgram, attributes, uniforms) {
    this.vertexShader = vertextShader;
    this.fragmentShader = fragmentShader;
    this.shaderProgram = shaderProgram;
    this.attributes = attributes;
    this.uniforms = uniforms;
}
TShaderProgram.buildShaderProgram = function(engine, vertexShaderSource, fragmentShaderSource, attributes, uniformNames)
{
    let vertexShader = engine.memmoryManager.createVertexShader(vertexShaderSource);
    let fragmentShader = engine.memmoryManager.createFragmentShader(fragmentShaderSource);
    let shaderProgram = engine.memmoryManager.createShaderProgram(vertexShader, fragmentShader);
    engine.memmoryManager.bufferShaderProgramAttributes(shaderProgram, attributes);
    engine.memmoryManager.linkShaderProgram(shaderProgram);
    let uniforms = engine.memmoryManager.bufferShaderProgramUniforms(shaderProgram, uniformNames);
    
    return new TShaderProgram(vertexShader, fragmentShader, shaderProgram, attributes, uniforms);
}

//=======================
function TTexture(texture, image) {
    this.texture = texture;
    this.image = image;
}
TTexture.buildTexture = function(engine, image) {
    let texture = engine.memmoryManager.createTexture();
    engine.memmoryManager.bind2DTexture(texture);
    engine.memmoryManager.buffer2DTexture(image);
    engine.memmoryManager.unbind2DTexture();
    return new TTexture(texture, image);
}

//=========================================================
function TEntityBlueprint(entity) {
    this.entity = entity;
    this.components = null;
}
TEntityBlueprint.prototype.create = function() {
    this.getRequired().forEach(compClass => {
        this.entity.add(compClass);
    });
    this.load();
    this.init();
    return this;
}
TEntityBlueprint.prototype.load = function() {
    this.components = this.entity.get(this.getRequired());
    return this.components;
}
//Implement to setup
TEntityBlueprint.prototype.getRequired = function() {
    return [];
}
TEntityBlueprint.prototype.init = function(){}




//
function TGameObject(entity) {
    this.entity = entity;
    this.components = null;
}
TGameObject.prototype.create = function() {
    this.getRequired().forEach(compClass => {
        this.entity.add(compClass);
    });
    this.load();
    this.init();
    return this;
}
TGameObject.prototype.load = function() {
    this.components = this.entity.get(this.getRequired());
    return this.components;
}
//Implement to setup
TGameObject.prototype.getRequired = function() {
    return [];
}
TGameObject.prototype.init = function(){}