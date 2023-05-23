import { Planet } from './Planet';
import { Vector2, Vector2Tools } from './Vector';

export class PlanetController {
  spawnPlanets(amount: number, width: number, height: number): Planet[] {
    const planets: Planet[] = [];

    for (let i = 0; i < amount; i++) {
      const position = new Vector2(Math.random() * width, Math.random() * height);
      const planet = new Planet('planet', position, 50);

      planets.push(planet);
    }

    return planets;
  }
  calculateGravitationalForces(planets: Planet[], gravitationalConstant: number): void {
    const numPlanets = planets.length;

    for (let i = 0; i < numPlanets; i++) {
      const planetA = planets[i];

      for (let j = 0; j < numPlanets; j++) {
        if (i !== j) {
          const planetB = planets[j];

          // const dx = planetB.position.x - planetA.position.x;
          // const dy = planetB.position.y - planetA.position.y;
          const distance = planetB.position.sub(planetA.position);
          const distanceLength = Vector2Tools.length(distance);

          const forceMagnitude =
            (gravitationalConstant * planetA.mass * planetB.mass) /
            (distanceLength * distanceLength);

          const force = distance.div(distanceLength).mul(forceMagnitude);

          // const forceX = forceMagnitude * (distance.x / distanceLength);
          // const forceY = forceMagnitude * (distance.y / distanceLength);

          // Update the acceleration of planetA based on the gravitational force
          // planetA.acceleration.x += forceX / planetA.mass;
          // planetA.acceleration.y += forceY / planetA.mass;

          planetA.acceleration = planetA.acceleration.add(force.div(planetA.mass));
          // handle movement

          planetA.position = planetA.position.add(planetA.acceleration);
        }
      }
    }
  }
}
