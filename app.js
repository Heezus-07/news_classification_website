import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const client = await Client.connect("heezuss/news-classification-model");

// Helper function for the "Counting Up" animation for numbers
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - start) + start).toFixed(3);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

window.runPrediction = async function () {
    const text = document.getElementById("text").value;
    const modelChoice = document.getElementById("model").value;
    const resultCard = document.getElementById("result");
    const probsContainer = document.getElementById("probabilities");
    const winningDisplay = document.getElementById("winning-class"); // The new display element

    if (!text) return;

    // Reset UI for new prediction
    resultCard.classList.remove("hidden");
    winningDisplay.textContent = ""; 
    probsContainer.innerHTML = `<div class="loading-pulse">Analyzing deep features...</div>`;

    try {
        const result = await client.predict("/predict_category", {
            text: text,
            model_choice: modelChoice
        });

        const [prediction, confidence, entropy] = result.data;

        // 1. DISPLAY THE WINNING CLASS (Large text above bars)
        const winningLabel = prediction.label;
        winningDisplay.textContent = winningLabel;

        // 2. Animate the Metric Numbers
        animateValue(document.getElementById("confidence-value"), 0, confidence, 1000);
        animateValue(document.getElementById("entropy-value"), 0, entropy, 1000);

        // 3. Dynamic Theme & Color Change based on winning category
        const topCat = winningLabel.toLowerCase();
        document.body.className = ""; // Reset body classes
        
        if (topCat.includes("sci")) {
            document.body.classList.add("theme-tech");
            winningDisplay.style.color = "#00d2ff";
        } else if (topCat.includes("bus")) {
            document.body.classList.add("theme-business");
            winningDisplay.style.color = "#00ff87";
        } else if (topCat.includes("wor")) {
            document.body.classList.add("theme-world");
            winningDisplay.style.color = "#ffcc33";
        } else if (topCat.includes("spo")) {
            document.body.classList.add("theme-sports");
            winningDisplay.style.color = "#ff4b2b";
        }

        // 4. Inject Probability Rows with Staggered Animation
        probsContainer.innerHTML = "";
        prediction.confidences.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "prob-row";
            row.style.animationDelay = `${index * 0.1}s`; 

            const percent = (item.confidence * 100).toFixed(2);
            row.innerHTML = `
                <div class="prob-label">${item.label}</div>
                <div class="prob-bar"><div class="prob-fill" id="bar-${index}"></div></div>
                <div class="prob-value">${percent}%</div>
            `;
            probsContainer.appendChild(row);

            // Trigger the bar growth animation
            setTimeout(() => {
                const bar = document.getElementById(`bar-${index}`);
                if (bar) bar.style.width = `${percent}%`;
            }, 100);
        });

    } catch (err) {
        console.error(err);
        probsContainer.innerHTML = "Error connecting to AI engine.";
    }
};

window.loadExample = function (element) {
    document.getElementById("text").value = element.textContent.trim();
};
