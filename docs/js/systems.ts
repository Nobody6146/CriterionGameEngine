class WindowResizerSystem extends CriterionSystem {

    static fullscreen = false;

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
        return CriterionBlueprint.blueprints(this.scene, CameraBluePrint)[0];
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
                textureCoordinates: blueprint.transformedTextureCoordinates(),
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

// class LineData
// {
//     chars:FontCharacter[];
//     width:number;

//     constructor(chars:FontCharacter[], width:number) {
//         this.chars = chars;
//         this.width = width;
//     }
// }

class TextBatcher extends CriterionSystem {

    #squareMesh:{indices:number[], vertices:Vector3f[], uvs:Vector2f[], normals:Vector3f[] }

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
            if(!blueprint.text.string)
                continue;

            let cursor = new Vector2f([0, 0]);
            let startHeight = 0;
            
            let fontSheet = blueprint.font.fontStyle.fontSheet;
            let size = {
                width: blueprint.text.width,
                height: blueprint.text.height
            };
            let transformation = blueprint.transform.transformation;
            let lines:{chars:FontCharacter[], width:number;}[] = this.#formatIntoLines(blueprint.text.string, size, fontSheet);

            switch(blueprint.text.verticalAlignment)
            {
                case "center":
                    startHeight = fontSheet.baseline + (fontSheet.height - lines.length*fontSheet.lineHeight)/2;
                    break;
                case "bottom":
                    startHeight = fontSheet.baseline + fontSheet.height - lines.length*fontSheet.lineHeight;
                    break;
                case "top":
                default:
                    startHeight = fontSheet.baseline;
            }
            
            cursor.y += startHeight;
            
            let characterCount = 0;
            for(let line of lines)
            {
                let chars = line.chars;
                
                let startWidth = 0;
                switch(blueprint.text.horizontalAlignment)
                {
                    case "center":
                        startWidth = (size.width - line.width)/2;
                        break;
                    case "right":
                        startWidth = size.width - line.width;
                        break;
                    case "left":
                    default:
                        startWidth = 0;
                }
                
                cursor.x += startWidth;
                
                for(let c of chars)
                {
                    let position = new Vector3f([cursor.x + c.lineOffset.x, cursor.y + c.lineOffset.y - fontSheet.baseline, 0]);
                    //Queue the data
                    //console.log("ascii ", String.fromCharCode(c.asciiValue), " ", position.array);
                    for(let i = 0; i < this.#squareMesh.vertices.length; i++)
                    {
                        let vertex = this.#squareMesh.vertices[i];
                        blueprint.mesh.vertices.push(new Vector3f([vertex.x * c.width, vertex.y * c.height, vertex.z]).transform(transformation).add(position));
                        let uv = this.#squareMesh.uvs[i];
                        blueprint.mesh.textureCoordinates.push(new Vector2f([c.frameStart.x + c.frameSize.x * uv.x, c.frameStart.y + c.frameSize.y * uv.y]));
                        let normal = this.#squareMesh.normals[i];
                        blueprint.mesh.normals.push(normal);
                    }
                    for(let i = 0; i < this.#squareMesh.indices.length; i++)
                    {
                        let index = this.#squareMesh.indices[i];
                        blueprint.mesh.indices.push(characterCount*this.#squareMesh.vertices.length + index);
                    }
                    characterCount++;
                    
                    cursor.x += c.lineAdvance;
                }
                
                cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
            }
            
            batchRenderer.renderBatcher.buffer({
                indicies: blueprint.mesh.indices,
                vertices: blueprint.mesh.vertices,
                textureCoordinates: blueprint.mesh.textureCoordinates,
                color: null,
                texture: blueprint.font.fontStyle.texture,
                layer: blueprint.renderer.layer,
            });
        }

        //this.scene.engine.terminate();
	}
		
	#formatIntoLines(text:string, size:{width:number, height:number}, fontSheet:FontSheet): {chars:FontCharacter[], width:number;}[]
	{
		let cursor = new Vector2f([0, fontSheet.baseline]);
		
		let lines:{chars:FontCharacter[], width:number;}[] = [];
		
		let lineChars:FontCharacter[] = [];
		let lineWidth = 0;
		for(let i = 0; i < text.length; i++)
		{
			let c = text.charAt(i);
			
			//Process newline
			if(c == '\n')
			{
				lines.push({chars: lineChars, width: lineWidth});
				lineChars = [];
				lineWidth = 0;
				cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
				continue;
			}
			
			let fontC = fontSheet.characters.get(c.charCodeAt(0));
			if(fontC == null)
				continue;
			
			//Move to the next line if we don't have space
			while(cursor.y <= size.height && cursor.x + fontC.lineAdvance >= size.width)
			{
				lines.push({chars: lineChars, width: lineWidth});
				lineChars = [];
				lineWidth = 0;
				cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
			}
			
			if(cursor.y > size.height)
				break;
			
			lineChars.push(fontC);
			lineWidth += fontC.lineAdvance;
            cursor.x += fontC.lineAdvance;
		}
		
		//Read the last character, so add the last line
		if(lineWidth > 0)
			lines.push({chars: lineChars, width: lineWidth});
		
		return lines;
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

class PatrolSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let navigations = this.#getNavigations();
        for(let navigation of navigations)
        {
            if(!navigation.navigator.navigating || (navigation.patroller.destinations?.length ?? 0) === 0)
                continue;
            
            //Determine how far we need to travel
            let distance = navigation.navigator.destination.subtract(navigation.transform.position);
            let translation = distance.normalize().scale(deltaTime * navigation.patroller.speed)

            //Check if we've arrived at our destination
            if(distance.magnitudeSquared() < navigation.patroller.tolerance || translation.magnitudeSquared() > distance.magnitudeSquared())
            {
                navigation.transform.position = navigation.navigator.destination;
                //Go to the next waypoint
                navigation.patroller.index = (++navigation.patroller.index) % navigation.patroller.destinations.length;
                navigation.navigate();
            } 
            else
                navigation.transform.position = navigation.transform.position.add(translation);
        } 
    }

    #getNavigations() {
        return CriterionBlueprint.blueprints(this.scene, PatrolLocationBlueprint);
    }
}

//delte everything below here
class TestEvent1 implements SystemEvent {

}
class TestEvent2 implements SystemEvent {
    
}
class ReadTestSytemEvents extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let events = this.scene.system(EventSystem).events();
        for(let event of events)
            console.warn("We found an event", event);
    }
}

