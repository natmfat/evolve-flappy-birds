import { assert } from "./assert";
import { constrain, random, randomArray, randomGaussian } from "./random";

/**
 * Create a basic neuron that can pass data through it
 * @param inputSize Input size to use for weights
 * @returns Methods to interact with the neuron
 */
export const createNeuron = (inputSize) => {
    let weights = randomArray(inputSize, -1, 1);
    let bias = random(-1, 1);

    // sigmoid activation function
    // const activate = (x: number) => 1 / (1 + Math.pow(Math.E, -x));

    // relu activation function
    const activate = (x) => Math.max(x, 0);

    return {
        getWeights: () => weights,
        setWeights: (nextWeights) => (weights = nextWeights),

        getBias: () => bias,
        setBias: (nextBias) => (bias = nextBias),

        feedForward: (inputs) => {
            assert(inputs.length == inputSize, "Input size does not match");

            return activate(
                inputs.reduce((sum, input, i) => sum + weights[i] * input) +
                    bias
            );
        },
    };
};

/**
 * Create array of neurons or a layer
 * @param inputSize Expected input size (output from the previous layer)
 * @param layerSize Number of neurons in the layer
 * @returns Methods to interact with the layer
 */
export const createLayer = (inputSize, layerSize) => {
    assert(inputSize >= 0, "Input size must be greater than 0");
    assert(layerSize >= 0, "Layer size must be greater than 0");

    const neurons = new Array(layerSize)
        .fill(0)
        .map(() => createNeuron(inputSize));

    return {
        getNeurons: () => neurons,
        feedForward: (inputs) =>
            neurons.map((neuron) => neuron.feedForward(inputs)),
    };
};

/**
 * Create a toy neural network
 * @param layers Neural network layers to use
 * @returns Methods to interact with the neural network
 */
export const createToyNetwork = (layers) => {
    return {
        getLayers: () => layers,
        copy: () => {
            const copied = createToyNetwork();
            for (let i = 0; i < layers.length; i++) {
                const originalNeurons = layers[i].getNeurons();
                const copiedNeurons = copied.getLayers()[i].getNeurons();
                for (let j = 0; j < originalNeurons.length; j++) {
                    const originalWeights = originalNeurons[j].getWeights();
                    copiedNeurons[j].setWeights([...originalWeights]);
                }
            }

            return copied;
        },
        mutate: (mutationRate = 0.1) => {
            const mutateWeight = (originalWeight) => {
                if (random() < mutationRate) {
                    return constrain(
                        originalWeight + randomGaussian() * 0.5,
                        -1,
                        1
                    );
                }

                return originalWeight;
            };

            for (const layer of layers) {
                for (const neuron of layer.getNeurons()) {
                    const weights = neuron.getWeights();

                    // mutate random weight of a random neuron of a random layer
                    neuron.setBias(mutateWeight(neuron.getBias()));
                    for (let i = 0; i < weights.length; i++) {
                        weights[i] = mutateWeight(weights[i]);
                    }
                }
            }
        },
        feedForward: (inputs) =>
            layers.reduce(
                (prevInputs, layer) => layer.feedForward(prevInputs),
                inputs
            ),
    };
};
