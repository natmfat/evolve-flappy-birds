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

function keepOnscreen() {
    return {
        update() {
            this.pos.x = constrain(this.pos.x, 0, width());
            this.pos.y = constrain(this.pos.y, 0, height());
        },
    };
}

function brain() {
    const network = createToyNetwork([
        createLayer(4, 10),
        createLayer(10, 10),
        createLayer(10, 1),
    ]);

    return {
        network,
        update() {
            const currentPipe = currentPipes[0];
            const inputs = [
                // how far away from pipes
                currentPipe ? currentPipe.pos.x / width() : 1,

                // pipe offset
                currentPipe ? currentPipe.pipeOffset / height() : 0,

                // current y,
                this.pos.y / height(),

                // current y velocity
                this.vel.y / 1000,
            ];

            if (network.feedForward(inputs)[0] >= 0.5) {
                this.jump(350);
            }
        },
    };
}

export function player() {
    const bird = add([
        sprite("bird"),
        pos(40, height() / 2 - 12),
        vel(),
        velRotate(-50, 80),
        area(),
        body(),
        rotate(0),
        anchor("center"),
        brain(),
        keepOnscreen(),
        z(20),
        "player",
    ]);

    bird.onCollide("pipe", (e) => {
        addKaboom(bird.pos);
        shake(10);
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
                pipe.remove();
            }
        });
    });

    currentPipes = pipes;
}
