export function shakeKill() {
    return {
        kill() {
            addKaboom(this.pos);
            shake(10);
            this.destroy();
        },
    };
}
