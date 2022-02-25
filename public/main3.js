let engine = new TriScara("canvas");

const shaderPackage = new GameShaders(engine);
let shader = shaderPackage.buildMaterialShader();

//let square = TModeler.generateSquare();
let model = TModel.createSquare(engine);

// let indicesVbo = engine.memmoryManager.createVbo();
// engine.memmoryManager.bindVboElements(indicesVbo);
// // engine.memmoryManager.bufferStaticUnsignedElements(indices);
// engine.memmoryManager.bufferStaticUnsignedElements(square.indices);
// engine.memmoryManager.unbindVboElements();
// let vao = engine.memmoryManager.createVao();
// engine.memmoryManager.bindVao(vao);
// let vbo = engine.memmoryManager.createVbo();
// engine.memmoryManager.bindVboArray(vbo);
// // engine.memmoryManager.bufferStaticFloatData(vertexData);
// engine.memmoryManager.bufferStaticFloatData(square.vertices);
// engine.memmoryManager.createFloatAttributePointer(1);
// engine.memmoryManager.unbindVboArray();
// engine.memmoryManager.unbindVao();

engine.memmoryManager.bindShaderProgram(shader.shaderProgram);
engine.memmoryManager.bindVao(model.attributesVao);
engine.memmoryManager.bindAttribute(shader.attributes.position);
engine.memmoryManager.bindVboElements(model.indicesVbo);
engine.windowManager.clear();
// engine.window.renderTriangles(3);
// engine.window.renderTraingleIndices(indices.length);
engine.gl.drawElements(engine.gl.TRIANGLES, model.indicesCount, engine.gl.UNSIGNED_SHORT, 0);
engine.memmoryManager.unbindAttribute(shader.attributes.position);
engine.memmoryManager.unbindVao();
engine.memmoryManager.unbindVboElements();
engine.memmoryManager.unbindShaderProgram();

// engine.memmoryManager.freeShaderProgram(shader.shaderProgram);
// engine.memmoryManager.freeShader(shader.vertexShader);
// engine.memmoryManager.freeShader(shader.fragmentShader);
// engine.memmoryManager.freeVbo(vbo);
// engine.memmoryManager.freeVao(vao);
engine.memmoryManager.freeAll();