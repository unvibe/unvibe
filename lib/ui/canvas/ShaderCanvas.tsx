import React, { useRef, useEffect } from 'react';

export interface ShaderCanvasProps {
  fragmentShader: string;
  vertexShader?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Default vertex shader
const DEFAULT_VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export const ShaderCanvas: React.FC<ShaderCanvasProps> = ({
  fragmentShader,
  vertexShader = DEFAULT_VERTEX_SHADER,
  width = 500,
  height = 500,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const refCanvas = canvasRef.current;
    if (!refCanvas) return;
    // Now canvasEl is guaranteed non-null
    const canvasEl: HTMLCanvasElement = refCanvas;
    const gl = canvasEl.getContext('webgl') as WebGLRenderingContext;
    if (!gl) return;

    function compileShader(
      glCtx: WebGLRenderingContext,
      type: number,
      source: string
    ) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    function createProgram(
      glCtx: WebGLRenderingContext,
      vShader: WebGLShader,
      fShader: WebGLShader
    ) {
      const program = glCtx.createProgram();
      if (!program) return null;
      glCtx.attachShader(program, vShader);
      glCtx.attachShader(program, fShader);
      glCtx.linkProgram(program);
      if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
        console.error('Program link error:', glCtx.getProgramInfoLog(program));
        glCtx.deleteProgram(program);
        return null;
      }
      return program;
    }

    const vShader = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
    const fShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vShader || !fShader) return;
    const program = createProgram(gl, vShader, fShader);
    if (!program) return;

    const posLoc = gl.getAttribLocation(program, 'a_position');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResLoc = gl.getUniformLocation(program, 'u_resolution');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);
    gl.enableVertexAttribArray(posLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    function render() {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (uTimeLoc) gl.uniform1f(uTimeLoc, performance.now() / 1000);
      if (uResLoc) gl.uniform2f(uResLoc, canvasEl.width, canvasEl.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteShader(vShader);
      gl.deleteShader(fShader);
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, [fragmentShader, vertexShader, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block', maxWidth: '100%', ...style }}
    />
  );
};

export default ShaderCanvas;
