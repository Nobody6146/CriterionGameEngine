
function DemoGame() {
    TriScara.call(this, "canvas");
}
DemoGame.prototype = Object.create(TriScara.prototype);
DemoGame.prototype.init = async function() {
    const shaderPackage = new GameShaders(this);
    const shader = shaderPackage.buildMaterialShader();
    this.resourceManager.setShader(GameShaders.shaders.MATERIAL_SHADER, shader);
    
    let model = await TModelLoader.loadObj("resources/models/Ratchet_3/ratchet.obj"); //TModelLoader.loadObj("resources/models/Ratchet/Ratchet.obj");
    this.resourceManager.setModel("player", TModel.buildModel(this, model));//TModel.createSquare(this));
    let texture = await TTextureLoader.loadTexture("resources/models/Ratchet_2/ratchet-texture.png");
    this.resourceManager.setTexture("player", TTexture.buildTexture(this, texture));

    model = await TModelLoader.loadObj("resources/models/cube.obj"); //TModelLoader.loadObj("resources/models/Ratchet/Ratchet.obj");
    this.resourceManager.setModel("cube", TModel.buildModel(this, model));//TModel.createSquare(this));
    texture = await TTextureLoader.loadTexture("resources/textures/grass.png");
    this.resourceManager.setTexture("grass", TTexture.buildTexture(this, texture));
    // const model = await TModelLoader.loadObj("resources/models/cube.obj"); //TModelLoader.loadObj("resources/models/Ratchet/Ratchet.obj");
    // this.resourceManager.setModel("player", TModel.buildModel(this, model));//TModel.createSquare(this));
    // const texture = await TTextureLoader.loadTexture("resources/textures/checkered pattern.png");
    // this.resourceManager.setTexture("player", TTexture.buildTexture(this, texture));
    
    this.sceneManager.loadScene(new TestScene(this));
    return Promise.resolve();
}
const game = new DemoGame();

let objFile = `v -0.5 0.5 0
v -0.5 -0.5 0
v 0.5 -0.5 0
v 0.5 0.5 0
vt 0 0
vt 0 1
vt 1 1
vt 1 0
vn 0 0 0
vn 0 0 0
vn 0 0 0
vn 0 0 0
f 1/1/1 2/2/2 4/4/4
f 4/4/4 2/2/2 3/3/3`

game.launch();

// let engine = new TriScara("canvas");

// const shaderPackage = new GameShaders(engine);
// let shader = shaderPackage.buildMaterialShader();

// //let square = TModeler.generateSquare();
// let model = TModel.createSquare(engine);

// // let indicesVbo = engine.memmoryManager.createVbo();
// // engine.memmoryManager.bindVboElements(indicesVbo);
// // // engine.memmoryManager.bufferStaticUnsignedElements(indices);
// // engine.memmoryManager.bufferStaticUnsignedElements(square.indices);
// // engine.memmoryManager.unbindVboElements();
// // let vao = engine.memmoryManager.createVao();
// // engine.memmoryManager.bindVao(vao);
// // let vbo = engine.memmoryManager.createVbo();
// // engine.memmoryManager.bindVboArray(vbo);
// // // engine.memmoryManager.bufferStaticFloatData(vertexData);
// // engine.memmoryManager.bufferStaticFloatData(square.vertices);
// // engine.memmoryManager.createFloatAttributePointer(1);
// // engine.memmoryManager.unbindVboArray();
// // engine.memmoryManager.unbindVao();

// engine.memmoryManager.bindShaderProgram(shader.shaderProgram);
// engine.memmoryManager.bindVao(model.attributesVao);
// engine.memmoryManager.bindAttribute(shader.attributes.position);
// engine.memmoryManager.bindVboElements(model.indicesVbo);
// engine.windowManager.prepare();
// // engine.window.renderTriangles(3);
// // engine.window.renderTraingleIndices(indices.length);
// engine.windowManager.renderTraingleIndices(model.indicesCount);
// engine.memmoryManager.unbindAttribute(shader.attributes.position);
// engine.memmoryManager.unbindVao();
// engine.memmoryManager.unbindVboElements();
// engine.memmoryManager.unbindShaderProgram();

// // engine.memmoryManager.freeShaderProgram(shader.shaderProgram);
// // engine.memmoryManager.freeShader(shader.vertexShader);
// // engine.memmoryManager.freeShader(shader.fragmentShader);
// // engine.memmoryManager.freeVbo(vbo);
// // engine.memmoryManager.freeVao(vao);
// engine.memmoryManager.freeAll();