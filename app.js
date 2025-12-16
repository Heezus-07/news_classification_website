async function runPrediction() {
  const text = document.getElementById("text").value;
  const modelChoice = document.getElementById("model").value;
  const resultDiv = document.getElementById("result");

  resultDiv.style.display = "block";
  resultDiv.innerHTML = "Running prediction...";

  const response = await fetch(
    "https://huggingface.co/spaces/heezuss/news-classification-model/api/predict_category",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [text, modelChoice]
      })
    }
  );

  const json = await response.json();
  const [probs, confidence, entropy] = json.data;

  let html = `<strong>Confidence:</strong> ${confidence.toFixed(3)}<br>`;
  html += `<strong>Entropy:</strong> ${entropy.toFixed(3)}<br><br>`;

  for (const [label, prob] of Object.entries(probs)) {
    html += `${label}: ${(prob * 100).toFixed(2)}%<br>`;
  }

  resultDiv.innerHTML = html;
}
