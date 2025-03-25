export function killOnBoundary() {
    return {
        update() {
            if (
                this.pos.x < 0 ||
                this.pos.x > width() ||
                this.pos.y < 0 ||
                this.pos.y > height()
            ) {
                this.kill();
                this.score /= 2;
            }
        },
    };
}
