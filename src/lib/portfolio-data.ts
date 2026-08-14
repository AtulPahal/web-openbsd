
/**
 * Portfolio / resume data for Atul Pahal.
 *
 * This is the single source of truth for the Portfolio and Resume apps.
 * All content is sourced from resuma.pdf and kept in sync.
 */
export interface SkillCategory {
  label: string;
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  date: string;
  links?: { label: string; href: string }[];
}

export interface Experience {
  role: string;
  organization: string;
  period: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  details?: string;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  location: string;
  phone: string;
  email: string;
  bio: string;
  skillCategories: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  interests: string[];
  social: { label: string; href: string; icon: string }[];
}

export const PORTFOLIO_DATA: PortfolioData = {
  name: "Atul Pahal",
  title: "AI/ML Engineer & Full-Stack Developer",
  location: "Sonipat, Haryana, India",
  phone: "+91-9499190701",
  email: "atulpahal@gmail.com",
  bio: `AI/ML Engineer and Full-Stack Developer building privacy-first, browser-native AI applications. Passionate about real-time inference with ONNX Runtime Web, precision agriculture with machine learning, and crafting responsive React/Next.js experiences. Experienced in Python ML stacks (TensorFlow, PyTorch, Scikit-learn), computer vision (YOLOv5), and modern web tooling (Bun, Vite, Langchain, FastAPI).`,

  skillCategories: [
    {
      label: "Languages",
      items: ["Python (Expert)", "JavaScript", "HTML/CSS", "C", "Rust"],
    },
    {
      label: "ML & Data Science",
      items: ["TensorFlow", "PyTorch", "Scikit-learn", "ONNX", "Pandas", "NumPy", "Gradio", "Matplotlib"],
    },
    {
      label: "Developer Tools",
      items: ["Neovim (LazyVim)", "Git/GitHub", "Docker", "Bun", "VS Code", "Linux", "Hugging Face"],
    },
    {
      label: "Frameworks / Web",
      items: ["Langchain", "FastAPI", "ReactJS", "NextJS", "ExpressJS", "Vite", "Streamlit"],
    },
  ],

  projects: [
    {
      id: "oculus-vision",
      title: "Oculus Vision: Real-time Object Detection",
      stack: ["YOLOv5", "ONNX Runtime Web", "Bun", "TypeScript"],
      date: "Jan 2026",
      description:
        "Architected a privacy-first vision app using YOLOv5 Nano, performing real-time inference locally in the browser via ONNX Runtime Web. Implemented support for image, video, and live webcam analysis, achieving high-frame-rate detection without server-side processing.",
      links: [
        { label: "GitHub", href: "https://github.com/atulpahal" },
      ],
    },
    {
      id: "crop-health",
      title: "AI-Based Crop Health Monitoring",
      stack: ["Python", "Random Forest", "Scikit-learn", "Pandas"],
      date: "Feb 2026",
      description:
        "Developed a Precision Agriculture model utilizing a Random Forest Classifier to monitor crop health with 92% accuracy based on multispectral vegetation indices (NDVI, SAVI, EVI). Engineered a data pipeline to analyze spectral data and generate heatmaps for identifying 'Healthy' vs. 'Stressed' zones.",
      links: [
        { label: "GitHub", href: "https://github.com/atulpahal" },
      ],
    },
    {
      id: "movie-recs",
      title: "Movie Recommender System",
      stack: ["React", "Vite", "TMDB API", "TypeScript"],
      date: "Jan 2026",
      description:
        "Developed a responsive recommendation engine utilizing vector similarity scores from a local dataset to suggest movies based on user selection. Integrated TMDB API for dynamic metadata fetching and poster rendering, optimized with Vite for fast production builds.",
      links: [
        { label: "GitHub", href: "https://github.com/atulpahal" },
      ],
    },
    {
      id: "breast-cancer",
      title: "Breast Cancer Diagnostic System",
      stack: ["Python", "Scikit-learn", "Gradio", "Pandas"],
      date: "Dec 2025",
      description:
        "Trained a K-Nearest Neighbors (KNN) classifier achieving 94.74% accuracy on medical diagnostic data through feature engineering and standard scaling. Deployed the model via an interactive Gradio web interface for real-time diagnosis prediction.",
      links: [
        { label: "GitHub", href: "https://github.com/atulpahal" },
      ],
    },
  ],

  experience: [],

  education: [
    {
      degree: "B.A. (Pursuing)",
      institution: "Maharshi Dayanand University",
      location: "Rohtak, India",
      period: "Ongoing",
    },
    {
      degree: "Class 12 (CBSE)",
      institution: "DA V Centenary Public School",
      location: "Samalkha, Panipat, Haryana",
      period: "64%",
    },
  ],

  certifications: [
    {
      name: "Specialized Program in Artificial Intelligence & Machine Learning with Drone Tech",
      issuer: "TiHAN IIT Hyderabad",
    },
    {
      name: "DCSP",
      issuer: "HARTRON",
    },
  ],

  interests: [
    "Linux Customization: Arch Linux, Hyprland, Dotfiles management, Tiling Window Managers",
    "Automation: Developing custom Python and Bash scripts for workflow optimization",
    "Open Source: Exploring SOTA ML models on GitHub and customizing Neovim (LazyVim)",
  ],

  social: [
    { label: "GitHub", href: "https://github.com/atulpahal", icon: "github" },
    { label: "LinkedIn", href: "https://linkedin.com/in/atulpahal", icon: "linkedin" },
    { label: "Email", href: "mailto:atulpahal@gmail.com", icon: "mail" },
  ],
} as const satisfies PortfolioData;

/** Convenience: all unique tech tags across projects, for the skill cloud. */
export const ALL_TECH_TAGS = Array.from(
  new Set(PORTFOLIO_DATA.projects.flatMap((p) => p.stack))
).sort();
