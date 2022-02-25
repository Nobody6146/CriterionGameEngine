class CriterionError extends Error {
    constructor(message) {
        super(message);
    }
}
class CriterionEngineLogger {
    #engine;
    constructor(engine) {
        this.#engine = engine;
    }
    #log(logLevel, message) {
        const formattedMessage = `::${new Date().toISOString()}>>\t${message}`;
        switch (logLevel) {
            case 'debug':
                console.log(`DEBUG${formattedMessage}`);
                break;
            case 'engine':
                console.log(`ENGINE${formattedMessage}`);
                break;
            case 'error':
                console.error(`WARNING${formattedMessage}`);
                break;
            case 'info':
                console.log(`INFO${formattedMessage}`);
                break;
            case 'warning':
                console.warn(`WARNING${formattedMessage}`);
                break;
        }
    }
    debug(message) {
        return this.#log('debug', message);
    }
    engine(message) {
        return this.#log('engine', message);
    }
    error(error) {
        if (error instanceof Error) {
            return this.#log('error', error.stack);
        }
        return this.#log('error', error);
    }
    info(message) {
        return this.#log('info', message);
    }
    warn(message) {
        return this.#log('warning', message);
    }
}
//****** Options ************/
class CriterionEngineOptions {
    canvasSelector;
    debugMode;
    logLevel;
    constructor() {
        this.canvasSelector = "canvas";
        this.debugMode = false;
        this.logLevel = 'info';
    }
}
//===================
class CriterionWindow {
    #engine;
    constructor(engine) {
        this.#engine = engine;
        this.#engine.logger.engine("initializing window");
        this.#engine.gl.clearColor(0, 0, 0, 1);
        //this.depthTest();
        //this.cullFace();
        this.#engine.logger.engine("window initialized");
    }
    get width() {
        return this.#engine.canvas.width;
    }
    get height() {
        return this.#engine.canvas.height;
    }
    get size() {
        return new Vector2f([this.width, this.height]);
    }
    clear() {
        this.#engine.gl.viewport(0, 0, this.#engine.canvas.width, this.#engine.canvas.height);
        this.#engine.gl.clear(this.#engine.gl.COLOR_BUFFER_BIT | this.#engine.gl.DEPTH_BUFFER_BIT);
    }
    enableDepthTest(toggle) {
        if (toggle === true)
            this.#engine.gl.enable(this.#engine.gl.DEPTH_TEST);
        else
            this.#engine.gl.disable(this.#engine.gl.DEPTH_TEST);
    }
    cullFace(toggle, frontFace = true, backFace = false) {
        if (toggle === true) {
            this.#engine.gl.enable(this.#engine.gl.CULL_FACE);
            if (frontFace) {
                if (!backFace)
                    this.#engine.gl.cullFace(this.#engine.gl.FRONT);
                else
                    this.#engine.gl.cullFace(this.#engine.gl.FRONT_AND_BACK);
            }
            else
                this.#engine.gl.cullFace(this.#engine.gl.BACK);
        }
        else
            this.#engine.gl.disable(this.#engine.gl.CULL_FACE);
    }
}
class CriterionKeyboardKey {
    #keyboard;
    code; //Prop
    key; //display name
    down;
    up;
    newPress;
    timeStamp;
    display;
    constructor(keyboard, code, key) {
        this.#keyboard = keyboard;
        //Default some values until we load them
        this.code = code;
        this.key = code;
        this.down = false;
        this.newPress = true;
        this.timeStamp = null;
        this.display = key.length === 1 ? key.toUpperCase() : key.replace(/([A-Z][a-z]+)([A-Z])/, "$1 $2");
    }
    get downTime() {
        return performance.now() - this.timeStamp;
    }
}
class CriterionKeyboard {
    #engine;
    keys;
    capsLock;
    numLock;
    shift;
    alt;
    control;
    recentKey;
    constructor(engine, mapping) {
        this.#engine = engine;
        this.#engine.logger.engine("initializing keyboard");
        this.keys = new Map();
        for (const code of Object.values(CriterionKeyboardKeys)) {
            let keyMapping = mapping.find(x => x[0] === code);
            this.keys.set(code, new CriterionKeyboardKey(this, code, keyMapping?.[1] ?? code));
        }
        this.recentKey = null;
        this.#engine.canvas.addEventListener("keydown", this.#updateKey.bind(this));
        this.#engine.canvas.addEventListener("keyup", this.#updateKey.bind(this));
        this.#engine.logger.engine("Keyboard initialized");
    }
    async #updateKey(event) {
        let key = this.keys.get(event.code);
        key.key = event.key;
        if (event.type === 'keydown') {
            if (!key.down)
                key.newPress = true;
            key.down = true;
            key.up = true;
            key.timeStamp = performance.now();
        }
        else {
            key.up = true;
            key.down = false;
            key.timeStamp = null;
        }
        this.capsLock = event.getModifierState("CapsLock");
        this.numLock = event.getModifierState("NumLock");
        this.shift = event.getModifierState("Shift");
        this.alt = event.getModifierState("ALt");
        this.control = event.getModifierState("Control");
    }
    update(deltaTime) {
        for (let key of this.keys.values()) {
            key.up = false;
            key.newPress = false;
        }
        this.recentKey = null;
    }
}
class CriterionMouseButton {
    #mouse;
    button; //display name
    down;
    up;
    newPress;
    timeStamp;
    display;
    constructor(mouse, button) {
        this.#mouse = mouse;
        //Default some values until we load them
        this.button = button;
        this.down = false;
        this.up = false;
        this.newPress = false;
        this.timeStamp = null;
        switch (button) {
            case 0:
                this.display = "Left Click";
                break;
            case 1:
                this.display = "Middle Click";
                break;
            case 2:
                this.display = "Right Click";
                break;
            default:
                this.display = "Click " + button;
                break;
        }
    }
    get downTime() {
        return performance.now() - this.timeStamp;
    }
}
class CriterionMouse {
    #engine;
    position;
    buttons;
    recentButton;
    constructor(engine) {
        this.#engine = engine;
        this.#engine.logger.engine("intitializing mouse");
        this.position = {
            x: null,
            y: null
        };
        this.buttons = new Map();
        for (let i = 0; i < 3; i++)
            this.buttons.set(1, new CriterionMouseButton(this, i));
        this.recentButton = null;
        // Add the event listeners for mousedown, mousemove, and mouseu
        this.#engine.canvas.addEventListener("mousemove", this.#mouseUpdate.bind(this));
        this.#engine.canvas.addEventListener("mousedown", this.#mouseUpdate.bind(this));
        this.#engine.canvas.addEventListener("mouseup", this.#mouseUpdate.bind(this));
        this.#engine.logger.engine("mouse initialized");
    }
    #mouseUpdate(event) {
        let button = this.buttons.get(event.button);
        if (button == null)
            return;
        switch (event.type) {
            case 'mousedown':
                if (!button.down)
                    button.newPress = true;
                button.down = true;
                button.up = false;
                button.timeStamp = performance.now();
            case 'mouseup':
                button.down = false;
                button.up = true;
                button.newPress = false;
                button.timeStamp = null;
        }
        this.recentButton = button;
    }
    update(deltaTime) {
        for (let button of this.buttons.values()) {
            button.up = false;
            button.newPress = false;
        }
        this.recentButton = null;
    }
}
//=================
class CriterionEngine {
    // this.memmoryManager = new TMemmoryManager(this);
    // this.windowManager = new TWindowManager(this);
    // this.resourceManager = new TResourceManager(this);
    // this.sceneManager = new TSceneMananger(this);
    // this.controllerManager = new TGameControllerManager(this);
    #logger;
    #resourceManager;
    #memoryManager;
    #window;
    #keyboard;
    #mouse;
    #sceneManager;
    options;
    #lastFrame = null;
    #deltaTime = null;
    #running = false;
    #canvas;
    #gl;
    constructor(options) {
        if (this.constructor === CriterionEngine) {
            throw new TypeError('CriterionEngine is an abstract class');
        }
        if (!options)
            options = new CriterionEngineOptions();
        this.options = options;
        this.#canvas = document.querySelector(this.options.canvasSelector);
        this.#gl = this.#canvas.getContext('webgl2');
        this.#deltaTime = 0;
        if (!this.isSupported)
            throw new CriterionError("WebGL2 is not supported");
    }
    get isSupported() {
        return this.gl !== undefined;
    }
    get gl() {
        return this.#gl;
    }
    get resourceManager() {
        return this.#resourceManager;
    }
    get canvas() {
        return this.#canvas;
    }
    get logger() {
        return this.#logger;
    }
    get memoryManager() {
        return this.#memoryManager;
    }
    get window() {
        return this.#window;
    }
    get keyboard() {
        return this.#keyboard;
    }
    get mouse() {
        return this.#mouse;
    }
    get sceneManager() {
        return this.#sceneManager;
    }
    async launch() {
        if (!this.isSupported)
            throw new CriterionError("WebGL2 is not supported");
        this.#logger = new CriterionEngineLogger(this);
        this.#resourceManager = new CriterionResourceManager(this);
        this.#memoryManager = new CriterionMemmoryManager(this);
        this.logger.engine("Criterion is starting");
        this.#window = new CriterionWindow(this);
        let keyboardLayout = null;
        try {
            //@ts-ignore
            keyboardLayout = await navigator.keyboard.getLayoutMap();
        }
        catch {
        }
        //@ts-ignore
        this.#keyboard = new CriterionKeyboard(this, keyboardLayout != null ? [...keyboardLayout.entries()] : []);
        this.#mouse = new CriterionMouse(this);
        this.#sceneManager = new CriterionSceneManager(this);
        this.#running = true;
        this.logger.engine("initializing game");
        await this.init();
        this.logger.engine("game initialized");
        this.logger.engine("Game starting");
        this.#lastFrame = performance.now();
        window.requestAnimationFrame(this.#update.bind(this));
        return true;
    }
    #update(timestamp) {
        this.#deltaTime = (timestamp - this.#lastFrame) / 1000;
        this.#lastFrame = timestamp;
        this.#window.clear();
        this.#keyboard.update(this.#deltaTime);
        this.#mouse.update(this.#deltaTime);
        //this.controllerManager.update(this.deltaTime);
        this.sceneManager.update(this.#deltaTime);
        if (this.#running)
            window.requestAnimationFrame(this.#update.bind(this));
        else {
            //this.memmoryManager.freeAll();
            this.#logger.engine("Game terminated");
        }
    }
    getFrameRate = function () {
        return 1 / this.#deltaTime;
    };
}
class CriterionResourceManager {
    #engine;
    #resources;
    constructor(engine) {
        this.#engine = engine;
        this.#engine.logger.engine("initializing resource manager");
        this.#resources = new Map();
        this.#engine.logger.engine("resource manager initialed");
    }
    resources(...resourceTypes) {
        if (resourceTypes == null || resourceTypes.length === 0)
            return this.#resources;
        let resources = new Map();
        for (let resourceType of resourceTypes)
            resources.set(resourceType, this.#resources.get(resourceType) ?? new Map());
        return resources;
    }
    get(name, resourceType) {
        let resources = this.#resources.get(resourceType);
        if (resources == null)
            return undefined;
        return resources.get(name);
    }
    add(name, resource) {
        let resources = this.#resources.get(resource.constructor);
        if (resources == null) {
            resources = new Map();
            this.#resources.set(resource.constructor, resources);
        }
        resources.set(name, resource);
        return resource;
    }
    remove(name, resourceType) {
        let resources = this.#resources.get(resourceType);
        if (resources == null)
            return false;
        return resources.delete(name);
    }
}
//=============== Scene ===================//
class CriterionSceneManager {
    #engine;
    #currentScene;
    #loadedScenes;
    #loadQueue;
    #unloadQueue;
    constructor(engine) {
        this.#engine = engine;
        this.#currentScene = null;
        this.#loadedScenes = new Map();
        this.#loadQueue = null;
        this.#unloadQueue = new Set();
    }
    get currentScene() {
        return this.#currentScene;
    }
    load(scene, swap = false) {
        if (scene == null) {
            this.#engine.logger.warn("Scene is empty");
            return undefined;
        }
        if (scene instanceof CriterionScene) {
            let type = scene.constructor;
            let loadedScene = this.#loadedScenes.get(type);
            this.#loadedScenes.set(type, scene);
            if (loadedScene != null && !swap)
                this.#unloadQueue.add(loadedScene);
            this.#loadQueue = scene;
            return scene;
        }
        else {
            let type = scene;
            scene = new type(this.#engine);
            let loadedScene = this.#loadedScenes.get(type);
            this.#loadedScenes.set(type, scene);
            if (loadedScene != null && !swap)
                this.#unloadQueue.add(loadedScene);
            this.#loadQueue = scene;
            return scene;
        }
    }
    unload(scene, swap = false) {
        if (scene == null) {
            this.#engine.logger.warn("Scene is empty");
            return false;
        }
        if (scene instanceof CriterionScene) {
            let type = scene.constructor;
            if (this.#loadedScenes.get(type) !== scene)
                return false;
            if (!this.#loadedScenes.delete(type))
                return false;
            this.#unloadQueue.add(scene);
            return true;
        }
        else {
            let type = scene;
            let loadedScene = this.#loadedScenes.get(type);
            if (!this.#loadedScenes.delete(type))
                return false;
            this.#unloadQueue.add(loadedScene);
            return true;
        }
    }
    update(deltaTime) {
        if (this.#currentScene != null)
            this.#currentScene.update(deltaTime);
        if (this.#loadQueue != null) {
            this.#currentScene = this.#loadQueue;
            this.#loadQueue = null;
        }
        for (let scene of this.#unloadQueue) {
            scene.release();
            if (this.#currentScene === scene)
                this.#currentScene = null;
        }
        this.#unloadQueue.clear();
    }
}
class CriterionBlueprint {
    static components() {
        return [];
    }
    static entities(scene) {
        return scene.entities(...this.components());
    }
    static createEntity(entity) {
        return entity.includes(...this.components());
    }
}
class CriterionEntity {
    #scene;
    id;
    constructor(id, scene) {
        this.#scene = scene;
        this.id = id;
    }
    get scene() {
        return this.#scene;
    }
    add(componentType) {
        return this.#scene.addComponent(this.id, componentType);
    }
    adds(...componentTypes) {
        let components = new Map();
        for (let componentType of componentTypes)
            components.set(componentType, this.add(componentType));
        return components;
    }
    include(componentType) {
        let component = this.#scene.component(this.id, componentType);
        if (component != null)
            return component;
        return this.#scene.addComponent(this.id, componentType);
    }
    includes(...componentTypes) {
        let components = new Map();
        for (let componentType of componentTypes)
            components.set(componentType, this.include(componentType));
        return components;
    }
    component(componentTpe) {
        return this.#scene.component(this.id, componentTpe);
    }
}
class CriterionComponent {
}
class CriterionSystem {
    #scene;
    constructor(scene) {
        if (this.constructor === CriterionEngine) {
            throw new TypeError('CriterionEngine is an abstract class');
        }
        this.#scene = scene;
    }
    get scene() {
        return this.#scene;
    }
}
class CriterionScene {
    #engine;
    #loaded;
    #nextEntityId;
    #entities;
    #destroyedEntities;
    #components;
    #systems;
    constructor(engine) {
        this.#engine = engine;
        this.#loaded = false;
        this.#nextEntityId = 0;
        this.#entities = new Set();
        this.#destroyedEntities = new Set();
        this.#components = new Map();
        this.#systems = new Map();
    }
    get engine() {
        return this.#engine;
    }
    get isLoaded() {
        return this.#loaded;
    }
    update(deltaTime) {
        //Init
        if (!this.isLoaded) {
            this.init();
            this.#loaded = true;
        }
        //Update systems
        for (let system of this.#systems.values())
            system.update(deltaTime);
        //Cleanup any removed entities
        this.#cleanupEntities();
    }
    #cleanupEntities() {
        for (let entityId of this.#destroyedEntities) {
            if (!this.#entities.has(entityId))
                return;
            for (let components of this.#components.values())
                components.delete(entityId);
        }
    }
    system(systemType) {
        return this.#systems.get(systemType);
    }
    systems() {
        return this.#systems;
    }
    addSystem(system) {
        if (system == null) {
            this.#engine.logger.warn("System is empty");
            return undefined;
        }
        if (system instanceof CriterionSystem) {
            let type = system.constructor;
            this.#systems.set(type, system);
            return system;
        }
        else {
            let type = system;
            system = new type(this);
            this.#systems.set(type, system);
            return system;
        }
    }
    /** Returns the list of components attached to that entity */
    entity(entityId) {
        if (!this.#entities.has(entityId))
            return null;
        let entity = new Map();
        for (let componentType of this.#components.keys()) {
            let component = this.#components.get(componentType);
            if (component != null)
                entity.set(componentType, component);
        }
        return entity;
    }
    /** Returns a map of entities that matches the set of components */
    entities(...componentTypes) {
        let entities = new Map();
        //Grab a list of entities that have these components
        for (let type of componentTypes) {
            let components = this.#components.get(type);
            //If component list doesn't exist, then we have no components that match this constraint;
            if (components === undefined)
                return new Map();
            for (let id of components.keys()) {
                let entity = entities.get(id);
                if (entity === undefined) {
                    entity = new Map();
                    entities.set(id, entity);
                }
                entity.set(type, components.get(id));
            }
        }
        //Prune out any entities that did not have all the components
        for (let entity of entities.keys()) {
            if (entities.get(entity).size < componentTypes.length)
                entities.delete(entity);
        }
        return entities;
    }
    /** Creates a new instance of an entity */
    createEntity() {
        let id = this.#nextEntityId++;
        this.#entities.add(id);
        return new CriterionEntity(id, this);
    }
    destroyEntity(entityId) {
        this.#destroyedEntities.add(entityId);
    }
    /** Gets an entity's component */
    component(entityId, componentTpe) {
        let components = this.#components.get(componentTpe);
        if (components === undefined)
            return undefined;
        let component = components.get(entityId);
        return component;
    }
    /** Gets a list of all entities with the component */
    components(componentType) {
        let components = this.#components.get(componentType);
        if (components == null)
            return new Map();
        let results = new Map();
        for (let entityId of components.keys())
            results.set(entityId, components.get(entityId));
        return results;
    }
    /** Adds a component to an entity */
    addComponent(entityId, component) {
        if (!this.#entities.has(entityId)) {
            this.#engine.logger.warn(`Entity of id: ${entityId} does not exist`);
            return undefined;
        }
        if (component == null) {
            this.#engine.logger.warn("Component is empty");
            return undefined;
        }
        if (component instanceof CriterionComponent) {
            let type = component.constructor;
            let components = this.#components.get(type);
            if (components == null) {
                components = new Map();
                this.#components.set(type, components);
            }
            components.set(entityId, component);
            return component;
        }
        else {
            let type = component;
            let components = this.#components.get(type);
            component = new component();
            if (components == null) {
                components = new Map();
                this.#components.set(type, components);
            }
            components.set(entityId, component);
            return component;
        }
    }
    removeComponent(entityId, component) {
        if (!this.#entities.has(entityId)) {
            this.#engine.logger.warn(`Entity of id: ${entityId} does not exist`);
            return undefined;
        }
        if (component == null) {
            this.#engine.logger.warn("Component is empty");
            return undefined;
        }
        if (component instanceof CriterionComponent) {
            let type = component.constructor;
            let components = this.#components.get(type);
            if (components == null || components.get(entityId) !== component)
                return false;
            return components.delete(entityId);
        }
        else {
            let type = component;
            let components = this.#components.get(type);
            component = new component();
            if (components == null)
                return false;
            return components.delete(entityId);
        }
    }
}
//======== Memory Manager =============//
class CriterionMemmoryManager {
    #engine;
    #vbos;
    #vaos;
    #shaders;
    #shaderPrograms;
    #textures;
    // this.boundVao = null;
    // this.boundVboArray = null;
    // this.boundVboElements = null;
    // this.boundShaderProgram = null;
    // this.boundAttributes = [];
    // this.bound2DTexture = null;
    // this.activeTexture = null;
    constructor(engine) {
        this.#engine = engine;
        this.#engine.logger.engine("initializing memory manager");
        this.#vbos = new Set();
        this.#vaos = new Set();
        this.#shaders = new Set();
        this.#shaderPrograms = new Set();
        this.#textures = new Set();
        this.#engine.logger.engine("memory manager initialed");
        //we'll assume 0 doesn't exist and ignore that index
        // for(let i = 0; i < this.engine.gl.MAX_VERTEX_ATTRIBS + 1; i++)
        //     this.boundAttributes.push(false);
    }
    /** Creates vbo */
    createBuffer() {
        let vbo = this.#engine.gl.createBuffer();
        this.#vbos.add(vbo);
        return vbo;
    }
    bindBufferArray(vbo) {
        this.#engine.gl.bindBuffer(this.#engine.gl.ARRAY_BUFFER, vbo);
    }
    unbindBufferArray() {
        return this.bindBufferArray(null);
    }
    bufferArray(data, dynamic = false) {
        let drawMode = dynamic ? this.#engine.gl.STATIC_DRAW : this.#engine.gl.DYNAMIC_DRAW;
        this.#engine.gl.bufferData(this.#engine.gl.ARRAY_BUFFER, data, drawMode);
    }
    setFloatAttribute(index, dimension, normalize = false, stride = 0, offset = 0) {
        this.#engine.gl.vertexAttribPointer(index, dimension, this.#engine.gl.FLOAT, normalize, stride, offset);
    }
    setIntAttribute(index, dimension, normalize = false, stride = 0, offset = 0) {
        this.#engine.gl.vertexAttribPointer(index, dimension, this.#engine.gl.INT, normalize, stride, offset);
    }
    /** Creates vao */
    createArray() {
        let vao = this.#engine.gl.createVertexArray();
        this.#vaos.add(vao);
        return vao;
    }
    bindArray(vao) {
        this.#engine.gl.bindVertexArray(vao);
    }
    unbindArray() {
        return this.bindArray(null);
    }
    enableAttribute(index) {
        this.#engine.gl.enableVertexAttribArray(index);
    }
    disableAttribute(index) {
        this.#engine.gl.disableVertexAttribArray(index);
    }
    // TMemmoryManager.prototype.createTexture = function(image) {
    //     const texture = this.engine.gl.createTexture();
    //     this.textures.push(texture);
    //     return texture;
    // }
    startShaderProgram(shaderProgram) {
        this.#engine.gl.useProgram(shaderProgram);
    }
    stopShaderProgram() {
        return this.startShaderProgram(null);
    }
    setUniform(uniformLocation, data) {
        if (typeof data === 'number')
            this.#engine.gl.uniform1f(uniformLocation, data);
        else if (data instanceof Vector2f)
            this.#engine.gl.uniform2fv(uniformLocation, data.array);
        else if (data instanceof Vector3f)
            this.#engine.gl.uniform3fv(uniformLocation, data.array);
        else if (data instanceof Vector4f)
            this.#engine.gl.uniform4fv(uniformLocation, data.array);
        else if (data instanceof Matrix3f)
            this.#engine.gl.uniformMatrix3fv(uniformLocation, false, data.array);
        else if (data instanceof Matrix4f)
            this.#engine.gl.uniformMatrix4fv(uniformLocation, false, data.array);
    }
    createShaderProgram(vertexShaderSource, fragmentShaderSource, attributeLocations, uniformNames) {
        let vertexShader = this.#createVertexShader(vertexShaderSource);
        let fragmentShader = this.#createFragmentShader(fragmentShaderSource);
        const program = this.#engine.gl.createProgram();
        this.#engine.gl.attachShader(program, vertexShader);
        this.#engine.gl.attachShader(program, fragmentShader);
        //Bind locations
        if (attributeLocations != null) {
            for (let attribute of attributeLocations.keys())
                this.#engine.gl.bindAttribLocation(program, attributeLocations.get(attribute), attribute);
        }
        this.#engine.gl.linkProgram(program);
        this.#shaderPrograms.add(program);
        if (!this.#engine.gl.getProgramParameter(program, this.#engine.gl.LINK_STATUS)) {
            var info = this.#engine.gl.getProgramInfoLog(program);
            let error = new Error('Could not compile WebGL program. \n\n' + info);
            this.#engine.logger.error(info);
            this.#engine.gl.deleteProgram(program);
            throw error;
        }
        let uniforms = new Map();
        if (uniformNames != null) {
            for (let i = 0; i < uniformNames.length; i++)
                uniforms.set(uniformNames[i], this.#engine.gl.getUniformLocation(program, uniformNames[i]));
        }
        return {
            shaderProgram: program,
            uniformLocations: uniforms
        };
    }
    #createVertexShader(source) {
        return this.#createShader(this.#engine.gl.VERTEX_SHADER, source);
    }
    #createFragmentShader(source) {
        return this.#createShader(this.#engine.gl.FRAGMENT_SHADER, source);
    }
    #createShader(shaderType, source) {
        const shader = this.#engine.gl.createShader(shaderType);
        this.#engine.gl.shaderSource(shader, source);
        this.#engine.gl.compileShader(shader);
        // Check the compile status
        var compiled = this.#engine.gl.getShaderParameter(shader, this.#engine.gl.COMPILE_STATUS);
        const engine = this.#engine;
        if (!compiled) {
            // Something went wrong during compilation; get the error
            var lastError = this.#engine.gl.getShaderInfoLog(shader);
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
            let error = new Error(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(source, lastError)}`);
            engine.logger.error(error);
            engine.gl.deleteShader(shader);
            throw error;
        }
        this.#shaders.add(shader);
        return shader;
    }
}
class CriterionKeyboardKeys {
    static altLeft = "AltLeft";
    static altRight = "AltRight";
    static arrowDown = "ArrowDown";
    static arrowLeft = "ArrowLeft";
    static arrowRight = "ArrowRight";
    static arrowUp = "ArrowUp";
    static backquote = "Backquote";
    static backslash = "Backslash";
    static backspace = "Backspace";
    static bracketLeft = "BracketLeft";
    static bracketRight = "BracketRight";
    static capsLock = "CapsLock";
    static comma = "Comma";
    static contextMenu = "ContextMenu";
    static controlLeft = "ControlLeft";
    static controlRight = "ControlRight";
    static delete = "Delete";
    static digit0 = "Digit0";
    static digit1 = "Digit1";
    static digit2 = "Digit2";
    static digit3 = "Digit3";
    static digit4 = "Digit4";
    static digit5 = "Digit5";
    static digit6 = "Digit6";
    static digit7 = "Digit7";
    static digit8 = "Digit8";
    static digit9 = "Digit9";
    static end = "End";
    static enter = "Enter";
    static equal = "Equal";
    static escape = "Escape";
    static f1 = "F1";
    static f2 = "F2";
    static f3 = "F3";
    static f4 = "F4";
    static f5 = "F5";
    static f6 = "F6";
    static f7 = "F7";
    static f8 = "F8";
    static f9 = "F9";
    static f10 = "F10";
    static f11 = "F11";
    static f12 = "F12";
    static home = "Home";
    static insert = "Insert";
    static keyA = "KeyA";
    static keyB = "KeyB";
    static keyC = "KeyC";
    static keyD = "KeyD";
    static keyE = "KeyE";
    static keyF = "KeyF";
    static keyG = "KeyG";
    static keyH = "KeyH";
    static keyI = "KeyI";
    static keyJ = "KeyJ";
    static keyK = "KeyK";
    static keyL = "KeyL";
    static keyM = "KeyM";
    static keyN = "KeyN";
    static keyO = "KeyO";
    static keyP = "KeyP";
    static keyQ = "KeyQ";
    static keyR = "KeyR";
    static keyS = "KeyS";
    static keyT = "KeyT";
    static keyU = "KeyU";
    static keyV = "KeyV";
    static keyW = "KeyW";
    static keyX = "KeyX";
    static keyY = "KeyY";
    static keyZ = "KeyZ";
    static metaLeft = "MetaLeft";
    static metaRight = "MetaRight";
    static minus = "Minus";
    static numLock = "NumLock";
    static numpad0 = "Numpad0";
    static numpad1 = "Numpad1";
    static numpad2 = "Numpad2";
    static numpad3 = "Numpad3";
    static numpad4 = "Numpad4";
    static numpad5 = "Numpad5";
    static numpad6 = "Numpad6";
    static numpad7 = "Numpad7";
    static numpad8 = "Numpad8";
    static numpad9 = "Numpad9";
    static numpadAdd = "NumpadAdd";
    static numpadDecimal = "NumpadDecimal";
    static numpadDivide = "NumpadDivide";
    static numpadMultiply = "NumpadMultiply";
    static numpadSubtract = "NumpadSubtract";
    static pageDown = "PageDown";
    static pageUp = "PageUp";
    static pause = "Pause";
    static period = "Period";
    static printScreen = "PrintScreen";
    static quote = "Quote";
    static scrollLock = "ScrollLock";
    static semicolon = "Semicolon";
    static shiftLeft = "ShiftLeft";
    static shiftRight = "ShiftRight";
    static slash = "Slash";
    static space = "Space";
    static tab = "Tab";
}
class CriterionMouseButtons {
    static buttonLeft = 1;
    static buttonMiddle = 2;
    static buttonRight = 3;
}
// class TransformComponent extends CriterionComponent
// {
//     x: 0;
//     y: 0;
// }
// class MeshComponent extends CriterionComponent
// {
//     texture: 0;
// }
// class PlayerBlueprint extends CriterionBlueprint
// {
//     static components(): (new () => CriterionComponent)[] {
//         return [TransformComponent, MeshComponent];
//     }
// }
// let scene = new CriterionScene(null);
// let entity = scene.createEntity();
// let components = PlayerBlueprint.createEntity(entity);
// let transform = components.get(TransformComponent) as TransformComponent;
// for(let entity of scene.entities(TransformComponent, MeshComponent).values())
// {
//     let transform = entity.get(TransformComponent) as TransformComponent;
//     let mesh = entity.get(MeshComponent) as MeshComponent;
//     console.log(transform.x + mesh.texture);
// }
