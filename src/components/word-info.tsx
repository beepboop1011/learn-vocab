'use client'

import { useRef } from 'react'
import { LangCode, Word } from "@/lib/interfaces"
import { Volume2 } from "lucide-react"

interface WordProps {
    word: Word
}

export const WordInfo = ({ word }: WordProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const langCodeMap: Record<string, string> = {
        ru: 'Russian',
        kk: 'Kazakh'
    }

    const onSpeakClick = (): void => {
        const utterance = new SpeechSynthesisUtterance(word.word)

        // Tweak for single-word clarity (optional but helps pronunciation)
        utterance.rate = 0.9

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

    return (
        <div className="bg-slate-200 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-semibold text-blue-600">
                    {word.word}
                </h2>
                <button onClick={onSpeakClick} className="text-gray-400 hover:text-blue-600 transition-colors ml-2 mt-1" aria-label="Pronounce word">
                    <Volume2 className="w-6 h-6" />
                </button>
            </div>
            <p className="text-black font-bold text-sm mb-3">{word.pronunciation}</p>
            <p className="text-gray-700 mb-4">{word.definition}</p>
            {word.examples.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Examples:</h3>
                    <ul className="space-y-2">
                        {word.examples.map((example, index) => (
                            <li key={index} className="text-gray-600 italic pl-4 border-l-2 border-blue-200">
                                &ldquo;{example}&rdquo;
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
                                <b>{langCodeMap[langCode]}</b>: {word.translations[langCode as LangCode]}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}