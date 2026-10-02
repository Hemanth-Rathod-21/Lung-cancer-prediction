
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "best_lung_cancer_model.joblib"
FRONTEND_DIR = BASE_DIR / "frontend"


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Lung Cancer Risk Prediction API",
    description="Machine-learning based lung cancer risk prediction",
    version="1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# LOAD MODEL
# ============================================================

model_bundle = joblib.load(MODEL_PATH)

model = model_bundle["model"]
FEATURES = model_bundle["features"]

print("==========================================")
print("Model loaded successfully.")
print("Model:", model_bundle.get("model_name", "Random Forest"))
print("Features:", FEATURES)
print("==========================================")


# ============================================================
# INPUT MODEL
# ============================================================

class PatientData(BaseModel):

    GENDER: int
    AGE: int
    SMOKING: int
    YELLOW_FINGERS: int
    ANXIETY: int
    PEER_PRESSURE: int
    CHRONIC_DISEASE: int
    FATIGUE: int
    ALLERGY: int
    WHEEZING: int
    ALCOHOL_CONSUMING: int
    COUGHING: int
    SHORTNESS_OF_BREATH: int
    SWALLOWING_DIFFICULTY: int
    CHEST_PAIN: int


# ============================================================
# FRONTEND
# ============================================================

@app.get("/")
def home():
    return FileResponse(
        FRONTEND_DIR / "index.html"
    )


@app.get("/style.css")
def style():
    return FileResponse(
        FRONTEND_DIR / "style.css"
    )


@app.get("/app.js")
def javascript():
    return FileResponse(
        FRONTEND_DIR / "app.js"
    )


# ============================================================
# API STATUS
# ============================================================

@app.get("/api/status")
def api_status():

    return {
        "status": "online",
        "message": "Lung Cancer Risk Prediction API is running",
        "model": model_bundle.get(
            "model_name",
            "Random Forest"
        )
    }


# ============================================================
# FEATURES
# ============================================================

@app.get("/api/features")
def get_features():

    return {
        "features": FEATURES
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/api/predict")
def predict(data: PatientData):

    # Convert input to dictionary
    patient = data.model_dump()

    # Create DataFrame
    input_df = pd.DataFrame(
        [patient],
        columns=FEATURES
    )

    # Prediction
    prediction = model.predict(
        input_df
    )[0]

    # Probability
    probabilities = model.predict_proba(
        input_df
    )[0]

    no_probability = float(
        probabilities[0]
    )

    yes_probability = float(
        probabilities[1]
    )

    # Result
    if prediction == 1:
        result = "Higher Predicted Risk"
    else:
        result = "Lower Predicted Risk"

    # Response
    return {

        "prediction": int(prediction),

        "result": result,

        "lung_cancer_probability": round(
            yes_probability * 100,
            2
        ),

        "no_lung_cancer_probability": round(
            no_probability * 100,
            2
        ),

        "disclaimer":
            "This is an ML-based risk prediction, "
            "not a medical diagnosis. Consult a qualified "
            "healthcare professional for medical evaluation."
    }

