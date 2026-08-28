import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Matter from 'matter-js';
import { createPlinkoEngine, spawnBall } from '../../engines/plinkoEngine';
import MultiplierSlots from './MultiplierSlots';

const PlinkoBoard = forwardRef(({ rows, risk, onBallLand, multipliers }, ref) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);

  const width = 600;
  const height = 550;

  useEffect(() => {
    const { engine, world, spacing, startY } = createPlinkoEngine(containerRef.current, {
      width,
      height,
      rows,
      onCollision: (ball) => {
        const x = ball.position.x;
        const slotWidth = width / (rows + 1);
        const slotIndex = Math.floor(x / slotWidth);
        const multiplier = multipliers[slotIndex];

        onBallLand(multiplier, slotIndex);
        setActiveSlotIndex(slotIndex);
        setTimeout(() => setActiveSlotIndex(null), 500);

        Matter.World.remove(world, ball);
      },
    });

    engineRef.current = engine;
    worldRef.current = world;

    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false,
      },
    });

    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
    };
  }, [rows, multipliers]);

  useImperativeHandle(ref, () => ({
    dropBall: () => {
      const spacing = width / (rows + 2);
      spawnBall(worldRef.current, width, 50, spacing);
    },
  }));

  const slotWidth = width / (rows + 1);

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef} 
        className="bg-black/20 rounded-[2rem] shadow-2xl border border-white/5 backdrop-blur-sm relative overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <canvas ref={canvasRef} />
      </div>
      <div className="w-full max-w-[600px]">
        <MultiplierSlots 
          multipliers={multipliers} 
          slotWidth={slotWidth} 
          activeSlotIndex={activeSlotIndex} 
        />
      </div>
    </div>
  );
});

export default PlinkoBoard;
