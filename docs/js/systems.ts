class WindowResizerSystem extends CriterionSystem {

    static fullscreen = false;
    static sync = false;

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let window = this.scene.engine.window;
        let pageResolution = window.pageResolution;
        let renderResolution = window.renderResolution;
        let displayResolution = window.displayResolution;
        let viewport = window.viewport;
        if(WindowResizerSystem.fullscreen && !pageResolution.equals(displayResolution))
        {
            window.displayResolution = pageResolution;
            displayResolution = pageResolution;
        }
        if(!WindowResizerSystem.sync)
            return;
        if(!renderResolution.equals(displayResolution))
            window.renderResolution = displayResolution;
        if(viewport.width != renderResolution.width || viewport.height != renderResolution.height)
            window.viewport = new Vector4f([0,0,renderResolution.width, renderResolution.height]);
    }
}

class EntityCleanupSystem extends CriterionSystem {
    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let entities = this.#getEntities();
        for(let entity of entities)
            if(entity.get(CleanupComponent)?.destroy)
                entity.destroy();
    }

    #getEntities():CriterionEntity[] {
        return this.scene.entities([CleanupComponent]);
    }
}

type EventSystemCleanupMode = "onNewFrame" | "onRead";

class EventSystem extends CriterionSystem {

    #events:Map<number, Map<new (...args) => SystemEvent, SystemEvent[]>>;
    #cleanupMode:EventSystemCleanupMode;

    constructor(scene:CriterionScene) {
        super(scene);
        this.#events = new Map();
        this.#cleanupMode = "onNewFrame";
    }

    update(deltaTime: number): void {
        if(this.#cleanupMode === "onNewFrame") {
            //Cleanup old events
            for(let frame of this.#events.keys()) {
                if(frame < this.scene.engine.frameStart)
                    this.#events.delete(frame);
            }
        }
    }

    events<T extends SystemEvent>(eventType?:new (...args) => T, timestamp?:number):{frame:Number, events:T[]}[] {
        let results:{frame:Number, events:T[]}[] = [];
        for(let [frame, frameEvents] of this.#events)
        {
            if(frame < timestamp)
                continue;
            let eventTypes = eventType ? [eventType] : [...frameEvents.keys()];
            for(let eType of eventTypes) {
                //@ts-ignore
                let events = frameEvents.get(eType) as T[];
                if(!events)
                    continue;
                results.push({
                    frame,
                    events: [...events]
                });
    
                if(this.#cleanupMode === "onRead")
                {
                    frameEvents.delete(eventType);
                    if(frameEvents.size === 0)
                        this.#events.delete(frame);
                }
            }
        }
        return results;
    }

    raise<T extends SystemEvent>(eventType:new (...args) => T, event:T):T {
        let timestamp = this.scene.engine.frameStart;
        let frameEvents = this.#events.get(timestamp);
        if(!frameEvents)
        {
            frameEvents = new Map<new (...args) => SystemEvent, SystemEvent[]>();
            this.#events.set(timestamp, frameEvents);
        }
        let events = frameEvents.get(eventType);
        if(!events)
        {
            events = [];
            frameEvents.set(eventType, events); 
        }
        events.push(event);
        return event;
    }
}

class CameraSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let camera = this.getCamera();
        camera.camera.view = Matrix4f.viewMatrix(camera.transform.position, camera.transform.rotation);
    }

    getCamera(){
        return CriterionBlueprint.blueprints(this.scene, CameraBlueprint)[0];
    }
}

class BatchRendererSystem extends CriterionSystem {
    
    renderBatcher:CriterionRenderBatcher;

    constructor(scene:CriterionScene) {
        super(scene);
        this.renderBatcher = new CriterionRenderBatcher();
    }

    update(deltaTime: number): void {
        let shader = this.scene.engine.resourceManager.get(BatchRendererShader);
        let batches = this.renderBatcher.batch(shader.maxBufferSize, shader.maxElemetsBufferSize, shader.maxTextures);
        shader.run(this.scene, batches);
        this.renderBatcher.clear();
    }

