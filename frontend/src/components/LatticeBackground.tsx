import React, { useEffect, useRef, useState } from 'react';
import * as twgl from 'twgl.js';

// --- 1. Math & Vector Utilities ---

const approxEquals = (a: number, b: number) => Math.abs(a - b) < 0.0001;
const ceilMultiple = (val: number, step: number) => Math.ceil(val / step) * step;

class Vector2 {
  constructor(public x: number, public y: number) {}
  add(v: Vector2) { return new Vector2(this.x + v.x, this.y + v.y); }
  sub(v: Vector2) { return new Vector2(this.x - v.x, this.y - v.y); }
  mult(s: number) { return new Vector2(this.x * s, this.y * s); }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
  mod(v: Vector2) { return new Vector2(((this.x % v.x) + v.x) % v.x, ((this.y % v.y) + v.y) % v.y); }
  to3(z = 0) { return new Vector3(this.x, this.y, z); }
}

class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}
  add(v: Vector3) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v: Vector3) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
  mult(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
  mult3(v: Vector3) { return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z); }
  add2(v: Vector2) { return new Vector3(this.x + v.x, this.y + v.y, this.z); }
  sub2(v: Vector2) { return new Vector3(this.x - v.x, this.y - v.y, this.z); }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  normalize() { const l = this.length(); return l === 0 ? new Vector3(0, 0, 0) : this.mult(1 / l); }
  xy() { return new Vector2(this.x, this.y); }
  abs() { return new Vector3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }
}

// --- 2. Configuration Options ---

const options = {
  mouseGradient: 'outward' as const, 
  spacing: 50,             
  mouseRepel: true,        
  mouseDistance: 350,      
  mouseStrength: 2,        
  mouseZ: 80,              
  moveStrength: 3,         
  accStrength: 0.1,
  xSpeed: 10,              
  ySpeed: 5,               
  drawColored: false,      
};

// --- 3. Lattice Physics Engine ---

class Lattice {
  public ogPoints: Array<Vector2>;
  public points: Array<Vector3>;
  public prevPoints: Array<Vector3>;
  public offset: Vector2 = new Vector2(0, 0);

  constructor(
    public origin: Vector2,
    public width: number,
    public height: number,
    public spacing: number,
  ) {
    this.points = [];
    this.ogPoints = [];
    this.prevPoints = [];
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        this.ogPoints.push(origin.add(new Vector2(x, y)));
        this.points.push(new Vector3(x, y, 0).add2(origin));
        this.prevPoints.push(new Vector3(x, y, 0).add2(origin));
      }
    }
  }

  getDrawPoints(canvasWidth: number, canvasHeight: number) {
    const result = [];
    const [maxDist, maxDistZ] = this.findMaxDistFromOg();

    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      if (p.x < -100 || p.x > canvasWidth + 100 || p.y < -100 || p.y > canvasHeight + 100) continue;
      
      const ogP = this.ogPoints[i];
      const dist = p.sub2(ogP).length();
      let alpha = 1;
      const min = 0.2;
      const imin = 1 - min;

      if (options.mouseGradient === 'outward') {
         alpha = min + imin * (dist / maxDist);
      }

      const r = 0.7; 
      const g = 0.8; 
      const b = 1.0; 

      let z = maxDistZ > 0 ? Math.abs(p.z) / maxDistZ : 0;
      
      result.push({ x: p.x, y: p.y, z, alpha, r, g, b });
    }
    return result;
  }

  findMaxDistFromOg(): [number, number] {
    let maxDist = 0;
    let maxDistZ = 0;
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const ogP = this.ogPoints[i];
      const dist = p.sub2(ogP).length();
      if (dist > maxDist) maxDist = dist;
      if (Math.abs(p.z) > maxDistZ) maxDistZ = Math.abs(p.z);
    }
    return [maxDist || 1, maxDistZ || 1];
  }

  physics(dt: number, mousePos: Vector2) {
    this.moveOffset(dt);
    this.movePointsToOg(dt);
    this.moveFromMouse(dt, mousePos);
    this.accelerate(dt);
  }

  moveOffset(dt: number) {
    const diff = new Vector2(options.xSpeed, options.ySpeed).mult(dt);
    this.offset = this.offset.add(diff);

    for(let i=0; i<this.points.length; i++) {
        this.points[i] = this.points[i].add2(diff);
        this.ogPoints[i] = this.ogPoints[i].add(diff);
        this.prevPoints[i] = this.prevPoints[i].add2(diff);
    }

    const checkWrap = (val: number, limit: number, direction: 1|-1) => {
        if ((direction === 1 && val > limit) || (direction === -1 && val < limit)) {
            return true;
        }
        return false;
    };

    const wrap = (axis: 'x'|'y', direction: 1|-1) => {
       const size = axis === 'x' ? this.width : this.height;
       const limit = direction === 1 
         ? size + this.spacing + (axis === 'x' ? this.origin.x : this.origin.y)
         : (axis === 'x' ? this.origin.x : this.origin.y) - this.spacing;
       
       const vec = new Vector2(
         axis === 'x' ? size * direction * -1 : 0,
         axis === 'y' ? size * direction * -1 : 0
       );

       for(let i=0; i<this.ogPoints.length; i++) {
           if (checkWrap(this.ogPoints[i][axis], limit, direction)) {
               this.ogPoints[i] = this.ogPoints[i].add(vec);
               this.points[i] = this.ogPoints[i].to3();
               this.prevPoints[i] = this.points[i];
           }
       }
    };

    if (this.offset.x > this.spacing) wrap('x', 1);
    else if (this.offset.x < 0) wrap('x', -1);

    if (this.offset.y > this.spacing) wrap('y', 1);
    else if (this.offset.y < 0) wrap('y', -1);

    this.offset = this.offset.mod(new Vector2(this.spacing, this.spacing));
  }

  movePointsToOg(dt: number) {
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const ogP = this.ogPoints[i];
      const diff = ogP.to3().sub(p);
      this.points[i] = p.add(diff.mult(dt * options.moveStrength));
    }
  }

  moveFromMouse(dt: number, mousePos: Vector2) {
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const diff2 = mousePos.sub(p.xy());
      const dist2 = diff2.length();
      const diff3 = mousePos.to3(dist2 + options.mouseZ).sub(p);
      const norm = diff3.normalize();
      const influence = options.mouseStrength * Math.max(0, 1 - diff3.length() / options.mouseDistance);
      
      if (options.mouseRepel) {
        this.points[i] = p.sub(norm.mult(dt * influence * 1000));
      } else {
        this.points[i] = p.add(norm.mult(dt * influence * 500).mult3(new Vector3(1, 1, -1)));
      }
    }
  }

  accelerate(_dt: number) {
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      const prevP = this.prevPoints[i];
      const diff = p.sub(prevP);
      this.points[i] = p.add(diff.mult(Math.pow(options.accStrength, 0.05)));
      this.prevPoints[i] = p;
    }
  }
}

