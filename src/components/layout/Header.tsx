import { Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { blink } from '@/blink/client'

interface HeaderProps {
  currentStep: number
  totalSteps: number
}

export function Header({ currentStep, totalSteps }: HeaderProps) {
  const handleLogout = () => {
    blink.auth.logout()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Account Research & Tiering Tool
            </h1>
            <p className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Welcome back</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}