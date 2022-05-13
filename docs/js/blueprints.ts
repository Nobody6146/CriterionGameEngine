class RenderableSpriteBlueprint extends CriterionBlueprint
{
    //Required components
    transform:TransformComponent;
    mesh:MeshComponent;
    sprite:SpriteComponent;
    renderer:RendererComponent;
    //optional components
    animator:AnimatorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent];
    }

    transformedVertices():Vector3f[] {
        let results:Vector3f[] = [];
        let transformation = this.transform.transformation;
        for(let vertex of this.mesh.vertices) {
            results.push(vertex.transform(transformation));
        }
        return results;
    }

    transformedTextureCoordinates():Vector2f[] {
        let results:Vector2f[] = [];
        let frame = this.sprite.frameCoordinates;
        let frameSize = new Vector2f([frame.end.x - frame.start.x, frame.end.y - frame.start.y])
        for(let coordinate of this.mesh.uvs) {
            results.push(new Vector2f([frame.start.x + frameSize.x * coordinate.x, frame.start.y + frameSize.y * coordinate.y]));
        }
        return results;
    }
}

class RenderableTextBlueprint extends CriterionBlueprint
{
    //Required components
    transform:TransformComponent;
    mesh:MeshComponent;
    text:TextComponent;
    font:FontComponent;
    renderer:RendererComponent;
    //optional components
    animator:AnimatorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    #intialize(engine:CriterionEngine) {
        this.renderer.layer = RenderLayers.UI;
        this.font.fontStyle = engine.resourceManager.get(FontStyle, "monospaced");
        return this;
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, TextComponent, FontComponent, RendererComponent];
    }

    static create(scene: CriterionScene): RenderableTextBlueprint {
        return RenderableTextBlueprint.createEntity(scene, RenderableTextBlueprint).#intialize(scene.engine);
    }
}

class CameraBlueprint extends CriterionBlueprint
{
    transform:TransformComponent;
    camera:CameraComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    #initialize() {
        this.transform.scale.y = -1;
        let resolution = this.entity.scene.engine.window.renderResolution;
        this.camera.projection = Matrix4f.orthographic(0, resolution.width, resolution.height, 0, -1, 1);
        return this;
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, CameraComponent];
    }

    static create(scene: CriterionScene): CameraBlueprint {
        return CriterionBlueprint.createEntity(scene, CameraBlueprint).#initialize();
    }
}


class UnitBlueprint extends CriterionBlueprint {

    transform:TransformComponent;
    mesh:MeshComponent;
    sprite:SpriteComponent;
    renderer:RendererComponent;
    inventory:InventoryComponent;
    //optional components
    animator:AnimatorComponent;
    selector:SelectorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, SpriteComponent, RendererComponent, AnimatorComponent, SelectorComponent, InventoryComponent];
    }

    intialize(engine:CriterionEngine) {
        this.transform.scale.array.set([Tile.SIZE.width / 2, Tile.SIZE.height * 2, 1]);
        let mesh = engine.resourceManager.get(Mesh, ResourceNames.SQUARE);
        this.mesh.set(mesh);
        this.renderer.layer = RenderLayers.ENTITIES;
        //this.sprite.setSpriteSheet(engine.resourceManager.get(SpriteSheet, ResourceNames.Humann));
        this.sprite.color = new Vector4f([0,.5,.5, 1]);

        this.selector.highlight = (entity:CriterionEntity) => {
            let blueprint = new UnitBlueprint(entity).load();
            blueprint.sprite.color = new Vector4f([0, 1, 1, 1]);
            // entity.scene.system(BatchRendererSystem).renderBatcher.buffer({
            //     indicies: blueprint.mesh.indices,
            //     vertices: blueprint.mesh.vertices,
            //     textureCoordinates: blueprint.mesh.textureCoordinates,
            //     color: blueprint.col,
            //     texture: blueprint.font.fontStyle.texture,
            //     layer: blueprint.renderer.layer,
            // });
        }
        this.selector.unhighlight = (entity:CriterionEntity) => {
            let blueprint = new UnitBlueprint(entity).load();
            blueprint.sprite.color = new Vector4f([0, .5, .5, 1]);
        }
        this.selector.select = (entity:CriterionEntity) => {
            console.log("Clicked: " + entity.id);
            let transform = entity.get(TransformComponent);
            let menu = UiBuilder.addMenu(entity.scene, new Vector2f([transform.position.x + transform.scale.x, transform.position.y]));

            let position = new Vector2f();
            for(let slot of this.inventory.slots) {
                let button = UiBuilder.addTextButton(entity.scene, 300, 40);
                menu.add(button.button, position);
                button.textbox.text.string = slot.displayName;
                position.y += 50;
            }
        }

        this.inventory.slots = [
            new WeaponInventorySlot("Weapon 1"),
            new WeaponInventorySlot("Weapon 2"),
            new GadgetInventorySlot("Gadget 2")
        ];

        return this;
    }

    static create(scene: CriterionScene): UnitBlueprint {
        return UnitBlueprint.createEntity(scene, UnitBlueprint).intialize(scene.engine);
    }

    getScreenPosition(tilePosition:Vector2f) {
        return Tile.getEntityPosition(tilePosition, this.transform.scale);
    }

    moveToTile(tilePosition:Vector2f) {
        let position = this.getScreenPosition(tilePosition);
        this.transform.position.x = position.x;
        this.transform.position.y = position.y;
    }
}

class SelectableBlueprint extends CriterionBlueprint {

