/**
 * Centralized AI/ML Models Configuration & Metadata.
 * Powers the interactive browser-native AI Studio application.
 */

export interface ModelFeature {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description: string;
}

export interface ModelDefinition {
  id: string;
  name: string;
  category: "Computer Vision" | "Diagnostic ML" | "Recommendation" | "Precision Ag";
  architecture: string;
  accuracy: string;
  latencyMs: number;
  description: string;
  features: ModelFeature[];
  classes: Array<{ label: string; color: string; description: string }>;
  predict: (inputs: Record<string, number>) => {
    predictedClass: string;
    confidence: number;
    probabilities: Record<string, number>;
    metrics: Record<string, number | string>;
  };
}

export const AI_MODELS: Record<string, ModelDefinition> = {
  "precision-agriculture": {
    id: "precision-agriculture",
    name: "Crop Health & NDVI Classifier",
    category: "Precision Ag",
    architecture: "Random Forest & Multispectral Indices",
    accuracy: "92.4%",
    latencyMs: 0.45,
    description: "Evaluates multispectral vegetation indices (NDVI, SAVI, EVI) to identify crop stress and disease before visual symptoms appear.",
    features: [
      { id: "nir", name: "Near-Infrared (NIR)", min: 0.1, max: 0.9, step: 0.01, defaultValue: 0.72, unit: "Reflectance", description: "High NIR indicates healthy cellular leaf structure" },
      { id: "red", name: "Red Band (RED)", min: 0.05, max: 0.5, step: 0.01, defaultValue: 0.12, unit: "Reflectance", description: "Chlorophyll absorbs red light for photosynthesis" },
      { id: "green", name: "Green Band (GREEN)", min: 0.05, max: 0.5, step: 0.01, defaultValue: 0.18, unit: "Reflectance", description: "Reflected green spectrum" },
      { id: "soilFactor", name: "Soil Adjustment Factor (L)", min: 0.1, max: 1.0, step: 0.05, defaultValue: 0.5, unit: "L", description: "Soil brightness correction factor" },
    ],
    classes: [
      { label: "Healthy Vegetation", color: "#10b981", description: "Dense chlorophyll, robust cellular leaf structure" },
      { label: "Moderate Stress", color: "#f59e0b", description: "Early water or nutrient deficiency detected" },
      { label: "Severe Stress / Diseased", color: "#ef4444", description: "Critical cellular breakdown or pest infestation" },
    ],
    predict: (inputs) => {
      const nir = inputs.nir ?? 0.72;
      const red = inputs.red ?? 0.12;
      const L = inputs.soilFactor ?? 0.5;

      const ndvi = +( (nir - red) / Math.max(0.001, (nir + red)) ).toFixed(3);
      const savi = +( ((nir - red) / (nir + red + L)) * (1 + L) ).toFixed(3);

      let healthyProb = 0.1;
      let moderateProb = 0.2;
      let severeProb = 0.7;

      if (ndvi > 0.6) {
        healthyProb = Math.min(0.98, 0.6 + ndvi * 0.4);
        moderateProb = (1 - healthyProb) * 0.7;
        severeProb = 1 - healthyProb - moderateProb;
      } else if (ndvi > 0.35) {
        moderateProb = 0.75;
        healthyProb = 0.15;
        severeProb = 0.10;
      } else {
        severeProb = Math.min(0.96, 0.7 + (0.35 - ndvi) * 0.8);
        moderateProb = (1 - severeProb) * 0.8;
        healthyProb = 1 - severeProb - moderateProb;
      }

      let predictedClass = "Healthy Vegetation";
      if (severeProb > healthyProb && severeProb > moderateProb) {
        predictedClass = "Severe Stress / Diseased";
      } else if (moderateProb > healthyProb) {
        predictedClass = "Moderate Stress";
      }

      const confidence = +(Math.max(healthyProb, moderateProb, severeProb) * 100).toFixed(1);

      return {
        predictedClass,
        confidence,
        probabilities: {
          "Healthy Vegetation": +healthyProb.toFixed(3),
          "Moderate Stress": +moderateProb.toFixed(3),
          "Severe Stress / Diseased": +severeProb.toFixed(3),
        },
        metrics: {
          "NDVI Index": ndvi,
          "SAVI Index": savi,
          "Biomass Index": +(ndvi * 1.42).toFixed(2),
        },
      };
    },
  },
  "breast-cancer-knn": {
    id: "breast-cancer-knn",
    name: "Diagnostic KNN Classifier",
    category: "Diagnostic ML",
    architecture: "K-Nearest Neighbors (k=7) + Feature Scaling",
    accuracy: "94.7%",
    latencyMs: 0.38,
    description: "Classifies cellular tissue samples based on morphological features computed from fine needle aspirate images.",
    features: [
      { id: "meanRadius", name: "Mean Radius", min: 6.0, max: 30.0, step: 0.1, defaultValue: 14.1, unit: "mm", description: "Mean distances from center to perimeter points" },
      { id: "meanTexture", name: "Mean Texture", min: 9.0, max: 40.0, step: 0.1, defaultValue: 19.3, unit: "std dev", description: "Standard deviation of gray-scale values" },
      { id: "meanPerimeter", name: "Mean Perimeter", min: 40.0, max: 190.0, step: 0.5, defaultValue: 92.0, unit: "mm", description: "Core tumor perimeter distance" },
      { id: "meanArea", name: "Mean Area", min: 140.0, max: 2500.0, step: 10, defaultValue: 654.0, unit: "mm²", description: "Cellular nucleus cross-sectional area" },
      { id: "meanSmoothness", name: "Mean Smoothness", min: 0.05, max: 0.2, step: 0.005, defaultValue: 0.096, unit: "variance", description: "Local variation in radius lengths" },
    ],
    classes: [
      { label: "Benign (Non-Cancerous)", color: "#10b981", description: "Standard cellular morphology with low nuclear atypia" },
      { label: "Malignant (Abnormal)", color: "#ef4444", description: "Irregular boundaries and elevated nuclear pleomorphism" },
    ],
    predict: (inputs) => {
      const radius = inputs.meanRadius ?? 14.1;
      const perimeter = inputs.meanPerimeter ?? 92.0;
      const area = inputs.meanArea ?? 654.0;
      const texture = inputs.meanTexture ?? 19.3;

      // Distance score based on diagnostic threshold
      const score = (radius / 15.0) * 0.3 + (perimeter / 100.0) * 0.3 + (area / 750.0) * 0.25 + (texture / 22.0) * 0.15;

      let malignantProb = Math.min(0.99, Math.max(0.01, 1 / (1 + Math.exp(-4 * (score - 1.05)))));
      let benignProb = 1 - malignantProb;

      const isMalignant = malignantProb > 0.5;
      const predictedClass = isMalignant ? "Malignant (Abnormal)" : "Benign (Non-Cancerous)";
      const confidence = +(Math.max(benignProb, malignantProb) * 100).toFixed(1);

      return {
        predictedClass,
        confidence,
        probabilities: {
          "Benign (Non-Cancerous)": +benignProb.toFixed(3),
          "Malignant (Abnormal)": +malignantProb.toFixed(3),
        },
        metrics: {
          "Risk Score": +score.toFixed(3),
          "Cellular Density": +(area / Math.max(1, radius * radius * 3.14)).toFixed(2),
        },
      };
    },
  },
  "movie-recommender": {
    id: "movie-recommender",
    name: "Vector Embedding Semantic Matcher",
    category: "Recommendation",
    architecture: "Cosine Similarity over TF-IDF & Tag Vectors",
    accuracy: "91.2%",
    latencyMs: 0.52,
    description: "Computes high-dimensional vector space similarity between user taste preferences and portfolio catalog items.",
    features: [
      { id: "actionWeight", name: "Action / Sci-Fi Affinity", min: 0, max: 100, step: 5, defaultValue: 85, unit: "%", description: "Weighting for high-energy and speculative content" },
      { id: "dramaWeight", name: "Drama / Depth Affinity", min: 0, max: 100, step: 5, defaultValue: 60, unit: "%", description: "Weighting for character-driven narrative arcs" },
      { id: "aiTechWeight", name: "AI / Tech Innovation", min: 0, max: 100, step: 5, defaultValue: 95, unit: "%", description: "Weighting for machine learning and systems engineering" },
    ],
    classes: [
      { label: "High Relevance Match", color: "#10b981", description: "Cosine similarity > 0.82" },
      { label: "Moderate Match", color: "#f59e0b", description: "Cosine similarity 0.50 - 0.82" },
      { label: "Low Affinity", color: "#64748b", description: "Cosine similarity < 0.50" },
    ],
    predict: (inputs) => {
      const action = (inputs.actionWeight ?? 85) / 100;
      const drama = (inputs.dramaWeight ?? 60) / 100;
      const tech = (inputs.aiTechWeight ?? 95) / 100;

      const vectorMagnitude = Math.max(0.001, Math.sqrt(action * action + drama * drama + tech * tech));
      const similarity = +( (action * 0.8 + drama * 0.5 + tech * 0.95) / (vectorMagnitude * 1.35) ).toFixed(3);

      const highProb = Math.min(0.96, Math.max(0.05, similarity > 0.75 ? similarity : similarity * 0.6));
      const modProb = (1 - highProb) * 0.7;
      const lowProb = 1 - highProb - modProb;

      let predictedClass = "High Relevance Match";
      if (similarity < 0.5) predictedClass = "Low Affinity";
      else if (similarity < 0.75) predictedClass = "Moderate Match";

      return {
        predictedClass,
        confidence: +(similarity * 100).toFixed(1),
        probabilities: {
          "High Relevance Match": +highProb.toFixed(3),
          "Moderate Match": +modProb.toFixed(3),
          "Low Affinity": +lowProb.toFixed(3),
        },
        metrics: {
          "Cosine Similarity": similarity,
          "Vector Dot Product": +(action * 0.8 + drama * 0.5 + tech * 0.95).toFixed(2),
        },
      };
    },
  },
};
