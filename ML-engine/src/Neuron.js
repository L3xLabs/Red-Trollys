const Value = require("./Value");

class Neuron {
  constructor(nin, nonlin = true) {
    this.w = Array.from(
      { length: nin },
      () => new Value(Math.random() * 2 - 1)
    ); // Random weights
    this.b = new Value(0); // Bias
    this.nonlin = nonlin; // Non-linearity
  }

  call(x) {
    const act = this.w.reduce((sum, wi, i) => sum.add(wi.mul(x[i])), this.b);
    return this.nonlin ? act.relu() : act;
  }

  parameters() {
    return [...this.w, this.b];
  }

  toString() {
    return `${this.nonlin ? "ReLU" : "Linear"}Neuron(${this.w.length})`;
  }
}

module.exports = Neuron;
