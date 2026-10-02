
const API_URL = "/api/predict";

const form = document.getElementById("predictionForm");
const loading = document.getElementById("loading");
const resultCard = document.getElementById("resultCard");
const predictBtn = document.getElementById("predictBtn");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const patientData = {
        GENDER: Number(document.getElementById("GENDER").value),
        AGE: Number(document.getElementById("AGE").value),
        SMOKING: Number(document.getElementById("SMOKING").value),
        YELLOW_FINGERS: Number(document.getElementById("YELLOW_FINGERS").value),
        ANXIETY: Number(document.getElementById("ANXIETY").value),
        PEER_PRESSURE: Number(document.getElementById("PEER_PRESSURE").value),
        CHRONIC_DISEASE: Number(document.getElementById("CHRONIC_DISEASE").value),
        FATIGUE: Number(document.getElementById("FATIGUE").value),
        ALLERGY: Number(document.getElementById("ALLERGY").value),
        WHEEZING: Number(document.getElementById("WHEEZING").value),
        ALCOHOL_CONSUMING: Number(document.getElementById("ALCOHOL_CONSUMING").value),
        COUGHING: Number(document.getElementById("COUGHING").value),
        SHORTNESS_OF_BREATH: Number(document.getElementById("SHORTNESS_OF_BREATH").value),
        SWALLOWING_DIFFICULTY: Number(document.getElementById("SWALLOWING_DIFFICULTY").value),
        CHEST_PAIN: Number(document.getElementById("CHEST_PAIN").value)
    };

    loading.classList.remove("hidden");
    resultCard.classList.add("hidden");
    predictBtn.disabled = true;

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(patientData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                typeof data.detail === "string"
                    ? data.detail
                    : "Prediction failed"
            );
        }

        showResult(data);

    } catch (error) {

        alert(
            "Unable to connect to the prediction server.\n\n" +
            "Make sure FastAPI is running on port 8000.\n\n" +
            error.message
        );

    } finally {

        loading.classList.add("hidden");
        predictBtn.disabled = false;

    }
});


function showResult(data) {

    resultCard.classList.remove("hidden");

    const cancerProbability =
        Number(data.lung_cancer_probability);

    const noCancerProbability =
        Number(data.no_lung_cancer_probability);


    /* Result title */

    document.getElementById("resultTitle").textContent =
        data.result;


    /* Main percentage */

    document.getElementById("riskPercentage").textContent =
        cancerProbability.toFixed(2) + "%";


    /* Summary status */

    document.getElementById("riskStatus").textContent =
        data.result;


    /* Probability values */

    document.getElementById("cancerProbability").textContent =
        cancerProbability.toFixed(2) + "%";

    document.getElementById("noCancerProbability").textContent =
        noCancerProbability.toFixed(2) + "%";


    /* Progress bars */

    document.getElementById("cancerBar").style.width =
        cancerProbability + "%";

    document.getElementById("noCancerBar").style.width =
        noCancerProbability + "%";


    /* Circular risk indicator */

    const angle = (cancerProbability / 100) * 360;

    document.querySelector(".risk-circle").style.setProperty(
        "--risk-angle",
        angle + "deg"
    );


    /* Disclaimer */

    document.getElementById("disclaimer").textContent =
        data.disclaimer;


    /* Scroll to result */

    resultCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function resetForm() {

    form.reset();

    resultCard.classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function printReport() {

    window.print();
}

