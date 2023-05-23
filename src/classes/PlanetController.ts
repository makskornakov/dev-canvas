import { randomFromArray } from '@/tools/randomFromArray';
import { Planet } from './Planet';
import { Vector2, Vector2Tools } from './Vector';

const possiblePlanetNames = ['Pipus', 'UrAnus', 'Mars', 'Venus', 'Earth', 'Moon', 'Sun'];
const gravitationalConstant = 9.8;

export class PlanetController {
  planets: Planet[];
  constructor(amount: number, public width: number, public height: number) {
    this.planets = this.spawnPlanets(amount, width, height);
  }

  simulate() {
    this.calculateGravitationalForces(this.planets, gravitationalConstant);
  }
  render(ctx: CanvasRenderingContext2D) {
    this.planets.forEach((planet) => {
      planet.draw(ctx);
    });
  }

  spawnPlanets(amount: number, width: number, height: number): Planet[] {
    const planets: Planet[] = [];

    for (let i = 0; i < amount; i++) {
      const currentBallRadius = 50;
      // TODO? don't spawn outside the screen
      const position = new Vector2(Math.random() * width, Math.random() * height);
      const planet = new Planet(randomFromArray(possiblePlanetNames), position, currentBallRadius);

      planets.push(planet);
    }

    return planets;
  }

  calculateGravitationalForces(planets: Planet[], gravitationalConstant: number): void {
    const numPlanets = planets.length;

    for (let i = 0; i < numPlanets; i++) {
      const planetA = planets[i];
      this.keepOutOfScreenBoundaries(planetA);

      for (let j = 0; j < numPlanets; j++) {
        if (i === j) continue;
        const planetB = planets[j];

        // const dx = planetB.position.x - planetA.position.x;
        // const dy = planetB.position.y - planetA.position.y;
        const distance = planetB.position.sub(planetA.position);
        const distanceLength = Vector2Tools.length(distance);

        const forceMagnitude =
          (gravitationalConstant * planetA.mass * planetB.mass) / (distanceLength * distanceLength);

        const force = distance.div(distanceLength).mul(forceMagnitude);

        // const forceX = forceMagnitude * (distance.x / distanceLength);
        // const forceY = forceMagnitude * (distance.y / distanceLength);

        // Update the acceleration of planetA based on the gravitational force
        // planetA.acceleration.x += forceX / planetA.mass;
        // planetA.acceleration.y += forceY / planetA.mass;

        planetA.acceleration = planetA.acceleration.add(force.div(planetA.mass));
        // handle movement
      }

      planetA.position = planetA.position.add(planetA.acceleration);
      planetA.acceleration = new Vector2(0, 0);
    }
  }

  keepOutOfScreenBoundaries(planet: Planet) {
    const speedLoss = 0.1;
    const bounceOffMultiplier = 1 - speedLoss;
    // consider 0,0 is left top corner
    // bounce off with 10% speed loss
    if (planet.position.x < 0) {
      planet.position = new Vector2(0, planet.position.y);
      planet.acceleration = new Vector2(
        planet.acceleration.x * -bounceOffMultiplier,
        planet.acceleration.y,
      );
    }
    if (planet.position.x > this.width) {
      planet.position = new Vector2(this.width, planet.position.y);
      planet.acceleration = new Vector2(
        planet.acceleration.x * -bounceOffMultiplier,
        planet.acceleration.y,
      );
    }
    if (planet.position.y < 0) {
      planet.position = new Vector2(planet.position.x, 0);
      planet.acceleration = new Vector2(
        planet.acceleration.x,
        planet.acceleration.y * -bounceOffMultiplier,
      );
    }
    if (planet.position.y > this.height) {
      planet.position = new Vector2(planet.position.x, this.height);
      planet.acceleration = new Vector2(
        planet.acceleration.x,
        planet.acceleration.y * -bounceOffMultiplier,
      );
    }
  }
}
