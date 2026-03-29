import Head from 'next/head'
import { useState } from 'react'

const CHOICES = [
  'Speed of responding to inquiries',
  'Reduction in admin / manual work',
  'Increase in bookings or revenue',
  'Guest / client experience',
  'Team coordination and calendar management',
  'Online payments and proposals',
  'Reporting and analytics',
]

const STEPS = [
  { id: 'welcome' },
  { id: 'name',        type: 'short_text',      question: "What's your name and role?",                                                                   placeholder: 'e.g. Sarah - Director of Sales, NYX Hotels Tel Aviv', required: true },
  { id: 'property',   type: 'short_text',      question: 'Which hotel or property are you from?',                                                          placeholder: 'Hotel / venue name and city...',                      required: true },
  { id: 'before',     type: 'long_text',        question: 'Before Book a Space - what was the most frustrating part of managing meeting and event bookings?', placeholder: 'Tell us about the chaos, the back-and-forth, the sticky notes...', required: true },
  { id: 'change',     type: 'long_text',        question: "What's the most concrete change you've seen since switching to Book a Space?",                   placeholder: 'Share the change - big or small...',                  required: true },
  { id: 'areas',      type: 'multiple_choice',  question: 'Which areas improved most after using Book a Space?',                                            required: true },
  { id: 'nps',        type: 'nps',              question: 'How likely are you to recommend Book a Space to a colleague in the industry?',                   required: true },
  { id: 'marketing',  type: 'yes_no',           question: 'Are you happy for Book a Space to use your name, role and quotes in our marketing?',             required: true },
  { id: 'extra',      type: 'long_text',        question: "Anything else you'd like to share about your experience with Book a Space?",                    placeholder: 'Any feature requests, suggestions, or just a shout-out - we love hearing it all!', required: false },
  { id: 'thankyou' },
]

const QUESTION_STEPS = STEPS.filter(s => s.id !== 'welcome' && s.id !== 'thankyou')
const TOTAL_QUESTIONS = QUESTION_STEPS.length

export default function Survey() {
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const current = STEPS[step]
  const questionIndex = QUESTION_STEPS.findIndex(s => s.id === current.id)
  const progress = current.id === 'welcome' ? 0
    : current.id === 'thankyou' ? 100
    : Math.round(((questionIndex + 1) / (TOTAL_QUESTIONS + 1)) * 100)

  function setValue(val) {
    setAnswers(prev => ({ ...prev, [current.id]: val }))
    setError('')
  }

  function validate() {
    if (!current.required) return true
    const val = answers[current.id]
    if (!val || (Array.isArray(val) && val.length === 0) || (typeof val === 'string' && !val.trim())) {
      setError('Please fill in this field before continuing.')
      return false
    }
    return true
  }

  function next() {
    if (current.id !== 'welcome' && current.id !== 'thankyou') {
      if (!validate()) return
    }
    if (step === STEPS.length - 2) {
      submit()
    } else {
      setStep(s => s + 1)
      setError('')
    }
  }

  function back() {
    setStep(s => s - 1)
    setError('')
  }

  async function submit() {
    setLoading(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStep(STEPS.length - 1)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function toggleChoice(label) {
    const current_val = answers['areas'] || []
    const updated = current_val.includes(label)
      ? current_val.filter(c => c !== label)
      : [...current_val, label]
    setValue(updated)
  }

  return (
    <>
      <Head>
        <title>Book a Space - Share Your Experience</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="survey-wrapper">
        {/* Header */}
        <header className="survey-header">
          <img
            src="https://www.bookasp.com/_next/static/media/logo.1bf20df5.png"
            alt="Book a Space"
            className="logo"
            onError={e => { e.target.style.display = 'none' }}
          />
          {current.id !== 'welcome' && current.id !== 'thankyou' && (
            <span className="step-counter">{questionIndex + 1} / {TOTAL_QUESTIONS}</span>
          )}
        </header>

        {/* Progress */}
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Main */}
        <main className="survey-main">

          {/* Welcome */}
          {current.id === 'welcome' && (
            <div className="step-card welcome-card" key="welcome">
              <div className="welcome-badge">Customer Story</div>
              <h1 className="welcome-title">Help us tell the Book a Space story</h1>
              <p className="welcome-desc">
                Your answers help us show other hotels and venues what is possible with Book a Space
                - and shape the future of the platform.
              </p>
              <div className="meta-row">
                <span className="meta-item">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                  </svg>
                  3-4 minutes
                </span>
                <span className="meta-item">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Your answers are private
                </span>
              </div>
              <button className="btn-primary" onClick={next} style={{ margin: '0 auto' }}>
                Let's go
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                </svg>
              </button>
            </div>
          )}

          {/* Questions */}
          {current.id !== 'welcome' && current.id !== 'thankyou' && (
            <div className="step-card" key={current.id}>
              <div className="question-number">Question {questionIndex + 1}</div>
              <h2 className="question-title">{current.question}</h2>
              {!current.required && <p className="question-optional">Optional - feel free to skip</p>}

              {/* Short / Long text */}
              {(current.type === 'short_text') && (
                <input
                  className="input-text"
                  type="text"
                  placeholder={current.placeholder}
                  value={answers[current.id] || ''}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && next()}
                  autoFocus
                />
              )}
              {current.type === 'long_text' && (
                <textarea
                  className="input-textarea"
                  placeholder={current.placeholder}
                  value={answers[current.id] || ''}
                  onChange={e => setValue(e.target.value)}
                  autoFocus
                />
              )}

              {/* Multiple choice */}
              {current.type === 'multiple_choice' && (
                <div className="choices-list">
                  {CHOICES.map(label => {
                    const selected = (answers['areas'] || []).includes(label)
                    return (
                      <div
                        key={label}
                        className={`choice-item${selected ? ' selected' : ''}`}
                        onClick={() => toggleChoice(label)}
                      >
                        <div className="choice-checkbox">
                          <span className="choice-checkbox-tick">✓</span>
                        </div>
                        <span className="choice-label">{label}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* NPS */}
              {current.type === 'nps' && (
                <div className="nps-wrapper">
                  <div className="nps-scale">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
                      <button
                        key={i}
                        className={`nps-btn${answers['nps'] === i ? ' selected' : ''}`}
                        onClick={() => setValue(i)}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <div className="nps-labels">
                    <span>Not at all likely</span>
                    <span>Extremely likely</span>
                  </div>
                </div>
              )}

              {/* Yes/No */}
              {current.type === 'yes_no' && (
                <div className="yesno-list">
                  {['Yes - happy to be featured!', 'No - keep my answers anonymous'].map(opt => (
                    <button
                      key={opt}
                      className={`yesno-btn${answers['marketing'] === opt ? ' selected' : ''}`}
                      onClick={() => setValue(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {error && <p className="error-msg">{error}</p>}

              <div className="btn-row">
                {step > 1
                  ? <button className="btn-back" onClick={back}>Back</button>
                  : <span />
                }
                <button className="btn-primary" onClick={next} disabled={loading}>
                  {loading ? 'Submitting...' : step === STEPS.length - 2 ? 'Submit' : 'Continue'}
                  {!loading && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Thank You */}
          {current.id === 'thankyou' && (
            <div className="step-card welcome-card" key="thankyou">
              <div className="thankyou-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <h1 className="thankyou-title">Thank you - you're brilliant!</h1>
              <p className="thankyou-desc">
                Your feedback means the world to us. We'll be in touch if we'd like to feature your story.
                In the meantime, enjoy those crisp bookings.
              </p>
              <a href="https://www.bookasp.com" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', margin: '0 auto' }}>
                Back to Book a Space
              </a>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
