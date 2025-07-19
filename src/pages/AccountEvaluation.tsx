import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Plus, Trash2, ArrowRight, ArrowLeft, Users, Building, Sparkles, ExternalLink } from 'lucide-react'
import { Account, Question, AccountAnswer } from '@/types'

interface AccountEvaluationProps {
  questions: Question[]
  onNext: (accounts: Account[], answers: AccountAnswer[]) => void
  onBack: () => void
  initialAccounts?: Account[]
  initialAnswers?: AccountAnswer[]
  aiRecommendations?: {
    criteria: Array<{ question: string; type: string; weight: number; options?: string[] }>
    prospects: Array<{ company: string; reason: string; industry: string; website?: string }>
  }
}

export function AccountEvaluation({ 
  questions, 
  onNext, 
  onBack, 
  initialAccounts = [], 
  initialAnswers = [],
  aiRecommendations
}: AccountEvaluationProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts)
  const [answers, setAnswers] = useState<Record<string, Record<string, any>>>(
    initialAnswers.reduce((acc, answer) => {
      if (!acc[answer.accountId]) acc[answer.accountId] = {}
      acc[answer.accountId][answer.questionId] = answer.answer
      return acc
    }, {} as Record<string, Record<string, any>>)
  )
  
  const [newAccount, setNewAccount] = useState({
    name: '',
    industry: '',
    companySize: '',
    revenue: '',
    location: '',
    website: '',
    notes: ''
  })

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0)
  const [showAddAccount, setShowAddAccount] = useState(accounts.length === 0)

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ]

  const revenueRanges = [
    'Under $1M',
    '$1M - $10M',
    '$10M - $50M',
    '$50M - $100M',
    '$100M - $500M',
    '$500M+'
  ]

  const addAccount = () => {
    if (!newAccount.name.trim()) return

    const account: Account = {
      id: `account_${Date.now()}`,
      ...newAccount,
      userId: 'current_user',
      createdAt: new Date().toISOString()
    }

    setAccounts([...accounts, account])
    setNewAccount({
      name: '',
      industry: '',
      companySize: '',
      revenue: '',
      location: '',
      website: '',
      notes: ''
    })
    setShowAddAccount(false)
  }

  const addRecommendedProspect = (prospect: any) => {
    const account: Account = {
      id: `account_${Date.now()}`,
      name: prospect.company,
      industry: prospect.industry,
      companySize: '',
      revenue: '',
      location: '',
      website: prospect.website || '',
      notes: `AI Recommended: ${prospect.reason}`,
      userId: 'current_user',
      createdAt: new Date().toISOString()
    }

    setAccounts([...accounts, account])
  }

  const removeAccount = (index: number) => {
    const accountToRemove = accounts[index]
    setAccounts(accounts.filter((_, i) => i !== index))
    
    // Remove answers for this account
    const newAnswers = { ...answers }
    delete newAnswers[accountToRemove.id]
    setAnswers(newAnswers)
    
    // Adjust current index if needed
    if (currentAccountIndex >= accounts.length - 1) {
      setCurrentAccountIndex(Math.max(0, accounts.length - 2))
    }
  }

  const updateAnswer = (accountId: string, questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [questionId]: answer
      }
    }))
  }

  const renderQuestionInput = (question: Question, accountId: string) => {
    const currentAnswer = answers[accountId]?.[question.id]

    switch (question.type) {
      case 'boolean':
        return (
          <RadioGroup
            value={currentAnswer?.toString()}
            onValueChange={(value) => updateAnswer(accountId, question.id, value === 'true')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${accountId}-${question.id}-yes`} />
              <Label htmlFor={`${accountId}-${question.id}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${accountId}-${question.id}-no`} />
              <Label htmlFor={`${accountId}-${question.id}-no`}>No</Label>
            </div>
          </RadioGroup>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={currentAnswer || ''}
            onChange={(e) => updateAnswer(accountId, question.id, parseFloat(e.target.value) || 0)}
            placeholder="Enter number"
          />
        )

      case 'multiple_choice':
        return (
          <Select
            value={currentAnswer || ''}
            onValueChange={(value) => updateAnswer(accountId, question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  const getCompletionStatus = () => {
    const totalQuestions = accounts.length * questions.length
    let answeredQuestions = 0

    accounts.forEach(account => {
      questions.forEach(question => {
        if (answers[account.id]?.[question.id] !== undefined) {
          answeredQuestions++
        }
      })
    })

    return { total: totalQuestions, answered: answeredQuestions }
  }

  const handleNext = () => {
    const accountAnswers: AccountAnswer[] = []
    
    accounts.forEach(account => {
      questions.forEach(question => {
        const answer = answers[account.id]?.[question.id]
        if (answer !== undefined) {
          accountAnswers.push({
            id: `answer_${account.id}_${question.id}`,
            accountId: account.id,
            questionId: question.id,
            answer,
            userId: 'current_user',
            createdAt: new Date().toISOString()
          })
        }
      })
    })

    onNext(accounts, accountAnswers)
  }

  const completion = getCompletionStatus()
  const isComplete = completion.answered === completion.total && completion.total > 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Evaluate Your Accounts
        </h2>
        <p className="text-gray-600">
          Add accounts and answer your criteria questions for each one.
        </p>
        {completion.total > 0 && (
          <div className="mt-4">
            <Badge variant={isComplete ? "default" : "secondary"}>
              {completion.answered}/{completion.total} questions answered
            </Badge>
          </div>
        )}
      </div>

      {/* AI Recommended Prospects */}
      {aiRecommendations?.prospects && aiRecommendations.prospects.length > 0 && (
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-green-600" />
              <span>AI-Recommended Prospects</span>
            </CardTitle>
            <CardDescription>
              Companies that might be good fits based on your business analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiRecommendations.prospects.map((prospect, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{prospect.company}</h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        {prospect.industry}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => addRecommendedProspect(prospect)}
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:text-green-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{prospect.reason}</p>
                  {prospect.website && (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Visit website</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Accounts ({accounts.length})</span>
              <Button
                size="sm"
                onClick={() => setShowAddAccount(true)}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showAddAccount && (
              <div className="space-y-4 p-4 border rounded-lg mb-4">
                <h4 className="font-medium">Add New Account</h4>
                <div className="space-y-3">
                  <Input
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="Company name *"
                  />
                  <Input
                    value={newAccount.industry}
                    onChange={(e) => setNewAccount({ ...newAccount, industry: e.target.value })}
                    placeholder="Industry"
                  />
                  <Select
                    value={newAccount.companySize}
                    onValueChange={(value) => setNewAccount({ ...newAccount, companySize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={newAccount.revenue}
                    onValueChange={(value) => setNewAccount({ ...newAccount, revenue: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newAccount.location}
                    onChange={(e) => setNewAccount({ ...newAccount, location: e.target.value })}
                    placeholder="Location"
                  />
                  <Input
                    value={newAccount.website}
                    onChange={(e) => setNewAccount({ ...newAccount, website: e.target.value })}
                    placeholder="Website"
                  />
                  <Textarea
                    value={newAccount.notes}
                    onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                    placeholder="Notes"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={addAccount}
                    disabled={!newAccount.name.trim()}
                    size="sm"
                  >
                    Add Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddAccount(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentAccountIndex === index
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentAccountIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{account.name}</h4>
                      <p className="text-xs text-gray-500">{account.industry}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAccount(index)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account Details & Questions */}
        <div className="lg:col-span-2">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts added</h3>
                <p className="text-gray-500 mb-4">Add your first account to start evaluation</p>
                <Button onClick={() => setShowAddAccount(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Current Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>{accounts[currentAccountIndex]?.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {accounts[currentAccountIndex]?.industry} • {accounts[currentAccountIndex]?.companySize}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Revenue:</span> {accounts[currentAccountIndex]?.revenue || 'Not specified'}
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span> {accounts[currentAccountIndex]?.location || 'Not specified'}
                    </div>
                    {accounts[currentAccountIndex]?.website && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Website:</span> {accounts[currentAccountIndex].website}
                      </div>
                    )}
                    {accounts[currentAccountIndex]?.notes && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Notes:</span> {accounts[currentAccountIndex].notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Questions</CardTitle>
                  <CardDescription>
                    Answer each question for {accounts[currentAccountIndex]?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {questions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Label className="text-sm font-medium">{question.text}</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                Weight: {question.weight}/10
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {question.type === 'boolean' ? 'Yes/No' : 
                                 question.type === 'number' ? 'Number' : 'Multiple Choice'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {renderQuestionInput(question, accounts[currentAccountIndex]?.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={!isComplete}
          className="flex items-center space-x-2"
        >
          <span>View Results & Tiering</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}