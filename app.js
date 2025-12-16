<script type="module">
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const client = await Client.connect("heezuss/news-classification-model");

window.runPrediction = async function () {
  const text = document.getElementById("text").value;
  const modelChoice = document.getElementById("model").value;
  const resultDiv = document.getElementById("result");

  resultDiv.style.display = "block";
  resultDiv.innerHTML = "Running prediction...";

  const result = await client.predict("/predict_category", {
    text: text,
    model_choice: modelChoice
  });

  const [probs, confidence, entropy] = result.data;

  let html = `<strong>Confidence:</strong> ${confidence.toFixed(3)}<br>`;
  html += `<strong>Entropy:</strong> ${entropy.toFixed(3)}<br><br>`;

  for (const [label, prob] of Object.entries(probs)) {
    html += `${label}: ${(prob * 100).toFixed(2)}%<br>`;
  }

  resultDiv.innerHTML = html;
};
</script>
