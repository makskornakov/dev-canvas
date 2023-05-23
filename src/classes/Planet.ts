import { Vector2 } from './Vector';

export class Planet {
  acceleration = new Vector2(0, 0);
  mass = this.radius * 1000;
  color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  constructor(public name: string, public position: Vector2, public radius: number) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    this.drawName(ctx);
  }

  drawName(ctx: CanvasRenderingContext2D) {
    ctx.font = '40px Arial';
    const offsetFromLowerBoundary = 10;

    const text = this.name;
    const measuredText = ctx.measureText(text);

    ctx.fillText(
      text,
      this.position.x - measuredText.width / 2,
      this.position.y +
        this.radius +
        measuredText.actualBoundingBoxAscent +
        offsetFromLowerBoundary,
    );
  }
}
