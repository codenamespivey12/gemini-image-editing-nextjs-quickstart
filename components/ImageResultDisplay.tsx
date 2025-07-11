"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";
import { HistoryItem, HistoryPart } from "@/lib/types";

interface ImageResultDisplayProps {
  imageUrl: string;
  description: string | null;
  onReset: () => void;
  conversationHistory?: HistoryItem[];
}

export function ImageResultDisplay({
  imageUrl,
  description,
  onReset,
  conversationHistory = [],
}: ImageResultDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="space-y-6">
      {/* Header with title and action buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Generated Image
            </h2>
          </div>
        </div>

        {/* Action buttons - more prominent layout */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Primary action - Start Over */}
          <Button
            onClick={onReset}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Image
          </Button>

          {/* Secondary actions */}
          <div className="flex gap-2 flex-1">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            {conversationHistory.length > 0 && (
              <Button
                variant="outline"
                onClick={toggleHistory}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200 flex-1"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {showHistory ? "Hide" : "History"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 border border-slate-200 dark:border-slate-600 shadow-xl">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-2 shadow-inner">
            <Image
              src={imageUrl}
              alt={description || "Generated image"}
              width={640}
              height={480}
              className="max-w-full h-auto mx-auto rounded-lg"
              unoptimized
            />
          </div>
        </div>
      </div>

      {description && (
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}

      {showHistory && conversationHistory.length > 0 && (
        <div className="p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-4">Conversation History</h3>
          <div className="space-y-4">
            {conversationHistory.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg bg-secondary`}>
                <p
                  className={`text-sm font-medium mb-2 ${
                    item.role === "user" ? "text-foreground" : "text-primary"
                  }`}
                >
                  {item.role === "user" ? "You" : "sixtyoneeighty"}
                </p>
                <div className="space-y-2">
                  {item.parts.map((part: HistoryPart, partIndex) => (
                    <div key={partIndex}>
                      {part.text && <p className="text-sm">{part.text}</p>}
                      {part.image && (
                        <div className="mt-2 overflow-hidden rounded-md">
                          <Image
                            src={part.image}
                            alt={`Image shared by ${item.role}`}
                            width={256}
                            height={192}
                            className="max-w-[16rem] h-auto object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
