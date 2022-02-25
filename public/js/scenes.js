function TestScene(engine) {
    this.engine = engine;
    TScene.call(this, engine);
}
TestScene.prototype = Object.create(TScene.prototype);
TestScene.prototype.getMaxRenderLayers = function() {
    return this.getEntities([RendererComponent]).reduce( (max, entity) => {
        let layer = entity.get(RendererComponent).layer;
        return layer > max ? layer : max;
    }, 0) + 1;
}
TestScene.prototype.init = function() {
    //Third Person
    const cameraSystem = this.createSystem(ThirdPersonCameraSystem);
    const movementSystem = this.createSystem(ThirdPersonPlayerControllerSystem);

    //First Person
    // const cameraSystem = this.createSystem(FirstPersonCameraSystem);
    // const movementSystem = this.createSystem(FirstPersonPlayerControllerSystem);

    this.createSystem(PhysicsSystem);
    this.createRenderer(MaterialRenderer);

    //ThirdPerson
    const camera = this.createThirdPersonCamera(cameraSystem);
    const player = this.createThirdPersonPlayer(movementSystem, camera);

    //First Person
    // const camera = this.createFirstPersonCamera(cameraSystem);
    // const player = this.createFirstPersonPlayer(movementSystem, camera);

    let ground = this.createEntity().create([TransformComponent, MeshComponent, MaterialComponent, RendererComponent]).load();
    ground.components.mesh.setModel(this.engine, "cube");
    ground.components.material.setTexture(this.engine, "grass");
    ground.components.transform.setScale(200, 1, 200);
    ground.components.transform.position.y = 0;
}
TScene.prototype.createThirdPersonCamera = function(cameraSystem)
{
    const camera = cameraSystem.createCamera();
    camera.components.view.setPosition(0, 30, 60);
    camera.components.thirdPerson.distance = 200;
    camera.components.thirdPerson.pitch = 40;
    camera.components.thirdPerson.turnSpeed = 60*4;
    return camera;
}
TScene.prototype.createFirstPersonCamera = function(cameraSystem)
{
    const camera = cameraSystem.createCamera();
    camera.components.view.setPosition(0, 30, 60);
    camera.components.firstPerson.turnSpeed = 60*4;
    return camera;
}
TScene.prototype.createThirdPersonPlayer = function(controllerSystem, camera) {
    const player = controllerSystem.createPlayer();
    player.components.transform.position.y = 32;
    camera.components.thirdPerson.entityFocus = player.entity;
    return player;
}
TScene.prototype.createFirstPersonPlayer = function(controllerSystem, camera) {
    const player = controllerSystem.createPlayer();
    player.components.transform.position.y = 32;
    camera.components.firstPerson.entityFocus = player.entity;
    return player;
}