"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ModelSelectorProps {
    onSelectModel: (model: string) => void;
    selectedModel: string;
}

export default function ModelSelector({ onSelectModel, selectedModel }: ModelSelectorProps) {
    const [models, setModels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchModels() {
            try {
                const res = await fetch("http://localhost:8000/models");
                if (res.ok) {
                    const data = await res.json();
                    setModels(data.models);
                    // If the currently selected model isn't in the list, select the first one
                    if (data.models.length > 0 && !data.models.includes(selectedModel)) {
                        // Don't override if user already selected something valid, 
                        // but if init state is empty or invalid, set it.
                        // Actually, let's just stick to the passed selectedModel unless it's empty
                        if (!selectedModel) onSelectModel(data.models[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch models", error);
                // Fallback list if offline or error
                setModels(["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-1.5-flash"]);
            } finally {
                setLoading(false);
            }
        }

        fetchModels();
    }, [selectedModel, onSelectModel]);

    return (
        <div className="relative inline-block text-left w-48">
            <div className="relative">
                <select
                    value={selectedModel}
                    onChange={(e) => onSelectModel(e.target.value)}
                    disabled={loading}
                    className="block w-full pl-3 pr-8 py-1.5 text-sm border border-white/10 bg-black/20 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                >
                    {models.map((m) => (
                        <option key={m} value={m} className="bg-gray-900 text-white">
                            {m}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>
            {loading && <p className="text-xs text-gray-500 mt-1">Loading models...</p>}
        </div>
    );
}
