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

const AGENT_COUNT = 200;

let agents = [];
let bestAgentOfAllTime = null;
const pickAgent = () => {
    let i = 0;
    let r = random();
    while (r > 0) {
        r -= agents[i].fitness;
        i++;
    }
    i--;

    return agents[i];
};

let generationValue = 0;

scene("game", () => {
    add([sprite("background")]);

    const generation = add([
        text("Generation: 0", { size: 14 }),
        pos(16, 16),
        z(30),
    ]);

    // add initial agents into scene
    if (agents.length === 0) {
        for (let i = 0; i < AGENT_COUNT; i++) {
            agents.push(createAgent());
        }
    } else {
        // square all of the scores
        for (const agent of agents) {
            agent.score = agent.score ** 2;
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
            agent.fitness = agent.score / totalScore;
        }

        // create a new population of agents based on the existing agents
        const nextAgents = [];
        nextAgents.push(createAgent(bestAgentOfAllTime.network));
        for (let i = 0; i < AGENT_COUNT - 1; i++) {
            nextAgents.push(createAgent(pickAgent().network));
        }

        agents = nextAgents;

        // update generation value
        generationValue++;
        generation.text = `Generation: ${generationValue}`;
    }

    onUpdate(() => {
        const existingAgents = get("agent");
        if (existingAgents.length === 0) {
            go("game");
        }
    });

    loop(2, () => {
        createPipe();
    });
});

go("game");
