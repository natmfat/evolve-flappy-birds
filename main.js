import "./style.css";

import kaboom from "kaboom";
import { createAgent, createPipe } from "./scenes/game";
import { random } from "./lib/random";

kaboom({
    width: 280,
    height: 512,
});

setGravity(1000);

loadSprite("background", "/sprites/background.png");
loadSprite("bird", "/sprites/bird.png");
loadSprite("pipe", "/sprites/pipe.png");

const AGENT_COUNT = 300;

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

    // add initial agents into scene
    if (agents.length === 0) {
        for (let i = 0; i < AGENT_COUNT; i++) {
            agents.push(createAgent());
        }
    }

    onUpdate(() => {
        // if there's still agents left, don't do genetic algorithm stuff
        const existingAgents = get("agent");
        if (existingAgents.length > 0) {
            return;
        }

        // get the best agent
        let bestAgent = agents[0];
        let bestScore = bestAgent.score;
        let totalScore = 0;
        for (const agent of agents) {
            if (agent.score >= bestScore) {
                bestAgent = agent;
                bestScore = agent.score;
            }

            totalScore += agent.score;
        }

        // get the best agent of all time
        if (!bestAgentOfAllTime || bestAgent.score > bestAgentOfAllTime.score) {
            bestAgentOfAllTime = bestAgent;
        }

        // normalize all of the scores
        for (const agent of agents) {
            agent.score = agent.score / totalScore;
        }

        // create a new population of agents based on the existing agents
        const nextAgents = [];
        for (let i = 0; i < AGENT_COUNT; i++) {
            nextAgents.push(createAgent(pickAgent().network.copy().mutate()));
        }

        nextAgents[0] = createAgent(bestAgentOfAllTime.network.copy());
        agents = nextAgents;

        destroyAll("pipe");
    });

    loop(2, () => {
        createPipe();
    });
});

go("game");
