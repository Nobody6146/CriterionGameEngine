class SpriteSheet {
    width;
    height;
    frameWidth;
    frameHeight;
    framesPerRow;
    framesPerColumn;
    constructor() {
    }
    getOffset() {
        return new Vector2f([this.width / this.frameWidth, this.height / this.frameHeight]);
    }
    getFrame(frame) {
        let offset = this.getOffset();
        return new Vector2f([(frame % this.framesPerRow) * offset.x, (frame / this.framesPerRow) * offset.y]);
    }
}
class Mesh {
    vertices;
    uvs;
    normals;
    constructor(vertices = [], uvs = [], normals = []) {
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
    }
}
