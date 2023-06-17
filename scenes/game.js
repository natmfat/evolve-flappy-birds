import { createToyNetwork } from "../lib/createToyNetwork";
import { killOnBoundary } from "../components/killOnBoundary";
import { shakeKill } from "../components/shakeKill";
import { vel, velRotate } from "../components/vel";

const PIPE_HEIGHT = 320;
const PIPE_GAP = 100;
const SPEED = 120;

let currentPipes = [];

function brain(existingNetwork) {
    const network = existingNetwork || createToyNetwork();

    return {
        score: 0,
        network,
        update() {
            if (currentPipes.length === 2) {
                const inputs = [
                    // how far away from pipes
                    (currentPipes[0].pos.x - this.pos.x) / width(),

                    // top of pipe opening
                    (currentPipes[0].pos.y + PIPE_HEIGHT) / height(),

                    // bottom of pipe opening
                    currentPipes[1].pos.y / height(),

                    // current y,
                    this.pos.y / height(),

                    // current y velocity
                    this.vel.y / 1000,
                ];

                // determine if we should jump or not
                const output = network.feedForward(inputs);
                if (output[0] > output[1]) {
                    this.jump(350);
                }

                // manage score
                this.score++;
            }
        },
    };
}

export function createAgent(existingNetwork) {
    const agent = add([
        sprite("bird"),
        pos(40, height() / 2 - 12),
        vel(),
        velRotate(-50, 80),
        area({ collisionIgnore: ["agent"] }),
        body(),
        rotate(0),
        anchor("center"),
        brain(existingNetwork),
        killOnBoundary(),
        z(20),
        shakeKill(),
        "agent",
    ]);

    agent.onCollide("pipe", () => {
        agent.kill();
    });

    return agent;
}

export function createPipe() {
    const pipeGap = PIPE_GAP / 2;
    const pipeOffset = rand(-100, 100);
    const pipeCenter = height() / 2 - PIPE_HEIGHT + pipeOffset;

    const pipes = [
        // top pipe
        add([
            sprite("pipe", { flipY: true }),
            pos(width(), pipeCenter - pipeGap),
            move(LEFT, SPEED),
            area(),
            "pipe",
            { pipeOffset },
        ]),

        // bottom pipe
        add([
            sprite("pipe"),
            pos(width(), pipeCenter + PIPE_HEIGHT + pipeGap),
            move(LEFT, SPEED),
            area(),
            "pipe",
            { pipeOffset },
        ]),
    ];

    pipes.forEach((pipe) => {
        pipe.onUpdate(() => {
            if (pipe.pos.x + pipe.width <= 0) {
                pipe.destroy();
            }
        });
    });

    currentPipes = pipes;
}
