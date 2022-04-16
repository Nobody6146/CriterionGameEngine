class RenderableSpriteShader extends CriterionShaderProgram<CriterionRenderBatch> {
    #maxBufferSize:number;
    #vbo:WebGLBuffer;

    constructor(maxBufferSize:number, vbo:WebGLBuffer, shaderResult:CriterionLoadedShaderProgramResult) {
        super(shaderResult.shaderProgram, shaderResult.uniformLocations, shaderResult.attributes);
        this.#maxBufferSize = maxBufferSize;
        this.#vbo = vbo;
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

    prepare(scene:CriterionScene):CriterionRenderBatch[] {
        var renderBatcher = new CriterionRenderBatcher();
        var blueprints = this.#getRenderables(scene);
        for(let blueprint of blueprints) {
            let renderable:CriterionRenderBatchEntity = {
                vertices: blueprint.transformedVertices(),
                textureCoordinates: blueprint.transformedTextureCoordinates(),
                color: blueprint.sprite.color,
                texture: blueprint.sprite.spriteSheet?.texture ?? blueprint.sprite.texture,
                layer: blueprint.transform.position.z,
            }
            renderBatcher.buffer(renderable);
        }
        let camera = this.#getCamera(scene);

        let mm = scene.engine.memoryManager;
        scene.engine.window.enableAlphaBlending(true);
        mm.bindBufferArray(this.#vbo);
        for(let attribute of this.attributes.values())
            mm.enableAttribute(attribute);
        mm.setUniform(this.uniforms.get(RenderableSpriteShader.viewUniform), camera.camera.view);
        mm.setUniform(this.uniforms.get(RenderableSpriteShader.projectionUniform), camera.camera.view);

        return renderBatcher.batch(this.#maxBufferSize, RenderableSpriteShader.maxTextures);
    }

    render(scene:CriterionScene, entity: CriterionRenderBatch) {
        let mm = scene.engine.memoryManager;
        //Load the textures
        for(let i = 0; i < entity.textures.length; i++)
        {
            //Turn textures on in shader
            mm.setUniform(this.uniforms.get(`${RenderableSpriteShader.projectionUniform}[${i}]`), i, "integer");
            //Activates the texture in open fl
            mm.useTexture(CriterionShaderProgram.indexToTextureId(scene.engine, i));
            //Sets the texture
            mm.bindTexture(entity.textures[i]);
        }
        //Load the colors
        for(let i = 0; i < entity.colors.length; i++)
        {
            mm.setUniform(this.uniforms.get(`${RenderableSpriteShader.colorsUniform}[${i}]`), entity.colors[i]);
        }
        //Load the data and draw
        mm.bufferArray(new Float32Array(entity.buffer), "dynamic", 0);
        scene.engine.window.renderTriangles(entity.verticesCount);
    }

    cleanup(scene:CriterionScene): void {
        let mm = scene.engine.memoryManager;
        for(let attribute of this.attributes.values())
            mm.disableAttribute(attribute);
        scene.engine.window.enableAlphaBlending(false);
        mm.unbindBufferArray();
    }

    #getCamera(scene:CriterionScene):CameraBluePrint {
        return CriterionBlueprint.blueprints(scene, CameraBluePrint)[0];
    }

    #getRenderables(scene:CriterionScene):RenderableSpriteBlueprint[] {
        return CriterionBlueprint.blueprints(scene, RenderableSpriteBlueprint);
    }

    static create(engine:CriterionEngine) {
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
        let attributes:Map<string, number> = new Map();
        attributes.set(RenderableSpriteShader.positionAttribute, 0);
        attributes.set(RenderableSpriteShader.textureCoordinatesAttribute, 1);
        attributes.set(RenderableSpriteShader.textureAttribute, 2);
        attributes.set(RenderableSpriteShader.colorAttribute, 3);
        let uniforms = [RenderableSpriteShader.viewUniform, RenderableSpriteShader.projectionUniform];
        for(let i = 0; i < this.maxTextures; i++)
        {
            uniforms.push(`${RenderableSpriteShader.texturesUniform}[${i}]`);
            uniforms.push(`${RenderableSpriteShader.colorsUniform}[${i}]`);
        }
        let shader = engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
        let maxBufferSize = CriterionRenderBatcher.totalBytesPerVertex* 3 * 1000;
        let vbo = this.createBuffer(engine, maxBufferSize);
        return new RenderableSpriteShader(maxBufferSize, vbo, shader);
    }

    static createBuffer(engine:CriterionEngine, maxBufferSize:number):WebGLBuffer {
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
}