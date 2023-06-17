import { constrain } from "../lib/random";

// include a velocity field (kind of cheating)
export function vel() {
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
export function velRotate(min = -90, max = 90) {
    return {
        targetAngle: 0,
        update() {
            this.targetAngle = constrain(
                (Math.atan2(this.vel.y, this.vel.x) * 180) / Math.PI,
                min,
                max
            );

            this.angle = lerp(this.angle, this.targetAngle, 0.1);
        },
    };
}
