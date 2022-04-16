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

class CameraSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        let camera = this.getCamera();
        camera.camera.view = Matrix4f.viewMatrix(camera.transform.position, camera.transform.scale);
    }

    getCamera(){
        return CriterionBlueprint.blueprints(this.scene, CameraBluePrint)[0];
    }
}

class SpriteRendererSystem extends CriterionSystem {

    constructor(scene:CriterionScene) {
        super(scene);
    }

    update(deltaTime: number): void {
        //Render sprites to screen
        let shader = this.scene.engine.resourceManager.get(RenderableSpriteShader);
        shader.run(this.scene);
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
            this.#animateComponents(animator, entity);
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
            this.#animateComponents(animator, entity);
            if(animator.finished) {
                animator.stop();
                return;
            }
        }
        animator.deltaTime = elapsedTime;
    }

    #animateComponents(animator:AnimatorComponent, entity:CriterionEntity) {
        for(let component of animator.animation.animatableComponents) {
            entity.get(component)?.animate(entity);
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