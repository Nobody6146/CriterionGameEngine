function GameShaders(engine) {
    this.engine = engine;
}
GameShaders.shaders = {
    MATERIAL_SHADER: "material"
}
GameShaders.prototype.buildMaterialShader = function() {
    const vertexShaderSource = `#version 300 es
    in vec3 position;
    in vec2 uvCoordinates;

    uniform mat4 view;
    uniform mat4 projection;
    uniform mat4 transform;

    out vec2 textureCoordinates;
    //out vec3 color;

    void main(void)
    {
        //gl_Position = vec4( (position - cameraPosition), 1.0);
        //gl_Position = transform * vec4(position, 1.0);

        vec4 worldPosition = transform * vec4(position, 1.0);
        vec4 positionRelativeToCam = view * worldPosition;
        gl_Position = projection * positionRelativeToCam;
        textureCoordinates = uvCoordinates;
        //color = vec3(1.0, 1.0, 1.0);
    }`;
    const fragmentShaderSource = `#version 300 es
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    //precision highp float
    //precision mediump float;

    //in vec3 color;
    in vec2 textureCoordinates;

    uniform sampler2D textureSampler;

    out vec4 outColor;

    void main(void)
    {
        //outColor = vec4(color, 1.0);
        outColor = texture(textureSampler, textureCoordinates);
    }`;
    let shaderAttributes = {position: 0, uvCoordinates: 1};
    let uniformNames = ["view", "projection", "transform", "textureSampler"];
    return TShaderProgram.buildShaderProgram(this.engine, vertexShaderSource, fragmentShaderSource, shaderAttributes, uniformNames);
}