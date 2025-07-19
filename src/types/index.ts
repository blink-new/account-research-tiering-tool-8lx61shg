export interface Company {
  id: string
  name: string
  description: string
  industry: string
  targetMarket: string
  userId: string
  createdAt: string
}

export interface Question {
  id: string
  text: string
  type: 'boolean' | 'number' | 'multiple_choice'
  weight: number
  options?: string[]
  companyId: string
  userId: string
  createdAt: string
}

export interface Account {
  id: string
  name: string
  industry: string
  companySize: string
  revenue: string
  location: string
  website?: string
  notes?: string
  userId: string
  createdAt: string
}

export interface AccountAnswer {
  id: string
  accountId: string
  questionId: string
  answer: string | number | boolean
  userId: string
  createdAt: string
}

export interface AccountScore {
  accountId: string
  totalScore: number
  maxScore: number
  percentage: number
  tier: 'A' | 'B' | 'C' | 'D'
  rank: number
}

export interface EvaluationResult {
  account: Account
  score: AccountScore
  answers: AccountAnswer[]
}