import { makeMonotoneRgb } from '@/tools/makeMonotoneRgb';
import { Body } from './Body';
import { G } from './constants';
import { p5 } from './p5Instance';

export class BodyController {
  planets: Body[] = [];
  sun!: Body;
  readonly destabilize = 0.15;
  features = {
    /** When this is false, only Sun attracts other planets. */
    attractEachOther: true,
  };

  constructor(readonly numPlanets = 4) {
    this.setup();
  }

  setup() {
    this.sun = new Body(50, p5.createVector(0, 0), p5.createVector(0, 0));

    // Initialize the planets
    for (let i = 0; i < this.numPlanets; i++) {
      let mass = p5.random(5, 15);
      let spawnRadius = p5.random(
        this.sun.diameter,
        p5.min(p5.windowWidth / 2, p5.windowHeight / 2),
      );
      let angle = p5.random(0, p5.TWO_PI);
      let planetPos = p5.createVector(spawnRadius * p5.cos(angle), spawnRadius * p5.sin(angle));

      // Find direction of orbit and set velocity
      let planetVel = planetPos.copy();
      if (p5.random(1) < 0.1) planetVel.rotate(-p5.HALF_PI);
      else planetVel.rotate(p5.HALF_PI); // Direction of orbit
      planetVel.normalize();
      planetVel.mult(p5.sqrt((G * this.sun.mass) / spawnRadius)); // Circular orbit velocity
      planetVel.mult(p5.random(1 - this.destabilize, 1 + this.destabilize)); // create elliptical orbit

      this.planets.push(new Body(mass, planetPos, planetVel));
    }
  }

  simulate() {
    for (let i = this.planets.length - 1; i >= 0; i--) {
      this.sun.attract(this.planets[i]);

      if (this.features.attractEachOther) {
        // all other planets attract each other
        for (let j = this.planets.length - 1; j >= 0; j--) {
          if (j === i) continue;
          this.planets[i].attract(this.planets[j]);
        }
      }

      this.planets[i].move();
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = makeMonotoneRgb(180);
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);

    for (let i = this.numPlanets - 1; i >= 0; i--) {
      this.planets[i].show(ctx);
    }
    this.sun.show(ctx);

    ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
  }
}
