const {Layer} = require("ml-engine");

class MLP {
  constructor(nin, nouts) {
    // Manually create the layers for a 3-layer model
    this.layer1 = new Layer(nin, 30, { nonlin: true });
    this.layer2 = new Layer(30, 10, { nonlin: true });
    this.layer3 = new Layer(10, nouts, { nonlin: false });
  }

  call(x) {
    // Pass the input through each layer sequentially
    x = this.layer1.call(x);
    x = this.layer2.call(x);
    x = this.layer3.call(x);
    return x;
  }

  parameters() {
    // Combine parameters from all layers
    return [
      ...this.layer1.parameters(),
      ...this.layer2.parameters(),
      ...this.layer3.parameters(),
    ];
  }

  toString() {
    return `MLP of [${this.layer1}, ${this.layer2}, ${this.layer3}]`;
  }
}

module.exports = MLP;