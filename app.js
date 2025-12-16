import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

/*
  Connect to Hugging Face Space using Gradio client
*/
const client = await Client.connect("heezuss/news-classification-model");

/*
  Run prediction
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
    probsContainer.innerHTML = "Please enter some text.";
    return;
  }

  resultCard.classList.remove("hidden");
  probsContainer.innerHTML = "Running prediction...";

  try {
    const result = await client.predict("/predict_category", {
      text: text,
      model_choice: modelChoice
    });

    const [prediction, confidence, entropy] = result.data;

    confidenceValue.textContent = confidence.toFixed(3);
    entropyValue.textContent = entropy.toFixed(3);

    probsContainer.innerHTML = "";

    prediction.confidences.forEach(item => {
      const row = document.createElement("div");
      row.className = "prob-row";

      row.innerHTML = `
        <div class="prob-label">${item.label}</div>
        <div class="prob-bar">
          <div class="prob-fill"
               style="width:${(item.confidence * 100).toFixed(1)}%">
          </div>
        </div>
        <div class="prob-value">
          ${(item.confidence * 100).toFixed(2)}%
        </div>
      `;

      probsContainer.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    probsContainer.innerHTML = "Prediction failed. Please try again.";
  }
};

/*
  Load example text
*/
window.loadExample = function (element) {
  const textInput = document.getElementById("text");
  textInput.value = element.textContent.trim();
  textInput.focus();
};
