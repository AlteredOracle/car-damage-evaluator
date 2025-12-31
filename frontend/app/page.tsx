"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, ScanSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ModelSelector from "./components/ModelSelector"; // Added import

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Damage {
  label: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] (0-1000 scale)
  score: number;
}

interface DetectionResult {
  damages: Damage[];
  source: string;
  error?: string;
  model?: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview"); // Added state

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setResult(null); // Reset previous results
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setImage(URL.createObjectURL(droppedFile));
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:8000/detect?model=${selectedModel}`, { // Updated fetch call
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Failed to connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert 0-1000 coordinates to percentages
  const getBoxStyle = (box: [number, number, number, number]) => {
    const [ymin, xmin, ymax, xmax] = box;
    return {
      top: `${(ymin / 1000) * 100}% `,
      left: `${(xmin / 1000) * 100}% `,
      height: `${((ymax - ymin) / 1000) * 100}% `,
      width: `${((xmax - xmin) / 1000) * 100}% `,
    };
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="p-6 border-b border-indigo-900/30 backdrop-blur-md bg-neutral-900/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="hover:opacity-80 transition-opacity flex items-center gap-3">
            <ScanSearch className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CarDamage<span className="font-light text-white">Evaluator</span>
            </h1>
          </a>
          <div className="flex items-center gap-4">
            <ModelSelector selectedModel={selectedModel} onSelectModel={setSelectedModel} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Upload Area */}
          {!image ? (
            <div
              className={cn(
                "border-2 border-dashed border-neutral-700 rounded-xl p-20 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:border-indigo-500/50 hover:bg-neutral-800/50 group"
              )}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-neutral-800 rounded-full mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-4">Upload Car Photo</h2>
              <p className="text-neutral-400 max-w-sm">
                Drag & drop an image here, or click to browse. Supported formats: JPG, PNG.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setImage(null);
                    setFile(null);
                    setResult(null);
                  }}
                  className="text-sm text-neutral-400 hover:text-white underline"
                >
                  Upload different photo
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyzeImage}
                  disabled={loading}
                  className={cn(
                    "px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all",
                    loading
                      ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <ScanSearch className="w-4 h-4" /> Detect Damage
                    </>
                  )}
                </motion.button>
              </div>

              {/* Image & Results Container */}
              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-black">
                {/* Main Image */}
                <img
                  src={image}
                  alt="Car Preview"
                  className="w-full object-contain max-h-[600px] opacity-90"
                />

                {/* Scanning Animation */}
                {loading && (
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)] z-10"
                  />
                )}

                {/* Bounding Boxes */}
                <AnimatePresence>
                  {result &&
                    result.damages.map((damage, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        style={getBoxStyle(damage.box_2d)}
                        className="absolute border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] group cursor-help"
                      >
                        {/* Label Badge */}
                        <div className="absolute -top-7 left-0 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          {damage.label} ({Math.round(damage.score * 100)}%)
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {/* Results List */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-800"
                >
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" /> Analysis Complete
                  </h4>
                  {result.damages.length === 0 ? (
                    <p className="text-neutral-400">No significant damage detected.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.damages.map((d, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-white">{d.label}</p>
                            <p className="text-xs text-neutral-500">Confidence: {Math.round(d.score * 100)}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500">
                    Analysis Source: {result.source === "gemini" ? `AI Model (${result.model})` : "Simulated (Demo Mode)"}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

