export const random = (min = 0, max = 1) => Math.random() * (max - min) + min;

export const randomInt = (min = 0, max = 1) => Math.floor(random(min, max));

export const randomArray = (length, min = 0, max = 1) =>
    new Array(length).fill(0).map(() => random(min, max));

let _gaussian_previous;
let y2 = 0;
export function randomGaussian(mean = 0, sd = 1) {
    let y1, x1, x2, w;

    if (_gaussian_previous) {
        y1 = y2;
        _gaussian_previous = false;
    } else {
        do {
            x1 = random(-1, 1);
            x2 = random(-1, 1);
            w = x1 * x1 + x2 * x2;
        } while (w >= 1);
        w = Math.sqrt((-2 * Math.log(w)) / w);
        y1 = x1 * w;
        y2 = x2 * w;
        _gaussian_previous = true;
    }

    return y1 * sd + mean;
}

export const choose = (array) =>
    array[Math.floor(Math.random() * array.length)];

export const constrain = (n, min, max) => Math.min(Math.max(n, min), max);