// --- 4. WebGL Shaders ---

const vs = `
  attribute vec3 pos;
  attribute vec4 color;
  attribute vec4 position;
  attribute vec2 texcoord;

  varying vec2 v_texcoord;
  varying vec4 v_color;
  varying float v_scale;
  
  void main() {
    gl_Position = position + vec4(pos.x - 0.5, 0.5 - pos.y, 0, 0) * 2.;
    v_texcoord = texcoord;
    v_color = color;
    v_scale = pos.z * 1.5 + 0.5; 
  }`;

const fs = `
  precision mediump float;
  varying vec2 v_texcoord;
  varying vec4 v_color;
  varying float v_scale;
  
  float circle(in vec2 st, in float radius) {
    vec2 dist = st - vec2(0.5);
    float distSquared = dot(dist, dist) * 4.0;
    return 1.0 - smoothstep(radius - 0.1, radius + 0.1, distSquared);
  }
  
  void main() {
    float c = circle(v_texcoord, v_scale * 0.4); 
    if (c < 0.01) discard;
    gl_FragColor = v_color * c;
  }
`;

function newLattice(width: number, height: number) {
  const offset = ceilMultiple(100, options.spacing);
  return new Lattice(
    new Vector2(-offset, -offset),
    ceilMultiple(width, options.spacing) + offset * 2,
    ceilMultiple(height, options.spacing) + offset * 2,
    options.spacing,
  );
}

// --- 5. React Component (Fixed Types) ---

export default function LatticeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Changed type to WebGL2RenderingContext to support drawArraysInstanced
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);
  const [lattice, setLattice] = useState<Lattice | null>(null);
  const [programInfo, setProgramInfo] = useState<twgl.ProgramInfo | null>(null);
  const mousePosRef = useRef(new Vector2(-9999, -9999));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // FIX: Request 'webgl2' context explicitly
    const context = canvas.getContext('webgl2', { alpha: true });
    
    if (!context) {
      console.error("WebGL2 is not supported by your browser.");
      return;
    }

    context.enable(context.BLEND);
    context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
    
    setGl(context);
    setProgramInfo(twgl.createProgramInfo(context, [vs, fs]));

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.viewport(0, 0, canvas.width, canvas.height);
      setLattice(newLattice(canvas.width, canvas.height));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = new Vector2(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(1 / 30, (time - lastTime) / 1000);
      lastTime = time;

      if (gl && programInfo && lattice && canvasRef.current) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        lattice.physics(dt, mousePosRef.current);
        const points = lattice.getDrawPoints(canvasRef.current.width, canvasRef.current.height);

        const quadSize = 3; 
        const px = (quadSize / canvasRef.current.width) * 2;
        const py = (quadSize / canvasRef.current.height) * 2;

        const arrays = {
          position: { numComponents: 2, data: [-px, -py, px, -py, -px, py, -px, py, px, -py, px, py] },
          texcoord: { numComponents: 2, data: [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0] },
          pos: {
            numComponents: 3,
            data: points.map(p => [p.x / canvasRef.current!.width, p.y / canvasRef.current!.height, p.z]).flat(),
            divisor: 1,
          },
          color: {
            numComponents: 4,
            data: points.map(p => [p.r, p.g, p.b, p.alpha]).flat(),
            divisor: 1,
          },
        };

        const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
        twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
        gl.useProgram(programInfo.program);
        
        // This line should now work without TS errors
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, points.length);
      }
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gl, programInfo, lattice]);

  return (
    <div className="fixed inset-0 -z-10 bg-black pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}