    transform:TransformComponent;
    mesh:MeshComponent;
    renderer:RendererComponent;
    selector:SelectorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, RendererComponent, SelectorComponent];
    }

    contains(position: Vector2f | Vector3f):boolean {
        let transformation = this.transform.transformation;
        let start = this.mesh.minVertex.transform(transformation);
        let end = this.mesh.maxVertex.transform(transformation);
        return new Vector4f([start.x, start.y, end.x - start.x, end.y - start.y]).contains(position);
    }
}

class TurnTrackerDisplayBlueprint extends CriterionBlueprint {

    transform:TransformComponent;
    mesh:MeshComponent;
    renderer:RendererComponent;
    selector:SelectorComponent;
    text:TextComponent;
    font:FontComponent;
    turnTracker:TurnTrackerComponent;
    uiLayout:UiLayoutComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, RendererComponent, SelectorComponent, TextComponent, FontComponent, TurnTrackerComponent, UiLayoutComponent];
    }

    intialize(engine:CriterionEngine) {
        //this.transform.scale.array.set([Tile.SIZE.width / 2, Tile.SIZE.height * 2, 1]);
        let mesh = engine.resourceManager.get(Mesh, ResourceNames.SQUARE);
        this.mesh.set(mesh);
        this.renderer.layer = RenderLayers.UI;
        this.font.fontStyle = engine.resourceManager.get(FontStyle, "monospaced");
        this.text.width = 300;
        this.text.height = 60;
        this.text.horizontalAlignment = "center";
        //this.sprite.setSpriteSheet(engine.resourceManager.get(SpriteSheet, ResourceNames.Humann));

        this.selector.highlight = (entity:CriterionEntity) => {
            console.log("highlighting");
        }
        this.selector.unhighlight = (entity:CriterionEntity) => {
            
        }
        this.selector.select = (entity:CriterionEntity) => {
            console.log("Ending Turn: " + entity.id);
        }
        return this;
    }

    static create(scene: CriterionScene): TurnTrackerDisplayBlueprint {
        return TurnTrackerDisplayBlueprint.createEntity(scene, TurnTrackerDisplayBlueprint).intialize(scene.engine);
    }
}

class UiBlueprint extends CriterionBlueprint {

    transform:TransformComponent;
    mesh:MeshComponent;
    renderer:RendererComponent;
    uiLayout:UiLayoutComponent;
    //Optional
    selector:SelectorComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, RendererComponent, UiLayoutComponent];
    }

    dismiss() {
        this.entity.add(CleanupComponent).destroy = true;
        for(let entityId of this.uiLayout.entities)
        {
            let entity = this.entity.scene.entity(entityId);
            if(!entity)
                continue;
            let ui = new UiBlueprint(entity).load();
            if(ui.uiLayout)
                ui.dismiss();
        }
    }

    add(blueprint:UiBlueprint, position:Vector2f) {
        this.uiLayout.entities.add(blueprint.entity.id);
        blueprint.uiLayout.offset = new Vector2f(position.array);
        return blueprint;
    }
}

class ProgressbarBlueprint extends CriterionBlueprint {

    transform:TransformComponent;
    mesh:MeshComponent;
    renderer:RendererComponent;
    progress:ProgressComponent

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return [TransformComponent, MeshComponent, RendererComponent, ProgressComponent];
    }

    transformedVertices(percentage:number):Vector3f[] {
        let results:Vector3f[] = [];
        let length = this.transform.scale.x * (1 - percentage);
        let scale = this.transform.scale.subtract(new Vector3f([length, 0, 0]));
        let transformation = Matrix4f.transformation(this.transform.position, this.transform.rotation, scale);
        for(let vertex of this.mesh.vertices) {
            results.push(vertex.transform(transformation));
        }
        return results;
    }
}

class ButtonBlueprint extends UiBlueprint {

    sprite:SpriteComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return super.requiredComponents().concat(SpriteComponent, SelectorComponent);
    }

    intialize(engine:CriterionEngine) {
        this.renderer.layer = RenderLayers.UI;
        this.mesh.set(engine.resourceManager.get(Mesh, ResourceNames.SQUARE));

        this.selector.highlight = (entity:CriterionEntity) => {
            this.sprite.color = new Vector4f([.8,.8,.8,.9]);
        }
        this.selector.unhighlight = (entity:CriterionEntity) => {
            this.sprite.color = new Vector4f([.2,.2,.2,.9]);
        }

        return this;
    }

    static create(scene: CriterionScene): ButtonBlueprint {
        return CriterionBlueprint.createEntity(scene, ButtonBlueprint).intialize(scene.engine);
    }
}

class TextboxBlueprint extends UiBlueprint {
    
    text:TextComponent;
    font:FontComponent;

    constructor(entity:CriterionEntity) {
        super(entity);
    }

    requiredComponents(): (new (...args: any[]) => CriterionComponent)[] {
        return super.requiredComponents().concat(TextComponent, FontComponent);
    }

    intialize(engine:CriterionEngine) {
        //this.transform.scale.array.set([Tile.SIZE.width / 2, Tile.SIZE.height * 2, 1]);
        this.mesh.set(engine.resourceManager.get(Mesh, ResourceNames.SQUARE));
        this.renderer.layer = RenderLayers.UI;
        this.font.fontStyle = engine.resourceManager.get(FontStyle, "monospaced");
        this.text.horizontalAlignment = "center";
        return this;
    }

    static create(scene: CriterionScene): TextboxBlueprint {
        return TextboxBlueprint.createEntity(scene, TextboxBlueprint).intialize(scene.engine);
    }
}