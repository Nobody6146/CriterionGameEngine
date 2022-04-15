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

class CriterionMeshUtils {
    static squareMesh(): {vertices:Vector3f[], uv:Vector2f[], normals:Vector3f[] } {
        return {
            vertices: [
                new Vector3f([-0.5, 0.5, 0]),
                new Vector3f([-0.5, -0.5, 0]),
                new Vector3f([0.5, -0.5, 0]),
                new Vector3f([0.5, -0.5, 0]),
                new Vector3f([0.5, 0.5, 0]),
                new Vector3f([-0.5, 0.5, 0])
            ],
            uv: [
                new Vector2f([0,1,]),
                new Vector2f([0,0,]),
                new Vector2f([1,0,]),
                new Vector2f([1,0,]),
                new Vector2f([1,1,]),
                new Vector2f([0,1])
            ],
            normals:[
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
            ],
        };
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
            memoryManager.setAttribute("float", i, attribute.dimension);
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

    static async loadTexture(engine:CriterionEngine, url:string): Promise<{image:HTMLImageElement, texture:WebGLTexture}> {
        let texture = engine.memoryManager.createTexture();
        engine.memoryManager.bindTexture(texture);
        let image = await CriterionTextureUtils.loadImage(url);
        engine.memoryManager.bufferTexture(0, image.width, image.height, image);
        engine.memoryManager.unbindTexture();
        return {
            image,
            texture
        }
    }
}