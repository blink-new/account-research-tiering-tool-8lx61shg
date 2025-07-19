import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Trophy, Medal, Award, ArrowLeft, Download, RefreshCw } from 'lucide-react'
import { Account, Question, AccountAnswer, AccountScore, EvaluationResult } from '@/types'

interface ResultsProps {
  accounts: Account[]
  questions: Question[]
  answers: AccountAnswer[]
  onBack: () => void
  onStartOver: () => void
}

export function Results({ accounts, questions, answers, onBack, onStartOver }: ResultsProps) {
  const [results, setResults] = useState<EvaluationResult[]>([])

  const calculateScores = useCallback(() => {
    const evaluationResults: EvaluationResult[] = []

    accounts.forEach(account => {
      const accountAnswers = answers.filter(answer => answer.accountId === account.id)
      let totalScore = 0
      let maxScore = 0

      questions.forEach(question => {
        const answer = accountAnswers.find(a => a.questionId === question.id)
        maxScore += question.weight

        if (answer) {
          let score = 0
          
          switch (question.type) {
            case 'boolean':
              score = answer.answer === true ? question.weight : 0
              break
            case 'number':
              // For numbers, we'll use a simple scoring: if > 0, give full weight
              // In a real app, you might want more sophisticated scoring
              score = (answer.answer as number) > 0 ? question.weight : 0
              break
            case 'multiple_choice':
              // For multiple choice, we'll give full weight if answered
              // In a real app, you might want to score different options differently
              score = answer.answer ? question.weight : 0
              break
          }
          
          totalScore += score
        }
      })

      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
      
      let tier: 'A' | 'B' | 'C' | 'D'
      if (percentage >= 80) tier = 'A'
      else if (percentage >= 60) tier = 'B'
      else if (percentage >= 40) tier = 'C'
      else tier = 'D'

      const accountScore: AccountScore = {
        accountId: account.id,
        totalScore,
        maxScore,
        percentage,
        tier,
        rank: 0 // Will be set after sorting
      }

      evaluationResults.push({
        account,
        score: accountScore,
        answers: accountAnswers
      })
    })

    // Sort by score and assign ranks
    evaluationResults.sort((a, b) => b.score.percentage - a.score.percentage)
    evaluationResults.forEach((result, index) => {
      result.score.rank = index + 1
    })

    setResults(evaluationResults)
  }, [accounts, questions, answers])

  useEffect(() => {
    calculateScores()
  }, [calculateScores])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200'
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'D': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <span className="text-sm font-medium text-gray-500">#{rank}</span>
    }
  }

  const topTen = results.slice(0, 10)
  const tierCounts = results.reduce((acc, result) => {
    acc[result.score.tier] = (acc[result.score.tier] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const exportResults = () => {
    const csvContent = [
      ['Rank', 'Company', 'Industry', 'Score', 'Percentage', 'Tier'],
      ...results.map(result => [
        result.score.rank,
        result.account.name,
        result.account.industry,
        `${result.score.totalScore}/${result.score.maxScore}`,
        `${result.score.percentage}%`,
        result.score.tier
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'account-evaluation-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Account Evaluation Results
        </h2>
        <p className="text-gray-600">
          Your accounts have been scored and tiered based on your criteria.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{results.length}</div>
              <div className="text-sm text-gray-500">Total Accounts</div>
            </div>
          </CardContent>
        </Card>
        
        {['A', 'B', 'C', 'D'].map(tier => (
          <Card key={tier}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{tierCounts[tier] || 0}</div>
                <div className="text-sm text-gray-500">
                  <Badge className={getTierColor(tier)}>Tier {tier}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top 10 Qualified Leads */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Top 10 Qualified Leads</span>
              </CardTitle>
              <CardDescription>
                Your highest-scoring prospects based on evaluation criteria
              </CardDescription>
            </div>
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTen.map((result, index) => (
              <div
                key={result.account.id}
                className={`p-4 border rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border">
                      {getRankIcon(result.score.rank)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{result.account.name}</h3>
                      <p className="text-sm text-gray-500">
                        {result.account.industry} • {result.account.companySize}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {result.score.percentage}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.score.totalScore}/{result.score.maxScore} points
                      </div>
                    </div>
                    <Badge className={getTierColor(result.score.tier)}>
                      Tier {result.score.tier}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3">
                  <Progress value={result.score.percentage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Account Results</CardTitle>
          <CardDescription>
            Complete ranking of all evaluated accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.account.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {result.score.rank <= 3 ? (
                        getRankIcon(result.score.rank)
                      ) : (
                        <span className="text-sm font-medium text-gray-500">
                          #{result.score.rank}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{result.account.name}</TableCell>
                  <TableCell>{result.account.industry}</TableCell>
                  <TableCell>{result.account.companySize}</TableCell>
                  <TableCell>
                    {result.score.totalScore}/{result.score.maxScore}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{result.score.percentage}%</span>
                      <Progress value={result.score.percentage} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierColor(result.score.tier)}>
                      Tier {result.score.tier}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Evaluation</span>
        </Button>
        
        <Button onClick={onStartOver} className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Start New Evaluation</span>
        </Button>
      </div>
    </div>
  )
}