    buffer(batchEntity:CriterionRenderBatchEntity) {
        this.renderBatcher.buffer(batchEntity);
    }
}

class SpriteBatcherSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let batchRenderer = this.scene.system(BatchRendererSystem);

        let blueprints = this.#getRenderables();
        for(let blueprint of blueprints) {
            //Use the indices we have, otherwise generate them
            let indices = (blueprint.mesh.indices?.length ?? 0) !== 0
                ? blueprint.mesh.indices : [];
            if(indices.length === 0){
                for(let i = 0; i < blueprint.mesh.vertices.length; i++)
                    indices.push(i);
            }
            let renderable:CriterionRenderBatchEntity = {
                vertices: blueprint.transformedVertices(),
                indicies: indices,
                uvs: blueprint.transformedTextureCoordinates(),
                color: blueprint.sprite.color,
                texture: blueprint.sprite.spriteSheet?.texture ?? blueprint.sprite.texture,
                layer: blueprint.renderer.layer,
            };
            batchRenderer.buffer(renderable);
        }
    }

    #getRenderables():RenderableSpriteBlueprint[] {
        return CriterionBlueprint.blueprints(this.scene, RenderableSpriteBlueprint);
    }
}

class TextBatcher extends CriterionSystem {

    #squareMesh:{indices:number[], vertices:Vector3f[], minVertex:Vector3f, maxVertex:Vector3f, uvs:Vector2f[], normals:Vector3f[] }

    constructor(scene:CriterionScene) {
        super(scene);

        this.#squareMesh = CriterionMeshUtils.createSquare2DMesh();
    }

    update(deltaTime: number): void {
        let blueprints:RenderableTextBlueprint[] = this.#getRenderables();
        
        let batchRenderer = this.scene.system(BatchRendererSystem);

        for(let blueprint of blueprints)
        {
            blueprint.mesh.clear();
            let text = blueprint.text;
            let mesh = TextGeneratorMeshGenerator.generateTextMesh(text.string, text.width, text.height, blueprint.font.fontStyle,
                blueprint.transform.transformation, text.horizontalAlignment, text.verticalAlignment);
            blueprint.mesh.set(mesh);

            batchRenderer.renderBatcher.buffer({
                indicies: blueprint.mesh.indices,
                vertices: blueprint.mesh.vertices,
                uvs: blueprint.mesh.uvs,
                color: null,
                texture: blueprint.font.fontStyle.texture,
                layer: blueprint.renderer.layer,
            });
        }

        //this.scene.engine.terminate();
	}

    #getRenderables():RenderableTextBlueprint[] {
        return CriterionBlueprint.blueprints(this.scene, RenderableTextBlueprint);
    }
}

class AnimatorSystem extends CriterionSystem {
    
    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let entities = this.#getAnimators();
        for(let entity of entities) {
            this.#animate(deltaTime, entity);
        }
    }

    #animate(deltaTime:number, entity:CriterionEntity) {
        let animator = entity.get(AnimatorComponent);
        if(!animator.animation)
            return;

        //If the animation just started, trigger any key frames for start frame
        if(animator.deltaTime < 0) {
            animator.deltaTime = 0;
            this.#animateEntity(animator, entity);
            return;
        }

        let elapsedTime = animator.deltaTime + deltaTime;
        
        while(elapsedTime >= animator.animation.frameDuration)
        {
            animator.deltaTime = animator.animation.frameDuration;
            animator.frame++;
            if(animator.frame > animator.animation.endFrame)
            {
                animator.iteration++;
                if(animator.animation.iterations >= 0 && animator.iteration > animator.animation.iterations)
                {
                    animator.playing = false;
                    animator.frame = animator.animation.finishedFrame ?? animator.frame;
                }
                else
                    animator.frame = animator.animation.startFrame;
            }
            elapsedTime -= animator.animation.frameDuration;
            this.#animateEntity(animator, entity);
            if(animator.finished) {
                animator.stop();
                return;
            }
        }
        animator.deltaTime = elapsedTime;
    }

    #animateEntity(animator:AnimatorComponent, entity:CriterionEntity) {
        for(let component of animator.animation.animatableComponents) {
            entity.get(component)?.animate(entity);
        }
        for(let [frame, keyFrame] of animator.animation.keyframes.entries()) {
            if(frame === animator.frame)
                keyFrame.animate(entity);
        }
    }

    #getAnimators():CriterionEntity[] {
        return this.scene.entities([AnimatorComponent]);
    }
}

