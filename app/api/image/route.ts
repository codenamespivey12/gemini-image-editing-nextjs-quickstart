import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { HistoryItem, HistoryPart } from "@/lib/types";

// Initialize the Google Gen AI client with your API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Define the model ID for Gemini 2.0 Flash experimental
const MODEL_ID = "gemini-2.0-flash-exp-image-generation";

// Define interface for the formatted history item
interface FormattedHistoryItem {
  role: "user" | "model";
  parts: Array<{
    text?: string;
    inlineData?: { data: string; mimeType: string };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    // Make sure we have the required API keys configured
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Parse JSON request
    const requestData = await req.json().catch((err) => {
      console.error("Failed to parse JSON body:", err);
      return null;
    });
    
    if (!requestData) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { prompt, image: inputImage, history, model = "fast" } = requestData;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Validate the image if provided
    if (inputImage) {
      if (typeof inputImage !== "string" || !inputImage.startsWith("data:")) {
        console.error("Invalid image data URL format", { inputImage });
        return NextResponse.json(
          { success: false, error: "Invalid image data URL format" },
          { status: 400 }
        );
      }
      const imageParts = inputImage.split(",");
      if (imageParts.length < 2) {
        console.error("Malformed image data URL", { inputImage });
        return NextResponse.json(
          { success: false, error: "Malformed image data URL" },
          { status: 400 }
        );
      }
      const base64Image = imageParts[1];
      // Check for non-empty and valid base64 (basic check)
      if (!base64Image || !/^([A-Za-z0-9+/=]+)$/.test(base64Image.replace(/\s/g, ""))) {
        console.error("Image data is empty or not valid base64", { base64Image });
        return NextResponse.json(
          { success: false, error: "Image data is empty or not valid base64" },
          { status: 400 }
        );
      }
    }

    try {
      let textResponse = null;
      let imageData = null;
      let mimeType = "image/png";

      if (model === "hq") {
        // OpenAI GPT-Image-1 implementation
        console.log("Uses our stronger model which is slower but provides better results");

        // Prepare input for OpenAI Responses API
        const inputContent = [];

        // Add text prompt
        inputContent.push({
          type: "input_text",
          text: prompt
        });

        // Add image if provided
        if (inputImage) {
          inputContent.push({
            type: "input_image",
            image_url: inputImage
          });
        }

        const openaiResponse = await openai.responses.create({
          model: "gpt-4.1",
          input: [{
            role: "user",
            content: inputContent
          }],
          tools: [{
            type: "image_generation",
            quality: "high",
            moderation: "low"
          }]
        });

        // Process OpenAI response
        const imageGenerationCalls = openaiResponse.output.filter(
          (output) => (output as { type: string }).type === "image_generation_call"
        );

        if (imageGenerationCalls.length > 0) {
          const call = imageGenerationCalls[0] as { result: string; revised_prompt?: string };
          imageData = call.result;
          textResponse = call.revised_prompt || null;
          mimeType = "image/png";
        }
      } else {
        // Gemini implementation (existing logic)
        console.log("Uses our faster model for instant generation and edits");

        // Convert history to the format expected by Gemini API
        const formattedHistory =
          history && history.length > 0
            ? history
                .map((item: HistoryItem) => {
                  return {
                    role: item.role,
                    parts: item.parts
                      .map((part: HistoryPart) => {
                        if (part.text) {
                          return { text: part.text };
                        }
                        if (part.image && item.role === "user") {
                          const imgParts = part.image.split(",");
                          if (imgParts.length > 1) {
                            return {
                              inlineData: {
                                data: imgParts[1],
                                mimeType: part.image.includes("image/png")
                                  ? "image/png"
                                  : "image/jpeg",
                              },
                            };
                          }
                        }
                        return { text: "" };
                      })
                      .filter((part) => Object.keys(part).length > 0), // Remove empty parts
                  };
                })
                .filter((item: FormattedHistoryItem) => item.parts.length > 0) // Remove items with no parts
            : [];

        // Prepare the current message parts
        const messageParts = [];

        // Add the text prompt
        messageParts.push({ text: prompt });

        // Add the image if provided
        if (inputImage) {
          // For image editing
          console.log("Processing image edit request");

          // Check if the image is a valid data URL
          if (!inputImage.startsWith("data:")) {
            throw new Error("Invalid image data URL format");
          }

          const imageParts = inputImage.split(",");
          if (imageParts.length < 2) {
            throw new Error("Invalid image data URL format");
          }

          const base64Image = imageParts[1];
          const imageMimeType = inputImage.includes("image/png")
            ? "image/png"
            : "image/jpeg";
          console.log(
            "Base64 image length:",
            base64Image.length,
            "MIME type:",
            imageMimeType
          );

          // Add the image to message parts
          messageParts.push({
            inlineData: {
              data: base64Image,
              mimeType: imageMimeType,
            },
          });
        }
        // Add the message parts to the history
        formattedHistory.push(messageParts);

        // Generate the content
        const geminiResponse = await ai.models.generateContent({
          model: MODEL_ID,
          contents: formattedHistory,
          config: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            responseModalities: ["Text", "Image"],
          },
        });

        // Process Gemini response
        if (geminiResponse.candidates && geminiResponse.candidates.length > 0) {
          const parts = geminiResponse.candidates[0].content.parts;
          console.log("Number of parts in response:", parts.length);

          for (const part of parts) {
            if ("inlineData" in part && part.inlineData) {
              // Get the image data
              imageData = part.inlineData.data;
              mimeType = part.inlineData.mimeType || "image/png";
              console.log(
                "Image data received, length:",
                imageData?.length || 0,
                "MIME type:",
                mimeType
              );
            } else if ("text" in part && part.text) {
              // Store the text
              textResponse = part.text;
              console.log(
                "Text response received:",
                textResponse.substring(0, 50) + "..."
              );
            }
          }
        } else {
          console.error("No response from Gemini API", { geminiResponse });
          return NextResponse.json(
            { success: false, error: "No response from Gemini API" },
            { status: 500 }
          );
        }
      }

      if (!imageData) {
        console.error("No image data in API response");
        return NextResponse.json(
          { success: false, error: "No image data in API response" },
          { status: 500 }
        );
      }

      // Return the base64 image and description as JSON
      return NextResponse.json({
        success: true,
        image: `data:${mimeType};base64,${imageData}`,
        description: textResponse || null
      });
    } catch (error) {
      console.error("Error generating image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error in AI processing";
      return NextResponse.json(
        { success: false, error: "AI API error", details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate image",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
