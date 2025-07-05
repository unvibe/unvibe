import React from 'react';
import { ShaderCanvas } from '@/lib/ui/canvas/ShaderCanvas';

const fragmentShader = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    // Normalized coordinates (-1 to 1)
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    float t = u_time * 0.7;
    // Polar coordinates
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    // Tunnel waves
    float waves = cos(10.0 * radius - t * 2.0 + cos(angle * 3.0 + t)) * 0.5 + 0.5;
    // Color cycling
    float r = 0.5 + 0.5 * cos(t + angle + waves * 2.0);
    float g = 0.5 + 0.5 * cos(t + angle + 2.0 + waves * 2.5);
    float b = 0.5 + 0.5 * cos(t + angle + 4.0 + waves * 3.0);
    float border = smoothstep(0.7, 0.9, radius);
    vec3 color = mix(vec3(r, g, b), vec3(0.0), border);
    gl_FragColor = vec4(color, 1.0);
}
`;

export default function ShaderArtDemo() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Shader Canvas Demo</h1>
      <p>
        Animated tunnel shader art! Custom effect using polar coordinates and
        color cycling. 🎨
      </p>
      <div style={{ maxWidth: 500 }}>
        <ShaderCanvas
          fragmentShader={fragmentShader}
          width={500}
          height={500}
        />
      </div>
    </main>
  );
}
