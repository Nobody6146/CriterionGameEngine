function TriScara(canvasSelector) {
    if(!canvasSelector)
        canvasSelector = "canvas";
    this.canvas = document.querySelector("canvas");
    this.gl = this.canvas.getContext('webgl2');
    if(!this.gl)
        throw new Error("WebGL not supported");

    this.memmoryManager = new TMemmoryManager(this);
    this.windowManager = new TWindowManager(this);
    this.resourceManager = new TResourceManager(this);
    this.sceneManager = new TSceneMananger(this);
    this.controllerManager = new TGameControllerManager(this);

    this.lastFrame = null;
    this.running = false;
}
//
TriScara.prototype.launch = async function() {
    console.log("Game running");
    this.running = true;
    let result = this.init();
    if(result instanceof Promise)
        await result;
    this.lastFrame = performance.now();
    
    window.requestAnimationFrame(this.update.bind(this));
}
TriScara.prototype.getFrameRate = function() {
    return 1 / this.deltaTime;
}
TriScara.prototype.terminate = function() {
    this.running = false;
}
//Implement
TriScara.prototype.init = async function() {
    return Promise.resolve();
}
//Internal
TriScara.prototype.update = function(timestamp) {
    this.deltaTime = (timestamp - this.lastFrame) / 1000;
    this.lastFrame = timestamp;

    this.windowManager.clear();
    this.controllerManager.update(this.deltaTime);
    this.sceneManager.update(this.deltaTime);
    if(this.running)
        window.requestAnimationFrame(this.update.bind(this));
    else
    {
        this.memmoryManager.freeAll();
        console.log("Game terminated");
    }
}

function TWindowManager(engine) {
    this.engine = engine;
    this.engine.gl.clearColor(0, 0, 0, 1);
    this.engine.gl.enable(this.engine.gl.DEPTH_TEST);
    this.engine.gl.enable(this.engine.gl.CULL_FACE);
}
TWindowManager.prototype.clear = function() {
    this.engine.gl.viewport(0, 0, this.engine.canvas.width, this.engine.canvas.height);
    this.engine.gl.clear(this.engine.gl.COLOR_BUFFER_BIT | this.engine.gl.DEPTH_BUFFER_BIT);
}

//======================= COntrollers
function TGameControllerManager(engine) {
    this.engine = engine;
    this.controllerMappings = new Map();
}
TGameControllerManager.prototype.update = function(deltaTime) {
    
}
TGameControllerManager.prototype.getControllers = function() {
    const manager = this;
    return Object.keys(navigator.getGamepads()).map(x => manager.getController(x));
}
TGameControllerManager.prototype.getController = function(index) {
    const gamePad = navigator.getGamepads()[index];
    if(gamePad == null)
        return new TGameController();
    let mapping = this.controllerMappings.get(gamePad.name);
    if(mapping == null)
    {
        //I only have an XBox mapping for now
        if(gamePad.mapping === "standard")
            mapping = new TGameControllerMappingXbox();
        else
            mapping = TGameControllerMappingXbox();
        this.controllerMappings.set(gamePad.id, mapping);
    }

    return new TGameController(gamePad, mapping);
}

