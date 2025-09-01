import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

const formatDate = (ts) => {
  try {
    if (!ts) return ''
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

const Card = ({ children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">{children}</div>
)

const Admin = () => {
  const [tab, setTab] = useState('pending') // 'pending' | 'published'
  const [pending, setPending] = useState([])
  const [published, setPublished] = useState([])
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [editText, setEditText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const colRef = collection(db, 'reviews')

    const unsubPending = onSnapshot(
      query(colRef, where('status', '==', 'pending')),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
          return tb - ta
        })
        setPending(items)
      },
      (err) => console.error('Pending snapshot error:', err)
    )

    const unsubPublished = onSnapshot(
      query(colRef, where('status', '==', 'published')),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
          return tb - ta
        })
        setPublished(items)
      },
      (err) => console.error('Published snapshot error:', err)
    )

    return () => {
      unsubPending()
      unsubPublished()
    }
  }, [])

  const approve = async (id) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'published' })
    } catch (e) {
      console.error('Approve failed', e)
    }
  }

  const unpublish = async (id) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status: 'pending' })
    } catch (e) {
      console.error('Unpublish failed', e)
    }
  }

  const remove = async (id) => {
    try {
      await deleteDoc(doc(db, 'reviews', id))
    } catch (e) {
      console.error('Delete failed', e)
    }
  }

  const startEdit = (item) => {
    setEditItem(item)
    setEditName(item.name || item.author || '')
    setEditText(item.text || '')
    setSaveError('')
    setEditOpen(true)
  }

  const cancelEdit = () => {
    setEditOpen(false)
    setEditItem(null)
    setSaveError('')
  }

  const saveEdit = async () => {
    if (!editItem?.id) return
    const name = (editName || '').trim()
    const text = (editText || '').trim()
    if (!text) {
      setSaveError('Comment cannot be empty.')
      return
    }
    setSaving(true)
    try {
      await updateDoc(doc(db, 'reviews', editItem.id), { name, text })
      setEditOpen(false)
      setEditItem(null)
    } catch (e) {
      console.error('Save edit failed', e)
      setSaveError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const ActiveList = tab === 'pending' ? pending : published

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="w-full grid grid-cols-3 items-center gap-4">
          <div />
          <div className="flex justify-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">Reviews Admin</h2>
          </div>
          <div />
        </div>

        {/* Tabs */}
        <div className="mt-5 flex justify-center">
          <div className="flex items-center bg-white rounded-full p-1 shadow">
            <button
              className={`px-5 py-2 rounded-full transition ${tab === 'pending' ? 'bg-[#f59e0b] text-white' : 'text-gray-700'}`}
              onClick={() => setTab('pending')}
            >
              Pending
            </button>
            <button
              className={`px-5 py-2 rounded-full transition ${tab === 'published' ? 'bg-[#f59e0b] text-white' : 'text-gray-700'}`}
              onClick={() => setTab('published')}
            >
              Published
            </button>
          </div>
        </div>

        {/* Lists */}
        <div className="mt-6 bg-[#f59e0b] rounded-[48px] p-6 sm:p-8 md:p-10">
          <div className="space-y-6">
            {ActiveList.length === 0 ? (
              <p className="text-white/90">{tab === 'pending' ? 'No pending comments.' : 'No published reviews.'}</p>
            ) : (
              ActiveList.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-gray-800 whitespace-pre-wrap">{item.text}</p>
                      <p className="mt-2 text-sm text-gray-500">{item.name || item.author || 'Anonymous'} • {formatDate(item.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {tab === 'pending' ? (
                        <>
                          <button onClick={() => approve(item.id)} className="rounded-full bg-white text-gray-800 px-4 py-2 shadow">Approve</button>
                          <button onClick={() => startEdit(item)} className="rounded-full bg-white text-gray-800 px-4 py-2 shadow">Edit</button>
                        </>
                      ) : (
                        <button onClick={() => unpublish(item.id)} className="rounded-full bg-white text-gray-800 px-4 py-2 shadow">Unpublish</button>
                      )}
                      <button onClick={() => remove(item.id)} className="rounded-full bg-white text-red-600 px-4 py-2 shadow">Delete</button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        {editOpen && (
          <dialog className="modal" open>
            <div className="modal-box">
              <h3 className="font-bold text-lg text-gray-800">Edit Review</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="input input-bordered w-full text-blue-600 placeholder-[#F5F5F5]"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-[120px] text-blue-600 placeholder-[#F5F5F5]"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Write your comment here..."
                  />
                </div>
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              </div>
              <div className="modal-action">
                <button onClick={cancelEdit} disabled={saving} className="rounded-full bg-white text-gray-800 px-4 py-2 shadow">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="rounded-full bg-[#f59e0b] text-white px-6 py-2 shadow">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={cancelEdit}>close</button>
            </form>
          </dialog>
        )}
      </div>
    </div>
  )
}

export default Admin
