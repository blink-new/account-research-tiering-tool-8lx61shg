import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { StepIndicator } from '@/components/layout/StepIndicator'
import { CompanySetup } from '@/pages/CompanySetup'
import { CriteriaBuilder } from '@/pages/CriteriaBuilder'
import { AccountEvaluation } from '@/pages/AccountEvaluation'
import { Results } from '@/pages/Results'
import { blink } from '@/blink/client'
import { Company, Question, Account, AccountAnswer } from '@/types'

const steps = [
  { id: 1, title: 'Company Setup', description: 'Tell us about your business' },
  { id: 2, title: 'Criteria Builder', description: 'Create evaluation questions' },
  { id: 3, title: 'Account Evaluation', description: 'Add and evaluate accounts' },
  { id: 4, title: 'Results & Tiering', description: 'View ranked results' }
]

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Data state
  const [company, setCompany] = useState<Company | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [answers, setAnswers] = useState<AccountAnswer[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Research & Tiering Tool
          </h1>
          <p className="text-gray-600 mb-6">
            Evaluate and rank potential accounts based on customizable criteria to identify your top qualified leads.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    )
  }

  const handleCompanyNext = (companyData: Omit<Company, 'id' | 'userId' | 'createdAt'>) => {
    const newCompany: Company = {
      id: `company_${Date.now()}`,
      ...companyData,
      userId: user.id,
      createdAt: new Date().toISOString()
    }
    setCompany(newCompany)
    setCurrentStep(2)
  }

  const handleCriteriaNext = (questionsData: Omit<Question, 'id' | 'companyId' | 'userId' | 'createdAt'>[]) => {
    const newQuestions: Question[] = questionsData.map((q, index) => ({
      id: `question_${Date.now()}_${index}`,
      ...q,
      companyId: company?.id || '',
      userId: user.id,
      createdAt: new Date().toISOString()
    }))
    setQuestions(newQuestions)
    setCurrentStep(3)
  }

  const handleEvaluationNext = (accountsData: Account[], answersData: AccountAnswer[]) => {
    setAccounts(accountsData)
    setAnswers(answersData)
    setCurrentStep(4)
  }

  const handleStartOver = () => {
    setCompany(null)
    setQuestions([])
    setAccounts([])
    setAnswers([])
    setCurrentStep(1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentStep={currentStep} totalSteps={steps.length} />
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      <main className="pb-12">
        {currentStep === 1 && (
          <CompanySetup 
            onNext={handleCompanyNext}
            initialData={company || undefined}
          />
        )}
        
        {currentStep === 2 && (
          <CriteriaBuilder
            onNext={handleCriteriaNext}
            onBack={handleBack}
            initialData={questions}
          />
        )}
        
        {currentStep === 3 && (
          <AccountEvaluation
            questions={questions}
            onNext={handleEvaluationNext}
            onBack={handleBack}
            initialAccounts={accounts}
            initialAnswers={answers}
          />
        )}
        
        {currentStep === 4 && (
          <Results
            accounts={accounts}
            questions={questions}
            answers={answers}
            onBack={handleBack}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  )
}

export default App