function TGameController(gamePad, mapping) {
    this.gamePad = gamePad;
    this.mapping = mapping;
    this.inputs = {};

    const controller = this;
    let addProp = function(name, index) {
        Object.defineProperty(controller.inputs, name, {
            get() {
                return controller.getInput(index);
            }
        });
    }

    addProp("ls", TGameController.inputs.LEFT_STICK);
    addProp("rs", TGameController.inputs.RIGHT_STICK);
    addProp("up", TGameController.inputs.DPAD_UP);
    addProp("right", TGameController.inputs.DPAD_RIGHT);
    addProp("down", TGameController.inputs.DPAD_DOWN);
    addProp("left", TGameController.inputs.DPAD_LEFT);
    addProp("y", TGameController.inputs.BUTTON_Y);
    addProp("b", TGameController.inputs.BUTTON_B);
    addProp("a", TGameController.inputs.BUTTON_A);
    addProp("x", TGameController.inputs.BUTTON_X);
    addProp("select", TGameController.inputs.BUTTON_SELECT);
    addProp("start", TGameController.inputs.BUTTON_START);
    addProp("lb", TGameController.inputs.BUTTON_L1);
    addProp("lt", TGameController.inputs.BUTTON_L2);
    addProp("lsb", TGameController.inputs.BUTTON_L3);
    addProp("rb", TGameController.inputs.BUTTON_R1);
    addProp("rt", TGameController.inputs.BUTTON_R2);
    addProp("rsb", TGameController.inputs.BUTTON_R3);
}
TGameController.prototype.isConnected = function() {
    return this.gamePad != null && this.gamePad.connected === true;
}
TGameController.prototype.getInput = function(input) {
    if(this.mapping == null)
        return null;
    let mapping = this.mapping.inputMappings[input];
    if(mapping == null)
        return null;
    if(mapping.buttonId != null)
        return this.gamePad.buttons[mapping.buttonId].value;
    else
    {
        const values = {
            x: this.gamePad.axes[mapping.axisId],
            y: this.gamePad.axes[mapping.axisId + 1],
        };
        return {
            x: Math.abs(values.x) > mapping.deadZone ? values.x : 0,
            y: Math.abs(values.y) > mapping.deadZone ? values.y : 0
        }
    }
}
TGameController.prototype.getInputs = function() {
    let inputs = [];
    for(let i = 0; i < this.mapping.inputMappings.length; i++)
    {
        const input = this.mapping.inputMappings[i];
        inputs.push({
            index: i,
            name: input.name,
            value: this.getInput(i),
            buttonId: input.buttonId,
            axisId: input.axisId
        });
    }
    return inputs;
}
TGameController.prototype.getActiveInputs = function() {
    return this.getInputs().filter(x => 
        (!(x.value instanceof Object) && x.value != 0) || (x.value instanceof Object && (x.value.x != 0 || x.value.y != 0))
    );
}
TGameController.prototype.getLeftStick = function() {
    return this.getInput(TGameController.inputs.LEFT_STICK);
}
TGameController.prototype.getRightStick = function() {
    return this.getInput(TGameController.inputs.RIGHT_STICK);
}
//
TGameController.prototype.getPadUp = function() {
    return this.getInput(TGameController.inputs.DPAD_UP);
}
TGameController.prototype.getPadRight = function() {
    return this.getInput(TGameController.inputs.DPAD_RIGHT);
}
TGameController.prototype.getPadDown = function() {
    return this.getInput(TGameController.inputs.DPAD_DOWN);
}
TGameController.prototype.getPadLeft = function() {
    return this.getInput(TGameController.inputs.DPAD_LEFT);
}
//
TGameController.prototype.getY = function() {
    return this.getInput(TGameController.inputs.BUTTON_Y);
}
TGameController.prototype.getB = function() {
    return this.getInput(TGameController.inputs.BUTTON_B);
}
TGameController.prototype.getA = function() {
    return this.getInput(TGameController.inputs.BUTTON_A);
}
TGameController.prototype.getButtonX = function() {
    return this.getInput(TGameController.inputs.BUTTON_X);
}
//
TGameController.prototype.getButtonY = function() {
    return this.getInput(TGameController.inputs.BUTTON_Y);
}
TGameController.prototype.getButtonY = function() {
    return this.getInput(TGameController.inputs.BUTTON_Y);
}

