import { EngineWithStats } from '@/classes/engine';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEventListener } from 'usehooks-ts';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function Canvas() {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  // const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  // const [simulationTakesTime, setSimulationTakesTime] = useState<number | null>(null);
  // const simulationTakesTime = useRef<number | null>(null);
  // const [maxSpeed, setMaxSpeed] = useState<number>(0);

  const balls = useRef<Ball[]>([]);
  // const animationFrame = useRef<number>();
  // const calcInterval = useRef<NodeJS.Timer>();
  const simulationInterval = useRef<NodeJS.Timer>();

  const resize = useCallback(() => {
    const mainCanvas = mainCanvasRef.current;
    // const overlayCanvas = overlayCanvasRef.current;

    if (!mainCanvas) return;
    // if (!overlayCanvas) return;
    console.log('resize');
    const { width, height } = mainCanvas.getBoundingClientRect();
    // dpr
    const dpr = window.devicePixelRatio || 1;
    // set canvas size
    setCanvasSize({ width: width * dpr, height: height * dpr });
  }, []);

  // resize
  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // set canvas size
  useEffect(() => {
    if (!canvasSize) return;
    const mainCanvas = mainCanvasRef.current;
    // const overlayCanvas = overlayCanvasRef.current;

    if (!mainCanvas) return;
    // if (!overlayCanvas) return;

    mainCanvas.width = canvasSize.width;
    mainCanvas.height = canvasSize.height;
    // overlayCanvas.width = canvasSize.width;
    // overlayCanvas.height = canvasSize.height;
  }, [canvasSize]);

  useEffect(() => {
    if (!canvasSize) return;
    // set 10 balls with random x, y, vx, vy, radius = 50
    const NBalls = 20;
    const radius = 25;
    const radiusVariation = 0.3;
    const { width, height } = canvasSize;
    // const newBalls = Array.from({ length: NBalls }, () => ({
    //   x: Math.random() * (width - radius * 2) + radius,
    //   y: Math.random() * (height - radius * 2) + radius,
    //   vx: Math.random() * 1 - 1,
    //   vy: Math.random() * 1 - 1,
    //   radius: radius - radius * radiusVariation + Math.random() * radius * radiusVariation,
    //   // random color
    //   color: `red`,
    //   // color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    // }));

    // set balls
    // create array and N times try to add ball
    // if there is a ball that is overlapped with other balls dont add it
    const ballsArray = [] as Ball[];

    // function getRange(min: number, max: number) {
    //   return Math.random() * (max - min) + min;
    // }
    ballsArray.push({
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      radius: 200,
      color: '#fff',
    });

    // const radiusVariation = 0.3;
    for (let i = 0; i < NBalls; i++) {
      const finalRadius =
        radius - radius * radiusVariation + Math.random() * radius * radiusVariation;
      const ball = {
        x: Math.random() * (width - finalRadius * 2) + finalRadius,
        y: Math.random() * (height - finalRadius * 2) + finalRadius,
        vx: 0,
        vy: 0,
        radius: finalRadius,
        color: `red`,
        // color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      };

      // check if ball is overlapped with other balls
      const isOverlapped = ballsArray.some((ballA) => {
        const dx = ball.x - ballA.x;
        const dy = ball.y - ballA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ball.radius + ballA.radius;
      });

      if (!isOverlapped) {
        ballsArray.push(ball);
      }
    }

    balls.current = ballsArray;
    console.log('balls', balls.current);
  }, [canvasSize]);

  function simulation(balls: Ball[], width: number, height: number) {
    balls.forEach((ballA) => {
      ballA.x += ballA.vx;
      ballA.y += ballA.vy;

      if (ballA.x + ballA.radius > width) {
        ballA.x = width - ballA.radius;
        ballA.vx *= -1;
      } else if (ballA.x - ballA.radius < 0) {
        ballA.x = ballA.radius;
        ballA.vx *= -1;
      }

      if (ballA.y + ballA.radius > height) {
        ballA.y = height - ballA.radius;
        ballA.vy *= -1;
      } else if (ballA.y - ballA.radius < 0) {
        ballA.y = ballA.radius;
        ballA.vy *= -1;
      }

      //   // collision detection NO ROTATION
      //   for (let j = 0; j < balls.length; j++) {
      //     const ballB = balls[j];

      //     // Calculate the distance between the centers of the two balls
      //     const dx = ballB.x - ballA.x;
      //     const dy = ballB.y - ballA.y;
      //     const distance = Math.sqrt(dx * dx + dy * dy);

      //     // Check if the distance is less than the sum of the radii
      //     if (distance < ballA.radius + ballB.radius) {
      //       // Calculate the collision angle and speed
      //       const angle = Math.atan2(dy, dx);
      //       const sin = Math.sin(angle);
      //       const cos = Math.cos(angle);

      //       // Rotate the coordinates
      //       const x1 = 0;
      //       const y1 = 0;
      //       const x2 = dx * cos + dy * sin;
      //       const y2 = dy * cos - dx * sin;

      //       // Rotate the velocities
      //       const vx1 = ballA.vx * cos + ballA.vy * sin;
      //       const vy1 = ballA.vy * cos - ballA.vx * sin;
      //       const vx2 = ballB.vx * cos + ballB.vy * sin;
      //       const vy2 = ballB.vy * cos - ballB.vx * sin;

      //       // Calculate the final velocities using one-dimensional collision equations
      //       const finalVx1 =
      //         ((ballA.radius - ballB.radius) * vx1 + 2 * ballB.radius * vx2) /
      //         (ballA.radius + ballB.radius);
      //       const finalVx2 =
      //         ((ballB.radius - ballA.radius) * vx2 + 2 * ballA.radius * vx1) /
      //         (ballA.radius + ballB.radius);
      //       const finalVy1 = vy1;
      //       const finalVy2 = vy2;

      //       // Rotate the velocities back
      //       const finalVx1Rotated = finalVx1 * cos - finalVy1 * sin;
      //       const finalVy1Rotated = finalVy1 * cos + finalVx1 * sin;
      //       const finalVx2Rotated = finalVx2 * cos - finalVy2 * sin;
      //       const finalVy2Rotated = finalVy2 * cos + finalVx2 * sin;

      //       // Update the velocities of the colliding balls
      //       ballA.vx = finalVx1Rotated;
      //       ballA.vy = finalVy1Rotated;
      //       ballB.vx = finalVx2Rotated;
      //       ballB.vy = finalVy2Rotated;
      //     }
      //   }
    });
    updateBalls(balls, 0.02);
    return balls;
  }

  const simulate = useCallback(() => {
    if (!canvasSize) {
      return;
    }
    simulation(balls.current, canvasSize.width, canvasSize.height);
  }, [canvasSize]);

  // async function measureSimulationTime(balls: Ball[], width: number, height: number) {
  //   const start = Date.now();
  //   simulation(balls, width, height);
  //   const end = Date.now();
  //   return end - start;
  // }

  // async callback to measure the time it takes to run the simulation
  // const measureSimulationTime = useCallback(
  //   async (balls: Ball[], width: number, height: number) => {
  //     const start = performance.now();
  //     await setTimeout(() => {}, 2000);
  //     simulation(balls, width, height);
  //     const end = performance.now();
  //     setSimulationTakesTime(end - start);
  //   },
  //   [],
  // );

  // set the time it takes to run the simulation
  // useEffect(() => {
  //   if (!canvasSize) return;
  //   const { width, height } = canvasSize;
  //   const balls2 = balls.current;
  //   if (!balls2) return;
  //   measureSimulationTime(balls2, width, height);
  // }, [canvasSize, measureSimulationTime]);

  // useEffect(() => {
  //   console.log('simulationTakesTime', simulationTakesTime);
  // }, [simulationTakesTime]);

  function drawBalls(balls: Ball[], context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    balls.forEach((ball) => {
      const velocityMagnitude = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      const squeezeFactor = Math.pow(1 / velocityMagnitude, 0.1);
      const rotationAngle = Math.atan2(ball.vx, ball.vy);

      // Apply the squeeze factor to the ball's dimensions
      const squeezedWidth = ball.radius * squeezeFactor;
      const squeezedHeight = ball.radius / squeezeFactor;

      // Draw the squeezed ball
      context.beginPath();
      context.ellipse(
        ball.x,
        ball.y,
        Math.min(squeezedWidth, ball.radius * 2),
        Math.max(squeezedHeight, ball.radius / 2),
        -rotationAngle,
        0,
        2 * Math.PI,
      );
      context.fillStyle = ball.color;
      context.fill();
      context.closePath();
    });
  }

  const render = useCallback(() => {
    const mainCanvas = mainCanvasRef.current;

    if (!mainCanvas) return;

    const context = mainCanvas.getContext('2d');
    if (!context) return;

    drawBalls(balls.current, context);
  }, []);

  // // run the animation frame loop to draw the balls
  // useEffect(() => {
  //   // if (!canvasSize) return;
  //   // const { width, height } = canvasSize;
  //   const mainCanvas = mainCanvasRef.current;

  //   if (!mainCanvas) return;

  //   const context = mainCanvas.getContext('2d');
  //   if (!context) return;

  //   // animation frame loop
  //   //  only draw the balls
  //   const drawTick = () => {
  //     // console.log('drawTick');
  //     // draw the balls
  //     drawBalls(balls.current, context);
  //     // request next frame
  //     animationFrame.current = requestAnimationFrame(drawTick);
  //   };
  //   console.log('start animation frame loop');
  //   // start the animation frame loop
  //   animationFrame.current = requestAnimationFrame(drawTick);

  //   // clean up the animation frame loop
  //   return () => {
  //     console.log('clean up animation frame loop');
  //     cancelAnimationFrame(animationFrame.current as number);
  //   };
  // }, []);

  // const [simulationFrameRate, setSimulationFrameRate] = useState<number>(0);
  const initialSimulationFrameRate = 1000 / 30;
  const [simulationSpeed, setSimulationSpeed] = useState(initialSimulationFrameRate); // iterations per second
  // const [freshSimulationSpeed] = useState(simulationSpeed);
  // run the simulation

  const engine = useMemo(
    () => new EngineWithStats(simulate, render, initialSimulationFrameRate),
    [initialSimulationFrameRate, render, simulate],
  );

  useEffect(() => {
    engine.time_step = simulationSpeed;
  }, [engine, simulationSpeed]);

  useEffect(() => {
    engine.start();

    return () => {
      engine.stop();
    };
  }, [engine]);

  const [stats, setStats] = useState({ ups: 0, fps: 0 });

  useEffect(() => {
    simulationInterval.current = setInterval(() => {
      const newStats = { ups: engine.getUPS(), fps: engine.getFPS() };
      setStats(newStats);
    }, 1000 / 30);

    return () => {
      clearInterval(simulationInterval.current);
    };
  }, [engine]);

  function increaseSimulationSpeed() {
    console.log('increase');
    const controlTimeStepMultiplier = 0.9;

    const new_time_step = engine.time_step * controlTimeStepMultiplier;

    // const engineHasStats = engine instanceof EngineWithStats;

    // if (engineHasStats) {
    const upsOfNewTimeStep = Math.round(1000 / new_time_step);

    const fineTunedMaximumUPSMultiplier = 0.9; // This system cannot perfectly measure how much updates can we do per second (or it can, but it's not very consistent), so I'm lowering that value a bit in order to prevent us from going into lagging.
    const fineTunedMaximumUPS = engine.getRecommendedMaximumUPS() * fineTunedMaximumUPSMultiplier;

    const hasNotReachedMaximumUPS = upsOfNewTimeStep <= fineTunedMaximumUPS;

    if (hasNotReachedMaximumUPS) {
      // engine.time_step = new_time_step;
      setSimulationSpeed(new_time_step);
    } else {
      // TODO show the user that he has reached the maximum recommended UPS.
      const activeCorrectionTimeStep = 1000 / fineTunedMaximumUPS;
      if (activeCorrectionTimeStep < engine.time_step) {
        setSimulationSpeed(activeCorrectionTimeStep);
        // engine.time_step = activeCorrectionTimeStep; // This is kinda "active correction", but it's jumpy, so I don't really like it.
      }
    }
    // } else {
    // engine.time_step = new_time_step;
    // }
  }

  function decreaseSimulationSpeed() {
    console.log('decrease');
    setSimulationSpeed(Math.min(600, engine.time_step * 1.1));
  }

  useEventListener('keydown', (event) => {
    if (event.code === 'KeyJ') {
      decreaseSimulationSpeed();
      return;
    }

    if (event.code === 'KeyL') {
      increaseSimulationSpeed();
      return;
    }

    if (event.code === 'KeyK') {
      // console.log(engine.animation_frame_request);
      engine.isRunning ? engine.stop() : engine.start();
      return;
    }
  });

  // useEffect(() => {
  //   if (!canvasSize) return;
  //   const { width, height } = canvasSize;
  //   if (!balls.current.length) return;

  //   // calculate time that it takes to run the simulation
  //   function calculateTimeToRunSimulation() {
  //     const start = performance.now();
  //     // run 10 simulations
  //     for (let i = 0; i < 10; i++) {
  //       simulation(balls.current, width, height);
  //     }
  //     const end = performance.now();
  //     const timeToRunSimulation = (end - start) / 10;
  //     simulationTakesTime.current = timeToRunSimulation;
  //   }
  //   calculateTimeToRunSimulation();
  //   // every 10 seconds calculate the time it takes to run the simulation
  //   calcInterval.current = setInterval(() => {
  //     calculateTimeToRunSimulation();
  //   }, 10000);

  //   return () => {
  //     clearInterval(calcInterval.current);
  //   };
  // }, [canvasSize]);

  // useEffect(() => {
  //   if (!canvasSize) return;
  //   const { width, height } = canvasSize;
  //   if (!balls.current.length) return;

  //   // calculate time that it takes to run the simulation
  //   // const timeToRunSimulation = measureSimulationTime(() => {
  //   //   simulation(balls.current, width, height);
  //   // });
  //   // setSimulationTakesTime(timeToRunSimulation);
  //   // console.log('timeToRunSimulation', timeToRunSimulation);

  //   // const start = performance.now();
  //   // simulation(balls.current, width, height);
  //   // const end = performance.now();
  //   // setSimulationTakesTime(end - start);
  //   // console.log('timeToRunSimulation', end - start);

  //   const timeOutTime = 1000 / simulationSpeed;

  //   let iterations = 0;
  //   // calculate how many iterations will be run in a second
  //   // const simsPerSec =  1000 / (1000 / simulationSpeed);
  //   let startTimestamp = performance.now();
  //   const simulationTick = () => {
  //     console.log('simulationTick');

  //     simulation(balls.current, width, height);

  //     iterations++;

  //     // if (iterations < simulationSpeed / 2) return;
  //     const timeStamp = performance.now();

  //     if (timeStamp - startTimestamp >= 1000) {
  //       setSimulationFrameRate(iterations);
  //       iterations = 0;
  //       startTimestamp = performance.now();
  //     }
  //   };
  //   console.log('start simulation loop');
  //   // start the simulation loop

  //   simulationInterval.current = setInterval(simulationTick, timeOutTime);
  //   // simulationTick();
  //   // clean up the simulation loop
  //   return () => {
  //     console.log('clean up simulation loop');
  //     clearInterval(simulationInterval.current);
  //   };
  // }, [canvasSize]);

  // useEffect(() => {
  //   const startTimestamp = performance.now();
  //   let iterations = 0;

  //   const measureIterationTime = () => {
  //     iterations++;

  //     if (iterations >= 60) {
  //       const elapsed = performance.now() - startTimestamp;
  //       const iterationTime = elapsed / iterations;

  //       // Calculate the maximum speed based on the iteration time
  //       const newMaxSpeed = Math.floor(1000 / iterationTime);

  //       // Set the new maximum speed
  //       setMaxSpeed(newMaxSpeed);

  //       iterations = 0;
  //     }

  //     // Request the next iteration
  //     setTimeout(measureIterationTime);
  //   };

  //   // Start measuring the iteration time
  //   setTimeout(measureIterationTime);

  //   // Clean up the measurement on component unmount
  //   return () => {
  //     // iterations = 0;
  //   };
  // }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <span>
        {stats.ups} ups, {stats.fps} fps
      </span>
      <br />
      <span>balls total: {balls.current.length}</span>
      <br />
      <span
        style={{
          display: 'grid',

          placeItems: 'center left',
        }}
      >
        <button
          style={{
            fontSize: '2rem',
            background: engine.isRunning ? 'red' : 'green',
          }}
          onClick={
            engine.isRunning
              ? () => {
                  engine.stop();
                }
              : () => {
                  engine.start();
                }
          }
          title="Press [K]"
        >
          {engine.isRunning ? '⏸️' : '▶️'}
        </button>

        <button onClick={increaseSimulationSpeed}>
          [<kbd>L</kbd>] speed +
        </button>
        <button onClick={decreaseSimulationSpeed}>
          [<kbd>J</kbd>] speed -
        </button>
      </span>
      <canvas
        ref={mainCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: 'rgb(255,255,0)',
        }}
      />
      {/* <canvas
        ref={overlayCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
        }}
      /> */}
    </div>
  );
}
//? =========================================
function updateBalls(balls: Ball[], gravityForce: number): void {
  const numBalls = balls.length;

  for (let i = 0; i < numBalls; i++) {
    const ballA = balls[i];

    // Apply gravity to each ball based on its size
    const gravity = gravityForce * ballA.radius;

    // Update ball velocity with gravity
    ballA.vy += gravity;

    for (let j = i + 1; j < numBalls; j++) {
      const ballB = balls[j];

      // Calculate the distance between the centers of the two balls
      const dx = ballB.x - ballA.x;
      const dy = ballB.y - ballA.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if the distance is less than the sum of the radii
      if (distance < ballA.radius + ballB.radius) {
        // Calculate the collision angle and speed (same as before)
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // Rotate the coordinates (same as before)
        // const x1 = 0;
        // const y1 = 0;
        // const x2 = dx * cos + dy * sin;
        // const y2 = dy * cos - dx * sin;

        // Rotate the velocities (same as before)
        const vx1 = ballA.vx * cos + ballA.vy * sin;
        const vy1 = ballA.vy * cos - ballA.vx * sin;
        const vx2 = ballB.vx * cos + ballB.vy * sin;
        const vy2 = ballB.vy * cos - ballB.vx * sin;

        // Calculate the final velocities using one-dimensional collision equations (same as before)
        const finalVx1 =
          ((ballA.radius - ballB.radius) * vx1 + 2 * ballB.radius * vx2) /
          (ballA.radius + ballB.radius);
        const finalVx2 =
          ((ballB.radius - ballA.radius) * vx2 + 2 * ballA.radius * vx1) /
          (ballA.radius + ballB.radius);
        const finalVy1 = vy1;
        const finalVy2 = vy2;

        // Rotate the velocities back (same as before)
        const finalVx1Rotated = finalVx1 * cos - finalVy1 * sin;
        const finalVy1Rotated = finalVy1 * cos + finalVx1 * sin;
        const finalVx2Rotated = finalVx2 * cos - finalVy2 * sin;
        const finalVy2Rotated = finalVy2 * cos + finalVx2 * sin;

        // Update the velocities of the colliding balls (same as before)
        ballA.vx = finalVx1Rotated;
        ballA.vy = finalVy1Rotated;
        ballB.vx = finalVx2Rotated;
        ballB.vy = finalVy2Rotated;
      }
    }

    // Update ball position based on velocity
    ballA.x += ballA.vx;
    ballA.y += ballA.vy;
  }
}
