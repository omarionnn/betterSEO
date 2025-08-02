'use client'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle } from 'lucide-react'

interface MonitorResult {
  id: string
  platform: string
  brandMentioned: boolean
  responseText: string
  competitorsMentioned: string[]
  checkedAt: string
  prompt: {
    id: string
    promptText: string
    category: string
    priority: string
  }
}

interface ResultDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: MonitorResult | null
}

export function ResultDetailDialog({ open, onOpenChange, result }: ResultDetailDialogProps) {
  if (!result) return null

  const getStatusIcon = (brandMentioned: boolean) => {
    return brandMentioned ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusColor = (brandMentioned: boolean) => {
    return brandMentioned
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRODUCT': return 'bg-blue-100 text-blue-800'
      case 'SERVICE': return 'bg-green-100 text-green-800'
      case 'COMPARISON': return 'bg-purple-100 text-purple-800'
      case 'HOW_TO': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getStatusIcon(result.brandMentioned)}
            <span>Monitoring Result Details</span>
          </DialogTitle>
          <DialogDescription>
            Detailed analysis of AI response and brand visibility
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Prompt Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Prompt</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
              {result.prompt.promptText}
            </p>
            <div className="flex items-center space-x-2">
              <Badge className={getCategoryColor(result.prompt.category)}>
                {result.prompt.category.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {result.prompt.priority} Priority
              </Badge>
            </div>
          </div>

          {/* Result Summary */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Result Summary</h3>
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(result.brandMentioned)}>
                {result.brandMentioned ? 'Brand Mentioned' : 'Brand Not Mentioned'}
              </Badge>
              <span className="text-sm text-gray-500">
                Checked on {new Date(result.checkedAt).toLocaleString()}
              </span>
              <Badge variant="outline">
                {result.platform}
              </Badge>
            </div>
          </div>

          {/* Competitors Mentioned */}
          {result.competitorsMentioned.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Competitors Mentioned</h3>
              <div className="flex flex-wrap gap-2">
                {result.competitorsMentioned.map((competitor, index) => (
                  <Badge key={index} className="bg-orange-100 text-orange-800">
                    {competitor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Response */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI Response</h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {result.responseText}
              </p>
            </div>
          </div>

          {/* Analysis Insights */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Analysis Insights</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <ul className="text-sm text-blue-800 space-y-1">
                {result.brandMentioned ? (
                  <li>✅ Your brand was mentioned in the AI response</li>
                ) : (
                  <li>❌ Your brand was not mentioned in the AI response</li>
                )}
                {result.competitorsMentioned.length > 0 ? (
                  <li>⚠️ {result.competitorsMentioned.length} competitor(s) were mentioned</li>
                ) : (
                  <li>✅ No competitors were mentioned</li>
                )}
                <li>
                  📊 This was a {result.prompt.category.toLowerCase().replace('_', ' ')} query with {result.prompt.priority.toLowerCase()} priority
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}