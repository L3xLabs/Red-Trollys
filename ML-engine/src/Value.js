class Value {
  constructor(data, _children = [], _op = "") {
    this.data = data;
    this.grad = 0;
    this._backward = () => {};
    this._prev = new Set(_children);
    this._op = _op;
  }

  add(other) {
    other = other instanceof Value ? other : new Value(other);
    const out = new Value(this.data + other.data, [this, other], "+");
    out._backward = () => {
      this.grad += out.grad;
      other.grad += out.grad;
    };
    return out;
  }

  sub(other) {
    return this.add(other.mul(-1));
  }

  mul(other) {
    other = other instanceof Value ? other : new Value(other);
    const out = new Value(this.data * other.data, [this, other], "*");
    out._backward = () => {
      this.grad += other.data * out.grad;
      other.grad += this.data * out.grad;
    };
    return out;
  }

  div(other) {
    return this.mul(other.pow(-1));
  }

  pow(exp) {
    const out = new Value(this.data ** exp, [this], `**${exp}`);
    out._backward = () => {
      this.grad += exp * (this.data ** (exp - 1)) * out.grad;
    };
    return out;
  }

  relu() {
    const out = new Value(Math.max(0, this.data), [this], "ReLU");
    out._backward = () => {
      this.grad += (out.data > 0 ? 1 : 0) * out.grad;
    };
    return out;
  }

  backward() {
    const topo = [];
    const visited = new Set();

    const buildTopo = (v) => {
      if (!visited.has(v)) {
        visited.add(v);
        v._prev.forEach(buildTopo);
        topo.push(v);
      }
    };

    buildTopo(this);
    this.grad = 1;

    for (const v of topo.reverse()) {
      v._backward();
    }
  }

  toString() {
    return `Value(data=${this.data}, grad=${this.grad})`;
  }
}

module.exports = Value;
