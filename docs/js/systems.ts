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

        let i = 0;
        let tiles = this.#tileMap.tiles;
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
        let selectables = this.#getSelectables();
        this.#highlight(mouse, camera, selectables);
        this.#select(mouse);
    }

    #getCamera():CameraBlueprint {
        return this.scene.system(CameraSystem).getCamera();
    }

    #getSelectables():SelectableBlueprint[] {
        return CriterionBlueprint.blueprints(this.scene, SelectableBlueprint);
    }

    #highlight(mouse:CriterionMouse, camera:CameraBlueprint, selectables:SelectableBlueprint[]):SelectableBlueprint {
        let cursor = new Vector3f(mouse.scaledPosition.array).add(camera.transform.position);
            //Figure out what the transform doesn't work
            //.transform(camera.transform.transformation)

        let highlighted:SelectableBlueprint = null;
        for(let selectable of selectables)
        {
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
        let camera = this.#getCamera();
        let turnTracker = this.#getTurnTracker();
        let renderResolution = this.scene.engine.window.renderResolution;
        turnTracker.transform.position.x = camera.transform.position.x + (renderResolution.width - turnTracker.text.width)/2;
        turnTracker.transform.position.y = camera.transform.position.y;
        turnTracker.text.string = `${this.unitTurn} Turn ${this.#turnNumber}\nWave ${this.#waveNumber}`;
    }

    #getTurnTracker() {
        return CriterionBlueprint.blueprints(this.scene, TurnTrackerDisplayBlueprint)[0];
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