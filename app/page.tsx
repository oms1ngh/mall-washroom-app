'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Sparkles,
  ThumbsUp,
  Meh,
  Frown,
  CheckCircle,
  XCircle,
  Shield,
  MapPin,
  Send,
} from 'lucide-react'

export default function Home() {
  const [locationCode, setLocationCode] = useState('')
  const [washroomName, setWashroomName] = useState('Loading...')
  const [cleanliness, setCleanliness] = useState('')
  const [facilities, setFacilities] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function loadWashroom() {
      const params = new URLSearchParams(window.location.search)
      const loc = params.get('loc')

      if (!loc) {
        setWashroomName('Unknown Washroom')
        return
      }

      setLocationCode(loc)

      try {
        const res = await fetch(
          `/api/washrooms/code/${loc}`
        )

        if (!res.ok) {
          setWashroomName('Unknown Washroom')
          return
        }

        const washroom = await res.json()
        setWashroomName(washroom.name)
      } catch (error) {
        console.error(error)
        setWashroomName('Unknown Washroom')
      }
    }

    loadWashroom()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!cleanliness || !facilities) {
      alert('Please answer required questions.')
      return
    }

    if (!locationCode) {
      alert('Invalid washroom link.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintId: `CMP-${Date.now()}`,
          washroomCode: locationCode,
          washroomName,
          cleanlinessStatus: cleanliness,
          facilitiesWorking: facilities,
          issueDescription: comment,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-md md:max-w-lg w-full">
          <Image
            src="/sam-logo.jpg"
            alt="South Avenue Mall"
            width={220}
            height={90}
            className="mx-auto mb-6"
          />

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Thank You!
          </h1>

          <p className="text-base md:text-lg text-gray-600">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </div>
    )
  }

  const cleanlinessOptions = [
    { label: 'Very Clean', icon: Sparkles, color: 'text-green-500' },
    { label: 'Clean', icon: ThumbsUp, color: 'text-green-600' },
    { label: 'Not Clean', icon: Meh, color: 'text-yellow-500' },
    { label: 'Dirty', icon: Frown, color: 'text-pink-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-green-50 relative overflow-hidden p-3 md:p-6">
      <div className="absolute left-0 top-0 w-8 md:w-20 h-full bg-pink-600 rounded-r-full opacity-90"></div>
      <div className="absolute left-0 bottom-0 w-8 md:w-20 h-24 md:h-48 bg-yellow-400 rounded-tr-full"></div>
      <div className="absolute right-0 bottom-0 w-8 md:w-20 h-40 md:h-72 bg-green-500 rounded-tl-full"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-w-md md:max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-5 md:p-10"
      >
        <div className="text-center mb-8">
          <Image
            src="/sam-logo.jpg"
            alt="South Avenue Mall"
            width={220}
            height={90}
            className="mx-auto mb-5"
          />

          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">
            Washroom Feedback
          </h1>

          <p className="text-base md:text-2xl text-gray-600">
            Help us maintain clean and comfortable washrooms for everyone.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 md:gap-3 bg-green-50 border border-green-200 px-5 md:px-8 py-3 md:py-4 rounded-2xl text-lg md:text-2xl font-semibold text-gray-800">
            <MapPin className="text-green-600 h-5 w-5 md:h-7 md:w-7" />
            {washroomName}
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-100 rounded-3xl p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-3xl font-bold mb-5">
            1. How was the cleanliness? *
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {cleanlinessOptions.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCleanliness(item.label)}
                  className={`border rounded-2xl p-4 md:p-6 text-center transition ${
                    cleanliness === item.label
                      ? 'border-pink-500 bg-white shadow-lg'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Icon
                    className={`mx-auto mb-3 h-7 w-7 md:h-10 md:w-10 ${item.color}`}
                  />
                  <p className="text-sm md:text-xl font-medium">
                    {item.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-3xl font-bold mb-5">
            2. Were facilities working properly? *
          </h2>

          <div className="grid grid-cols-2 gap-3 md:gap-5">
            <button
              type="button"
              onClick={() => setFacilities('Yes')}
              className={`border rounded-2xl p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3 text-lg md:text-2xl font-medium ${
                facilities === 'Yes'
                  ? 'border-green-500 bg-white shadow-lg'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <CheckCircle className="text-green-600 h-6 w-6 md:h-8 md:w-8" />
              Yes
            </button>

            <button
              type="button"
              onClick={() => setFacilities('No')}
              className={`border rounded-2xl p-4 md:p-6 flex items-center justify-center gap-2 md:gap-3 text-lg md:text-2xl font-medium ${
                facilities === 'No'
                  ? 'border-pink-500 bg-white shadow-lg'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <XCircle className="text-pink-600 h-6 w-6 md:h-8 md:w-8" />
              No
            </button>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-3xl p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-3xl font-bold mb-4">
            3. Any issue or suggestion? <span className="text-gray-500">(Optional)</span>
          </h2>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder="Share your thoughts..."
            rows={5}
            className="w-full border border-gray-200 rounded-2xl p-4 text-base md:text-xl"
          />

          <p className="text-right text-gray-500 mt-2">
            {comment.length}/500
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-4 md:p-6 mb-6 flex gap-3 items-start">
          <Shield className="text-blue-600 h-8 w-8 shrink-0" />
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-blue-900">
              Your feedback matters!
            </h3>
            <p className="text-sm md:text-lg text-gray-600">
              We use your feedback to improve South Avenue Mall facilities.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white rounded-2xl p-4 md:p-6 text-xl md:text-3xl font-bold flex justify-center items-center gap-3"
        >
          <Send className="h-5 w-5 md:h-8 md:w-8" />
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  )
}