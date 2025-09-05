import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { db } from '../../firebase'
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore'

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

// Format: YYYY-MM-DD HH:mm (local time)
const formatYMDHM = (ts) => {
  try {
    if (!ts) return ''
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`
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

  // Modal + realtime subscription state
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [listError, setListError] = useState('')

  // Subscribe to published reviews when modal opens
  useEffect(() => {
    if (!showModal) return
    setLoading(true)
    setListError('')
    const q = query(collection(db, 'reviews'), where('status', '==', 'published'))
    let items = []
    const unsub = onSnapshot(
      q,
      (snap) => {
        items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
          return tb - ta
        })
        setPublished(items)
        setLoading(false)
      },
      (e) => {
        console.error('Failed to load reviews', e)
        setListError('Failed to load reviews. Please try again.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [showModal])

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
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center rounded-full bg-white text-[#0e1728] px-6 py-2 font-semibold shadow hover:bg-white/90"
              >
                View published reviews
              </button>
            </div>
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

        {/* Reviews modal (portal) */}
        {showModal && createPortal(
          <div
            className="modal modal-open fixed inset-0 z-[99999]"
            style={{ zIndex: 2147483647 }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="modal-box relative bg-white rounded-3xl shadow-2xl w-[96vw] max-w-3xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
              <h3 className="font-bold text-lg text-[#460dff]">Published Reviews</h3>

              {listError && (
                <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{listError}</p>
              )}

              <div className="mt-4">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <span className="loading loading-spinner loading-md text-[#460dff]"></span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {published.length === 0 ? (
                      <p className="text-sm text-slate-600">No reviews yet.</p>
                    ) : (
                      published.map((p) => (
                        <div key={p.id} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-gray-800">{p.name || p.author || 'Anonymous'}</p>
                            <p className="text-xs text-slate-500">{formatYMDHM(p.createdAt)}</p>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{p.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}

export default Reviews