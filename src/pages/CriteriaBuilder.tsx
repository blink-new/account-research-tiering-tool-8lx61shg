import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Plus, Trash2, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react'
import { Question } from '@/types'

interface CriteriaBuilderProps {
  onNext: (questions: Omit<Question, 'id' | 'companyId' | 'userId' | 'createdAt'>[]) => void
  onBack: () => void
  initialData?: Question[]
}

export function CriteriaBuilder({ onNext, onBack, initialData }: CriteriaBuilderProps) {
  const [questions, setQuestions] = useState<Omit<Question, 'id' | 'companyId' | 'userId' | 'createdAt'>[]>(
    initialData?.map(q => ({
      text: q.text,
      type: q.type,
      weight: q.weight,
      options: q.options
    })) || [
      {
        text: 'Does the company have 500+ employees?',
        type: 'boolean' as const,
        weight: 8
      }
    ]
  )

  const [newQuestion, setNewQuestion] = useState({
    text: '',
    type: 'boolean' as const,
    weight: 5,
    options: ['']
  })

  const questionTypes = [
    { value: 'boolean', label: 'Yes/No Question', description: 'Simple true/false evaluation' },
    { value: 'number', label: 'Numeric Value', description: 'Enter a number (revenue, employees, etc.)' },
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Select from predefined options' }
  ]

  const addQuestion = () => {
    if (!newQuestion.text.trim()) return

    const questionToAdd = {
      ...newQuestion,
      options: newQuestion.type === 'multiple_choice' 
        ? newQuestion.options.filter(opt => opt.trim()) 
        : undefined
    }

    setQuestions([...questions, questionToAdd])
    setNewQuestion({
      text: '',
      type: 'boolean',
      weight: 5,
      options: ['']
    })
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestionWeight = (index: number, weight: number) => {
    setQuestions(questions.map((q, i) => 
      i === index ? { ...q, weight } : q
    ))
  }

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, '']
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newQuestion.options]
    newOptions[index] = value
    setNewQuestion({ ...newQuestion, options: newOptions })
  }

  const removeOption = (index: number) => {
    if (newQuestion.options.length > 1) {
      setNewQuestion({
        ...newQuestion,
        options: newQuestion.options.filter((_, i) => i !== index)
      })
    }
  }

  const handleNext = () => {
    if (questions.length === 0) return
    onNext(questions)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boolean': return 'bg-blue-100 text-blue-800'
      case 'number': return 'bg-green-100 text-green-800'
      case 'multiple_choice': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Build Your Evaluation Criteria
        </h2>
        <p className="text-gray-600">
          Create questions to evaluate potential accounts. Each question will be weighted for scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add New Question */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>
              Create criteria to evaluate your prospects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-text">Question *</Label>
              <Textarea
                id="question-text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                placeholder="e.g., Does the company have a dedicated IT budget?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value: 'boolean' | 'number' | 'multiple_choice') => 
                  setNewQuestion({ ...newQuestion, type: value, options: value === 'multiple_choice' ? [''] : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newQuestion.type === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>Options</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {newQuestion.options.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Weight: {newQuestion.weight}/10</Label>
              <Slider
                value={[newQuestion.weight]}
                onValueChange={([value]) => setNewQuestion({ ...newQuestion, weight: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher weight = more important for scoring
              </p>
            </div>

            <Button
              onClick={addQuestion}
              disabled={!newQuestion.text.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Questions ({questions.length})</CardTitle>
            <CardDescription>
              Review and adjust your evaluation criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No questions added yet</p>
                <p className="text-sm">Add your first evaluation criteria</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{question.text}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getTypeColor(question.type)}>
                            {questionTypes.find(t => t.value === question.type)?.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Weight: {question.weight}/10
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {question.options && (
                      <div className="text-xs text-gray-600">
                        Options: {question.options.join(', ')}
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label className="text-xs">Weight: {question.weight}/10</Label>
                      <Slider
                        value={[question.weight]}
                        onValueChange={([value]) => updateQuestionWeight(index, value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <Button 
          onClick={handleNext} 
          disabled={questions.length === 0}
          className="flex items-center space-x-2"
        >
          <span>Continue to Account Evaluation</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}