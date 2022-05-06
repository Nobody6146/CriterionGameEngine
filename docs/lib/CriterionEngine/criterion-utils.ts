interface CriterionShaderProgramUtilsShader {
    shaderProgram:WebGLProgram;
    uniformLocations:Map<string,WebGLUniformLocation>;
    attributes:Map<string, number>;
}

class CriterionShaderProgramUtils
{
    static createTestShaderProgram(engine:CriterionEngine):CriterionShaderProgramUtilsShader {
        const vertexShaderSource = `#version 300 es
            in vec3 position;

            void main(void)
            {
                gl_Position = vec4(position, 1.0);
            }`;
        const fragmentShaderSource = `#version 300 es
            #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp float;
            #else
            precision mediump float;
            #endif

            out vec4 outColor;

            void main(void)
            {
                outColor = vec4(.5, .5, .5, .5);
            }`;
        return engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource);
    }

    static createSolidFillShaderProgram(engine:CriterionEngine):CriterionShaderProgramUtilsShader  {
        const vertexShaderSource = `#version 300 es
            in vec3 position;

            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat4 transformMatrix;

            out vec2 textureCoordinates;
            out vec4 color;

            void main(void)
            {
                gl_Position = projectionMatrix * viewMatrix * transformMatrix * vec4(position, 1.0);
                //gl_Position = vec4(position, 1.0);
            }`;
            const fragmentShaderSource = `#version 300 es
            precision mediump float;

            uniform vec4 color;

            out vec4 outColor;

            void main(void)
            {
                outColor = color;
            }`;
        let attributes:Map<string, number> = new Map();
        attributes.set("position", 0);
        let uniforms = ["viewMatrix", "projectionMatrix", "transformMatrix", "color"];
        return engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
    }

    static createTextureShaderProgram(engine:CriterionEngine):CriterionShaderProgramUtilsShader {
        const vertexShaderSource = `#version 300 es
            in vec3 position;
            in vec2 uvCoordinates;

            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat4 transformMatrix;

            out vec2 textureCoordinates;

            void main(void)
            {
                gl_Position = projectionMatrix * viewMatrix * transformMatrix * vec4(position, 1.0);
                textureCoordinates = uvCoordinates;
            }`;
            const fragmentShaderSource = `#version 300 es
            precision mediump float;

            in vec2 textureCoordinates;

            uniform sampler2D textureSampler;

            out vec4 outColor;

            void main(void)
            {
                outColor = texture(textureSampler, textureCoordinates);
            }`;
        let attributes:Map<string, number> = new Map();
        attributes.set("position", 0);
        attributes.set("uvCoordinates", 1);
        let uniforms = ["viewMatrix", "projectionMatrix", "transformMatrix", "textureSampler"];
        return engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
    }
}

interface CriterionMeshUtilsMesh {
    indices:number[],
    vertices:Vector3f[],
    minVertex:Vector3f,
    maxVertex:Vector3f,
    uvs:Vector2f[],
    normals:Vector3f[] 
};

class CriterionMeshUtils {
    static createSquare3DMesh(): CriterionMeshUtilsMesh {
        return {
            indices: [0, 1, 3, 3, 1, 2],
            vertices: [
                new Vector3f([-0.5, 0.5, 0]),
                new Vector3f([-0.5, -0.5, 0]),
                new Vector3f([0.5, -0.5, 0]),
                new Vector3f([0.5, 0.5, 0]),
            ],
            minVertex: new Vector3f([-.5, -.5, 0]),
            maxVertex: new Vector3f([.5, .5, 0]),
            uvs: [
                new Vector2f([0,1,]),
                new Vector2f([0,0,]),
                new Vector2f([1,0,]),
                new Vector2f([1,1,]),
            ],
            normals:[
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
            ],
        };
    }

    static createSquare2DMesh(): CriterionMeshUtilsMesh {
        return {
            indices: [0, 1, 3, 3, 1, 2],
            vertices: [
                new Vector3f([0, 1, 0]),
                new Vector3f([0, 0, 0]),
                new Vector3f([1, 0, 0]),
                new Vector3f([1, 1, 0]),
            ],
            minVertex: new Vector3f([0, 0, 0]),
            maxVertex: new Vector3f([1, 1, 0]),
            uvs: [
                new Vector2f([0,1,]),
                new Vector2f([0,0,]),
                new Vector2f([1,0,]),
                new Vector2f([1,1,]),
            ],
            normals:[
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
            ],
        };
    }
}

