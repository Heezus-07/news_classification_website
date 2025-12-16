import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

/*
  Connect to the Hugging Face Space using Gradio's client.
  This avoids browser CORS restrictions.
*/
const client = await Client.connect("heezuss/news-classification-model");

/*
  Main prediction function triggered from index.html
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
    /*
      Call the deployed Gradio function.
    */
    const result = await client.predict("/predict_category", {
      text: text,
      model_choice: modelChoice
    });

    /*
      Expected result.data format:
      [
        { label: "...", confidences: [{label, confidence}, ...] },
        confidence_number,
        entropy_number
      ]
    */
    const [prediction, confidence, entropy] = result.data;

    // Update scalar metrics
    confidenceValue.textContent = confidence.toFixed(3);
    entropyValue.textContent = entropy.toFixed(3);

    // Clear previous probabilities
    probsContainer.innerHTML = "";

    if (prediction && prediction.confidences) {
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
    } else {
      probsContainer.innerHTML = "Probability details unavailable.";
    }

  } catch (error) {
    console.error(error);
    probsContainer.innerHTML =
      "Prediction failed. Please try again or check the console.";
  }
};
