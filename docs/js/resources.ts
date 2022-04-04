class SpriteSheet {
    width:number;
    height:number;
    frameWidth:number;
    frameHeight:number;
    framesPerRow:number;
    framesPerColumn:number;

    constructor() {

    }
    
    getOffset() {
        return new Vector2f([this.width/this.frameWidth, this.height/this.frameHeight]);
    }

    getFrame(frame:number):Vector2f {
        let offset = this.getOffset();
        return new Vector2f([(frame % this.framesPerRow) * offset.x, (frame / this.framesPerRow) * offset.y]);
    }
}