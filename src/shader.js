const canvas = document.getElementById("shaderCanvas");
const gl = canvas.getContext("webgl");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#ifdef GL_ES
precision mediump float;
#endif

uniform float iTime;
uniform vec2 iResolution;

#define COLOR3 vec3(1.00, 0.98, 0.67)
#define COLOR2 vec3(0.361, 0.812, 0.565)
#define COLOR4 vec3(0.514, 0.933, 0.757)

float rand(vec2 p) {
    return fract(sin(dot(p, vec2(12.99, 78.233))) * 43758.545);
}

float noise(vec2 p) {
    vec2 f = fract(p);
    f = f * f * (3. - 2. * f);
    vec2 i = floor(p);
    return mix(mix(rand(i + vec2(0, 0)), 
                   rand(i + vec2(1, 0)), f.x),
               mix(rand(i + vec2(0, 1)), 
                   rand(i + vec2(1, 1)), f.x), f.y);
}

float fbm_streaks(vec2 p) {
    float v = 0.;
    float a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 7; ++i) {
        v += a * noise(p);
        p = rot * p * vec2(1.5, 0.7);
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
    
    float time = iTime * 0.1;
    
    float f = fbm_streaks(p * 1.0 + time);
    float f2 = fbm_streaks(p * 0.2 - time * 1.5 + f);
    
    vec2 q = vec2(f, f2);
    
    float final = fbm_streaks(p * 1.0 + q * 2.0);
    
    vec3 col = mix(COLOR2, COLOR3, smoothstep(0.2, 0.9, final));
    col = mix(col, COLOR4, smoothstep(0.6, 1.0, final));
    
    col = pow(col, vec3(1.5));
    col = mix(col, col * col * (3.0 - 2.0 * col), 0.15);
    
    gl_FragColor = vec4(col, 1.0);
}
`;

// Compile shader function
function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Create and link WebGL program
const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(
  gl,
  fragmentShaderSource,
  gl.FRAGMENT_SHADER
);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Program link error:", gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Set up geometry (a full-screen quad)
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  gl.STATIC_DRAW
);

const positionLocation = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Uniform locations
const iTimeLocation = gl.getUniformLocation(program, "iTime");
const iResolutionLocation = gl.getUniformLocation(program, "iResolution");

// Render loop
function render(time) {
  gl.uniform1f(iTimeLocation, time * 0.001);
  gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

const resizeHandler = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
};

// Resize canvas on window resize
window.addEventListener("resize", resizeHandler);
resizeHandler();
