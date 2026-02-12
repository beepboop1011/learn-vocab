import { LangCode, Word } from "@/lib/interfaces"

interface WordProps {
    word: Word
}

export const WordInfo = ({ word }: WordProps) => {
    const langCodeMap: Record<string, string> = {
        ru: 'Russian',
        kk: 'Kazakh'
    }

    return (
        <div className="bg-slate-200 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-1">
                {word.word}
            </h2>
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