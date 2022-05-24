class CriterionShaderProgramUtils {
    static createTestShaderProgram(engine) {
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
    static createSolidFillShaderProgram(engine) {
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
        let attributes = new Map();
        attributes.set("position", 0);
        let uniforms = ["viewMatrix", "projectionMatrix", "transformMatrix", "color"];
        return engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
    }
    static createTextureShaderProgram(engine) {
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
        let attributes = new Map();
        attributes.set("position", 0);
        attributes.set("uvCoordinates", 1);
        let uniforms = ["viewMatrix", "projectionMatrix", "transformMatrix", "textureSampler"];
        return engine.memoryManager.createShaderProgram(vertexShaderSource, fragmentShaderSource, attributes, uniforms);
    }
}
;
class CriterionMeshUtils {
    static createSquare3DMesh() {
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
                new Vector2f([0, 1,]),
                new Vector2f([0, 0,]),
                new Vector2f([1, 0,]),
                new Vector2f([1, 1,]),
            ],
            normals: [
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
            ],
        };
    }
    static createSquare2DMesh() {
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
                new Vector2f([0, 1,]),
                new Vector2f([0, 0,]),
                new Vector2f([1, 0,]),
                new Vector2f([1, 1,]),
            ],
            normals: [
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
                new Vector3f([0, 0, 1]),
            ],
        };
    }
    static transformVertices(vertices, transformation) {
        let results = [];
        for (let vertex of vertices) {
            results.push(vertex.transform(transformation));
        }
        return results;
    }
    static transformTextureCoordinates(uvs, start, end) {
        let results = [];
        let frameSize = new Vector2f([end.x - start.x, end.y - start.y]);
        for (let coordinate of uvs) {
            results.push(new Vector2f([start.x + frameSize.x * coordinate.x, start.y + frameSize.y * coordinate.y]));
        }
        return results;
    }
}
class CriterionModelUtils {
    static buildModel(engine, attributes, indices = []) {
        let memoryManager = engine.memoryManager;
        //Create model
        let vao = memoryManager.createArray();
        memoryManager.bindArray(vao);
        for (let i = 0; i < attributes.length; i++) {
            let attribute = attributes[i];
            let vbo = memoryManager.createBuffer();
            memoryManager.bindBufferArray(vbo);
            memoryManager.bufferArray(new Float32Array(attribute.data));
            memoryManager.setAttribute("float", i, attribute.dimension);
        }
        memoryManager.unbindBufferArray();
        memoryManager.unbindArray();
        if (indices?.length > 0) {
            let vbo = memoryManager.createBuffer();
            memoryManager.bindElementsBufferArray(vbo);
            memoryManager.bufferElements(new Uint16Array(indices));
            memoryManager.unbindElementsBufferArray();
            return {
                vao,
                indicesVbo: vbo
            };
        }
        return {
            vao,
            indicesVbo: null
        };
    }
}
class CriterionTextureUtils {
    static async loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = function () {
                resolve(image);
            };
            image.onerror = function () {
                reject("Failed to load texture");
            };
            image.src = url;
        });
    }
    static async loadTexture(engine, url, aliasing) {
        let texture = engine.memoryManager.createTexture();
        engine.memoryManager.bindTexture(texture);
        let image = await CriterionTextureUtils.loadImage(url);
        engine.memoryManager.bufferTexture(0, image.width, image.height, image, aliasing);
        engine.memoryManager.unbindTexture();
        return {
            image,
            texture
        };
    }
}
class FontSheet {
    lineHeight;
    baseline;
    fontSize;
    width;
    height;
    characters;
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
    asciiValue;
    lineOffset;
    lineAdvance;
    width;
    height;
    frameStart;
    frameSize;
    frameEnd;
    constructor(sheetWidth, sheetHeight, asciiValue, x, y, width, height, xoffset, yoffset, lineAdvance) {
        this.asciiValue = asciiValue;
        this.lineOffset = new Vector2f([xoffset, yoffset]);
        this.lineAdvance = lineAdvance;
        this.width = width;
        this.height = height;
        this.frameStart = new Vector2f([x / sheetWidth, y / sheetHeight]);
        this.frameSize = new Vector2f([width / sheetWidth, height / sheetHeight]);
        this.frameEnd = new Vector2f([this.frameStart.x + this.frameSize.x, this.frameStart.y + this.frameSize.y]);
    }
}
class CriterionFontUtils {
    static async loadFont(url) {
        let text = await (await fetch(url)).text();
        let lines = text.split("\n");
        let fontSheet = new FontSheet();
        for (let line of lines) {
            if (line.startsWith("info ")) {
                fontSheet.fontSize = this.#getAttribute("size", line);
            }
            else if (line.startsWith("common ")) {
                fontSheet.width = this.#getAttribute("scaleW", line);
                fontSheet.height = this.#getAttribute("scaleH", line);
                fontSheet.lineHeight = this.#getAttribute("lineHeight", line);
                fontSheet.baseline = this.#getAttribute("base", line);
            }
            else if (line.startsWith("char ")) {
                let character = new FontCharacter(fontSheet.width, fontSheet.height, this.#getAttribute("id", line), this.#getAttribute("x", line), this.#getAttribute("y", line), this.#getAttribute("width", line), this.#getAttribute("height", line), this.#getAttribute("xoffset", line), this.#getAttribute("yoffset", line), this.#getAttribute("xadvance", line));
                fontSheet.characters.set(character.asciiValue, character);
            }
        }
        return fontSheet;
    }
    static #getAttribute(name, line) {
        let regex = new RegExp(`${name}=(\\w+)`);
        return Number.parseInt(line.match(regex)?.[1] ?? "0");
    }
}
