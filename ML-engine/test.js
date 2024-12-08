const { Value } = require("ml-engine");
const MLP = require("./Model");

const data = [
  { x: [new Value(0), new Value(0)], y: new Value(0) },
  { x: [new Value(0), new Value(1)], y: new Value(1) },
  { x: [new Value(1), new Value(0)], y: new Value(1) },
  { x: [new Value(1), new Value(1)], y: new Value(0) },
];
const model = new MLP(2, 1);
function mseLoss(predictions, targets) {
  const losses = predictions.map((pred, i) =>
    pred.sub(targets[i]).mul(pred.sub(targets[i]))
  );
  return losses
    .reduce((sum, loss) => sum.add(loss), new Value(0))
    .mul(1 / predictions.length);
}
// Training loop
const learningRate = 0.1;
const epochs = 100;

for (let epoch = 0; epoch < epochs; epoch++) {
  // Forward pass
  const predictions = data.map((d) => model.call(d.x));
  const targets = data.map((d) => d.y);

  // Calculate loss
  const loss = mseLoss(predictions, targets);

  // Backward pass
  model.parameters().forEach((p) => (p.grad = 0)); // Zero gradients
  loss.backward();

  // Gradient descent step
  for (const p of model.parameters()) {
    p.data -= learningRate * p.grad;
  }

  // Log loss every 100 epochs
  if (epoch % 100 === 0) {
    console.log(`Epoch ${epoch}, Loss: ${loss.data}`);
  }
}
console.log("\nTesting Model:");
data.forEach(({ x, y }) => {
  const pred = model.call(x);
  console.log(
    `Input: [${x[0].data}, ${x[1].data}], Predicted: ${pred.data.toFixed(
      2
    )}, Actual: ${y.data}`
  );
});