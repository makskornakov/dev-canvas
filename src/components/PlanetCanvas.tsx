import { PlanetController } from '@/classes/PlanetController';
import { EngineWithStats } from '@/classes/engine';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEffectOnce, useEventListener } from 'usehooks-ts';

export default function PlanetCanvas() {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainContext = useRef<CanvasRenderingContext2D | null>(null);

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const resize = useCallback(() => {
    const mainCanvas = mainContext.current?.canvas;
    if (!mainCanvas) return;

    console.info('resize');
    const { width, height } = mainCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    setCanvasSize({ width: width * dpr, height: height * dpr });
  }, []);
  useEffect(() => {
    if (!mainCanvasRef.current) return;
    mainContext.current = mainCanvasRef.current.getContext('2d');
  }, [mainCanvasRef]);
  useEffectOnce(resize);
  useEventListener('resize', resize);
  // set canvas size
  useEffect(() => {
    if (!canvasSize) return;
    const mainCanvas = mainContext.current?.canvas;
    // const overlayCanvas = overlayCanvasRef.current;

    if (!mainCanvas) return;
    // if (!overlayCanvas) return;

    mainCanvas.width = canvasSize.width;
    mainCanvas.height = canvasSize.height;
    // overlayCanvas.width = canvasSize.width;
    // overlayCanvas.height = canvasSize.height;
  }, [canvasSize]);

  const planetController = useMemo(
    () => new PlanetController(5, canvasSize?.width ?? 0, canvasSize?.height ?? 0),
    [canvasSize?.height, canvasSize?.width],
  );

  const render = useCallback(() => {
    const context = mainContext.current;
    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    planetController.render(context);
  }, [planetController]);
  const simulate = useCallback(() => {
    planetController.simulate();
  }, [planetController]);

  /** seconds per iteration */
  const initialSimulationFrameRate = 1000 / 30;
  const [simulationSpeed, setSimulationSpeed] = useState(initialSimulationFrameRate);
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
  const statsInterval = useRef<NodeJS.Timer>();
  useEffect(() => {
    statsInterval.current = setInterval(() => {
      const newStats = { ups: engine.getUPS(), fps: engine.getFPS() };
      setStats(newStats);
    }, 1000 / 30);

    return () => {
      clearInterval(statsInterval.current);
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
      engine.isRunning ? engine.stop() : engine.start();
      return;
    }
  });

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <span>
        <input
          type="number"
          onBlur={(event) => {
            setSimulationSpeed(1000 / Number(event.target.value));
          }}
          defaultValue={stats.ups}
        />
        ups, {stats.fps} fps
      </span>
      <br />
      <span>Planets total: {planetController.planets.length}</span>
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
    </div>
  );
}