class TileSystem extends CriterionSystem {

    #tileMap:TileMap;
    #spriteSheet:SpriteSheet;
    #mesh:{indices:number[], vertices:Vector3f[], uvs:Vector2f[], normals:Vector3f[] }

    constructor(scene:CriterionScene) {
        super(scene);

        this.#tileMap = new TileMap(20, 20, 1);
        this.#spriteSheet = this.scene.engine.resourceManager.get(SpriteSheet, ResourceNames.TILE);
        this.#mesh = CriterionMeshUtils.createSquare2DMesh();
    }

    update(deltaTime: number): void {
        let batchRenderer = this.scene.system(BatchRendererSystem);

        let frame = this.#spriteSheet.getFrameCoordinates(0);

        let transformation = Matrix4f.transformation(new Vector3f(), new Vector3f([1,1,1]), new Vector3f([Tile.SIZE.width, Tile.SIZE.height, 1]));
        let tiles = this.#tileMap.tiles;
        let i = 0;
        for(let floor = 0; floor < tiles.length; floor++) {
            for(let y = 0; y < tiles[floor].length; y++) {
                for(let x = 0; x < tiles[floor][y].length; x++) {
                    i++;
                    let cursor = Tile.screenPosition(new Vector2f([x, y]));
                    // let cursor:Vector3f;
                    // switch(i++) {
                    //     case 0:
                    //         cursor = new Vector3f([32, 32, 0]);
                    //         break;
                    //     case 1:
                    //         cursor = new Vector3f([48, 40, 0]);
                    //         break;
                    //     case 2:
                    //         cursor = new Vector3f([64, 48, 0]);
                    //         break;
                    //     case 3:
                    //         cursor = new Vector3f([60, 56, 0]);
                    //         break;
                    // }
                    batchRenderer.buffer({
                        indicies: this.#mesh.indices,
                        vertices: this.#transformVertices(this.#mesh.vertices, transformation, new Vector3f(cursor.array)),
                        uvs: this.#transformUvs(this.#mesh.uvs, frame.start, frame.end),
                        color: null,
                        texture: this.#spriteSheet.texture,
                        layer: RenderLayers.TILEMAP,
                    });
                }
            }
        }
        // console.log("tiles: ", i);
    }

    #getCamera() {
        return CriterionBlueprint.blueprints(this.scene, CameraBlueprint)[0];
    }

    #transformVertices(vertices:Vector3f[], transformation:Matrix4f, position:Vector3f) {
        
        let result:Vector3f[] = [];
        for(let vertex of vertices) {
            result.push(vertex.transform(transformation).add(position));
        }
        return result;
    }

    #transformUvs(uvs:Vector2f[], start:Vector2f, end:Vector2f) {
        let results:Vector2f[] = [];
        let frameSize = new Vector2f([end.x - start.x, end.y - start.y])
        for(let uv of uvs) {
            results.push(new Vector2f([start.x + frameSize.x * uv.x, start.y + frameSize.y * uv.y]));
        }
        return results;
    }
}

class PlayerController extends CriterionSystem {

    #mouseDelta:number;
    static SCROLL_THRESHOLD = 10;

    constructor(scene:CriterionScene) {
        super(scene);
        this.#mouseDelta = 0;
    }

