import { createLayer, createToyNetwork } from "../lib/createToyNetwork";
import { constrain } from "../lib/random";

const PIPE_HEIGHT = 320;
const PIPE_GAP = 100;
const SPEED = 120;

let currentPipes = [];

// include a velocity field (kind of cheating)
function vel() {
    return {
        prevPos: null,
        vel: vec2(0, 0),
        update() {
            if (this.prevPos === null) {
                this.prevPos = this.pos;
            }

            const vel = vec2(
                (this.pos.x - this.prevPos.x) / dt(),
                (this.pos.y - this.prevPos.y) / dt()
            );

            this.vel = vel;
            this.prevPos = this.pos;
        },
    };
}

// rotate in the direction of the velocity
function velRotate(min = -90, max = 90) {
    return {
        update() {
            this.angle = constrain(
                this.angle + Math.atan2(this.vel.y, this.vel.x),
                min,
                max
            );
        },
    };
}

function dieOffScreen() {
    return {
        update() {
            if (
                this.pos.x < 0 ||
                this.pos.x > width() ||
                this.pos.y < 0 ||
                this.pos.y > height()
            ) {
                this.kill();
            }
        },
    };
}

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

export function player(existingNetwork) {
    const bird = add([
        sprite("bird"),
        pos(40, height() / 2 - 12),
        vel(),
        velRotate(-50, 80),
        area({ collisionIgnore: ["player"] }),
        body(),
        rotate(0),
        anchor("center"),
        brain(existingNetwork),
        dieOffScreen(),
        z(20),
        "player",
        {
            kill() {
                addKaboom(bird.pos);
                shake(10);
                bird.destroy();
            },
        },
    ]);

    bird.onCollide("pipe", () => {
        bird.kill();
    });

    return bird;
}

export function pipe() {
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
