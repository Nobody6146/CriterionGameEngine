class EntityCleanupSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let entities = this.#getEntities();
        for (let entity of entities)
            if (entity.get(CleanupComponent)?.destroy)
                entity.destroy();
    }
    #getEntities() {
        return this.scene.entities([CleanupComponent]);
    }
}
class EventSystem extends CriterionSystem {
    #events;
    #cleanupMode;
    constructor(scene) {
        super(scene);
        this.#events = new Map();
        this.#cleanupMode = "onNewFrame";
    }
    update(deltaTime) {
        if (this.#cleanupMode === "onNewFrame") {
            //Cleanup old events
            for (let frame of this.#events.keys()) {
                if (frame < this.scene.engine.frameStart)
                    this.#events.delete(frame);
            }
        }
    }
    events(eventType, timestamp) {
        let results = [];
        for (let [frame, frameEvents] of this.#events) {
            if (frame < timestamp)
                continue;
            let eventTypes = eventType ? [eventType] : [...frameEvents.keys()];
            for (let eType of eventTypes) {
                //@ts-ignore
                let events = frameEvents.get(eType);
                if (!events)
                    continue;
                results.push({
                    frame,
                    events: [...events]
                });
                if (this.#cleanupMode === "onRead") {
                    frameEvents.delete(eventType);
                    if (frameEvents.size === 0)
                        this.#events.delete(frame);
                }
            }
        }
        return results;
    }
    raise(eventType, event) {
        let timestamp = this.scene.engine.frameStart;
        let frameEvents = this.#events.get(timestamp);
        if (!frameEvents) {
            frameEvents = new Map();
            this.#events.set(timestamp, frameEvents);
        }
        let events = frameEvents.get(eventType);
        if (!events) {
            events = [];
            frameEvents.set(eventType, events);
        }
        events.push(event);
        return event;
    }
}
class CameraSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let camera = this.getCamera();
        camera.camera.view = Matrix4f.viewMatrix(camera.transform.position, camera.transform.rotation);
    }
    getCamera() {
        return CriterionBlueprint.blueprints(this.scene, CameraBluePrint)[0];
    }
}
class BatchRendererSystem extends CriterionSystem {
    renderBatcher;
    constructor(scene) {
        super(scene);
        this.renderBatcher = new CriterionRenderBatcher();
    }
    update(deltaTime) {
        let shader = this.scene.engine.resourceManager.get(BatchRendererShader);
        let batches = this.renderBatcher.batch(shader.maxBufferSize, shader.maxTextures);
        shader.run(this.scene, batches);
        this.renderBatcher.clear();
    }
    buffer(batchEntity) {
        this.renderBatcher.buffer(batchEntity);
    }
}
class SpriteBatcherSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let batchRenderer = this.scene.system(BatchRendererSystem);
        let blueprints = this.#getRenderables();
        for (let blueprint of blueprints) {
            let renderable = {
                vertices: blueprint.transformedVertices(),
                textureCoordinates: blueprint.transformedTextureCoordinates(),
                color: blueprint.sprite.color,
                texture: blueprint.sprite.spriteSheet?.texture ?? blueprint.sprite.texture,
                layer: blueprint.renderer.layer,
            };
            batchRenderer.buffer(renderable);
        }
    }
    #getRenderables() {
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
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let blueprints = this.#getRenderables();
        let squareMesh = CriterionMeshUtils.squareMesh();
        let batchRenderer = this.scene.system(BatchRendererSystem);
        for (let blueprint of blueprints) {
            blueprint.mesh.clear();
            if (!blueprint.text.string)
                continue;
            let cursor = new Vector2f([0, 0]);
            let startHeight = 0;
            let fontSheet = blueprint.font.fontStyle.fontSheet;
            let size = {
                width: blueprint.transform.scale.x,
                height: blueprint.transform.scale.y
            };
            let transformation = Matrix4f.transformation(blueprint.transform.position, blueprint.transform.rotation, new Vector3f([fontSheet.fontSize, fontSheet.fontSize, fontSheet.fontSize]));
            let lines = this.#formatIntoLines(blueprint.text.string, size, fontSheet);
            switch (blueprint.text.verticalAlignment) {
                case "center":
                    startHeight = fontSheet.baseline + (fontSheet.height - lines.length * fontSheet.lineHeight) / 2;
                    break;
                case "bottom":
                    startHeight = fontSheet.baseline + fontSheet.height - lines.length * fontSheet.lineHeight;
                    break;
                case "top":
                default:
                    startHeight = fontSheet.baseline;
            }
            cursor.y += startHeight;
            for (let line of lines) {
                let chars = line.chars;
                let startWidth = 0;
                switch (blueprint.text.horizontalAlignment) {
                    case "center":
                        startWidth = (size.width - line.width) / 2;
                        break;
                    case "right":
                        startWidth = size.width - line.width;
                        break;
                    case "left":
                    default:
                        startWidth = 0;
                }
                cursor.x += startWidth;
                for (let c of chars) {
                    let position = new Vector3f([cursor.x + c.lineOffset.x, cursor.y + c.lineOffset.y - fontSheet.baseline, 0]);
                    //Queue the data
                    //console.log("ascii ", String.fromCharCode(c.asciiValue), " ", position.array);
                    for (let vertex of squareMesh.vertices)
                        blueprint.mesh.vertices.push(vertex.transform(transformation).add(position));
                    for (let uv of squareMesh.uvs)
                        blueprint.mesh.textureCoordinates.push(new Vector2f([c.frameStart.x + c.frameSize.x * uv.x, c.frameStart.y + c.frameSize.y * uv.y]));
                    blueprint.mesh.normals = squareMesh.normals;
                    cursor.x += c.lineAdvance;
                }
                cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
            }
            batchRenderer.renderBatcher.buffer({
                vertices: blueprint.mesh.vertices,
                textureCoordinates: blueprint.mesh.textureCoordinates,
                color: null,
                texture: blueprint.font.fontStyle.texture,
                layer: blueprint.renderer.layer,
            });
        }
        //this.scene.engine.terminate();
    }
    #formatIntoLines(text, size, fontSheet) {
        let cursor = new Vector2f([0, fontSheet.baseline]);
        let lines = [];
        let lineChars = [];
        let lineWidth = 0;
        for (let i = 0; i < text.length; i++) {
            let c = text.charAt(i);
            //Process newline
            if (c == '\n') {
                lines.push({ chars: lineChars, width: lineWidth });
                lineChars = [];
                lineWidth = 0;
                cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
                continue;
            }
            let fontC = fontSheet.characters.get(c.charCodeAt(0));
            if (fontC == null)
                continue;
            //Move to the next line if we don't have space
            while (cursor.y <= size.height && cursor.x + fontC.lineAdvance >= size.width) {
                lines.push({ chars: lineChars, width: lineWidth });
                lineChars = [];
                lineWidth = 0;
                cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
            }
            if (cursor.y > size.height)
                break;
            lineChars.push(fontC);
            lineWidth += fontC.lineAdvance;
        }
        //Read the last character, so add the last line
        if (lineWidth > 0)
            lines.push({ chars: lineChars, width: lineWidth });
        return lines;
    }
    #getRenderables() {
        return CriterionBlueprint.blueprints(this.scene, RenderableTextBlueprint);
    }
}
class AnimatorSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let entities = this.#getAnimators();
        for (let entity of entities) {
            this.#animate(deltaTime, entity);
        }
    }
    #animate(deltaTime, entity) {
        let animator = entity.get(AnimatorComponent);
        if (!animator.animation)
            return;
        //If the animation just started, trigger any key frames for start frame
        if (animator.deltaTime < 0) {
            animator.deltaTime = 0;
            this.#animateEntity(animator, entity);
            return;
        }
        let elapsedTime = animator.deltaTime + deltaTime;
        while (elapsedTime >= animator.animation.frameDuration) {
            animator.deltaTime = animator.animation.frameDuration;
            animator.frame++;
            if (animator.frame > animator.animation.endFrame) {
                animator.iteration++;
                if (animator.animation.iterations >= 0 && animator.iteration > animator.animation.iterations) {
                    animator.playing = false;
                    animator.frame = animator.animation.finishedFrame ?? animator.frame;
                }
                else
                    animator.frame = animator.animation.startFrame;
            }
            elapsedTime -= animator.animation.frameDuration;
            this.#animateEntity(animator, entity);
            if (animator.finished) {
                animator.stop();
                return;
            }
        }
        animator.deltaTime = elapsedTime;
    }
    #animateEntity(animator, entity) {
        for (let component of animator.animation.animatableComponents) {
            entity.get(component)?.animate(entity);
        }
        for (let [frame, keyFrame] of animator.animation.keyframes.entries()) {
            if (frame === animator.frame)
                keyFrame.animate(entity);
        }
    }
    #getAnimators() {
        return this.scene.entities([AnimatorComponent]);
    }
}
class PatrolSystem extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let navigations = this.#getNavigations();
        for (let navigation of navigations) {
            if (!navigation.navigator.navigating || (navigation.patroller.destinations?.length ?? 0) === 0)
                continue;
            //Determine how far we need to travel
            let distance = navigation.navigator.destination.subtract(navigation.transform.position);
            let translation = distance.normalize().scale(deltaTime * navigation.patroller.speed);
            //Check if we've arrived at our destination
            if (distance.magnitudeSquared() < navigation.patroller.tolerance || translation.magnitudeSquared() > distance.magnitudeSquared()) {
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
class TestEvent1 {
}
class TestEvent2 {
}
class ReadTestSytemEvents extends CriterionSystem {
    constructor(scene) {
        super(scene);
    }
    update(deltaTime) {
        let events = this.scene.system(EventSystem).events();
        for (let event of events)
            console.warn("We found an event", event);
    }
}
