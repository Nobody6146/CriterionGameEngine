//============== Positioning/Movement
function TransformComponent() {
    this.position = new Vector3f();
    this.rotation = new Vector3f();
    this.scale = new Vector3f([1,1,1]);
}
TransformComponent.prototype.getTransformationMatrix = function() {
    return Matrix4f.transformation(this.position, this.rotation, this.scale);
}
TransformComponent.prototype.translate = function(x, y, z) {
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
}
TransformComponent.prototype.setPosition = function(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
}
TransformComponent.prototype.rotate = function(x, y, z) {
    this.rotation.x = (this.rotation.x + x) % 360;
    this.rotation.y = (this.rotation.y + y) % 360;
    this.rotation.z = (this.rotation.z + z) % 360;
}
TransformComponent.prototype.setRotation = function(x, y, z) {
    this.rotation.x = x;
    this.rotation.y = y;
    this.rotation.z = z;
}
TransformComponent.prototype.scaleUp = function(x, y, z) {
    this.scale.x += x;
    this.scale.y += y;
    this.scale.z += z;
}
TransformComponent.prototype.setScale = function(x, y, z) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
}

function MomentumComponent() {
    this.velocity = new Vector3f();
    this.acceleration = new Vector3f();
}
MomentumComponent.prototype.setSpeed = function(x, y, z) {
    this.velocity.x = x;
    this.velocity.y = y;
    this.velocity.z = z;
}
MomentumComponent.prototype.speedUp = function(x, y, z) {
    this.velocity.x += x;
    this.velocity.y += y;
    this.velocity.z += z;
}
MomentumComponent.prototype.setAcceleration = function(x, y, z) {
    this.acceleration.x = x;
    this.acceleration.y = y;
    this.acceleration.z = z;
}
MomentumComponent.prototype.accelerate = function(x, y, z) {
    this.acceleration.x += x;
    this.acceleration.y += y;
    this.acceleration.z += z;
}


//=============== Rendering
function RendererComponent() {
    this.layer = 0;
    this.priority = 0;
}
RendererComponent.prototype.setTarget = function(layer, priority) {
    this.layer = layer;
    this.priority = priority;
}

function MeshComponent() {
    this.indicesVbo = null;
    this.indicesCount = null;
    this.attributesVao = null;
}
MeshComponent.prototype.setModel = function(engine, model) {
    if(!(model instanceof Object))
        //Search up based on name
        model = engine.resourceManager.getModel(model);
    if(model == null)
        return;
    this.indicesVbo = model.indicesVbo;
    this.indicesCount = model.indicesCount;
    this.attributesVao = model.attributesVao;
}

function MaterialComponent() {
    this.texture = null;
    this.color = new Vector4f();
}
MaterialComponent.prototype.setColor = function(r, g, b, a) {
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    this.color.a = a;
}
MaterialComponent.prototype.setTexture = function(engine, texture) {
    if(!(texture instanceof Object))
        //Search up based on name
        texture = engine.resourceManager.getTexture(texture);
    if(texture == null)
        return;
    this.texture = texture.texture;
}


///============ Camera Components
function ViewComponent() {
    this.position = new Vector3f();
    this.rotation = new Vector2f();
}
ViewComponent.prototype.getViewMatrix = function() {
    let viewMatrix = Matrix4f.identity();
    viewMatrix = viewMatrix.multiply(Matrix4f.rotation(this.rotation.x, 1, 0, 0));
    viewMatrix = viewMatrix.multiply(Matrix4f.rotation(this.rotation.y, 0, 1, 0));
    viewMatrix = viewMatrix.multiply(Matrix4f.translation(-this.position.x, -this.position.y, -this.position.z));
    return viewMatrix;
}
ViewComponent.prototype.translate = function(x, y, z) {
    this.position.x += x;
    this.position.y += y;
    this.position.z += z;
}
ViewComponent.prototype.setPosition = function(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
}
ViewComponent.prototype.rotate = function(x, y) {
    this.rotation.x = (this.rotation.x + x) % 360;
    this.rotation.y = (this.rotation.y + y) % 360;
}
ViewComponent.prototype.setRotation = function(x, y) {
    this.rotation.x = x;
    this.rotation.y = y;
}

function OrthographicComponent() {
    this.left = -1;
    this.right = 1;
    this.bottom = -1;
    this.top = 1;
    this.near = -1;
    this.far = 1;
}
OrthographicComponent.prototype.setProjection = function(left, right, bottom, top, near, far) {
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.near = near;
    this.far = far;
}
OrthographicComponent.prototype.getProjectionMatrix = function() {
    return Matrix4f.orthographic(this.left, this.right, this.bottom, this.top, this.near, this.far);
}

function PerspectiveComponent() {
    this.fov = 60;
    this.aspectRatio = devicePixelRatio;
    this.near = .1;
    this.far = 1000;
}
PerspectiveComponent.prototype.setProjection = function(fov, aspectRatio, near, far){
    this.fov = fov;
    this.aspectRatio = aspectRatio;
    this.near = near;
    this.far = far;
}
PerspectiveComponent.prototype.getProjectionMatrix = function() {
    return Matrix4f.perspective(this.fov, this.aspectRatio, this.near, this.far);
}

function ThirdPersonComponent() {
    this.entityFocus = null;
    
    this.pitch = 0;
    this.rotation = 0;
    this.distance = 100;

    this.pitchRange = {
        min: 0,
        max: 90
    };

    this.turnSpeed = 1;
}
ThirdPersonComponent.prototype.setPitchRange = function(min, max) {
    this.pitchRange.min = min;
    this.pitchRange.max = max;
}

function FirstPersonComponent() {
    this.entityFocus = null;

    this.pitchRange = {
        min: -90,
        max: 90
    };

    this.turnSpeed = 1;
}
FirstPersonComponent.prototype.setPitchRange = function(min, max) {
    this.pitchRange.min = min;
    this.pitchRange.max = max;
}