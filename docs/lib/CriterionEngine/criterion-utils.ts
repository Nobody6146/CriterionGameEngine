class CriterionShaderProgramUtils
{
    static createTestShaderProgram(engine:CriterionEngine): {shaderProgram:WebGLProgram, uniformLocations:Map<string,WebGLUniformLocation>} {
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

    static createSolidFillShaderProgram(engine:CriterionEngine): {shaderProgram:WebGLProgram, uniformLocations:Map<string,WebGLUniformLocation>} {
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
        let uniforms = ["viewMatrix", "projectionMatrix", "transformMatrix", "color"];
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