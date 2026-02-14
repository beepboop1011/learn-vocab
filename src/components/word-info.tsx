'use client'

import { useRef, useState } from 'react'
import { LangCode, Word } from "@/lib/interfaces"
import { Volume2, PenLine, X, Loader2, CheckCircle, XCircle } from "lucide-react"
import { ZSentenceAnalysis } from "@/lib/schemas"

interface WordProps {
    word: Word
}

export const WordInfo = ({ word }: WordProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const [exampleLang, setExampleLang] = useState<LangCode>('en')
    const [practiceOpen, setPracticeOpen] = useState(false)
    const [sentence, setSentence] = useState('')
    const [checking, setChecking] = useState(false)
    const [feedback, setFeedback] = useState<ZSentenceAnalysis | null>(null)
    const [practiceError, setPracticeError] = useState('')

    const langCodeMap: Record<LangCode, string> = {
        en: 'English',
        ru: 'Russian',
        kk: 'Kazakh'
    }

    const onSpeakClick = (): void => {
        const utterance = new SpeechSynthesisUtterance(word.word)

        // Tweak for single-word clarity (optional but helps pronunciation)
        utterance.rate = 0.7

        // Clear anything stuck in queue
        window.speechSynthesis.cancel()

        const voices = window.speechSynthesis.getVoices()
        if (voices.length === 0) {
            return
        }

        // Prefer a good Google voice if available
        let selectedVoice = voices.find(v => 
            v.lang.startsWith('en') && v.name.includes('Google')
        )

        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0]
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        window.speechSynthesis.speak(utterance)
    }

    const handlePracticeSubmit = async () => {
        if (!sentence.trim()) return
        setChecking(true)
        setFeedback(null)
        setPracticeError('')
        try {
            const res = await fetch('/api/words/sentence-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: word.word, sentence: sentence.trim() })
            })
            if (!res.ok) throw new Error('Failed to check sentence')
            const data: ZSentenceAnalysis = await res.json()
            setFeedback(data)
        } catch {
            setPracticeError('Something went wrong. Please try again.')
        } finally {
            setChecking(false)
        }
    }

    const closePractice = () => {
        setPracticeOpen(false)
        setSentence('')
        setFeedback(null)
        setPracticeError('')
    }

    return (
        <div className="bg-slate-200 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-semibold text-blue-600">
                    {word.word}
                </h2>
                <button onClick={onSpeakClick} className="text-gray-400 hover:text-blue-600 transition-colors ml-3 mt-1" aria-label="Pronounce word" title="Pronounce">
                    <Volume2 className="w-6 h-6" />
                </button>
                <button onClick={() => setPracticeOpen(true)} className="text-gray-400 hover:text-blue-600 transition-colors mt-1 ml-3" aria-label="Practice word" title="Practice">
                    <PenLine className="w-5 h-5" />
                </button>
            </div>
            <p className="text-black font-bold text-sm mb-3">{word.pronunciation}</p>
            <p className="text-gray-700 mb-4">{word.definition}</p>
            {word.examples.length > 0 && (
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Examples:</h3>
                        <select
                            value={exampleLang}
                            onChange={(e) => setExampleLang(e.target.value as LangCode)}
                            className="text-sm bg-white border border-gray-300 rounded px-2 py-0.5 text-gray-600"
                        >
                            {Object.entries(langCodeMap).map(([code, name]) => (
                                <option key={code} value={code}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <ul className="space-y-2">
                        {word.examples.map((example, index) => (
                            <li key={index} className="text-gray-600 italic pl-4 border-l-2 border-blue-200">
                                &ldquo;{example[exampleLang]}&rdquo;
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {Object.keys(word.translations).length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Translations:</h3>
                    <ul className="space-y-2">
                        {Object.keys(word.translations).map((langCode, index) => (
                            <li key={index} className="text-gray-600 pl-4 border-l-2 border-blue-200">
                                <b>{langCodeMap[langCode as LangCode]}</b>: {word.translations[langCode as LangCode]}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {practiceOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePractice}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Practice: <span className="text-blue-600">{word.word}</span>
                            </h3>
                            <button onClick={closePractice} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">Write a sentence using the word &ldquo;{word.word}&rdquo;</p>
                        <textarea
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            placeholder={`e.g. "The ${word.word} ..."`}
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={3}
                            disabled={checking}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePracticeSubmit() } }}
                        />
                        <button
                            onClick={handlePracticeSubmit}
                            disabled={checking || !sentence.trim()}
                            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {checking ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : 'Check'}
                        </button>

                        {practiceError && (
                            <p className="mt-3 text-red-500 text-sm">{practiceError}</p>
                        )}

                        {feedback && (
                            <div className={`mt-4 p-4 rounded-lg ${feedback.result ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {feedback.result
                                        ? <><CheckCircle className="w-5 h-5 text-green-600" /><span className="font-medium text-green-700">Correct!</span></>
                                        : <><XCircle className="w-5 h-5 text-red-600" /><span className="font-medium text-red-700">Not quite</span></>
                                    }
                                </div>
                                <p className="text-sm text-gray-700">{feedback.reason}</p>
                                {!feedback.result && feedback.fixedSentence && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 font-medium">Suggested fix:</p>
                                        <p className="text-sm text-gray-700 italic">&ldquo;{feedback.fixedSentence}&rdquo;</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}