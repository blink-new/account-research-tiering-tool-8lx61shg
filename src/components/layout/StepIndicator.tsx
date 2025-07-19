import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: number
  title: string
  description: string
}

interface StepIndicatorProps {
  currentStep: number
  steps: Step[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.id}
                className={cn(
                  stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                  'relative'
                )}
              >
                {step.id < currentStep ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-primary" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                  </>
                ) : step.id === currentStep ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                    </div>
                  </>
                )}
                <div className="mt-3">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      step.id <= currentStep ? 'text-primary' : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </span>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}