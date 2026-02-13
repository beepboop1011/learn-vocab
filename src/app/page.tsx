'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WordInfo } from '@/components/word-info'
import { Word, WordWithLearnedDate } from '@/lib/interfaces'
import { ChevronDown, ChevronUp } from 'lucide-react'

const HomePage = () => {
    const router = useRouter()
    const [words, setWords] = useState<Word[]>([])
    const [previousWords, setPreviousWords] = useState<WordWithLearnedDate[]>([])
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' })
        router.push('/login')
    }

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const res = await fetch('/api/words')
                if (!res.ok) {
                    throw new Error('Failed to fetch words')
                }
                const data = await res.json()
                setWords(data.words)

                const _previousWords = data.previousWords ?? []
                _previousWords.sort((a: WordWithLearnedDate, b: WordWithLearnedDate) => new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime())
                setPreviousWords(_previousWords)
            } catch (e) {
                console.error(e)
                setError('Failed to load words')
            } finally {
                setLoading(false)
            }
        }

        fetchWords()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600 text-lg">Loading today&apos;s words...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="lg:w-5/6 md:w-11/12 mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Today&apos;s Words
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Log out
                    </button>
                </div>
                {words.length === 0 ?
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <p className="text-gray-600 text-lg">No more words to learn!</p>
                            <p className="text-gray-500 mt-2">You&apos;ve learned all available words.</p>
                        </div>
                    </div>
                    :
                    <div className="space-y-6">
                        {words.map((word) => (
                            <WordInfo key={word._id.toString()} word={word} />
                        ))}
                    </div>
                }

                {previousWords.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Previously Learned</h2>
                            <p className="text-gray-400">{`${previousWords.length} words since ${new Date(previousWords[previousWords.length - 1].learnedAt).toDateString()}`}</p>
                        </div>
                        <div className="space-y-2">
                            {previousWords.map((word) => {
                                const id = word._id.toString()
                                const isExpanded = expandedId === id
                                return (
                                    <div key={id}>
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : id)}
                                            className="w-full text-left px-4 py-3 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 transition-colors flex items-center justify-between"
                                        >
                                            <span className="text-lg font-medium text-blue-600">{word.word}</span>
                                            <div className="flex items-center gap-3">
                                                {word.learnedAt && (
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(word.learnedAt).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                )}
                                                {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                            </div>
                                        </button>
                                        {isExpanded && (
                                            <div className="mt-1">
                                                <WordInfo word={word} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomePage
