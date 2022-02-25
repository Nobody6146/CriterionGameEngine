let canvas = document.querySelector("canvas");
let gl = canvas.getContext('webgl2');
if(!gl)
    throw new Error("WebGL not supported");

gl.viewport(0, 0, canvas.width, canvas.height);


gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // tell webgl to cull faces
    gl.enable(gl.CULL_FACE);

const vertexData = [
    0, 1, 0,
    1, -1, 0,
    -1, -1, 0,
];


var vertexShaderSource = `#version 300 es
in vec3 position;

out vec3 color;

void main(void)
{
	gl_Position = vec4(position, 1.0);
	color = vec3(1.0, 1.0, 1.0);
}`;
var fragmentShaderSource = `#version 300 es
//precision highp float
precision mediump float;

in vec3 color;

out vec4 outColor;

void main(void)
{
	outColor = vec4(color, 1.0);
    //outColor = vec4(1,1,1,1);
}`;

const errorRE = /ERROR:\s*\d+:(\d+)/gi;
function addLineNumbersWithError(src, log = '') {
    // Note: Error message formats are not defined by any spec so this may or may not work.
    const matches = [...log.matchAll(errorRE)];
    const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
      const lineNo = parseInt(m[1]);
      const next = matches[ndx + 1];
      const end = next ? next.index : log.length;
      const msg = log.substring(m.index, end);
      return [lineNo - 1, msg];
    }));
    return src.split('\n').map((line, lineNo) => {
      const err = lineNoToErrorMap.get(lineNo);
      return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
    }).join('\n');
  }

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

// Check the compile status
var compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
if (!compiled) {
  // Something went wrong during compilation; get the error
  var lastError = gl.getShaderInfoLog(vertexShader);
  console.error(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(vertexShaderSource, lastError)}`);
  gl.deleteShader(vertexShader);
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
if (!compiled) {
  // Something went wrong during compilation; get the error
  lastError = gl.getShaderInfoLog(fragmentShader);
  console.error(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(fragmentShaderSource, lastError)}`);
  gl.deleteShader(vertexShader);
}


const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.bindAttribLocation(program, 1, "position");
gl.linkProgram(program);
gl.useProgram(program);

let vao = gl.createVertexArray();
gl.bindVertexArray(vao);

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(1);
gl.drawArrays(gl.TRIANGLES, 0, 3);
gl.bindVertexArray(null);
gl.deleteVertexArray(vao);
gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.deleteBuffer(buffer);
gl.useProgram(null);

gl.deleteProgram(program);
gl.deleteShader(vertexShader);
gl.deleteShader(fragmentShader);