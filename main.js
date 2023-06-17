import "./style.css";

import kaboom from "kaboom";
import { pipe, player } from "./scenes/game";

kaboom({
    width: 280,
    height: 512,
});

setGravity(1000);

loadSprite("background", "/sprites/background.png");
loadSprite("bird", "/sprites/bird.png");
loadSprite("pipe", "/sprites/pipe.png");

scene("game", () => {
    add([sprite("background")]);

    for (let i = 0; i < 30; i++) {
        player();
    }

    loop(2, () => {
        pipe();
    });
});

go("game");