    update(deltaTime: number): void {
        let cameraBlueprint = this.#getCamera();
        let mouse = this.scene.engine.mouse;
        let button = mouse.buttons.get(CriterionMouseButtons.buttonLeft);
        if(button.down)
        {
            let mouseDelta = mouse.deltaPosition;
            this.#mouseDelta += Math.abs(mouseDelta.x) + Math.abs(mouseDelta.y);
            
            if(this.scrolling)
            {
                cameraBlueprint.transform.position.x += mouseDelta.x;
                cameraBlueprint.transform.position.y += mouseDelta.y;
            }
            // console.log([...mouse.scaledPosition.array]);
            // console.log(Tile.tilePosition(new Vector3f(mouse.scaledPosition.array).add(cameraBlueprint.transform.position)).array);
        }
        else
            this.#mouseDelta = 0;
        // console.log([...mouse.scaledPosition.array]);

        if(this.scene.system(UiControllerSystem).highlighted == null)
        {
            let position = Tile.screenPosition(Tile.tilePosition(mouse.position.add(new Vector2f(cameraBlueprint.transform.position.array))));
            let transformation = Matrix4f.transformation(new Vector3f(position.array), new Vector3f(), new Vector3f([Tile.SIZE.width, Tile.SIZE.height, 1]));
            let mesh = CriterionMeshUtils.createSquare2DMesh();
            let spriteSheet = this.scene.engine.resourceManager.get(SpriteSheet, ResourceNames.MARKERS);
            let frameCoordinates = spriteSheet.getFrameCoordinates(1);
            this.scene.system(BatchRendererSystem).buffer({
                vertices: CriterionMeshUtils.transformVertices(mesh.vertices, transformation),
                indicies: mesh.indices,
                uvs: CriterionMeshUtils.transformTextureCoordinates(mesh.uvs, frameCoordinates.start, frameCoordinates.end),
                color: null,
                texture: spriteSheet.texture,
                layer: RenderLayers.UI,
            });
        }
    }

    #getCamera():CameraBlueprint {
        return this.scene.system(CameraSystem).getCamera();
    }

    get scrolling():boolean {
        return this.#mouseDelta > PlayerController.SCROLL_THRESHOLD;
    }
}

class UiControllerSystem extends CriterionSystem {

    #highlighted:SelectableBlueprint;
    #selected:SelectableBlueprint;

    constructor(scene:CriterionScene) {
        super(scene);
        this.#highlighted = null;
        this.#selected = null;
    }

    update(deltaTime: number): void {
        let mouse = this.scene.engine.mouse;
        let camera = this.#getCamera();
        this.#positionUis(camera);
        let selectables = this.#getSelectables();
        this.#highlight(mouse, camera, selectables);
        this.#select(mouse);
    }

