class BatchRendererShader extends CriterionShader<CriterionRenderBatch> {
    #maxBufferSize:number;
    #maxElementsBufferSize:number;
    #vbo:WebGLBuffer;
    #elementsVbo:WebGLBuffer;

    constructor(maxBufferSize:number, maxElementsBufferSize:number, vbo:WebGLBuffer, elementsVbo:WebGLBuffer, shaderResult:CriterionLoadedShaderProgramResult) {
        super(shaderResult.shaderProgram, shaderResult.uniformLocations, shaderResult.attributes);
        this.#maxBufferSize = maxBufferSize;
        this.#maxElementsBufferSize = maxElementsBufferSize;
        this.#vbo = vbo;
        this.#elementsVbo = elementsVbo;
    }

    get maxBufferSize():number {
        return this.#maxBufferSize;
    }
    get maxElemetsBufferSize():number {
        return this.#maxElementsBufferSize;
    }
    get maxTextures():number {
        return BatchRendererShader.maxTextures;
    }
    static get maxTextures():number {
        return 8;
    }
    static get positionAttribute():string {
        return "position";
    }
    static get textureCoordinatesAttribute():string {
        return "uvCoordinatesAttribut";
    };
    static get textureAttribute():string {
        return "textureId";
    };
    static get colorAttribute():string {
        return "colorId";
    };

    static get viewUniform():string
    {
        return "viewMatrix"
    }
    static get projectionUniform():string {
        return "projectionMatrix";
    };
    static get texturesUniform():string {
        return "textures"
    }
    static get colorsUniform():string {
        return "colors";
    }

