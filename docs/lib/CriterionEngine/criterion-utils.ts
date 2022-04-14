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

class CriterionModelUtils {
    static buildModel(engine:CriterionEngine, attributes: {data: number[], dimension: number}[]): WebGLVertexArrayObject {
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
            memoryManager.setFloatAttribute(i, attribute.dimension);
        }
        memoryManager.unbindBufferArray();
        memoryManager.unbindArray();
        return vao;
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
}

interface RenderBatchEntity {
    vertices:Vector3f[];
    textureCoordinates:Vector2f[];
    color:Vector4f;
    texture:WebGLTexture;
    layer:number;
}

class RenderBatch {
    buffer:number[];
    textures:WebGLTexture[];
    colors:Vector4f[];

    constructor() {
        this.buffer = [];
        this.textures = [];
        this.colors = [];
    }
}

class RenderBatcher {
    #layers:Map<number, RenderBatchEntity[]>;

    constructor() {
        this.#layers = new Map();
    }

    clear():void {
        this.#layers.clear();
    }

    buffer(renderable:RenderBatchEntity):void {
        let renderLayer = this.#layers.get(renderable.layer);
        if(!renderLayer)
        {
            renderLayer = [];
            this.#layers.set(renderable.layer, renderLayer);
        }
        renderLayer.push(renderable);
    }

    batch(maxBufferSize:number, maxTextures:number):RenderBatch[] {
        let batches = [new RenderBatch()];
        let batch = batches[0];

        //Batch in order of layers/priority
        let layerNumbers = [...this.#layers.keys()].sort((x, y) => x - y);
        for(let layerNumber of layerNumbers)
        {
            let layer = this.#layers.get(layerNumber);
            for(let renderable of layer)
            {
                let spaceNeeded = renderable.vertices.length * RenderBatcher.bytesPerVertex;
                if(batch.buffer.length + spaceNeeded > maxBufferSize)
                {
                    batch = new RenderBatch();
                    batches.push(batch);
                }

                //Determine texture and color ids (also move batches if needed)
                let textureId = renderable.texture == null ? null : batch.textures.indexOf(renderable.texture);
                if(textureId < 0)
                {
                    if(batch.textures.length === maxTextures)
                    {
                        batch = new RenderBatch();
                        batches.push(batch);
                    }
                    textureId = batch.textures.length;
                    batch.textures.push(renderable.texture);
                } else if(textureId === null) {
                    textureId = -1;
                }
                let colorId = renderable.color == null ? null : batch.colors.findIndex(x => x.equals(renderable.color));
                if(colorId < 0)
                {
                    if(batch.colors.length === maxTextures)
                    {
                        batch = new RenderBatch();
                        batches.push(batch);
                    }
                    colorId = batch.colors.length;
                    batch.colors.push(renderable.color);
                } else if(textureId === null) {
                    textureId = -1;
                }

                //Batch the model's data
                for(let i = 0; i < renderable.vertices.length; i++)
                {
                    let vertice = renderable.vertices[i];
                    let textureCoords = renderable.textureCoordinates[i] ?? new Vector2f([0, 0]);
                    batch.buffer.push(...vertice.array);
                    batch.buffer.push(...textureCoords.array);
                    batch.buffer.push(textureId);
                    batch.buffer.push(colorId);
                }
            }
        }
        return batches;
    }

    static get bytesPerVertex() {
        return 3 //vertices values count
            + 2 //plus texture coordinate values count
            + 1 //plus texture number
            + 1; //plus color number
            //If we don't have enough space left in the batch, start a new one
    }
}