class TileSystem extends CriterionSystem {

    #tileMap:TileMap;
    #spriteSheet:SpriteSheet;

    constructor(scene:CriterionScene) {
        super(scene);

        this.#tileMap = new TileMap(2, 2, 1);
        this.#spriteSheet = this.scene.engine.resourceManager.get(SpriteSheet, ResourceNames.TILE_SPRITE_SHEET);
    }

    update(deltaTime: number): void {
        let batchRenderer = this.scene.system(BatchRendererSystem);

        let mesh = CriterionMeshUtils.createSquare2DMesh();
        let frame = this.#spriteSheet.getFrameCoordinates(0);

        let transformation = Matrix4f.transformation(new Vector3f(), new Vector3f([1,1,1]), new Vector3f([Tile.SIZE.width, Tile.SIZE.height, 1]));

        let i = 0;
        let tiles = this.#tileMap.tiles;
        for(let floor = 0; floor < tiles.length; floor++) {
            for(let y = 0; y < tiles[floor].length; y++) {
                for(let x = 0; x < tiles[floor][y].length; x++) {
                    let cursor = new Vector3f([(x -y)*Tile.SIZE.width/2 + 64, (x + y)*Tile.SIZE.height/2 + 64, 0]);
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
                        indicies: mesh.indices,
                        vertices: this.#transformVertices(mesh.vertices, transformation, cursor),
                        textureCoordinates: this.#transformUvs(mesh.uvs, frame.start, frame.end),
                        color: null,
                        texture: this.#spriteSheet.texture,
                        layer: -1,
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