    #getCamera():CameraBlueprint {
        return this.scene.system(CameraSystem).getCamera();
    }

    #getUis():UiBlueprint[] {
        return CriterionBlueprint.blueprints(this.scene, UiBlueprint);
    }

    #getSelectables():SelectableBlueprint[] {
        return CriterionBlueprint.blueprints(this.scene, SelectableBlueprint);
    }

    #positionUis(camera:CameraBlueprint) {
        let uis = this.#getUis();
        for(let ui of uis) {
            if(ui.uiLayout.absolute) {
                ui.transform.position.x = camera.transform.position.x + ui.uiLayout.offset.x;
                ui.transform.position.y = camera.transform.position.y + ui.uiLayout.offset.y;
            }

            for(let entityId of ui.uiLayout.entities) {
                let entity = this.scene.entity(entityId);
                if(!entity)
                {
                    ui.uiLayout.entities.delete(entityId);
                    continue;
                }
                let blueprint = new UiBlueprint(entity).load();
                if(!blueprint.uiLayout || !blueprint.transform)
                    continue;
                blueprint.transform.position.x = ui.transform.position.x + blueprint.uiLayout.offset.x;
                blueprint.transform.position.y = ui.transform.position.y + blueprint.uiLayout.offset.y;
            }
        }
    }

    #highlight(mouse:CriterionMouse, camera:CameraBlueprint, selectables:SelectableBlueprint[]):SelectableBlueprint {
        let cursor = new Vector3f(mouse.scaledPosition.array).add(camera.transform.position);
            //Figure out what the transform doesn't work
            //.transform(camera.transform.transformation)

        let highlighted:SelectableBlueprint = null;
        for(let i = selectables.length - 1; i > 0; i--)
        {
            let selectable = selectables[i];
            if(!selectable.selector.selectable)
                continue;
            if(selectable.contains(cursor))
            {
                highlighted = selectable;
                break
            }
        }

        if(this.#highlighted?.entity.id != highlighted?.entity.id)
        {
            if(this.#highlighted != null)
                this.#highlighted.selector.unhighlight(this.#highlighted.entity);
            this.#highlighted = highlighted;
            if(this.#highlighted != null)
                this.#highlighted.selector.highlight(this.#highlighted.entity);
        }
        return highlighted;
    }

    #select(mouse:CriterionMouse) {
        let scrollingCamera = this.scene.system(PlayerController)?.scrolling ?? false;
        let button = mouse.buttons.get(CriterionMouseButtons.buttonLeft);
        if(button.newPress)
        {
            this.#selected = this.#highlighted;
        }
        if(button.up) {
            //Select the element
            if(!scrollingCamera && this.#selected && this.#selected == this.#highlighted)
                this.#selected.selector.select(this.#selected.entity);
            this.#selected = null;
        }
    }

    get highlighted():SelectableBlueprint {
        return this.#highlighted;
    }
}

type UnitTurnType = "Player" | "Zombie";

class TurnController extends CriterionSystem {

    #turnNumber:number;
    #waveNumber:number;
    #unitTurn:UnitTurnType;

    constructor(scene:CriterionScene) {
        super(scene);
        this.#turnNumber = 1;
        this.#waveNumber = 1;
        this.#unitTurn = "Player";
    }

    get turnNumber():number {
        return this.#turnNumber;
    }
    get waveNumber():number {
        return this.#waveNumber;
    }
    get unitTurn():UnitTurnType {
        return this.#unitTurn;
    }

    update(deltaTime: number): void {
        this.#updateTurnTracker();
    }

    #updateTurnTracker() {
        let turnTracker = CriterionBlueprint.blueprints(this.scene, TurnTrackerDisplayBlueprint)[0];
        if(!turnTracker)
            return;
        turnTracker.text.string = `${this.unitTurn} Turn ${this.#turnNumber}\nWave ${this.#waveNumber}`;
    }

    #getCamera():CameraBlueprint {
        return this.scene.system(CameraSystem).getCamera();
    }

    passTurn() {
        switch(this.#unitTurn)
        {
            case "Player":
                this.#unitTurn = "Zombie";
                break;
            case "Zombie":
                this.#unitTurn = "Player";
                this.#turnNumber++;
                break;
        }
    }
}

class ProgressbarBatcher extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let batchRenderer = this.scene.system(BatchRendererSystem);

        let blueprints = this.#getRenderables();
        for(let blueprint of blueprints) {
            //Use the indices we have, otherwise generate them
            let indices = (blueprint.mesh.indices?.length ?? 0) !== 0
                ? blueprint.mesh.indices : [];
            if(indices.length === 0){
                for(let i = 0; i < blueprint.mesh.vertices.length; i++)
                    indices.push(i);
            }
            batchRenderer.buffer({
                vertices: blueprint.transformedVertices(1),
                indicies: indices,
                uvs: blueprint.mesh.uvs,
                color: blueprint.progress.secondaryColor,
                texture: null,
                layer: blueprint.renderer.layer,
            });
            batchRenderer.buffer({
                vertices: blueprint.transformedVertices(blueprint.progress.value),
                indicies: indices,
                uvs: blueprint.mesh.uvs,
                color: blueprint.progress.primaryColor,
                texture: null,
                layer: blueprint.renderer.layer,
            });
        }
    }

    #getRenderables():ProgressbarBlueprint[] {
        return CriterionBlueprint.blueprints(this.scene, ProgressbarBlueprint);
    }
}