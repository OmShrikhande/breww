import Matter from 'matter-js';

const { Engine, Render, World, Bodies, Composite, Runner, Events } = Matter;

export const createPlinkoEngine = (container, options) => {
  const { width, height, rows, onCollision } = options;

  const engine = Engine.create({
    gravity: { y: 1, scale: 0.001 },
  });

  const world = engine.world;

  const runner = Runner.create();
  Runner.run(runner, engine);

  const pegs = [];
  const spacing = width / (rows + 2);
  const startY = 50;
  const pegRadius = 4;

  for (let i = 0; i < rows; i++) {
    const rowPegs = i + 3;
    const rowWidth = (rowPegs - 1) * spacing;
    const startX = (width - rowWidth) / 2;

    for (let j = 0; j < rowPegs; j++) {
      const x = startX + j * spacing;
      const y = startY + i * spacing;
      const peg = Bodies.circle(x, y, pegRadius, {
        isStatic: true,
        restitution: 0.5,
        friction: 0.01,
        label: 'peg',
        render: { fillStyle: '#ffffff' },
      });
      pegs.push(peg);
    }
  }

  World.add(world, pegs);

  // Bottom boundary to detect collisions with multiplier slots
  const sensorHeight = 40;
  const sensor = Bodies.rectangle(width / 2, height - sensorHeight / 2, width, sensorHeight, {
    isStatic: true,
    isSensor: true,
    label: 'multiplier-sensor',
    render: { visible: false },
  });

  World.add(world, sensor);

  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      if (
        (bodyA.label === 'ball' && bodyB.label === 'multiplier-sensor') ||
        (bodyB.label === 'ball' && bodyA.label === 'multiplier-sensor')
      ) {
        const ball = bodyA.label === 'ball' ? bodyA : bodyB;
        onCollision(ball);
      }
    });
  });

  return { engine, world, runner, spacing, startY };
};

export const spawnBall = (world, width, startY, spacing) => {
  const ballRadius = 6;
  const x = width / 2 + (Math.random() - 0.5) * spacing * 0.5;
  const y = 0;

  const ball = Bodies.circle(x, y, ballRadius, {
    restitution: 0.5,
    friction: 0.01,
    frictionAir: 0.02,
    label: 'ball',
    render: { fillStyle: '#ff0000' },
  });

  World.add(world, ball);
  return ball;
};
