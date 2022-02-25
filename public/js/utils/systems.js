//============
function ThirdPersonCameraSystem(scene) {
    TSystem.call(this, scene);
}
ThirdPersonCameraSystem.prototype = Object.create(TSystem.prototype);
ThirdPersonCameraSystem.prototype.getComponents = function() {
    return [ViewComponent, PerspectiveComponent, ThirdPersonComponent];
}
ThirdPersonCameraSystem.prototype.createCamera = function() {
    const camera = this.scene.createEntity().create(this.getComponents()).load();
    return camera;
}
ThirdPersonCameraSystem.prototype.init = function() {
    
}
ThirdPersonCameraSystem.prototype.update = function(deltaTime) {
    const forwardOffset = 90;

    const camera = this.getCamera();
    const player = this.getPlayer();
    const controller = this.getController();

    //Rotate our camera
    const turnSpeed = camera.components.thirdPerson.turnSpeed;
    // if(controller != null && controller.isConnected())
    if(controller != null)
    {
        let rs = controller.inputs.rs;
        if(rs == null)
        rs = {x: 0, y: 0}
        camera.components.thirdPerson.pitch = (camera.components.thirdPerson.pitch + rs.y*turnSpeed*deltaTime) % 360;
        camera.components.thirdPerson.rotation = (camera.components.thirdPerson.rotation + rs.x*turnSpeed*deltaTime) % 360;
    }
    const maxCameraDistance = camera.components.thirdPerson.distance;

    //Clamp rotation
    const clamp = camera.components.thirdPerson;
    camera.components.thirdPerson.pitch = Math.max(clamp.pitchRange.min, Math.min(clamp.pitchRange.max, camera.components.thirdPerson.pitch));

    //Calc our camera distances
    const cameraPitch = MathUtil.degreesToRadians(camera.components.thirdPerson.pitch);
    const cameraHeight = Math.sin(cameraPitch) * maxCameraDistance;
    const horizontalDistance = Math.abs(Math.cos(cameraPitch) * maxCameraDistance);
    
    //Move camera
    const cameraYaw = MathUtil.degreesToRadians(camera.components.thirdPerson.rotation + 0);
    const playerPos = player.components.transform.position;
    camera.components.view.setPosition(playerPos.x + Math.cos(cameraYaw) * horizontalDistance, playerPos.y + cameraHeight, playerPos.z + Math.sin(cameraYaw) * horizontalDistance); 
    
    //Rotate camera
    camera.components.view.setRotation(camera.components.thirdPerson.pitch, camera.components.thirdPerson.rotation - forwardOffset);
}
//Helpers
ThirdPersonCameraSystem.prototype.getCamera = function() {
    const camera = this.scene.getEntities(this.getComponents())[0];
    return camera != null ? camera.load() : null;
}
ThirdPersonCameraSystem.prototype.getPlayer = function() {
    const camera = this.getCamera();
    if(camera == null)
        return null;
    const focus = camera.components.thirdPerson.entityFocus;
    if(focus == null)
        return null;
    return focus.load();
}
ThirdPersonCameraSystem.prototype.getController = function() {
    return this.engine.controllerManager.getController(0);
}

function FirstPersonCameraSystem(scene) {
    TSystem.call(this, scene);
}
FirstPersonCameraSystem.prototype = Object.create(TSystem.prototype);
FirstPersonCameraSystem.prototype.getComponents = function() {
    return [ViewComponent, PerspectiveComponent, FirstPersonComponent];
}
FirstPersonCameraSystem.prototype.createCamera = function() {
    const camera = this.scene.createEntity().create(this.getComponents()).load();
    return camera;
}
FirstPersonCameraSystem.prototype.init = function() {
    
}
FirstPersonCameraSystem.prototype.update = function(deltaTime) {
    
    const camera = this.getCamera();
    const controller = this.getController();

    const turnSpeed = camera.components.firstPerson.turnSpeed;
    if(controller != null && controller.isConnected())
    {
        const rs = controller.inputs.rs;
        camera.components.view.rotate(rs.y*turnSpeed*deltaTime, rs.x*turnSpeed*deltaTime, 0);
    }
    

    //Clamp rotation
    const clamp = camera.components.firstPerson;
    camera.components.view.rotation.x = Math.max(clamp.pitchRange.min, Math.min(clamp.pitchRange.max, camera.components.view.rotation.x));
}
//Helpers
FirstPersonCameraSystem.prototype.getCamera = function() {
    const camera = this.scene.getEntities(this.getComponents())[0];
    return camera != null ? camera.load() : null;
}
FirstPersonCameraSystem.prototype.getPlayer = function() {
    return this.getCamera();
}
FirstPersonCameraSystem.prototype.getController = function() {
    return this.engine.controllerManager.getController(0);
}


//========
function PhysicsSystem(scene) {
    TSystem.call(this, scene);
}
PhysicsSystem.prototype = Object.create(TSystem.prototype);
PhysicsSystem.prototype.getComponents = function() {
    return [TransformComponent, MomentumComponent];
}
PhysicsSystem.prototype.getPhysics = function() {
    const objects = this.scene.getEntities(this.getComponents());
    return objects != null ? objects.map(x => x.load()) : null;
}
PhysicsSystem.prototype.init = function() {
    
}
PhysicsSystem.prototype.update = function(deltaTime) {
    const physics = this.getPhysics();
    (physics != null ? physics : []).forEach(x => {

        const c = x.components;
        const acc = x.components.momentum.acceleration;
        const velocity = x.components.momentum.velocity;
        
        x.components.momentum.speedUp(acc.x, acc.y, acc.z);
        x.components.transform.translate(velocity.x, velocity.y, velocity.z);
    });
}

//===============
//============
