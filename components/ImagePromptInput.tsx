"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { Input } from "./ui/input";

interface ImagePromptInputProps {
  onSubmit: (prompt: string) => void;
  isEditing: boolean;
  isLoading: boolean;
}

export function ImagePromptInput({
  onSubmit,
  isEditing,
  isLoading,
}: ImagePromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isEditing
                ? "Describe how you want to edit the image"
                : "Describe the image you want to generate"}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-4">
            Be specific and detailed for best results
          </p>
        </div>

        <div className="relative">
          <Input
            id="prompt"
            className="min-h-[60px] px-4 py-3 text-base border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder={
              isEditing
                ? "Example: Make the background blue and add a rainbow..."
                : "Example: A 3D rendered image of a pig with wings and a top hat flying over a futuristic city..."
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-400 dark:text-slate-500">
            {prompt.length}/500
          </div>
        </div>

        <Button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center justify-center space-x-2">
            <Wand2 className={`w-5 h-5 transition-transform duration-200 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12'}`} />
            <span>{isEditing ? "Edit Image" : "Generate Image"}</span>
          </div>
        </Button>
      </form>
    </div>
  );
}
