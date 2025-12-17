import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const client = await Client.connect("heezuss/news-classification-model");

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = (progress * (end - start) + start).toFixed(3);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

window.runPrediction = async function () {
    const text = document.getElementById("text").value;
    const modelChoice = document.getElementById("model").value;
    const resultCard = document.getElementById("result");
    const probsContainer = document.getElementById("probabilities");
    const winningDisplay = document.getElementById("winning-class");

    if (!text || text.trim().length === 0) return;

    resultCard.classList.remove("hidden");
    winningDisplay.textContent = "...";
    probsContainer.innerHTML = `<div style="text-align:center; padding:20px; font-weight:600;">Analyzing Headlines...</div>`;

    try {
        const result = await client.predict("/predict_category", {
            text: text,
            model_choice: modelChoice
        });

        const [prediction, confidence, entropy] = result.data;

        const winningLabel = prediction.label;
        winningDisplay.textContent = winningLabel;
        
        const topCat = winningLabel.toLowerCase();
        document.body.className = ""; 
        if (topCat.includes("sci")) { document.body.classList.add("theme-tech"); winningDisplay.style.color = "#3a7bd5"; }
        else if (topCat.includes("bus")) { document.body.classList.add("theme-business"); winningDisplay.style.color = "#27ae60"; }
        else if (topCat.includes("wor")) { document.body.classList.add("theme-world"); winningDisplay.style.color = "#f2994a"; }
        else if (topCat.includes("spo")) { document.body.classList.add("theme-sports"); winningDisplay.style.color = "#eb5757"; }

        animateValue(document.getElementById("confidence-value"), 0, confidence, 1000);
        animateValue(document.getElementById("entropy-value"), 0, entropy, 1000);

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

            setTimeout(() => {
                const bar = document.getElementById(`bar-${index}`);
                if (bar) bar.style.width = `${percent}%`;
            }, 150);
        });

    } catch (err) {
        probsContainer.innerHTML = "Prediction Failed. Try again.";
    }
};

window.loadExample = function (element) {
    document.getElementById("text").value = element.textContent.trim();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
