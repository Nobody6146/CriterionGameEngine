class ResourceNames {
    static SQUARE = "square";
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

interface SystemEvent {
    
}

class SpriteSheet {
    texture:WebGLTexture;
    width:number;
    height:number;
    frameWidth:number;
    frameHeight:number;
    framesPerRow:number;
    framesPerColumn:number;

    constructor(texture:WebGLTexture, width:number, height:number, frameWidth?:number, frameHeight?:number, framesPerRow?:number, framesPerColumn?:number,) {
        this.texture = texture;
        this.width = width;
        this.height = height;
        this.frameWidth = frameWidth ?? this.width;
        this.frameHeight = frameHeight ?? this.height;
        this.framesPerColumn = framesPerColumn ?? Math.floor(this.height / this.frameHeight);
        this.framesPerRow = framesPerRow ?? Math.floor(this.width / this.frameWidth);
    }

    getFrameCoordinates(frame:number): {start:Vector2f, end:Vector2f} {
        let frameSize = new Vector2f([this.frameWidth/this.width, this.frameHeight/this.height]);
        let start = new Vector2f([(frame % this.framesPerRow) * frameSize.x, Math.floor(frame / this.framesPerRow) * frameSize.y]);
        return {
            start,
            end: new Vector2f([start.x + frameSize.x, start.y + frameSize.y])
        };
    }
}

class Mesh {
    indices:number[];
    vertices:Vector3f[];
    uvs:Vector2f[];
    normals:Vector3f[];
    minVertex:Vector3f;
    maxVertex:Vector3f;

    constructor(indices:number[], vertices:Vector3f[] = [], minVertex:Vector3f, maxVertex:Vector3f, uvs:Vector2f[] = [], normals:Vector3f[] = []) {
        this.indices = indices;
        this.vertices = vertices;
        this.uvs = uvs;
        this.normals = normals;
        this.minVertex = minVertex;
        this.maxVertex = maxVertex;
    }
}

interface IAnimatableComponent extends CriterionComponent {
    animate(entity:CriterionEntity);
}

interface AnimationKeyframe {
    animate(entity:CriterionEntity);
}

class AnimationSequence {
    startFrame:number;
    endFrame:number;
    frameDuration:number;
    animatableComponents:(new (...args) => IAnimatableComponent)[];
    keyframes:Map<number, AnimationKeyframe>;
    //The frame to go to when animation stops/finishes
    finishedFrame:number;
    //How many times to repeat
    iterations:number;
    //Whether or not the animation can be interupted
    interruptible:boolean;

    constructor(startFrame:number, endFrame:number, frameDuration:number, animatableComponents:(new (...args) => IAnimatableComponent)[] = [], iterations:number = -1, keyframes?:Map<number, AnimationKeyframe>, interruptible:boolean = true, finishedFrame:number = null)
    {
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

type HorizontalAlignment = "left" | "center" | "right";
type VeriticalAlignment = "top" | "center" | "bottom";

class FontStyle {
    texture:WebGLTexture;
    fontSheet:FontSheet;

    constructor(texture:WebGLTexture, fontSheet:FontSheet) {
        this.texture = texture;
        this.fontSheet = fontSheet;
    }
}

class TextGeneratorMeshGenerator {
    static generateTextMesh(text:string, width:number, height:number, fontStyle:FontStyle, transformation:Matrix4f, horizontalAlignment:HorizontalAlignment, verticalAlignment:VeriticalAlignment) {
        let squareMesh = CriterionMeshUtils.createSquare2DMesh();
        let mesh:Mesh = {
            vertices: [],
            minVertex: null,
            maxVertex: null,
            uvs: [],
            normals: [],
            indices: [],
        }

        mesh.minVertex = squareMesh.minVertex;
        mesh.maxVertex = squareMesh.maxVertex;
        if(!text)
            return mesh;

        let cursor = new Vector2f([0, 0]);
        let startHeight = 0;
        
        let fontSheet = fontStyle.fontSheet;
        let size = {
            width: width,
            height: height
        };
        let lines:{chars:FontCharacter[], width:number;}[] = this.#formatIntoLines(text, size, fontSheet);

        switch(verticalAlignment)
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
            switch(horizontalAlignment)
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
                for(let i = 0; i < squareMesh.vertices.length; i++)
                {
                    let vertex = squareMesh.vertices[i];
                    mesh.vertices.push(new Vector3f([vertex.x * c.width, vertex.y * c.height, vertex.z]).transform(transformation).add(position));
                    let uv = squareMesh.uvs[i];
                    mesh.uvs.push(new Vector2f([c.frameStart.x + c.frameSize.x * uv.x, c.frameStart.y + c.frameSize.y * uv.y]));
                    let normal = squareMesh.normals[i];
                    mesh.normals.push(normal);
                }
                for(let i = 0; i < squareMesh.indices.length; i++)
                {
                    let index = squareMesh.indices[i];
                    mesh.indices.push(characterCount*squareMesh.vertices.length + index);
                }
                characterCount++;
                
                cursor.x += c.lineAdvance;
            }
            
            cursor = new Vector2f([0, cursor.y + fontSheet.lineHeight]);
        }
        
        return mesh;
    }

    static #formatIntoLines(text:string, size:{width:number, height:number}, fontSheet:FontSheet): {chars:FontCharacter[], width:number;}[]
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
}