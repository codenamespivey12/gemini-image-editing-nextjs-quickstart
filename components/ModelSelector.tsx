"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Zap, Crown } from "lucide-react";

export type ModelType = "fast" | "hq";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-purple-500 rounded-full"></div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Model Selection</h3>
        </div>
        <RadioGroup
          value={selectedModel}
          onValueChange={(value) => onModelChange(value as ModelType)}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="relative">
            <RadioGroupItem value="fast" id="fast" className="peer sr-only" />
            <Label
              htmlFor="fast"
              className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedModel === "fast"
                  ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg shadow-yellow-500/20"
                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-yellow-300 dark:hover:border-yellow-600 hover:shadow-md"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                selectedModel === "fast"
                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                  : "bg-slate-100 dark:bg-slate-700"
              }`}>
                <Zap className={`w-5 h-5 ${
                  selectedModel === "fast"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-slate-600 dark:text-slate-400"
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Fast</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Quick generation & editing • Instant results
                </div>
              </div>
              {selectedModel === "fast" && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </Label>
          </div>

          <div className="relative">
            <RadioGroupItem value="hq" id="hq" className="peer sr-only" />
            <Label
              htmlFor="hq"
              className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedModel === "hq"
                  ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20"
                  : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                selectedModel === "hq"
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-slate-100 dark:bg-slate-700"
              }`}>
                <Crown className={`w-5 h-5 ${
                  selectedModel === "hq"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-slate-600 dark:text-slate-400"
                }`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">High Quality</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Premium model • Superior generation & editing
                </div>
              </div>
              {selectedModel === "hq" && (
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              )}
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
