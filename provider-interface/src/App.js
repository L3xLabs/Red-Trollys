import React, { useState, useEffect } from "react";

const App = () => {
  const [hardwareData, setHardwareData] = useState(null);
  const [category, setCategory] = useState("Unknown");
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        const response = await fetch("/release.wasm");
        const buffer = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(buffer, {
          env: {
            abort: (msg, file, line, column) => {
              console.error(`Abort called at ${file}:${line}:${column}`);
            },
            memory: new WebAssembly.Memory({ initial: 1 }),
          },
        });

        const memory =
          instance.exports.memory || new WebAssembly.Memory({ initial: 1 });
        const getHardwareInfo = instance.exports.getHardwareInfo;
        const free = instance.exports.free;

        const dataPointer = getHardwareInfo();
        const dataView = new DataView(memory.buffer);
        const cpuCores = dataView.getUint32(dataPointer, true);
        const memorySize = dataView.getUint32(dataPointer + 4, true);
        const storageSize = dataView.getUint32(dataPointer + 8, true);

        free(dataPointer);

        const parsedData = {
          cpuCores,
          memory: memorySize,
          storage: storageSize,
        };
        setHardwareData(parsedData);
        categorizeDevice(parsedData);
      } catch (err) {
        console.error("Error loading WASM:", err);
        setError("Failed to load hardware health data.");
      }
    };

    loadWasm();
  }, []);

  const categorizeDevice = (data) => {
    if (!data) return;

    const { cpuCores, memory, storage } = data;

    if (cpuCores > 8 && memory > 16 && storage > 512) {
      setCategory("Large");
    } else if (cpuCores > 4 && memory > 8 && storage > 256) {
      setCategory("Medium");
    } else {
      setCategory("Small");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!hardwareData) {
    return <div>Loading hardware health data...</div>;
  }

  return (
    <div>
      <h1>Hardware Health Check</h1>
      <p>Category: {category}</p>
      <div>
        <h2>Hardware Details</h2>
        <ul>
          <li>CPU Cores: {hardwareData.cpuCores}</li>
          <li>Memory: {hardwareData.memory} GB</li>
          <li>Storage: {hardwareData.storage} GB</li>
        </ul>
      </div>
    </div>
  );
};

export default App;
