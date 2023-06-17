import { createToyNetwork } from "../lib/createToyNetwork";
import { killOnBoundary } from "../components/killOnBoundary";
import { shakeKill } from "../components/shakeKill";
import { vel, velRotate } from "../components/vel";
import { constrain } from "../lib/random";

const PIPE_HEIGHT = 320;
const PIPE_GAP = 100;
const SPEED = 160;

let currentPipes = [];

function brain(existingNetwork) {
    const network = existingNetwork || createToyNetwork();

    return {
        score: 0,
        network,
        update() {
            let [upperPipe, lowerPipe] = currentPipes;
            const pipesExist = upperPipe && lowerPipe;

            const inputs = [
                // how far away from pipes
                pipesExist ? (upperPipe.pos.x - this.pos.x) / width() : 1,

                // top of pipe opening
                pipesExist ? (upperPipe.pos.y + PIPE_HEIGHT) / height() : 0,

                // bottom of pipe opening
                pipesExist
                    ? (upperPipe.pos.y + PIPE_HEIGHT + PIPE_GAP) / height()
                    : 1,

                // current y,
                constrain(this.pos.y / height(), 0, 1),

                // current y velocity
                constrain(this.vel.y / 1000, -1, 1),
            ];

            // console.log(inputs);

            // determine if we should jump or not
            const output = network.feedForward(inputs);
            if (output[0] > output[1]) {
                this.jump(350);
            }

            // increment score if the pipes exist
            if (pipesExist) {
                this.score++;

                // increment score if agent passes
                if (this.pos.x >= upperPipe.pos.x + upperPipe.width) {
                    console.log("ok");
                    this.score += 1000;
                }
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
        shakeKill(),
        z(20),
        "agent",
    ]);

    // onKeyPress("space", () => {
    //     agent.jump(350);
    // });

    agent.onCollide("pipe", () => {
        agent.kill();
    });

    return agent;
}

export function createPipe() {
    const pipeGap = PIPE_GAP / 2;
    const pipeOffset = rand(-100, 100);
    const pipeCenter = height() / 2 - PIPE_HEIGHT + pipeOffset;
    const pipeId = Math.random().toString().substring(2);

    const pipes = [
        // top pipe
        add([
            sprite("pipe", { flipY: true }),
            pos(width(), pipeCenter - pipeGap),
            move(LEFT, SPEED),
            area(),
            "pipe",
            pipeId,
            { pipeOffset },
        ]),

        // bottom pipe
        add([
            sprite("pipe"),
            pos(width(), pipeCenter + PIPE_HEIGHT + pipeGap),
            move(LEFT, SPEED),
            area(),
            "pipe",
            pipeId,
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
