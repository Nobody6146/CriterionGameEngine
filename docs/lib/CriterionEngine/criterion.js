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
    renderResolution;
    constructor() {
        this.canvasSelector = "canvas";
        this.debugMode = false;
        this.logLevel = 'info';
        this.renderResolution = new Vector2f([window.screen.width, window.screen.height]);
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
    get resolution() {
        return new Vector2f([this.#engine.canvas.width, this.#engine.canvas.height]);
    }
    clear() {
        this.#engine.gl.viewport(0, 0, this.#engine.canvas.width, this.#engine.canvas.height);
        this.#engine.gl.clear(this.#engine.gl.COLOR_BUFFER_BIT | this.#engine.gl.DEPTH_BUFFER_BIT);
    }
    enableAlphaBlending(toggle) {
        if (toggle === true) {
            this.#engine.gl.enable(this.#engine.gl.BLEND);
            this.#engine.gl.blendFunc(this.#engine.gl.SRC_ALPHA, this.#engine.gl.ONE_MINUS_SRC_ALPHA);
        }
        else {
            this.#engine.gl.disable(this.#engine.gl.BLEND);
        }
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
    renderTriangles(verticesCount) {
        this.#engine.gl.drawArrays(this.#engine.gl.TRIANGLES, 0, verticesCount);
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
    #frameStart = null;
    #deltaTime = null;
    #running = false;
    #canvas;
    #gl;
    static #instance;
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
    static get instance() {
        return this.#instance;
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
        CriterionEngine.#instance = this;
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
    terminate() {
        this.#running = false;
    }
    #update(timestamp) {
        this.#frameStart = timestamp;
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
    get frameStart() {
        return this.#frameStart;
    }
    get deltaTime() {
        return this.#deltaTime;
    }
    get frameRate() {
        return 1 / this.#deltaTime;
    }
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
    get(resourceType, name) {
        let resources = this.#resources.get(resourceType);
        if (resources == null)
            return undefined;
        return !name ? [...resources.values()]?.[0] : resources.get(name);
    }
    add(resource, name = "") {
        let resources = this.#resources.get(resource.constructor);
        if (resources == null) {
            resources = new Map();
            this.#resources.set(resource.constructor, resources);
        }
        resources.set(name, resource);
        return resource;
    }
    remove(resourceType, name) {
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
            scene.cleanup();
            if (this.#currentScene === scene)
                this.#currentScene = null;
        }
        this.#unloadQueue.clear();
    }
}
class CriterionEntity {
    #scene;
    #id;
    #components;
    constructor(id, scene) {
        this.#scene = scene;
        this.#id = id;
        this.#components = new Map();
    }
    get scene() {
        return this.#scene;
    }
    get components() {
        return this.#components;
    }
    /** Gets the entity's component of the given type */
    get(componentType) {
        return this.#components.get(componentType);
    }
    /** Returns the entity's component of the given type or adds a new component if it doesn't exist */
    add(componentType) {
        let registered = this.#scene.registeredComponent(componentType);
        if (!registered) {
            this.#scene.engine.logger.warn(`${componentType.name} is not a registered component and cannot be added`);
            return undefined;
        }
        let component = this.#components.get(componentType);
        if (component !== undefined)
            return component;
        component = new componentType();
        this.#components.set(componentType, component);
        return component;
    }
    /** Sets the component of the entity to a specific value */
    set(componentType, component) {
        let registered = this.#scene.registeredComponent(componentType);
        if (!registered) {
            this.#scene.engine.logger.warn(`${componentType.name} is not a registered component and cannot be added`);
            return undefined;
        }
        this.#components.set(componentType, component);
        return component;
    }
    /** Removes the entity's component of the given type if it exist */
    remove(componentType) {
        let component = this.#components.get(componentType);
        if (component === undefined)
            return undefined;
        this.#components.delete(componentType);
        return component;
    }
    /** Tells the scene to remove the entity */
    destroy() {
        this.#scene.destroyEntity(this.#id);
    }
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
    #componentTypes;
    #systems;
    constructor(engine) {
        this.#engine = engine;
        this.#loaded = false;
        this.#nextEntityId = 0;
        this.#entities = new Map();
        this.#componentTypes = new Set();
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
            this.prepare();
            this.#loaded = true;
        }
        //Update systems
        for (let system of this.#systems.values())
            system.update(deltaTime);
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
    get registeredComponents() {
        return [...this.#componentTypes];
    }
    registeredComponent(componentType) {
        return this.#componentTypes.has(componentType);
    }
    /** Registers a component to be tracked by the engine (otherwise the component can't be added to entities)*/
    registerComponent(componentType) {
        this.#componentTypes.add(componentType);
    }
    /** Gets all the components of the type attached to entities */
    components(componentType) {
        let components = [];
        for (let entity of this.#entities.values()) {
            let component = entity.get(componentType);
            if (component)
                components.push(component);
        }
        return components;
    }
    /** Returns an entity */
    entity(entityId) {
        return this.#entities.get(entityId);
    }
    /** Returns a map of entities that matches the set of components */
    entities(componentTypes) {
        let entities = [];
        for (let entity of this.#entities.values()) {
            let passed = true;
            for (let type of componentTypes) {
                if (!entity.get(type)) {
                    passed = false;
                    break;
                }
            }
            if (passed)
                entities.push(entity);
        }
        return entities;
    }
    /** Creates a new instance of an entity */
    createEntity() {
        let id = this.#nextEntityId++;
        let entity = new CriterionEntity(id, this);
        this.#entities.set(id, entity);
        return entity;
    }
    destroyEntity(entityId) {
        if (!this.#entities.has(entityId))
            return;
        this.#entities.delete(entityId);
    }
}
class CriterionBlueprint {
    #entity;
    constructor(entity) {
        this.#entity = entity;
    }
    #mapPropertiesToEntityComponents() {
        let registeredComponents = this.#entity.scene.registeredComponents;
        for (let componentType of registeredComponents) {
            let componentName = componentType.name.toLowerCase();
            let endsWithComponent = componentName.lastIndexOf("component");
            let namingConvention = endsWithComponent < 0
                ? componentName
                : componentName.substring(0, endsWithComponent);
            //If we find a property with the name that matches the convention:
            // "[NAME]Component" or the name of the component, lets override to map to the component for easy editing
            if (this.hasOwnProperty(namingConvention))
                this.#mapPropertyToComponent(namingConvention, componentType);
        }
    }
    #mapPropertyToComponent(propertyName, componentType) {
        if (this.hasOwnProperty(propertyName)) {
            Object.defineProperty(this, propertyName, {
                get() {
                    return this.#entity.get(componentType);
                },
                set(value) {
                    this.#entity.set(componentType, value);
                }
            });
        }
    }
    get entity() {
        return this.#entity;
    }
    load() {
        this.#mapPropertiesToEntityComponents();
        return this;
    }
    static createDummy(scene, blueprintType) {
        return new blueprintType(new CriterionEntity(-1, scene));
    }
    static entities(scene, blueprintType) {
        let dummyBlueprint = CriterionBlueprint.createDummy(scene, blueprintType);
        return scene.entities(dummyBlueprint.requiredComponents());
    }
    static blueprints(scene, blueprintType) {
        let dummyBlueprint = CriterionBlueprint.createDummy(scene, blueprintType);
        let entities = scene.entities(dummyBlueprint.requiredComponents());
        let blueprints = [];
        for (let entity of entities) {
            let blueprint = new blueprintType(entity).load();
            blueprints.push(blueprint);
        }
        return blueprints;
    }
    static createEntity(entity, blueprintType) {
        if (entity instanceof CriterionScene)
            entity = entity.createEntity();
        let blueprint = new blueprintType(entity);
        blueprint.load();
        for (let componentType of (blueprint.requiredComponents())) {
            entity.add(componentType);
        }
        return blueprint;
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
    bufferArray(data, mode = "static", offset) {
        let drawMode = mode === "static" ? this.#engine.gl.STATIC_DRAW : this.#engine.gl.DYNAMIC_DRAW;
        if (typeof data === "number") {
            this.#engine.gl.bufferData(this.#engine.gl.ARRAY_BUFFER, data, drawMode);
        }
        else {
            if (offset == null)
                this.#engine.gl.bufferData(this.#engine.gl.ARRAY_BUFFER, data, drawMode);
            else
                this.#engine.gl.bufferSubData(this.#engine.gl.ARRAY_BUFFER, offset, data);
        }
    }
    setAttribute(type, index, dimension, normalize = false, stride = 0, offset = 0) {
        let dataType = type === "integer" ? this.#engine.gl.INT : this.#engine.gl.FLOAT;
        this.#engine.gl.vertexAttribPointer(index, dimension, dataType, normalize, stride, offset);
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
    setUniform(uniformLocation, data, uniformDataType = "float") {
        if (typeof data === 'number') {
            if (uniformDataType === "float")
                this.#engine.gl.uniform1f(uniformLocation, data);
            else
                this.#engine.gl.uniform1i(uniformLocation, data);
        }
        else if (Array.isArray(data) && typeof data?.[0] === 'number') {
            if (uniformDataType === "float")
                this.#engine.gl.uniform1fv(uniformLocation, data);
            else
                this.#engine.gl.uniform1iv(uniformLocation, data);
        }
        else if (data instanceof Vector2f) {
            if (uniformDataType === "float")
                this.#engine.gl.uniform2fv(uniformLocation, data.array);
            else
                this.#engine.gl.uniform2iv(uniformLocation, data.array);
        }
        else if (data instanceof Vector3f) {
            if (uniformDataType === "float")
                this.#engine.gl.uniform3fv(uniformLocation, data.array);
            else
                this.#engine.gl.uniform3iv(uniformLocation, data.array);
        }
        else if (data instanceof Vector4f) {
            if (uniformDataType === "float")
                this.#engine.gl.uniform4fv(uniformLocation, data.array);
            else
                this.#engine.gl.uniform4iv(uniformLocation, data.array);
        }
        else if (data instanceof Matrix3f) {
            this.#engine.gl.uniformMatrix3fv(uniformLocation, false, data.array);
        }
        else if (data instanceof Matrix4f) {
            this.#engine.gl.uniformMatrix4fv(uniformLocation, false, data.array);
        }
    }
    createShaderProgram(vertexShaderSource, fragmentShaderSource, attributeLocations = new Map(), uniformNames = []) {
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
            uniformLocations: uniforms,
            attributes: attributeLocations
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
    get maxTextures() {
        return this.#engine.gl.getParameter(this.#engine.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    }
    createTexture() {
        const texture = this.#engine.gl.createTexture();
        this.#textures.add(texture);
        return texture;
    }
    bindTexture(texture) {
        this.#engine.gl.bindTexture(this.#engine.gl.TEXTURE_2D, texture);
    }
    unbindTexture() {
        this.bindTexture(null);
    }
    useTexture(index) {
        this.#engine.gl.activeTexture(index);
    }
    bufferTexture(level, width, height, image, aliasing) {
        let border = 0;
        //@ts-ignore
        this.#engine.gl.texImage2D(this.#engine.gl.TEXTURE_2D, level, this.#engine.gl.RGBA, width, height, border, this.#engine.gl.RGBA, this.#engine.gl.UNSIGNED_BYTE, image);
        let renderLevel = aliasing === "nearest" ? this.#engine.gl.NEAREST : this.#engine.gl.LINEAR;
        const isPowerOf2 = function isPowerOf2(value) {
            return (value & (value - 1)) == 0;
        };
        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(width) && isPowerOf2(height)) {
            // Yes, it's a power of 2. Generate mips.
            this.#engine.gl.generateMipmap(this.#engine.gl.TEXTURE_2D);
        }
        else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            this.#engine.gl.texParameteri(this.#engine.gl.TEXTURE_2D, this.#engine.gl.TEXTURE_WRAP_S, this.#engine.gl.CLAMP_TO_EDGE);
            this.#engine.gl.texParameteri(this.#engine.gl.TEXTURE_2D, this.#engine.gl.TEXTURE_WRAP_T, this.#engine.gl.CLAMP_TO_EDGE);
        }
        if (aliasing)
            this.#engine.gl.texParameteri(this.#engine.gl.TEXTURE_2D, this.#engine.gl.TEXTURE_MIN_FILTER, renderLevel);
    }
}
class CriterionRenderBatch {
    buffer;
    textures;
    colors;
    constructor() {
        this.buffer = [];
        this.textures = [];
        this.colors = [];
    }
    get verticesCount() {
        return this.buffer.length / CriterionRenderBatcher.totalBytesPerVertex * 4;
    }
}
class CriterionRenderBatcher {
    #layers;
    constructor() {
        this.#layers = new Map();
    }
    clear() {
        this.#layers.clear();
    }
    buffer(renderable) {
        let renderLayer = this.#layers.get(renderable.layer);
        if (!renderLayer) {
            renderLayer = [];
            this.#layers.set(renderable.layer, renderLayer);
        }
        renderLayer.push(renderable);
    }
    batch(maxBufferSize, maxTextures) {
        let batches = [new CriterionRenderBatch()];
        let batch = batches[0];
        //Batch in order of layers/priority
        let layerNumbers = [...this.#layers.keys()].sort((x, y) => x - y);
        for (let layerNumber of layerNumbers) {
            let layer = this.#layers.get(layerNumber);
            for (let renderable of layer) {
                let spaceNeeded = renderable.vertices.length * CriterionRenderBatcher.totalBytesPerVertex / 4;
                if (batch.buffer.length + spaceNeeded > maxBufferSize) {
                    batch = new CriterionRenderBatch();
                    batches.push(batch);
                }
                //Determine texture and color ids (also move batches if needed)
                let textureId = renderable.texture == null ? null : batch.textures.indexOf(renderable.texture);
                if (textureId < 0) {
                    if (batch.textures.length === maxTextures) {
                        batch = new CriterionRenderBatch();
                        batches.push(batch);
                    }
                    textureId = batch.textures.length;
                    batch.textures.push(renderable.texture);
                }
                else if (textureId === null) {
                    textureId = -1;
                }
                let colorId = renderable.color == null ? null : batch.colors.findIndex(x => x.equals(renderable.color));
                if (colorId < 0) {
                    if (batch.colors.length === maxTextures) {
                        batch = new CriterionRenderBatch();
                        batches.push(batch);
                    }
                    colorId = batch.colors.length;
                    batch.colors.push(renderable.color);
                }
                else if (colorId === null) {
                    colorId = -1;
                }
                //Batch the model's data
                for (let i = 0; i < renderable.vertices.length; i++) {
                    let vertice = renderable.vertices[i];
                    let textureCoords = renderable.textureCoordinates[i] ?? new Vector2f([0, 0]);
                    batch.buffer.push(...vertice.array);
                    batch.buffer.push(...textureCoords.array);
                    batch.buffer.push(textureId);
                    batch.buffer.push(colorId);
                }
            }
        }
        return batches;
    }
    static get totalBytesPerVertex() {
        return this.numberOfVertexBytes + this.numberOfTextureCoordinateBytes + this.numberOfTextureIdBytes + this.numberOfColorIdBytes;
    }
    static get numberOfVertexBytes() {
        return 12;
    }
    static get numberOfTextureCoordinateBytes() {
        return 8;
    }
    static get numberOfTextureIdBytes() {
        return 4;
    }
    static get numberOfColorIdBytes() {
        return 4;
    }
}
class CriterionShader {
    #program;
    #uniforms;
    #attributes;
    constructor(program, uniforms, attributes) {
        this.#program = program;
        this.#uniforms = uniforms;
        this.#attributes = attributes;
    }
    get program() {
        return this.#program;
    }
    get uniforms() {
        return this.#uniforms;
    }
    get attributes() {
        return this.#attributes;
    }
    run(scene, batches) {
        scene.engine.memoryManager.startShaderProgram(this.#program);
        let entities = this.prepare(scene);
        for (let batch of batches) {
            this.render(scene, batch);
        }
        this.cleanup(scene);
        scene.engine.memoryManager.stopShaderProgram();
    }
    static indexToTextureId(engine, index) {
        return index === 0 || index > 32
            ? engine.gl.TEXTURE0 : engine.gl.TEXTURE0 + index;
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
