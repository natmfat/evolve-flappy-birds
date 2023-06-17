import "./style.css";

import kaboom from "kaboom";
import { pipe, player } from "./scenes/game";
import { random } from "./lib/random";

kaboom({
    width: 280,
    height: 512,
});

setGravity(1000);

loadSprite("background", "/sprites/background.png");
loadSprite("bird", "/sprites/bird.png");
loadSprite("pipe", "/sprites/pipe.png");

const PLAYER_COUNT = 300;

let agents = [];
let bestAgentOfAllTime;
const pickAgent = () => {
    let i = 0;
    let r = random();
    while (r > 0) {
        r -= agents[i];
        i++;
    }
    i--;

    return agents[i];
};

scene("game", () => {
    add([sprite("background")]);

    if (agents.length === 0) {
        for (let i = 0; i < PLAYER_COUNT; i++) {
            agents.push(player());
        }
    }

    onUpdate(() => {
        const players = get("player");
        if (players.length === 0) {
            let bestAgent = agents[0];
            let bestScore = bestAgent.score;
            let totalScore = 0;
            for (const agent of agents) {
                if (agent.score >= bestScore) {
                    bestAgent = agent;
                    bestScore = agent.score;
                }

                totalScore += agent.score ** 2;
            }

            // normalize all of the scores
            for (const agent of agents) {
                agent.score = agent.score ** 2 / totalScore;
            }

            // create a new population of agents based on the existing agents
            const nextAgents = [];
            for (let i = 0; i < PLAYER_COUNT; i++) {
                nextAgents.push(player(pickAgent().network.copy().mutate()));
            }

            // ensure that the strongest competitor always stays in the game
            if (
                !bestAgentOfAllTime ||
                bestAgent.score > bestAgentOfAllTime.score
            ) {
                bestAgentOfAllTime = bestAgent;
            }

            nextAgents[0] = player(bestAgentOfAllTime.network.copy());
            agents = nextAgents;

            destroyAll("pipe");
        }
    });

    loop(2, () => {
        pipe();
    });
});

go("game");
