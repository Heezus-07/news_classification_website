import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

/* Connect to Hugging Face Space using Gradio client 
*/
const client = await Client.connect("heezuss/news-classification-model");

/* Run prediction 
*/
window.runPrediction = async function () {
  const text = document.getElementById("text").value;
  const modelChoice = document.getElementById("model").value;

  const resultCard = document.getElementById("result");
  const confidenceValue = document.getElementById("confidence-value");
  const entropyValue = document.getElementById("entropy-value");
  const probsContainer = document.getElementById("probabilities");

  if (!text || text.trim().length === 0) {
    resultCard.classList.remove("hidden");
    probsContainer.innerHTML = `<div style="text-align:center; padding: 20px; font-weight:600;">Please enter some text.</div>`;
    return;
  }

  // Visual feedback during processing
  resultCard.classList.remove("hidden");
  probsContainer.innerHTML = `<div style="text-align:center; padding: 20px; font-weight:600; color: #6c63ff;">Analyzing article...</div>`;
  confidenceValue.textContent = "---";
  entropyValue.textContent = "---";

  try {
    const result = await client.predict("/predict_category", {
      text: text,
      model_choice: modelChoice
    });

    const [prediction, confidence, entropy] = result.data;

    // Update the metric boxes
    confidenceValue.textContent = confidence.toFixed(3);
    entropyValue.textContent = entropy.toFixed(3);

    probsContainer.innerHTML = "";

    // Generate the probability rows
    prediction.confidences.forEach(item => {
      const row = document.createElement("div");
      row.className = "prob-row";

      // item.confidence is usually a decimal (e.g., 0.9785)
      const percent = (item.confidence * 100).toFixed(2);

      row.innerHTML = `
        <div class="prob-label">${item.label}</div>
        <div class="prob-bar">
          <div class="prob-fill" 
               style="width: ${percent}%">
          </div>
        </div>
        <div class="prob-value">
          ${percent}%
        </div>
      `;

      probsContainer.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    probsContainer.innerHTML = `<div style="text-align:center; color: #d9534f; font-weight:600;">Prediction failed. Please try again.</div>`;
  }
};

/* Load example text 
*/
window.loadExample = function (element) {
  const textInput = document.getElementById("text");
  textInput.value = element.textContent.trim();
  textInput.focus();
};
