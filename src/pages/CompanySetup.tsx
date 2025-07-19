import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, ArrowRight } from 'lucide-react'
import { Company } from '@/types'

interface CompanySetupProps {
  onNext: (company: Omit<Company, 'id' | 'userId' | 'createdAt'>) => void
  initialData?: Partial<Company>
}

export function CompanySetup({ onNext, initialData }: CompanySetupProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    industry: initialData?.industry || '',
    targetMarket: initialData?.targetMarket || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Professional Services',
    'Media & Entertainment',
    'Transportation',
    'Energy',
    'Other'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Company description is required'
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Industry is required'
    }
    
    if (!formData.targetMarket.trim()) {
      newErrors.targetMarket = 'Target market is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your company
        </h2>
        <p className="text-gray-600">
          This information helps us understand what you sell and who your ideal customers are.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Provide details about your business to create targeted evaluation criteria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Acme Software Solutions"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">What do you sell? *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your products or services, value proposition, and key benefits..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange('industry', value)}
              >
                <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-600">{errors.industry}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market *</Label>
              <Textarea
                id="targetMarket"
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                placeholder="Describe your ideal customers (company size, industry, role, pain points, etc.)"
                rows={3}
                className={errors.targetMarket ? 'border-red-500' : ''}
              />
              {errors.targetMarket && (
                <p className="text-sm text-red-600">{errors.targetMarket}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="flex items-center space-x-2">
                <span>Continue to Criteria Builder</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}