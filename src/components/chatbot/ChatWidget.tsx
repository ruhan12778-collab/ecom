'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const TOPIC_SUGGESTIONS = [
  { label: '\uD83D\uDC0D Python', message: "I want to learn Python programming. What courses do you recommend?" },
  { label: '\u26A1 JavaScript', message: "I'm interested in learning JavaScript. What do you have?" },
  { label: '\uD83C\uDF10 Web Dev', message: "I want to become a full-stack web developer" },
  { label: '\uD83D\uDCCA Data Science', message: "I want to learn data science and machine learning" },
  { label: '\u2601\uFE0F Cloud/DevOps', message: "I'm interested in cloud computing and DevOps" },
  { label: '\uD83D\uDD10 Security', message: "I want to learn cybersecurity" },
]

const COURSE_SLUGS: Record<string, string> = {
  'python for beginners': 'python-for-beginners',
  'javascript mastery': 'javascript-mastery',
  'full stack development': 'full-stack-development',
  'data science with python': 'data-science-python',
  'react & next.js': 'react-nextjs',
  'typescript fundamentals': 'typescript-fundamentals',
  'node.js & express apis': 'nodejs-express-api',
  'sql & database design': 'sql-database-design',
  'aws cloud essentials': 'aws-cloud-essentials',
  'docker & kubernetes': 'docker-kubernetes',
  'cybersecurity basics': 'cybersecurity-basics',
  'data structures & algorithms': 'data-structures-algorithms',
  'react native mobile dev': 'react-native-mobile',
  'machine learning with tensorflow': 'machine-learning-tensorflow',
  'css & modern styling': 'css-modern-styling',
  'postgresql for developers': 'postgresql-developers',
  'system design & architecture': 'system-design-architecture',
}

function renderMessageContent(content: string) {
  const contentLower = content.toLowerCase()
  const foundCourses: { title: string; slug: string }[] = []

  for (const [title, slug] of Object.entries(COURSE_SLUGS)) {
    if (contentLower.includes(title)) {
      foundCourses.push({ title, slug })
    }
  }

  if (foundCourses.length === 0) {
    return <p className="text-sm whitespace-pre-wrap">{content}</p>
  }

  return (
    <div>
      <p className="text-sm whitespace-pre-wrap">{content}</p>
      <div className="mt-2 flex flex-col gap-1.5">
        {foundCourses.map(({ title, slug }) => (
          <Link
            key={slug}
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors w-fit"
          >
            {title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            <span className="ml-1">{'\u2192'}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your CodeEd learning advisor. I can help you find the perfect course based on your goals and experience level. What would you like to learn?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.content }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-stone-900 rounded-full shadow-lg hover:bg-stone-700 transition-all duration-200 flex items-center justify-center z-50"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-stone-200 flex flex-col z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-stone-200 flex items-center space-x-3 bg-stone-50 rounded-t-xl">
            <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center">
              <span className="text-lg">{'\uD83C\uDF93'}</span>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">CodeEd Learning Advisor</h3>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-stone-900 text-white rounded-br-md'
                      : 'bg-white text-stone-900 rounded-bl-md shadow-sm border border-stone-200'
                  }`}
                >
                  {message.role === 'assistant'
                    ? renderMessageContent(message.content)
                    : <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  }
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-stone-900 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm border border-stone-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Topic Suggestions */}
          <div className="px-4 py-2 border-t border-stone-200 bg-white">
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => sendMessage(suggestion.message)}
                  disabled={isLoading}
                  className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-stone-200 bg-white rounded-b-xl">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about courses..."
                className="input flex-1"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
