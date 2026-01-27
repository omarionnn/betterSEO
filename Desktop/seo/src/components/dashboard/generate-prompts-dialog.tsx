'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Plus, Check, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Suggestion {
    text: string
    category: string
}

interface GeneratePromptsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onAddPrompts: (prompts: Suggestion[]) => Promise<void>
}

export function GeneratePromptsDialog({
    open,
    onOpenChange,
    onAddPrompts,
}: GeneratePromptsDialogProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const [generating, setGenerating] = useState(false)
    const [adding, setAdding] = useState(false)

    const generateSuggestions = async () => {
        setGenerating(true)
        try {
            const response = await fetch('/api/prompts/generate', {
                method: 'POST',
            })
            if (response.ok) {
                const data = await response.json()
                setSuggestions(data)
                // Select all by default
                setSelectedIndices(data.map((_: any, i: number) => i))
            }
        } catch (error) {
            console.error('Error generating suggestions:', error)
        } finally {
            setGenerating(false)
        }
    }

    const handleToggleSelection = (index: number) => {
        setSelectedIndices((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        )
    }

    const handleAddSelected = async () => {
        setAdding(true)
        const toAdd = suggestions.filter((_, i) => selectedIndices.includes(i))
        try {
            await onAddPrompts(toAdd)
            onOpenChange(false)
            setSuggestions([])
            setSelectedIndices([])
        } catch (error) {
            console.error('Error adding suggestions:', error)
        } finally {
            setAdding(false)
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'PRODUCT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'SERVICE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'COMPARISON': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'HOW_TO': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col glass border-white/10 p-0 rounded-[2.5rem]">
                <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none" />

                <DialogHeader className="p-10 pb-6 border-b border-white/5 relative bg-white/[0.02]">
                    <DialogTitle className="flex items-center space-x-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-3xl font-black text-white italic tracking-tight">AI Discovery <span className="text-primary not-italic font-medium text-lg ml-2 uppercase tracking-[0.2em]">Engine</span></span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 font-medium text-base">
                        Generating strategic queries to benchmark your betterSEO performance across neural environments.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-10 py-6 custom-scrollbar">
                    {suggestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-10">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center relative border border-white/10 shadow-2xl rotate-6 group-hover:rotate-0 transition-all duration-500">
                                    <Sparkles className="h-10 w-10 text-primary" />
                                </div>
                            </div>
                            <div className="max-w-sm">
                                <h4 className="font-black text-2xl text-white mb-4 italic">Baseline Intelligence</h4>
                                <p className="text-gray-400 font-medium leading-relaxed">
                                    Analyze brand positioning and competitor incursion to discover high-priority monitoring prompts.
                                </p>
                            </div>
                            <Button
                                onClick={generateSuggestions}
                                disabled={generating}
                                className="h-14 px-10 rounded-2xl font-black italic bg-primary text-white hover:scale-105 transition-all shadow-xl shadow-primary/30"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        DECRYPTING MARKET DATA...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCcw className="mr-3 h-5 w-5" />
                                        EXECUTE DISCOVERY PROSESS
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "group flex items-center space-x-6 p-6 rounded-[1.5rem] border transition-glass cursor-pointer relative overflow-hidden",
                                        selectedIndices.includes(index)
                                            ? "glass border-primary/40 bg-primary/[0.03]"
                                            : "glass border-white/5 bg-transparent hover:border-white/20"
                                    )}
                                    onClick={() => handleToggleSelection(index)}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl border flex items-center justify-center transition-all flex-shrink-0",
                                        selectedIndices.includes(index)
                                            ? "bg-primary border-primary shadow-lg shadow-primary/30"
                                            : "bg-white/5 border-white/10"
                                    )}>
                                        {selectedIndices.includes(index) && <Check className="h-5 w-5 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                                        <p className={cn(
                                            "text-base font-black leading-tight transition-colors",
                                            selectedIndices.includes(index) ? "text-white" : "text-gray-300 group-hover:text-white"
                                        )}>
                                            "{suggestion.text}"
                                        </p>
                                        <Badge variant="outline" className={cn("text-[10px] w-fit px-3 py-1 border font-black uppercase tracking-widest rounded-lg", getCategoryColor(suggestion.category))}>
                                            {suggestion.category.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {suggestions.length > 0 && (
                    <div className="p-8 px-10 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Allocation</p>
                            <p className="text-2xl font-black text-white italic">{selectedIndices.length} <span className="text-sm not-italic font-bold text-gray-500 ml-1 uppercase tracking-tighter">Prompts Found</span></p>
                        </div>
                        <div className="flex space-x-4">
                            <Button
                                variant="outline"
                                className="rounded-xl h-12 border-white/10 hover:bg-white/5 font-bold text-gray-400"
                                onClick={() => setSuggestions([])}
                            >
                                Start Over
                            </Button>
                            <Button
                                className="h-12 px-8 rounded-xl font-black italic bg-primary text-white hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                onClick={handleAddSelected}
                                disabled={selectedIndices.length === 0 || adding}
                            >
                                {adding ? (
                                    <>
                                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                        INTEGRATING...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-3 h-5 w-5" />
                                        COMMIT TO VAULT
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
