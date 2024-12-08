const Neuron = require("./Neuron");

class Layer {
  constructor(nin, nout, kwargs = {}) {
    this.neurons = Array.from(
      { length: nout },
      () => new Neuron(nin, kwargs.nonlin)
    );
  }

  call(x) {
    const out = this.neurons.map((n) => n.call(x));
    return out.length === 1 ? out[0] : out;
  }

  parameters() {
    return this.neurons.flatMap((n) => n.parameters());
  }

  toString() {
    return `Layer of [${this.neurons.join(", ")}]`;
  }
}

module.exports = Layer;
