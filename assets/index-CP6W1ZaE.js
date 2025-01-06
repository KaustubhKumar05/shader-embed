(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const t of o)if(t.type==="childList")for(const f of t.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&i(f)}).observe(document,{childList:!0,subtree:!0});function s(o){const t={};return o.integrity&&(t.integrity=o.integrity),o.referrerPolicy&&(t.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?t.credentials="include":o.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function i(o){if(o.ep)return;o.ep=!0;const t=s(o);fetch(o.href,t)}})();const n=document.getElementById("shaderCanvas"),e=n.getContext("webgl");n.width=window.innerWidth;n.height=window.innerHeight;const h=`
attribute vec2 aPosition;
void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`,p=`#ifdef GL_ES
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
`;function d(r,c,s){const i=r.createShader(s);return r.shaderSource(i,c),r.compileShader(i),r.getShaderParameter(i,r.COMPILE_STATUS)?i:(console.error("Shader compilation error:",r.getShaderInfoLog(i)),r.deleteShader(i),null)}const v=d(e,h,e.VERTEX_SHADER),g=d(e,p,e.FRAGMENT_SHADER),a=e.createProgram();e.attachShader(a,v);e.attachShader(a,g);e.linkProgram(a);e.getProgramParameter(a,e.LINK_STATUS)||console.error("Program link error:",e.getProgramInfoLog(a));e.useProgram(a);const S=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,S);e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);const l=e.getAttribLocation(a,"aPosition");e.enableVertexAttribArray(l);e.vertexAttribPointer(l,2,e.FLOAT,!1,0,0);const L=e.getUniformLocation(a,"iTime"),R=e.getUniformLocation(a,"iResolution");function m(r){e.uniform1f(L,r*.001),e.uniform2f(R,n.width,n.height),e.drawArrays(e.TRIANGLES,0,6),requestAnimationFrame(m)}requestAnimationFrame(m);const u=()=>{n.width=window.innerWidth,n.height=window.innerHeight,e.viewport(0,0,n.width,n.height)};window.addEventListener("resize",u);u();
