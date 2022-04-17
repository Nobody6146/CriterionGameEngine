class BatchRendererShader extends CriterionShader {
    #maxBufferSize;
    #vbo;
    constructor(maxBufferSize, vbo, shaderResult) {
        super(shaderResult.shaderProgram, shaderResult.uniformLocations, shaderResult.attributes);
        this.#maxBufferSize = maxBufferSize;
        this.#vbo = vbo;
    }
    get maxBufferSize() {
        return this.#maxBufferSize;
    }
    get maxTextures() {
        return BatchRendererShader.maxTextures;
    }
    static get maxTextures() {
        return 8;
    }
    static get positionAttribute() {
        return "position";
    }
    static get textureCoordinatesAttribute() {
        return "uvCoordinatesAttribut";
    }
    ;
    static get textureAttribute() {
        return "textureId";
    }
    ;
    static get colorAttribute() {
        return "colorId";
    }
    ;
    static get viewUniform() {
        return "viewMatrix";
    }
    static get projectionUniform() {
        return "projectionMatrix";
    }
    ;
    static get texturesUniform() {
        return "textures";
    }
    static get colorsUniform() {
        return "colors";
    }
    prepare(scene) {
        let camera = this.#getCamera(scene);
        let mm = scene.engine.memoryManager;
        scene.engine.window.enableAlphaBlending(true);
        mm.bindBufferArray(this.#vbo);
        for (let attribute of this.attributes.values())
            mm.enableAttribute(attribute);
        mm.setUniform(this.uniforms.get(BatchRendererShader.viewUniform), camera.camera.view);
        mm.setUniform(this.uniforms.get(BatchRendererShader.projectionUniform), camera.camera.projection);
    }
    render(scene, batch) {
        let mm = scene.engine.memoryManager;
        //Load the textures
        for (let i = 0; i < batch.textures.length; i++) {
            //Turn textures on in shader
            mm.setUniform(this.uniforms.get(`${BatchRendererShader.projectionUniform}[${i}]`), i, "integer");
            //Activates the texture in open fl
            mm.useTexture(CriterionShader.indexToTextureId(scene.engine, i));
            //Sets the texture
            mm.bindTexture(batch.textures[i]);
        }
        //Load the colors
        for (let i = 0; i < batch.colors.length; i++) {
            mm.setUniform(this.uniforms.get(`${BatchRendererShader.colorsUniform}[${i}]`), batch.colors[i]);
        }
        //Load the data and draw
        mm.bufferArray(new Float32Array(batch.buffer), "dynamic", 0);
        scene.engine.window.renderTriangles(batch.verticesCount);
    }
    cleanup(scene) {
        let mm = scene.engine.memoryManager;
        for (let attribute of this.attributes.values())
            mm.disableAttribute(attribute);
        scene.engine.window.enableAlphaBlending(false);
        mm.unbindBufferArray();
    }
    #getCamera(scene) {
        return CriterionBlueprint.blueprints(scene, CameraBluePrint)[0];
    }
    #getRenderables(scene) {
        return CriterionBlueprint.blueprints(scene, RenderableSpriteBlueprint);
    }
    static create(engine) {
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
        const fragmentShaderSource = `#version 300 es
            #define numTextures 8
            precision mediump float;

            in vec2 textureCoordinates;
            in float textureIndex;
            in float colorIndex;

            uniform sampler2D textures[numTextures];
            uniform vec4 colors[numTextures];

            out vec4 outColor;

            vec4 getSampleFromArray(sampler2D textures[numTextures], int i, vec2 uv) {
                switch(i) {
                    case 0:
                        return texture(textures[0], uv);
                    case 1:
                        return texture(textures[0], uv);
                    case 2:
                        return texture(textures[0], uv);
                    case 3:
                        return texture(textures[0], uv);
                    case 4:
                        return texture(textures[0], uv);
                    case 5:
                        return texture(textures[0], uv);
                    case 6:
                        return texture(textures[0], uv);
                    case 7:
                        return texture(textures[0], uv);
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
        let attributes = new Map();
        attributes.set(BatchRendererShader.positionAttribute, 0);
        attributes.set(BatchRendererShader.textureCoordinatesAttribute, 1);
        attributes.set(BatchRendererShader.textureAttribute, 2);
        attributes.set(BatchRendererShader.colorAttribute, 3);
        let uniforms = [BatchRendererShader.viewUniform, BatchRendererShader.projectionUniform];
        for (let i = 0; i < this.maxTextures; i++) {
            uniforms.push(`${BatchRendererShader.texturesUniform}[${i}]`);
            uniforms.push(`${BatchRendererShader.colorsUniform}[${i}]`);
        }
        let shader = engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
        let maxBufferSize = CriterionRenderBatcher.totalBytesPerVertex * 3 * 1000;
        let vbo = this.createBuffer(engine, maxBufferSize);
        return new BatchRendererShader(maxBufferSize, vbo, shader);
    }
    static createBuffer(engine, maxBufferSize) {
        let mm = engine.memoryManager;
        let vbo = mm.createBuffer();
        mm.bindBufferArray(vbo);
        mm.bufferArray(maxBufferSize, "dynamic");
        let totalBytes = 0;
        let index = 0;
        let setAttribute = function (dimension, bytes) {
            mm.setAttribute("float", index++, dimension, false, CriterionRenderBatcher.totalBytesPerVertex, totalBytes);
            totalBytes += bytes;
        };
        setAttribute(3, CriterionRenderBatcher.numberOfVertexBytes);
        setAttribute(2, CriterionRenderBatcher.numberOfTextureCoordinateBytes);
        setAttribute(1, CriterionRenderBatcher.numberOfTextureIdBytes);
        setAttribute(1, CriterionRenderBatcher.numberOfColorIdBytes);
        mm.unbindArray();
        return vbo;
    }
}