TGameController.inputs = {
    LEFT_STICK: 0,
    RIGHT_STICK: 1,

    DPAD_UP: 2,
    DPAD_RIGHT: 3,
    DPAD_DOWN: 4,
    DPAD_LEFT: 5,

    BUTTON_Y: 6,
    BUTTON_B: 7,
    BUTTON_A: 8,
    BUTTON_X: 9,
    
    BUTTON_SELECT: 10,
    BUTTON_START: 11,

    BUTTON_L1: 12,
    BUTTON_L2: 13,
    BUTTON_L3: 14,
    BUTTON_R1: 15,
    BUTTON_R2: 16,
    BUTTON_R3: 17,
}
function TControllerInputMapping(name, buttonId, axisId, deadZone) {
    this.name = name;
    this.buttonId = buttonId;
    this.axisId = axisId;
    this.deadZone = deadZone;
}
function TGameControllerMappingXbox() {
    this.name = "Xbox";
    this.inputMappings = [];
    this.inputMappings[TGameController.inputs.LEFT_STICK] = new TControllerInputMapping("LS", null, 0, .2);
    this.inputMappings[TGameController.inputs.RIGHT_STICK] = new TControllerInputMapping("RS", null, 2, .2);

    this.inputMappings[TGameController.inputs.DPAD_UP] = new TControllerInputMapping("D-UP", 12, null, null);
    this.inputMappings[TGameController.inputs.DPAD_RIGHT] = new TControllerInputMapping("D-RIGHT", 15, null, null);
    this.inputMappings[TGameController.inputs.DPAD_DOWN] = new TControllerInputMapping("D-DOWN", 13, null, null);
    this.inputMappings[TGameController.inputs.DPAD_LEFT] = new TControllerInputMapping("D-LEFT", 14, null, null);

    this.inputMappings[TGameController.inputs.BUTTON_Y] = new TControllerInputMapping("Y", 3, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_B] = new TControllerInputMapping("B", 1, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_A] = new TControllerInputMapping("A", 0, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_X] = new TControllerInputMapping("X", 2, null, null);

    this.inputMappings[TGameController.inputs.BUTTON_SELECT] = new TControllerInputMapping("BACK", 8, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_START] = new TControllerInputMapping("START", 9, null, null);

    this.inputMappings[TGameController.inputs.BUTTON_L1] = new TControllerInputMapping("LB", 4, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_L2] = new TControllerInputMapping("LT", 6, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_L3] = new TControllerInputMapping("LSB", 10, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_R1] = new TControllerInputMapping("RB", 5, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_R2] = new TControllerInputMapping("RT", 7, null, null);
    this.inputMappings[TGameController.inputs.BUTTON_R3] = new TControllerInputMapping("RSB", 11, null, null);
}

