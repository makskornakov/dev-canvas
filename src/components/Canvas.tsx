import { useCallback, useEffect, useRef, useState } from 'react';

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
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  // const [simulationTakesTime, setSimulationTakesTime] = useState<number | null>(null);
  const simulationTakesTime = useRef<number | null>(null);
  // const [maxSpeed, setMaxSpeed] = useState<number>(0);

  const balls = useRef<Ball[]>([]);
  const animationFrame = useRef<number>();
  const calcInterval = useRef<NodeJS.Timer>();
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
    const { width, height } = canvasSize;
    const size = 20;
    const newBalls = Array.from({ length: 1000 }, () => ({
      x: Math.random() * (width - size * 2) + size,
      y: Math.random() * (height - size * 2) + size,
      vx: Math.random() * 10 - 1,
      vy: Math.random() * 10 - 1,
      radius: size,
      // random color
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    }));
    balls.current = newBalls;
    console.log('balls', balls.current);
  }, [canvasSize]);

  function simulation(balls: Ball[], width: number, height: number) {
    balls.forEach((ball) => {
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x + ball.radius > width) {
        ball.x = width - ball.radius;
        ball.vx *= -1;
      } else if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -1;
      }

      if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;
        ball.vy *= -1;
      } else if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
      }

      // collision detection
      // balls.forEach((otherBall) => {
      //   if (ball === otherBall) return;
      //   const dx = ball.x - otherBall.x;
      //   const dy = ball.y - otherBall.y;
      //   const distance = Math.sqrt(dx * dx + dy * dy);
      //   const minDistance = ball.radius + otherBall.radius;
      //   if (distance < minDistance) {
      //     const angle = Math.atan2(dy, dx);
      //     const targetX = ball.x + Math.cos(angle) * minDistance;
      //     const targetY = ball.y + Math.sin(angle) * minDistance;
      //     const ax = (targetX - otherBall.x) * 0.1;
      //     const ay = (targetY - otherBall.y) * 0.1;
      //     ball.vx -= ax;
      //     ball.vy -= ay;
      //     otherBall.vx += ax;
      //     otherBall.vy += ay;
      //   }
      // });
    });

    return balls;
  }

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
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
      context.fillStyle = ball.color;
      context.fill();
    });
  }

  // run the animation frame loop to draw the balls
  useEffect(() => {
    // if (!canvasSize) return;
    // const { width, height } = canvasSize;
    const mainCanvas = mainCanvasRef.current;

    if (!mainCanvas) return;

    const context = mainCanvas.getContext('2d');
    if (!context) return;

    // animation frame loop
    //  only draw the balls
    const drawTick = () => {
      // console.log('drawTick');
      // draw the balls
      drawBalls(balls.current, context);
      // request next frame
      animationFrame.current = requestAnimationFrame(drawTick);
    };
    console.log('start animation frame loop');
    // start the animation frame loop
    animationFrame.current = requestAnimationFrame(drawTick);

    // clean up the animation frame loop
    return () => {
      console.log('clean up animation frame loop');
      cancelAnimationFrame(animationFrame.current as number);
    };
  }, []);

  const [simulationFrameRate, setSimulationFrameRate] = useState<number>(0);
  const simulationSpeed = 50; // iterations per second
  // run the simulation

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

  useEffect(() => {
    if (!canvasSize) return;
    const { width, height } = canvasSize;
    if (!balls.current.length) return;

    // calculate time that it takes to run the simulation
    // const timeToRunSimulation = measureSimulationTime(() => {
    //   simulation(balls.current, width, height);
    // });
    // setSimulationTakesTime(timeToRunSimulation);
    // console.log('timeToRunSimulation', timeToRunSimulation);

    // const start = performance.now();
    // simulation(balls.current, width, height);
    // const end = performance.now();
    // setSimulationTakesTime(end - start);
    // console.log('timeToRunSimulation', end - start);

    const timeOutTime = 1000 / simulationSpeed;

    let iterations = 0;
    // calculate how many iterations will be run in a second
    // const simsPerSec =  1000 / (1000 / simulationSpeed);
    let startTimestamp = performance.now();
    const simulationTick = () => {
      console.log('simulationTick');

      simulation(balls.current, width, height);

      iterations++;

      // if (iterations < simulationSpeed / 2) return;
      const timeStamp = performance.now();

      if (timeStamp - startTimestamp >= 1000) {
        setSimulationFrameRate(iterations);
        iterations = 0;
        startTimestamp = performance.now();
      }
    };
    console.log('start simulation loop');
    // start the simulation loop

    simulationInterval.current = setInterval(simulationTick, timeOutTime);
    // simulationTick();
    // clean up the simulation loop
    return () => {
      console.log('clean up simulation loop');
      clearInterval(simulationInterval.current);
    };
  }, [canvasSize]);

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
      <span>{simulationFrameRate} fps</span>
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
