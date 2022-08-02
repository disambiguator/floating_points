 #ifdef GL_ES
    precision highp float;
    #endif

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
    uniform float posScale;
    uniform float time;
    uniform float striations;
    uniform float height;
    float noise(vec2 pos, float scaling) {
        return snoise3(vec3(pos/posScale, 1.)) * scaling;
    }
    varying vec3 color;

    void main() {
        vec3 p = position;
        float scaling = height * (length(p.xy))/100.;
        p.z = noise(p.xy, scaling);
        // color = vec3(p.z/scaling);
        float l = mod(length(p.xy),striations) * 10./striations;
        if(l > 10.*2./3.) {
          color = vec3(103.,119.,68.);
        } else if (l > 10./3.) {
          color = vec3(188.,189.,139.);
        } else {
          color = vec3(138.,97.,63.);
        }
        color /= 255.;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
    }