//=================================================
function TResourceManager(engine) {
    this.engine = engine;
    this.resources = new Map();
}
TResourceManager.prototype.get = function(resourceType, resourceName)
{
    let resourceGroup = this.resources.get(resourceType);
    if(resourceGroup == null)
        return null;
    return resourceGroup.get(resourceName);
}
TResourceManager.prototype.set = function(resourceType, resourceName, resource)
{
    let resourceGroup = this.resources.get(resourceType);
    if(resourceGroup == null)
    {
        resourceGroup = new Map();
        this.resources.set(resourceType, resourceGroup);
    }
    resourceGroup.set(resourceName, resource);
    return resource;
}
TResourceManager.prototype.remove = function(resourceType, resourceName)
{
    let resourceGroup = this.resources.get(resourceType);
    if(resourceGroup == null)
        return;
    resourceGroup.delete(resourceName);
}
//Types
TResourceManager.prototype.getShader = function(name) {
    return this.get("shader", name);
}
TResourceManager.prototype.setShader = function(name, resource) {
    return this.set("shader", name, resource);
}
TResourceManager.prototype.removeShader = function(name) {
    return this.remove("shader", name);
}
TResourceManager.prototype.getModel = function(name) {
    return this.get("models", name);
}
TResourceManager.prototype.setModel = function(name, resource) {
    return this.set("models", name, resource);
}
TResourceManager.prototype.removeModel = function(name) {
    return this.remove("models", name);
}
TResourceManager.prototype.getTexture = function(name) {
    return this.get("texture", name);
}
TResourceManager.prototype.setTexture = function(name, resource) {
    return this.set("texture", name, resource);
}
TResourceManager.prototype.removeTexture = function(name) {
    return this.remove("texture", name);
}
//=========================================================
function TMemmoryManager(engine) {
    this.engine = engine;
    this.vbos = [];
    this.vaos = [];
    this.shaders = [];
    this.shaderPrograms = [];
    this.textures = [];


    this.boundVao = null;
    this.boundVboArray = null;
    this.boundVboElements = null;
    this.boundShaderProgram = null;
    this.boundAttributes = [];
    this.bound2DTexture = null;
    this.activeTexture = null;

    //we'll assume 0 doesn't exist and ignore that index
    for(let i = 0; i < this.engine.gl.MAX_VERTEX_ATTRIBS + 1; i++)
        this.boundAttributes.push(false);
}
//==== Binding
TMemmoryManager.prototype.bindVao = function(vao) {
    if(this.boundVao === vao)
        return;
    this.engine.gl.bindVertexArray(vao);
    this.boundVao = vao;
}
TMemmoryManager.prototype.bindVboArray = function(vbo) {
    if(this.boundVboArray === vbo)
        return;
    this.engine.gl.bindBuffer(this.engine.gl.ARRAY_BUFFER, vbo);
    this.boundVboArray = vbo;
}
TMemmoryManager.prototype.bindVboElements = function(vbo) {
    if(this.boundVboElements === vbo)
        return;
    this.engine.gl.bindBuffer(this.engine.gl.ELEMENT_ARRAY_BUFFER, vbo);
    this.boundVboElements = vbo;
}
TMemmoryManager.prototype.bindAttribute = function(attribute) {
    if(this.boundAttributes[attribute] == null || this.boundAttributes[attribute])
        return;
    this.engine.gl.enableVertexAttribArray(attribute);
    this.boundAttributes[attribute] = true;
}
TMemmoryManager.prototype.bind2DTexture = function(texture) {
    if(this.bound2DTexture === texture)
        return;
    this.engine.gl.bindTexture(this.engine.gl.TEXTURE_2D, texture);
    this.bound2DTexture = texture;
}
TMemmoryManager.prototype.bindShaderProgram = function(shaderProgram) {
    if(this.boundShaderProgram === shaderProgram)
        return;
    this.engine.gl.useProgram(shaderProgram);
    this.boundShaderProgram = shaderProgram;
}
//==== UnBinding
TMemmoryManager.prototype.unbindVao = function() {
    this.bindVao(null);
}
TMemmoryManager.prototype.unbindVboArray = function() {
    this.bindVboArray(null);
}
TMemmoryManager.prototype.unbindVboElements = function() {
    this.bindVboElements(null);
}
TMemmoryManager.prototype.unbindAttribute = function(attribute) {
    if(this.boundAttributes[attribute] == null || this.boundAttributes[attribute] === false)
        return;
    this.engine.gl.disableVertexAttribArray(attribute);
    this.boundAttributes[attribute] = false;
}
TMemmoryManager.prototype.unbindAttributes = function() {
    Object.keys(this.boundAttributes).forEach(x => {
        this.unbindAttribute(x);
    });
}
TMemmoryManager.prototype.unbind2DTexture = function() {
    this.bind2DTexture(null);
}
TMemmoryManager.prototype.unbindShaderProgram = function() {
    this.bindShaderProgram(null);
}
//==== Creating
TMemmoryManager.prototype.createVbo = function(){
    let vbo = this.engine.gl.createBuffer();
    this.vbos.push(vbo);
    return vbo;
}
TMemmoryManager.prototype.createVao = function() {
    let vao = this.engine.gl.createVertexArray();
    this.vaos.push(vao);
    return vao;
}
TMemmoryManager.prototype.createFloatAttributePointer = function(attribute, size = 3, normalize = false, stride = 0, offset = 0) {
    this.createAttributePointer(attribute, size, this.engine.gl.FLOAT, normalize, stride, offset);
}
TMemmoryManager.prototype.createAttributePointer = function(attribute, size = 3, type = this.engine.gl.FLOAT, normalize = false, stride = 0, offset = 0) {
    // stride - 2 components per iteration
    // type - the data is 32bit floating point values
    // normalize - convert from 0-255 to 0.0-1.0
    // stride - 0 = move forward size * sizeof(type) each iteration to get the next color
    // offset - 0 = start at the beginning of the buffer
    this.engine.gl.vertexAttribPointer(attribute, size, type, normalize, stride, offset);
}
TMemmoryManager.prototype.createTexture = function(image) {
    const texture = this.engine.gl.createTexture();
    this.textures.push(texture);
    return texture;
}
TMemmoryManager.prototype.createVertexShader = function(source) {
    return this.createShader(this.engine.gl.VERTEX_SHADER, source);
}
TMemmoryManager.prototype.createFragmentShader = function(source) {
    return this.createShader(this.engine.gl.FRAGMENT_SHADER, source);
}
TMemmoryManager.prototype.createShader = function(shaderType, source) {
    const shader = this.engine.gl.createShader(shaderType);
    this.engine.gl.shaderSource(shader, source);
    this.engine.gl.compileShader(shader);

    // Check the compile status
    var compiled = this.engine.gl.getShaderParameter(shader, this.engine.gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        var lastError = this.engine.gl.getShaderInfoLog(shader);

        const errorRE = /ERROR:\s*\d+:(\d+)/gi;
        function addLineNumbersWithError(src, log = '') {
            // Note: Error message formats are not defined by any spec so this may or may not work.
            const matches = [...log.matchAll(errorRE)];
            const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
            const lineNo = parseInt(m[1]);
            const next = matches[ndx + 1];
            const end = next ? next.index : log.length;
            const msg = log.substring(m.index, end);
            return [lineNo - 1, msg];
            }));
            return src.split('\n').map((line, lineNo) => {
            const err = lineNoToErrorMap.get(lineNo);
            return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
            }).join('\n');
        }

        console.error(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(source, lastError)}`);
        this.engine.gl.deleteShader(shader);
        throw new Error(err);
    }

    this.shaders.push(shader);
    return shader;
}
TMemmoryManager.prototype.createShaderProgram = function(vertexShader, fragmentShader) {
    const program = this.engine.gl.createProgram();
    this.engine.gl.attachShader(program, vertexShader);
    this.engine.gl.attachShader(program, fragmentShader);
    this.shaderPrograms.push(program);
    return program;
}
//Buffering
TMemmoryManager.prototype.bufferStaticUnsignedElements = function(data) {
    this.bufferData(this.engine.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.engine.gl.STATIC_DRAW);
}
TMemmoryManager.prototype.bufferStaticFloatData = function(data) {
    this.bufferData(this.engine.gl.ARRAY_BUFFER, new Float32Array(data), this.engine.gl.STATIC_DRAW);
}
TMemmoryManager.prototype.bufferData = function(target, glData, usage) {
    this.engine.gl.bufferData(target, glData, usage);
}
TMemmoryManager.prototype.buffer2DTexture = function(image) {
    const level = 0;
    const internalFormat = this.engine.gl.RGBA;
    const srcFormat = this.engine.gl.RGBA;
    const srcType = this.engine.gl.UNSIGNED_BYTE;
    
    this.engine.gl.texImage2D(this.engine.gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

    const isPowerOf2 = function(value) {
        return (value & (value - 1)) == 0;
    }

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        this.engine.gl.generateMipmap(this.engine.gl.TEXTURE_2D);
    } else {
        // No, it's not a power of 2. Turn off mips and set
        // wrapping to clamp to edge
        this.engine.gl.texParameteri(this.engine.gl.TEXTURE_2D, this.engine.gl.TEXTURE_WRAP_S, this.engine.gl.CLAMP_TO_EDGE);
        this.engine.gl.texParameteri(this.engine.gl.TEXTURE_2D, this.engine.gl.TEXTURE_WRAP_T, this.engine.gl.CLAMP_TO_EDGE);
        this.engine.gl.texParameteri(this.engine.gl.TEXTURE_2D, this.engine.gl.TEXTURE_MIN_FILTER, this.engine.gl.LINEAR);
    }
}
TMemmoryManager.prototype.activateTexture0 = function() {
    const texture = this.engine.gl.TEXTURE0;
    if(this.activeTexture === texture)
        return;
    this.engine.gl.activeTexture(texture);
    this.activeTexture = texture;
}
TMemmoryManager.prototype.deactivateTexture = function() {
    if(this.activeTexture === null)
        return;
    this.engine.gl.activeTexture(null);
    this.activeTexture = null
}
TMemmoryManager.prototype.bufferShaderProgramAttributes = function(program, attributes) {
    if(attributes != null)
    {
        Object.keys(attributes).forEach(name => {
            this.engine.gl.bindAttribLocation(program, attributes[name], name);
        });
    }
}
TMemmoryManager.prototype.bufferShaderProgramUniforms = function(program, uniformNames) {
    let uniforms = {};
    if(uniformNames != null || uniformNames.length > -1)
    {
        uniformNames.forEach(x => {
            uniforms[x] = this.engine.gl.getUniformLocation(program, x);
        });
    }
    return uniforms;
}
TMemmoryManager.prototype.linkShaderProgram = function(program) {
    this.engine.gl.linkProgram(program);
}
//Releasing
TMemmoryManager.prototype.freeVbo = function(vbo) {
    var index = this.vbos.findIndex(x => x == vbo);
    if(index === -1)
        return;
    this.vbos.splice(index, 1);
    this.engine.gl.deleteBuffer(vbo);
    if(this.boundVboArray === vbo)
        this.unbindVboArray();
    if(this.boundVboElements === vbo)
        this.unbindVboElements();
}
TMemmoryManager.prototype.freeVao = function(vao) {
    var index = this.vaos.findIndex(x => x == vao);
    if(index === -1)
        return;
    this.vaos.splice(index, 1);
    this.engine.gl.deleteVertexArray(vao);
    if(this.boundVao === vao)
        this.unbindVao();
}
TMemmoryManager.prototype.freeTexture = function(texture) {
    var index = this.textures.findIndex(x => x == texture);
    if(index === -1)
        return;
    this.textures.splice(index, 1);
    this.engine.gl.deleteTexture(texture);
    if(this.bound2DTexture === texture)
        this.unbind2DTexture();
}
TMemmoryManager.prototype.freeShader = function(shader) {
    var index = this.shaders.findIndex(x => x == shader);
    if(index === -1)
        return;
    this.shaders.splice(index, 1);
    this.engine.gl.deleteShader(shader);
}
TMemmoryManager.prototype.freeShaderProgram = function(program) {
    var index = this.shaderPrograms.findIndex(x => x == program);
    if(index === -1)
        return;
    this.shaderPrograms.splice(index, 1);
    this.engine.gl.deleteProgram(program);
    if(this.boundShaderProgram === program)
        this.unbindShaderProgram();
}
TMemmoryManager.prototype.freeAll = function() {
    this.vbos.forEach(x => {
        this.engine.gl.deleteBuffer(x);
    });
    this.vbos = [];

    this.vaos.forEach(x => {
        this.engine.gl.deleteVertexArray(x);
    });
    this.vaos = [];

    this.textures.forEach(x => {
        this.engine.gl.deleteTexture(x);
    });
    this.textures = [];

    this.shaders.forEach(x => {
        this.engine.gl.deleteShader(x);
    });
    this.shaders = [];

    this.shaderPrograms.forEach(x => {
        this.engine.gl.deleteProgram(x);
    });
    this.shaderPrograms = [];

    this.unbindAttributes();
    this.unbindVao();
    this.unbindVboArray();
    this.unbindVboElements();
    this.unbindShaderProgram();
}

//========================================
function TSceneMananger(engine) {
    this.engine = engine;
    this.primaryLoadQueue = null;
    this.subLoadQueue = [];
    this.unloadQueue = [];
    
    this.primaryScene = null;
    this.subScenes = [];
}
//Public methods
TSceneMananger.prototype.getCurrentScene = function() {
    return this.primaryScene;
}
TSceneMananger.prototype.getSubScenes = function() {
    return this.subScenes;
}
TSceneMananger.prototype.loadScene = function(scene) {
    this.primaryLoadQueue = scene instanceof TScene ? scene : scene.constructor();
}
TSceneMananger.prototype.reloadScene = function() {
    if(this.primaryScene == null)
        return;
    //Create a new version of the scene (may no be correct here)
    let scene = {};
    scene.__proto__ = this.primaryScene.__proto__;
    this.primaryScene.constructor.call(scene, this.engine);

    this.loadScene(scene);
}
TSceneMananger.prototype.loadSubscene = function(scene) {
    this.subLoadQueue.push(scene);
}
TSceneMananger.prototype.unloadScene = function(scene) {
    this.unloadQueue.push(scene);
}
//Internal
TSceneMananger.prototype.update = function(deltaTime) {
    this.loadQueuedScenes();
    this.unloadOldScenes();
    this.processScenes(deltaTime);
}
TSceneMananger.prototype.processScenes = function(deltaTime) {
    if(this.primaryScene != null)
        this.primaryScene.update(deltaTime);
    this.subScenes.forEach(x => {
        x.update(deltaTime);
    });
}
TSceneMananger.prototype.loadQueuedScenes = function() {
    if(this.primaryLoadQueue !== null)
    {
        if(this.primaryScene !== null)
        {
            this.subScenes.forEach(x => {
                this.unloadScene(x);
            });
            this.unloadScene(this.primaryScene);
        }
        this.primaryScene = this.primaryLoadQueue;
        this.subScenes = [];
        this.primaryLoadQueue = null;
        this.subLoadQueue = [];
        this.primaryScene.create();
    }
    this.subLoadQueue.forEach(x => {
        this.subScenes.push(x);
        x.create();
    });
    this.subLoadQueue = [];
}
TSceneMananger.prototype.unloadOldScenes = function() {
    this.unloadQueue.forEach(x => {
        if(this.primaryScene === x)
        {
            this.primaryScene = null;
            //Unload all the other subscenes as well
            this.subScenes = [];
        }
        let subIndex = this.subScenes.indexOf(x);
        if(subIndex > -1)
            this.subScenes.splice(subIndex, 1);
    });
    this.unloadQueue = [];
}

//=======================================================
function TScene(engine) {
    this.engine = engine;
    this.entities = new Map();
    this.components = new Map();
    this.systems = new Map();
    this.renderers = new Map();
    this.availableEntityId = 1;
}
//
TScene.prototype.isPrimaryScene = function() {
    return this.engine.sceneManager.getCurrentScene() === this;
}
TScene.prototype.isSubScene = function() {
    let subScenes = this.engine.sceneManager.getSubScenes();
    let index = subScenes.indexOf(x => x === this);
    return index > -1;
}
TScene.prototype.getEntity = function(id) {
    return this.entities.get(id);
}
TScene.prototype.getEntities = function(compClasses){
    if(compClasses != null && !Array.isArray(compClasses))
        compClasses = [compClasses];
    let entities = [];
    for(let entity of this.entities.values())
    {
        if(compClasses == null || compClasses.length == 0)
        {
            entities.push(entity);
            continue;
        }
        let valid = true;
        let components = this.components.get(entity.id);
        compClasses.forEach(comp => 
        {
            if(components.get(comp.name) == null)
                valid = false;
        });
        if(valid)
            entities.push(entity);
    }
    return entities;
}
TScene.prototype.createEntity = function() {
    const id = this.availableEntityId++;//(this.availableEntityId++).toString();
    let entity = new TEntity(id, this);
    this.entities.set(entity.id, entity);
    this.components.set(entity.id, new Map());
    return entity;
}
TScene.prototype.destroyEntity = function(entityId) {
    if(!this.entities.has(entityId))
        throw new Error('Entity "' + entityId + " does not exist");
    this.entities.delete(entityId);
    this.components.delete(entityId);
}
TScene.prototype.getComponent = function(entityId, compClass)
{
    if(compClass == null)
        return null;
    let components = this.getComponents(entityId, [compClass]);
    return Object.values(components)[0];
}
TScene.prototype.getComponents = function(entityId, compClasses)
{
    if(!this.entities.has(entityId))
        throw new Error('Entity "' + entityId + " does not exist");
    let components = {};

    let entityComponents = this.components.get(entityId);
    for(let key of entityComponents.keys())
    {
        if(compClasses == null || compClasses.length == 0 || compClasses.findIndex(x => x.name == key) > -1)
        {
            let name = key.replace("Component", "");
            if(name.length > 0)
            {
                name = name.length === 1 ? name.toLowerCase()
                    : name.charAt(0).toLowerCase() + name.substring(1, name.length);
            }
            components[name] = entityComponents.get(key);
        }
    }
    return components;
}
TScene.prototype.createComponent = function(entityId, compClass){
    if(!this.entities.has(entityId))
        throw new Error('Entity "' + entityId + " does not exist");
    let comp = new compClass();
    this.components.get(entityId).set(compClass.name, comp);
    return comp;
}
TScene.prototype.destroyComponent = function(entityId, compClass) {
    if(!this.entities.has(entityId))
        throw new Error('Entity "' + entityId + " does not exist");
    this.components.get(entityId).delete(compClass.name);
}
TScene.prototype.getSystem = function(systemClass) {
    let systems = this.getSystems([systemClass]);
    if(systems.length === 0)
        return null;
    return systems[0];
}
TScene.prototype.getSystems = function(systemClasses) {
    let systems = [];
    if(systemClasses == null || systemClasses.length === 0)
        for(let system of this.systems.values())
            systems.push(system);
    else
        systemClasses.forEach(key => {
            let system = this.systems.get(key.name);
            if(system != null)
                systems.push(system);
        });
    return systems;
}
TScene.prototype.createSystem = function(systemClass){
    let system = new systemClass(this);
    this.systems.set(systemClass.name, system);
    system.init();
    return system;
}
TScene.prototype.getRenderer = function(rendererClass) {
    let systems = this.getRenderers([rendererClass]);
    if(systems.length === 0)
        return null;
    return systems[0];
}
TScene.prototype.getRenderers = function(rendererClasses) {
    let renderers = [];
    if(rendererClasses == null || rendererClasses.length === 0)
        for(let renderer of this.renderers.values())
            renderers.push(renderer);
    else
        rendererClasses.forEach(key => {
            let renderer = this.renderers.get(key.name);
            if(renderer != null)
                renderers.push(renderer);
        });
    return renderers;
}
TScene.prototype.createRenderer = function(rendererClass){
    let renderer = new rendererClass(this);
    this.renderers.set(rendererClass.name, renderer);
    renderer.init();
    return renderer;
}
//Internal
TScene.prototype.create = function() {
    this.init();
}
TScene.prototype.update = function(deltaTime) {
    this.runSystems(deltaTime);
    this.render();
}
TScene.prototype.runSystems = function(deltaTime) {
    for(let system of this.systems.values())
        if(system.isEnabled())
            system.update(deltaTime);
}
TScene.prototype.render = function() {
    let maxLayers = this.getMaxRenderLayers();
    for(let layer = 0; layer < maxLayers; layer++)
        for(let renderer of this.renderers.values())
            renderer.update(layer);
}
//implementable
TScene.prototype.getMaxRenderLayers = function() {
    return 1;
}
TScene.prototype.init = function() {

}

//=========================================================
function TEntity(id, scene) {
    this.id = id;
    this.scene = scene;
    this.initialized = true;
}
TEntity.prototype.isActive = function() {
    return this.scene.getEntity(this.id) != null;
}
TEntity.prototype.destroy = function() {
    this.scene.destroyEntity(this.id);
}
TEntity.prototype.add = function(compClass) {
    let comp = this.scene.getComponent(this.id, compClass);
    if(comp == null)
        comp = this.scene.createComponent(this.id, compClass);
    return comp;
}
TEntity.prototype.remove = function(compClass) {
    this.scene.destroyComponent(this.id, compClass);
}
TEntity.prototype.get = function(compClasses) {
    if(compClasses == null || Array.isArray(compClasses))
        return this.scene.getComponents(this.id, compClasses);
    return this.scene.getComponent(this.id, compClasses);
}
TEntity.prototype.create = function(compClasses) {
    if(compClasses == null)
        return this;
    const entity = this;
    if(!Array.isArray(compClasses))
        compClasses = [compClasses];
    compClasses.forEach(compClass => {
        const comp = entity.get(compClass);
        if(comp == null)
            entity.add(compClass);
    });
    return this;
}
TEntity.prototype.load = function() {
    return {
        entity: this,
        components: this.get()
    };
}


//==================================================================
function TSystem(scene) {
    this.scene = scene;
    this.engine = scene.engine;
    this.enabled = true;
}
TSystem.prototype.init = function() {

}
TSystem.prototype.update = function(deltaTime) {

}
TSystem.prototype.isEnabled = function() {
    return this.enabled;
}
TSystem.prototype.enable = function(toggle) {
    this.enabled = toggle == true;
}

//====================================================================
function TRenderer(scene) {
    this.scene = scene;
    this.engine = scene.engine;
    this.enabled = true;
}
TRenderer.prototype.init = function() {

}
TRenderer.prototype.update = function(renderLayer) {

}
TRenderer.prototype.isEnabled = function() {
    return this.enabled;
}
TRenderer.prototype.enable = function(toggle) {
    this.enabled = toggle == true;
}