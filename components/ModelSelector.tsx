"use client";

import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Model Selection</h3>
          <RadioGroup
            value={selectedModel}
            onValueChange={(value) => onModelChange(value as ModelType)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fast" id="fast" />
              <Label
                htmlFor="fast"
                className="flex items-center space-x-2 cursor-pointer flex-1 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                <div className="flex-1">
                  <div className="font-medium">Fast</div>
                  <div className="text-xs text-muted-foreground">
                    Our fast model for instant generations and edits - Quick generation
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hq" id="hq" />
              <Label
                htmlFor="hq"
                className="flex items-center space-x-2 cursor-pointer flex-1 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <Crown className="w-4 h-4 text-purple-500" />
                <div className="flex-1">
                  <div className="font-medium">HQ</div>
                  <div className="text-xs text-muted-foreground">
                    Uses a stronger model - slower but higher quality
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
