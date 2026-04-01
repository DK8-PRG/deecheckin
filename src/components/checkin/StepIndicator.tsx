"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  readonly steps: string[];
  readonly currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Check-in progress" className="mb-8">
      <ol className="flex items-center w-full">
        {steps.map((label, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={label}
              className={`flex items-center ${isLast ? "" : "flex-1"}`}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Circle */}
                <div
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold
                    transition-all duration-300
                    ${isCompleted ? "bg-green-500 text-white shadow-sm shadow-green-200" : ""}
                    ${isCurrent ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-primary/10" : ""}
                    ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
                  `}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </div>
                {/* Label */}
                <span
                  className={`
                    text-xs font-medium text-center max-w-[80px] leading-tight
                    transition-colors duration-200
                    ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                  `}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-3 mb-6">
                  <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "w-full bg-green-500" : "w-0 bg-primary"
                      }`}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