class CriterionModelUtils {
    static buildModel(engine:CriterionEngine, attributes: {data: number[], dimension: number}[], indices:number[] = []): {vao:WebGLVertexArrayObject, indicesVbo:WebGLBuffer} {
        let memoryManager = engine.memoryManager;
        //Create model
        let vao = memoryManager.createArray();
        memoryManager.bindArray(vao);
        for(let i = 0; i < attributes.length; i++)
        {
            let attribute = attributes[i];
            let vbo = memoryManager.createBuffer();
            memoryManager.bindBufferArray(vbo);
            memoryManager.bufferArray(new Float32Array(attribute.data));
            memoryManager.setAttribute("float", i, attribute.dimension);
        }
        memoryManager.unbindBufferArray();
        memoryManager.unbindArray();

        if(indices?.length > 0)
        {
            let vbo = memoryManager.createBuffer();
            memoryManager.bindElementsBufferArray(vbo);
            memoryManager.bufferElements(new Uint16Array(indices));
            memoryManager.unbindElementsBufferArray();
            return {
                vao,
                indicesVbo: vbo
            }
        }

        return {
            vao,
            indicesVbo: null
        };
    }
}

class CriterionTextureUtils 
{
    static async loadImage(url:string): Promise<HTMLImageElement> {
        return new Promise( (resolve, reject) => {
            const image = new Image();
            image.onload = function() {
                resolve(image);
            }
            image.onerror = function() {
                reject("Failed to load texture");
            }
            image.src = url;
        })
    }

    static async loadTexture(engine:CriterionEngine, url:string, aliasing?:CriterionTextureAliasing): Promise<{image:HTMLImageElement, texture:WebGLTexture}> {
        let texture = engine.memoryManager.createTexture();
        engine.memoryManager.bindTexture(texture);
        let image = await CriterionTextureUtils.loadImage(url);
        engine.memoryManager.bufferTexture(0, image.width, image.height, image, aliasing);
        engine.memoryManager.unbindTexture();
        return {
            image,
            texture
        }
    }
}

class FontSheet {
    lineHeight:number;
    baseline:number;
    fontSize:number;
    width:number;
    height:number;
    characters:Map<number, FontCharacter>;

    constructor() {
        this.lineHeight = 0;
        this.baseline = 0;
        this.fontSize = 0;
        this.width = 0;
        this.height = 0;
        this.characters = new Map();
    }

    scale() {
        this.lineHeight /= this.width;
        this.baseline /= this.width;
    }
}

class FontCharacter {
    asciiValue:number;
    lineOffset:Vector2f;
	lineAdvance:number;
    width:number;
    height:number;

    frameStart:Vector2f;
    frameSize:Vector2f;
    frameEnd:Vector2f;
	
	constructor(sheetWidth:number, sheetHeight:number, asciiValue:number, x:number, y:number, width:number, height:number, xoffset:number, yoffset:number, lineAdvance:number)
	{
		this.asciiValue = asciiValue;
		this.lineOffset = new Vector2f([xoffset, yoffset]);
        this.lineAdvance = lineAdvance;
        this.width = width;
        this.height = height;

        this.frameStart = new Vector2f([x/sheetWidth, y/sheetHeight]);
        this.frameSize = new Vector2f([width/sheetWidth, height/sheetHeight]);
        this.frameEnd = new Vector2f([this.frameStart.x + this.frameSize.x, this.frameStart.y + this.frameSize.y]);
	}
}

class CriterionFontUtils {
	
	static async loadFont(url:string):Promise<FontSheet> {	
        let text = await (await fetch(url)).text();
        let lines = text.split("\n");

        let fontSheet = new FontSheet();
        
		for(let line of lines)
		{
            if(line.startsWith("info ")) {
                fontSheet.fontSize = this.#getAttribute("size", line);
            }
            else if(line.startsWith("common ")) {
                fontSheet.width = this.#getAttribute("scaleW", line);
                fontSheet.height = this.#getAttribute("scaleH", line);
                fontSheet.lineHeight = this.#getAttribute("lineHeight", line);
                fontSheet.baseline = this.#getAttribute("base", line);
            }
            else if(line.startsWith("char "))
            {
				let character = new FontCharacter(
                    fontSheet.width,
                    fontSheet.height,
                    this.#getAttribute("id", line),
                    this.#getAttribute("x", line),
                    this.#getAttribute("y", line),
                    this.#getAttribute("width", line),
                    this.#getAttribute("height", line),
                    this.#getAttribute("xoffset", line),
                    this.#getAttribute("yoffset", line),
                    this.#getAttribute("xadvance", line)
                );
                fontSheet.characters.set(character.asciiValue, character);
            }
        }

        return fontSheet;
	}

    static #getAttribute(name:string, line:string) {
        let regex = new RegExp(`${name}=(\\w+)`);
        return Number.parseInt(line.match(regex)?.[1] ?? "0");
    }
}