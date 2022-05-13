class ResourceNames {
    static SQUARE = "square";
    static MARKERS = "markers";
    static TILE = "tiles";
    static MONOSPACED = "monospaced";
    static Humann = "human";
    static Zombie = "zombie";
}
class RenderLayers {
    static MAP = 0;
    static TILEMAP = 1;
    static MARKERS = 2;
    static ENTITIES = 2;
    static UI = 3;
}
class SpriteSheet {
    texture;
    width;
    height;
    frameWidth;
    frameHeight;
    framesPerRow;
    framesPerColumn;
    constructor(texture, width, height, frameWidth, frameHeight, framesPerRow, framesPerColumn) {
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.frameWidth = frameWidth ?? this.width;
        this.frameHeight = frameHeight ?? this.height;
        this.framesPerColumn = framesPerColumn ?? Math.floor(this.height / this.frameHeight);
        this.framesPerRow = framesPerRow ?? Math.floor(this.width / this.frameWidth);
    }
    getFrameCoordinates(frame) {
        let frameSize = new Vector2f([this.frameWidth / this.width, this.frameHeight / this.height]);
        let start = new Vector2f([(frame % this.framesPerRow) * frameSize.x, Math.floor(frame / this.framesPerRow) * frameSize.y]);
        return {
            start,
            end: new Vector2f([start.x + frameSize.x, start.y + frameSize.y])
        };
    }
}
class Mesh {
    indices;
    vertices;
    uvs;
    normals;
    minVertex;
    maxVertex;
    constructor(indices, vertices = [], minVertex, maxVertex, uvs = [], normals = []) {
        this.indices = indices;
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.minVertex = minVertex;
        this.maxVertex = maxVertex;
    }
}
class AnimationSequence {
    startFrame;
    endFrame;
    frameDuration;
    animatableComponents;
    keyframes;
    //The frame to go to when animation stops/finishes
    finishedFrame;
    //How many times to repeat
    iterations;
    //Whether or not the animation can be interupted
    interruptible;
    constructor(startFrame, endFrame, frameDuration, animatableComponents = [], iterations = -1, keyframes, interruptible = true, finishedFrame = null) {
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.frameDuration = frameDuration;
        this.animatableComponents = animatableComponents;
        this.keyframes = keyframes ?? new Map();
        this.iterations = iterations;
        this.interruptible = interruptible;
        this.finishedFrame = finishedFrame;
    }
}
class FontStyle {
    texture;
    fontSheet;
    constructor(texture, fontSheet) {
        this.texture = texture;
        this.fontSheet = fontSheet;
    }
}
class TextGeneratorMeshGenerator {
    static generateTextMesh(text, width, height, fontStyle, transformation, horizontalAlignment, verticalAlignment) {
        let squareMesh = CriterionMeshUtils.createSquare2DMesh();
        let mesh = {
            vertices: [],
            minVertex: null,
            maxVertex: null,
            uvs: [],
            normals: [],
            indices: [],
        };
        mesh.minVertex = squareMesh.minVertex;
        mesh.maxVertex = squareMesh.maxVertex;
        if (!text)
            return mesh;
        let cursor = new Vector2f([0, 0]);
        let startHeight = 0;
        let fontSheet = fontStyle.fontSheet;
        let size = {
            width: width,
            height: height
        };
        let lines = this.#formatIntoLines(text, size, fontSheet);
        switch (verticalAlignment) {
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
        let characterCount = 0;
        for (let line of lines) {
            let chars = line.chars;
            let startWidth = 0;
            switch (horizontalAlignment) {
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
                for (let i = 0; i < squareMesh.vertices.length; i++) {
                    let vertex = squareMesh.vertices[i];
                    mesh.vertices.push(new Vector3f([vertex.x * c.width, vertex.y * c.height, vertex.z]).transform(transformation).add(position));
                    let uv = squareMesh.uvs[i];
                    mesh.uvs.push(new Vector2f([c.frameStart.x + c.frameSize.x * uv.x, c.frameStart.y + c.frameSize.y * uv.y]));
                    let normal = squareMesh.normals[i];
                    mesh.normals.push(normal);
                }
                for (let i = 0; i < squareMesh.indices.length; i++) {
                    let index = squareMesh.indices[i];
                    mesh.indices.push(characterCount * squareMesh.vertices.length + index);
                }
                characterCount++;
                cursor.x += c.lineAdvance;
            }
            cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
        }
        return mesh;
    }
    static #formatIntoLines(text, size, fontSheet) {
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
            cursor.x += fontC.lineAdvance;
        }
        //Read the last character, so add the last line
        if (lineWidth > 0)
            lines.push({ chars: lineChars, width: lineWidth });
        return lines;
    }
}
