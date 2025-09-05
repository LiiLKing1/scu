import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

const StarIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.802-2.036a1 1 0 0 0-1.176 0l-2.802 2.036c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 0 0 .95-.69l1.07-3.292Z" />
  </svg>
)

const StarRow = ({ count = 5, className = '' }) => (
  <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <StarIcon key={i} />
    ))}
  </div>
)

const formatDate = (ts) => {
  try {
    if (!ts) return ''
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const ReviewItem = ({ title, author, date, body, showReport = true, showStars = false, showTitle = false }) => (
  <div className="pt-4">
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {showStars && <StarRow />}
      {showTitle ? (
        <>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{author || 'Anonymous'}</p>
        </>
      ) : (
        <h3 className="text-2xl font-semibold text-gray-800">{author || 'Anonymous'}</h3>
      )}
      <p className="mt-2 text-gray-700 leading-relaxed">{body}</p>
      <p className="mt-3 text-sm text-gray-400 italic text-right">on {date}</p>
      {showReport && (
        <div className="mt-4 text-right">
          <button type="button" className="text-blue-600 text-sm hover:underline">Report as Inappropriate</button>
        </div>
      )}
    </div>
  </div>
)

const Reviews = () => {
  const [published, setPublished] = useState([])
  const [text, setText] = useState('')
  const [message, setMessage] = useState('')

  // Load published reviews from Firestore on mount
  useEffect(() => {
    const fetchPublished = async () => {
      try {
        const q = query(collection(db, 'reviews'), where('status', '==', 'published'))
        const snap = await getDocs(q)
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
          return tb - ta
        })
        setPublished(items)
      } catch (e) {
        console.error('Failed to load reviews', e)
      }
    }
    fetchPublished()
  }, [])

  

  const handleSend = async () => {
    const t = text.trim()
    if (!t) {
      setMessage('Please write a review before sending.')
      return
    }
    try {
      await addDoc(collection(db, 'reviews'), {
        text: t,
        name: 'Anonymous',
        author: 'Anonymous',
        title: t.slice(0, 20),
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setMessage('Thanks! Your review has been sent.')
      setText('')
    } catch (e) {
      console.error('Failed to submit review', e)
      setMessage('Failed to submit. Please try again.')
    } finally {
      setTimeout(() => setMessage(''), 2500)
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="w-full flex items-start justify-between gap-4">
          <div className="w-full">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center">Reviews</h2>
            {false && (
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <StarRow />
                <span>Based on {published.length} reviews</span>
              </div>
            )}
          </div>
        </div>

        {/* Lists and public compose */}
        <div className="mt-6 bg-[#f59e0b] rounded-[48px] p-6 sm:p-8 md:p-10">
          <div className="space-y-6">
            {published.map((p) => (
              <div key={p.id}>
                <ReviewItem author={p.name || p.author} date={formatDate(p.createdAt)} body={p.text} showReport={false} showStars={false} />
              </div>
            ))}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Leave a comment</h4>
              <textarea
                className="textarea textarea-bordered w-full min-h-[120px] placeholder-[#F5F5F5] text-white"
                placeholder="Write your comment here..."
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <button onClick={handleSend} className="rounded-full bg-[#f59e0b] text-white px-6 py-2 shadow">Submit</button>
              </div>
              {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
            </div>
          </div>
        </div>

        {/* Admin compose moved into orange container; nothing below */}
      </div>
    </div>
  )
}

export default Reviews