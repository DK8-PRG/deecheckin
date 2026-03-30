"use client";

import { CheckCircle2 } from "lucide-react";

interface StepIndicatorProps {
  readonly steps: string[];
  readonly currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                  transition-colors duration-200
                  ${isCompleted ? "bg-green-500 text-white" : ""}
                  ${isCurrent ? "bg-primary text-white ring-2 ring-primary/30" : ""}
                  ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={`
                  mt-1.5 text-xs font-medium text-center max-w-[80px] leading-tight
                  ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                `}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 mt-[-1rem]
                  ${isCompleted ? "bg-green-500" : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
