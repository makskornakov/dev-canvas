import type P5 from 'p5';

import { p5 } from './p5Instance';
import { G } from './constants';
import { makeMonotoneRgb } from '@/tools/makeMonotoneRgb';

function noStroke(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
}

export class Body {
  d = this.mass * 2;
  thetaInit = 0;
  path: P5.Vector[] = [];
  /** Was 200 in the original */
  pathLen = 500;
  constructor(public mass: number, public pos: P5.Vector, public vel: P5.Vector) {}

  // show() {
  //   this.p5.stroke(0, 50);
  //   for (let i = 0; i < this.path.length - 2; i++) {
  //     this.p5.line(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y);
  //   }
  //   this.p5.fill(255);
  //   this.p5.noStroke();
  //   this.p5.ellipse(this.pos.x, this.pos.y, this.d, this.d);
  // }
  show(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    // ctx.lineWidth = 1; // Default is 1 already

    this.showTrace(ctx);

    ctx.fillStyle = makeMonotoneRgb(255);
    noStroke(ctx);
    ctx.beginPath();
    ctx.ellipse(this.pos.x, this.pos.y, this.d / 2, this.d / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  protected showTrace(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.path.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(this.path[i].x, this.path[i].y);
      ctx.lineTo(this.path[i + 1].x, this.path[i + 1].y);
      ctx.stroke();
    }
  }

  move() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.saveToTrail();
  }

  protected saveToTrail() {
    this.path.push(p5.createVector(this.pos.x, this.pos.y));
    if (this.path.length > this.pathLen) this.path.splice(0, 1);
  }

  applyForce(f: P5.Vector) {
    this.vel.x += f.x / this.mass;
    this.vel.y += f.y / this.mass;
  }

  attract(child: this) {
    const r = p5.dist(this.pos.x, this.pos.y, child.pos.x, child.pos.y);
    const f = this.pos.copy().sub(child.pos);
    f.setMag((G * this.mass * child.mass) / (r * r));
    child.applyForce(f);
  }
}
