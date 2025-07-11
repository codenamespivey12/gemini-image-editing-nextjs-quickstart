"use client";
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePromptInput } from "@/components/ImagePromptInput";
import { ImageResultDisplay } from "@/components/ImageResultDisplay";
import { ModelSelector, ModelType } from "@/components/ModelSelector";
import { ImageIcon, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HistoryItem } from "@/lib/types";
import Image from "next/image";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelType>("fast");

  const handleImageSelect = (imageData: string) => {
    console.log("handleImageSelect called with:", {
      hasData: !!imageData,
      dataLength: imageData?.length || 0,
      dataPrefix: imageData?.substring(0, 50) || "none"
    });

    // If empty string, clear everything
    if (!imageData || imageData.trim() === "") {
      console.log("Clearing image data");
      setImage(null);
      setGeneratedImage(null);
      setDescription(null);
      setHistory([]);
      return;
    }

    // Set the image data
    setImage(imageData);

    // If we have valid image data, create a placeholder generated image
    // This will trigger the UI to show the edit screen
    console.log("Setting up edit mode for uploaded image");

    // Set a temporary description to indicate the image was uploaded
    setDescription("Your uploaded image is ready to edit. Enter a prompt to describe the changes you want to make.");

    // Set the uploaded image as the "generated" image to display in the edit view
    setGeneratedImage(imageData);

    // Create initial history entry to establish the uploaded image in conversation context
    // This mimics what happens when an image is generated from text
    const initialUserMessage: HistoryItem = {
      role: "user",
      parts: [
        { text: "I have uploaded an image that I would like to edit." },
        { image: imageData }
      ],
    };

    const initialAiResponse: HistoryItem = {
      role: "model",
      parts: [
        { text: "I can see your uploaded image. Please describe what changes you'd like me to make." },
        { image: imageData }
      ],
    };

    // Set the initial history to establish context
    setHistory([initialUserMessage, initialAiResponse]);
  };

  const handlePromptSubmit = async (prompt: string) => {
    try {
      setLoading(true);
      setError(null);

      // If we have a generated image, use that for editing, otherwise use the uploaded image
      const imageToEdit = generatedImage || image;

      console.log("Debug - Image editing:", {
        hasGeneratedImage: !!generatedImage,
        hasUploadedImage: !!image,
        imageToEditLength: imageToEdit?.length || 0,
        imageToEditPrefix: imageToEdit?.substring(0, 50) || "none",
        historyLength: history.length,
        selectedModel
      });

      // Prepare the request data as JSON
      const requestData = {
        prompt,
        image: imageToEdit,
        history: history.length > 0 ? history : undefined,
        model: selectedModel,
      };

      const response = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Image too large. Please try a smaller image or the compression failed.");
        }

        let errorMessage = "Failed to generate image";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.image) {
        // Update the generated image and description
        setGeneratedImage(data.image);
        setDescription(data.description || null);

        // Update history locally - add user message
        const userMessage: HistoryItem = {
          role: "user",
          parts: [
            { text: prompt },
            ...(imageToEdit ? [{ image: imageToEdit }] : []),
          ],
        };

        // Add AI response
        const aiResponse: HistoryItem = {
          role: "model",
          parts: [
            ...(data.description ? [{ text: data.description }] : []),
            ...(data.image ? [{ image: data.image }] : []),
          ],
        };

        // Update history with both messages
        setHistory((prevHistory) => [...prevHistory, userMessage, aiResponse]);
      } else {
        setError("No image returned from API");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Error processing request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setGeneratedImage(null);
    setDescription(null);
    setLoading(false);
    setError(null);
    setHistory([]);
  };

  // If we have a generated image, we want to edit it next time
  const currentImage = generatedImage || image;
  const isEditing = !!currentImage;

  // Get the latest image to display (either generated or uploaded)
  const displayImage = generatedImage;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-4xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 animate-fade-in">
          <CardHeader className={`text-center space-y-6 ${displayImage ? 'pb-4' : 'pb-8'}`}>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-2xl shadow-xl border border-white/20 dark:border-slate-600/50 backdrop-blur-sm">
                  <Image
                    src="/logo.png"
                    alt="sixtyoneeighty Logo"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent">
                  sixtyoneeighty image studio
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                  {displayImage ? "Continue editing your image" : "Upload an image to edit, or generate a new one"}
                </p>
              </div>
            </div>

            {/* Breadcrumb-style navigation when editing */}
            {displayImage && (
              <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Create</span>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Edit</span>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <span className="text-slate-400">Refine</span>
              </div>
            )}

            {!displayImage && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    💡 Quick Start Guide
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Upload an image to edit it with AI, or skip uploading to generate a brand new image from text
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center space-x-3 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300">
                Powered by sixtyoneeighty
              </span>
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800 animate-slide-up">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {!displayImage && !loading ? (
              <div className="space-y-8 animate-slide-up">
                {/* Option 1: Upload to Edit */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Upload an Image to Edit
                    </h3>
                  </div>
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    currentImage={currentImage}
                  />
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      OR
                    </span>
                  </div>
                </div>

                {/* Option 2: Generate from Text */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-bold">
                      2
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                      Generate a New Image from Text
                    </h3>
                  </div>
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                  <ImagePromptInput
                    onSubmit={handlePromptSubmit}
                    isEditing={isEditing}
                    isLoading={loading}
                  />
                </div>
              </div>
            ) : loading ? (
              <div
                role="status"
                className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-in"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-medium text-slate-700 dark:text-slate-300">Creating your image...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">This may take a few moments</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-slide-up">
                {/* Back to Start Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Editing Mode • Choose your AI model and describe changes
                      </span>
                    </div>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="bg-white/80 dark:bg-slate-800/80 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Start
                    </Button>
                  </div>
                </div>

                <ImageResultDisplay
                  imageUrl={displayImage || ""}
                  description={description}
                  onReset={handleReset}
                  conversationHistory={history}
                />

                {/* Model selector for editing */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Choose AI Model for Editing
                    </h3>
                  </div>
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                  />
                </div>

                <ImagePromptInput
                  onSubmit={handlePromptSubmit}
                  isEditing={true}
                  isLoading={loading}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
