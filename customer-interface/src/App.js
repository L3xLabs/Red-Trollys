import React, { useState } from "react";

function App() {
  const [csvUrl, setCsvUrl] = useState("");
  const [elements, setElements] = useState([
    { type: "linear", param1: 0, param2: 0 },
  ]);

  const handleElementChange = (index, field, value) => {
    const updatedElements = [...elements];
    updatedElements[index][field] =
      field === "type" ? value : parseInt(value, 10) || 0;
    setElements(updatedElements);
  };

  const addElement = () => {
    setElements([...elements, { type: "linear", param1: 0, param2: 0 }]);
  };

  const removeElement = (index) => {
    const updatedElements = elements.filter((_, i) => i !== index);
    setElements(updatedElements);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ csvUrl, elements });
    alert(`CSV URL: ${csvUrl}\nElements: ${JSON.stringify(elements, null, 2)}`);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>CSV File and Parameters Form</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            CSV File URL:
          </label>
          <input
            type="url"
            value={csvUrl}
            onChange={(e) => setCsvUrl(e.target.value)}
            placeholder="Enter CSV file URL"
            required
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        <h3>Elements</h3>
        {elements.map((element, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              border: "1px solid #ccc",
              padding: "10px",
            }}
          >
            <label>Type:</label>
            <select
              value={element.type}
              onChange={(e) =>
                handleElementChange(index, "type", e.target.value)
              }
              style={{ marginLeft: "10px", marginRight: "20px" }}
            >
              <option value="linear">Linear</option>
              <option value="non-linear">Non-Linear</option>
            </select>

            <label>Param 1:</label>
            <input
              type="number"
              value={element.param1}
              onChange={(e) =>
                handleElementChange(index, "param1", e.target.value)
              }
              style={{ marginLeft: "10px", marginRight: "20px" }}
            />

            <label>Param 2:</label>
            <input
              type="number"
              value={element.param2}
              onChange={(e) =>
                handleElementChange(index, "param2", e.target.value)
              }
              style={{ marginLeft: "10px" }}
            />

            <button
              type="button"
              onClick={() => removeElement(index)}
              style={{ marginLeft: "20px", color: "red" }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addElement}
          style={{ marginBottom: "15px" }}
        >
          Add Element
        </button>

        <br />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