    prepare(scene:CriterionScene):void {
        let camera = this.#getCamera(scene);

        let mm = scene.engine.memoryManager;
        scene.engine.window.enableAlphaBlending(true);
        mm.bindBufferArray(this.#vbo);
        for(let attribute of this.attributes.values())
            mm.enableAttribute(attribute);
        mm.bindElementsBufferArray(this.#elementsVbo);
        mm.setUniform(this.uniforms.get(BatchRendererShader.viewUniform), camera.camera.view);
        mm.setUniform(this.uniforms.get(BatchRendererShader.projectionUniform), camera.camera.projection);
    }

    render(scene:CriterionScene, batch: CriterionRenderBatch) {
        let mm = scene.engine.memoryManager;
        //Load the textures
        //mm.setUniform(this.uniforms.get(BatchRendererShader.texturesUniform), [0,1,2,3], "integer");
        for(let i = 0; i < batch.textures.length; i++)
        {
            mm.useTexture(CriterionShader.indexToTextureId(scene.engine, i));
            mm.bindTexture(batch.textures[i]);
        }
        //Load the colors
        for(let i = 0; i < batch.colors.length; i++)
            mm.setUniform(this.uniforms.get(`${BatchRendererShader.colorsUniform}[${i}]`), batch.colors[i]);
        //Load the data and draw
        mm.bufferArray(new Float32Array(batch.buffer), "dynamic", 0);
        mm.bufferElements(new Uint16Array(batch.elementsBuffer), "dynamic");
        //scene.engine.window.renderArrays(batch.elementsBuffer.length);
        scene.engine.window.renderElements(batch.elementCount);
    }

    cleanup(scene:CriterionScene): void {
        let mm = scene.engine.memoryManager;
        for(let attribute of this.attributes.values())
            mm.disableAttribute(attribute);
        scene.engine.window.enableAlphaBlending(false);
        mm.unbindBufferArray();
        mm.unbindElementsBufferArray();
    }

    #getCamera(scene:CriterionScene):CameraBluePrint {
        return CriterionBlueprint.blueprints(scene, CameraBluePrint)[0];
    }

    static create(engine:CriterionEngine):BatchRendererShader {
        const vertexShaderSource = `#version 300 es
            in vec3 position;
            in vec2 uvCoordinates;
            in float textureId;
            in float colorId;

            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;

            out vec2 textureCoordinates;
            out float textureIndex;
            out float colorIndex;

            void main(void)
            {
                gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
                textureCoordinates = uvCoordinates;
                textureIndex = textureId;
                colorIndex = colorId;
            }`;

            let textureText = "";
            for(let i = 0; i < BatchRendererShader.maxTextures; i++)
                textureText += `case ${i}:
                return texture(textures[${i}], uv);
                `;

            const fragmentShaderSource = `#version 300 es
            #define numTextures ${BatchRendererShader.maxTextures}
            precision mediump float;

            in vec2 textureCoordinates;
            in float textureIndex;
            in float colorIndex;

            uniform sampler2D textures[numTextures];
            uniform vec4 colors[numTextures];

            out vec4 outColor;

            vec4 getSampleFromArray(sampler2D textures[numTextures], int i, vec2 uv) {
                switch(i) {
                    ${textureText}
                }
            }

            void main(void)
            {
                outColor = vec4(1,1,1,1);
                if(textureIndex < 0.0)
                    outColor = colors[int(floor(colorIndex))];
                else
                    outColor = getSampleFromArray(textures, int(textureIndex), textureCoordinates);
            }`;
        let attributes:Map<string, number> = new Map();
        attributes.set(BatchRendererShader.positionAttribute, 0);
        attributes.set(BatchRendererShader.textureCoordinatesAttribute, 1);
        attributes.set(BatchRendererShader.textureAttribute, 2);
        attributes.set(BatchRendererShader.colorAttribute, 3);
        let uniforms = [BatchRendererShader.viewUniform, BatchRendererShader.projectionUniform];
        for(let i = 0; i < this.maxTextures; i++)
        {
            uniforms.push(`${BatchRendererShader.texturesUniform}[${i}]`);
            uniforms.push(`${BatchRendererShader.colorsUniform}[${i}]`);
        }
        let shaderResult = engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
        let maxBufferSize = CriterionRenderBatcher.totalBytesPerVertex* 3 * 10000; //1mb
        let maxElementsBufferSize = 1000000; //1mb
        let vbo = this.#createBuffer(engine, maxBufferSize);
        let elementsVbo = this.#createElementsBuffer(engine, maxElementsBufferSize);
        let shader = new BatchRendererShader(maxBufferSize, maxElementsBufferSize, vbo, elementsVbo, shaderResult);

        //Enable the textures for the shader
        engine.memoryManager.startShaderProgram(shaderResult.shaderProgram);
        for(let i = 0; i < this.maxTextures; i++)
            engine.memoryManager.setUniform(shaderResult.uniformLocations.get(`${BatchRendererShader.texturesUniform}[${i}]`), i, "integer");        
        engine.memoryManager.stopShaderProgram();

        return shader
    }

    static #createBuffer(engine:CriterionEngine, maxBufferSize:number):WebGLBuffer {
        let mm = engine.memoryManager;
        let vbo = mm.createBuffer();
        mm.bindBufferArray(vbo);
        mm.bufferArray(maxBufferSize, "dynamic");
        let totalBytes = 0;
        let index = 0;
        let setAttribute = function(dimension:number, bytes:number) {
            mm.setAttribute("float", index++, dimension, false, CriterionRenderBatcher.totalBytesPerVertex, totalBytes);
            totalBytes+= bytes;
        }
        setAttribute(3, CriterionRenderBatcher.numberOfVertexBytes);
        setAttribute(2, CriterionRenderBatcher.numberOfTextureCoordinateBytes);
        setAttribute(1, CriterionRenderBatcher.numberOfTextureIdBytes);
        setAttribute(1, CriterionRenderBatcher.numberOfColorIdBytes);
        mm.unbindArray();
        return vbo;
    }

    static #createElementsBuffer(engine:CriterionEngine, maxBufferSize:number):WebGLBuffer {
        let mm = engine.memoryManager;
        let vbo = mm.createBuffer();
        mm.bindElementsBufferArray(vbo);
        mm.bufferElements(maxBufferSize, "dynamic");
        mm.unbindElementsBufferArray();
        return vbo;
    }
}