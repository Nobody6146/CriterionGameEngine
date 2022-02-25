function PlayerControllerSystem(scene) {
    TSystem.call(this, scene);

    this.weapon = {
        coolDown: 0
    };
}
PlayerControllerSystem.prototype = Object.create(TSystem.prototype);
PlayerControllerSystem.prototype.getComponents = function() {
    return [TransformComponent, MeshComponent, MaterialComponent, RendererComponent];
}
PlayerControllerSystem.prototype.init = function() {
    
}
PlayerControllerSystem.prototype.getCamera = function() {
    const camera = this.scene.getEntities(this.scene.getSystem(ThirdPersonCameraSystem).getComponents())[0];
    return camera != null ? camera.load() : null;
}
PlayerControllerSystem.prototype.getPlayer = function() {
    const player = this.scene.getEntities(this.getComponents())[0];
    return player != null ? player.load() : null;
}
PlayerControllerSystem.prototype.getController = function() {
    return this.engine.controllerManager.getController(0);
}
PlayerControllerSystem.prototype.createPlayer = function() {
    const player = this.scene.createEntity().create(this.getComponents()).load();
    player.components.mesh.setModel(this.engine, "player");
    player.components.material.setTexture(this.engine, "player");
    return player;
}
PlayerControllerSystem.prototype.update = function(deltaTime) {
    const forwardOffset = 90;

    const controller = this.getController();
    // if(controller == null || !controller.isConnected())
    //     return;
    if(controller == null)
        return;

    if(controller.inputs.start == 1)
    {
        let scene = Object.create(this.scene);
        scene.constructor(this.engine);
        this.scene.engine.sceneManager.loadScene(scene);
    }
    
    const player = this.getPlayer();
    const camera = this.getCamera();

    this.shootBullet(deltaTime, player, controller);

    this.move(deltaTime, player, camera, controller);
    //this.firstPersonMovement(deltaTime, player, camera, controller);
}
PlayerControllerSystem.prototype.shootBullet = function(deltaTime, player, controller) {
    if(controller.inputs.rt && this.weapon.coolDown <= 0)
    {
        //Let's shoot
        this.weapon.coolDown = .15;

        const playerPos = player.components.transform.position;
        const playerRot = player.components.transform.rotation;
        const yaw = MathUtil.degreesToRadians(playerRot.y - 0);
        const pitch = MathUtil.degreesToRadians(playerRot.x);
        const bulletSpeed = 30;

        const bullet = this.scene.createEntity().create([TransformComponent, MomentumComponent, MeshComponent, MaterialComponent, RendererComponent]).load();
        bullet.components.transform.setScale(10, 10, 10);
        bullet.components.mesh.setModel(this.engine, "cube");
        bullet.components.material.setTexture(this.engine, "player");
        bullet.components.transform.setPosition(playerPos.x, playerPos.y, playerPos.z);
        bullet.components.momentum.setSpeed(Math.cos(yaw) * bulletSpeed, Math.sin(pitch) * bulletSpeed, - Math.sin(yaw) * bulletSpeed);
    }
    else if(this.weapon.coolDown > 0)
        this.weapon.coolDown -= deltaTime;
}
PlayerControllerSystem.prototype.move = function(deltaTime, player, camera, controller) {
    
}
//
function ThirdPersonPlayerControllerSystem(scene) {
    TSystem.call(this, scene);

    this.weapon = {
        coolDown: 0
    };
}
ThirdPersonPlayerControllerSystem.prototype = Object.create(PlayerControllerSystem.prototype);
ThirdPersonPlayerControllerSystem.prototype.move = function(deltaTime, player, camera, controller) {
    const forwardOffset = 90;
    const ls = controller.inputs.ls;
    const moveSpeed = 60*4;

    if(ls != null && (ls.x != 0 || ls.y != 0)) {
        const speed = Math.min(new Vector2f([ls.x, ls.y]).magnitude(), 1) * moveSpeed * deltaTime;

        const offset = camera.components.view.position.subtract(player.components.transform.position);
        player.components.transform.rotation.y = - (MathUtil.radiansToDegrees(Math.atan2(offset.z, offset.x)) + 90);

        const angle = Math.atan2(-ls.y, ls.x) - MathUtil.degreesToRadians(camera.components.view.rotation.y + 0);
        player.components.transform.rotation.y = MathUtil.radiansToDegrees(angle);

        const move = new Vector2f([Math.cos(angle) * speed, Math.sin(angle) * speed]);
        player.components.transform.translate(move.x, 0, -move.y);
    }

    //Straffe
    if(controller.inputs.lt == 1)
    {
        player.components.transform.rotation.y = -(camera.components.view.rotation.y - forwardOffset);
    }
}
//
function FirstPersonPlayerControllerSystem(scene) {
    TSystem.call(this, scene);

    this.weapon = {
        coolDown: 0
    };
}
FirstPersonPlayerControllerSystem.prototype = Object.create(PlayerControllerSystem.prototype);
FirstPersonPlayerControllerSystem.prototype.getCamera = function() {
    const camera = this.scene.getEntities(this.scene.getSystem(FirstPersonCameraSystem).getComponents())[0];
    return camera != null ? camera.load() : null;
}
FirstPersonPlayerControllerSystem.prototype.move = function(deltaTime, player, camera, controller) {
    const ls = controller.inputs.ls;
    const moveSpeed = 60*4;

    if(ls.x != 0 || ls.y != 0)
    {
        const moveAngle = Math.atan2(ls.y, ls.x);
        const speed = Math.min(new Vector2f([ls.x, ls.y]).magnitude(), 1) * moveSpeed * deltaTime;
        const angle = MathUtil.degreesToRadians(camera.components.view.rotation.y) + moveAngle;
        const move = new Vector2f([Math.cos(angle) * speed, Math.sin(angle) * speed]);
        
        //TODO: Undo?
        camera.components.view.translate(move.x, 0, move.y);
    }  
}