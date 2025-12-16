import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

/*
  Connect to the Hugging Face Space.
  This uses Gradio's internal transport (WebSocket/queue),
  which avoids browser CORS restrictions.
*/
const client = await Client.connect("heezuss/news-classification-model");

/*
  Main prediction function called from index.html
*/
window.runPrediction = async function () {
  const text = document.getElementById("text").value;
  const modelChoice = document.getElementById("model").value;
  const resultDiv = document.getElementById("result");

  if (!text || text.trim().length === 0) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "Please enter some text.";
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.innerHTML = "Running prediction...";

  try {
    /*
      Call the Gradio API function exposed by the Space.
      This corresponds to predict_category(...) in app.py.
    */
    const result = await client.predict("/predict_category", {
      text: text,
      model_choice: modelChoice
    });

    /*
      Expected result.data structure (Gradio Label output):

      [
        {
          label: "Business",
          confidences: [
            { label: "World", confidence: 0.01 },
            { label: "Sports", confidence: 0.002 },
            { label: "Business", confidence: 0.978 },
            { label: "Sci/Tech", confidence: 0.01 }
          ]
        },
        confidence_number,
        entropy_number
      ]
    */
    const [prediction, confidence, entropy] = result.data;

    let html = "";
    html += `<strong>Confidence:</strong> ${confidence.toFixed(3)}<br>`;
    html += `<strong>Entropy:</strong> ${entropy.toFixed(3)}<br><br>`;

    if (prediction && prediction.confidences) {
      for (const item of prediction.confidences) {
        html += `${item.label}: ${(item.confidence * 100).toFixed(2)}%<br>`;
      }
    } else {
      html += "Probability details unavailable.";
    }

    resultDiv.innerHTML = html;

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML =
      "Prediction failed. Please try again or check the console for details.";
  }
};
