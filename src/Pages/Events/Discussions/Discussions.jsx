import React, { useEffect, useRef, useState } from 'react'

import { createPortal } from 'react-dom'
import LoginCard from '../../../Elements/LoginCard/LoginCard'
import trashIcon from '../../../assets/trash.png'
import editIcon from '../../../assets/editing.png'
import { normalizeDriveAudioLink, extractDriveFileId } from '../utils'
import { db } from '../../../firebase'
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'

const Discussions = () => {
  const [inView, setInView] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [playerIn, setPlayerIn] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fallbackSrc, setFallbackSrc] = useState(null)
  // Login + Upload modal state
  const [showLogin, setShowLogin] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [recDriveLink, setRecDriveLink] = useState('')
  const [recName, setRecName] = useState('')
  const [recInfo, setRecInfo] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false)
  const [editIdx, setEditIdx] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [recs, setRecs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  useEffect(() => {
    const id = requestAnimationFrame(() => setInView(true))
    return () => cancelAnimationFrame(id)
  }, [])
  // Persist discussions recordings
  useEffect(() => {
    setIsLoading(true)
    setListError('')
    const q = query(collection(db, 'discussionsRecordings'), orderBy('createdAt', 'desc'))
    let arr = []
    const unsub = onSnapshot(
      q,
      (snap) => {
        const changes = snap.docChanges()
        if (!changes.length) {
          // Initial population or no diffs (fallback)
          arr = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        } else {
          changes.forEach((change) => {
            const id = change.doc.id
            const data = { id, ...change.doc.data() }
            if (change.type === 'added') {
              arr.splice(change.newIndex, 0, data)
            } else if (change.type === 'modified') {
              if (change.oldIndex === change.newIndex) {
                arr[change.oldIndex] = data
              } else {
                arr.splice(change.oldIndex, 1)
                arr.splice(change.newIndex, 0, data)
              }
            } else if (change.type === 'removed') {
              arr.splice(change.oldIndex, 1)
            }
          })
        }
        setRecs([...arr])
        setIsLoading(false)
      },
      (err) => {
        console.error('Failed to subscribe to recordings:', err)
        setListError('Failed to load recordings. Please refresh the page.')
        setIsLoading(false)
      }
    )
    return () => unsub()
  }, [])

  // Upload helpers switched to Google Drive link input
  // Card actions: edit & delete
  const handleDelete = async (idx) => {
    const rec = recs[idx]
    if (!rec?.id) return
    try {
      setDeletingId(rec.id)
      await deleteDoc(doc(db, 'discussionsRecordings', rec.id))
    } catch (e) {
      console.error('Failed to delete recording:', e)
    } finally {
      setDeletingId(null)
    }
  }
  const openEdit = (idx) => {
    setEditIdx(idx)
    setEditName(recs[idx]?.title || '')
    setEditDesc(recs[idx]?.desc || '')
    setEditOpen(true)
  }
  const saveEdit = async () => {
    if (editIdx == null) return
    const rec = recs[editIdx]
    if (!rec?.id) return
    try {
      setEditError('')
      setEditSaving(true)
      await updateDoc(doc(db, 'discussionsRecordings', rec.id), {
        title: editName,
        desc: editDesc,
      })
      // success -> close & reset
      setEditOpen(false)
      setEditIdx(null)
      setEditName('')
      setEditDesc('')
    } catch (e) {
      console.error('Failed to update recording:', e)
      setEditError('Failed to save changes. Please try again.')
    } finally {
      setEditSaving(false)
    }
  }
  return (
    <section className="select-none">
      <h2 className="text-[#0e1728] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-center">Discussion</h2>
      <p className="mt-3 text-center text-[#0e1728]/70 max-w-3xl mx-auto">
        
      </p>

      <div
        className={`mt-8 sm:mt-10 rounded-[2rem] bg-[#ff9000] p-6 sm:p-8 shadow-xl ring-1 ring-black/5 transform-gpu transition-all duration-500 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
      >
        {listError && (
          <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{listError}</p>
        )}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-white"></span>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto pr-1">
          {recs.map((item, i) => (
            <div
              key={item.id || i}
              className={`rounded-3xl bg-[#0e1728] text-white p-4 sm:p-5 shadow-md transform-gpu transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              style={{ transitionDelay: `${100 + i * 50}ms` }}
            >
              <div className="rounded-2xl bg-slate-800/80 p-4">
                <h4 className="font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={
                    (item && item.rawLink && item.rawLink.trim()) ||
                    (extractDriveFileId(((item && (item.fileId || item.src)) || ''))
                      ? `https://drive.google.com/file/d/${extractDriveFileId(((item && (item.fileId || item.src)) || ''))}/view`
                      : (item?.src || '#'))
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white text-[#0e1728] px-5 py-2 font-semibold shadow hover:bg-white/90 transition"
                >
                  Open
                </a>
                {isLoggedIn && (
                  <div className="inline-flex items-center rounded-full bg-white p-1 shadow">
                    <button
                      onClick={() => handleDelete(i)}
                      disabled={Boolean(deletingId)}
                      className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
                      aria-label="Delete recording"
                      title="Delete"
                    >
                      {deletingId === item.id ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <img src={trashIcon} alt="Delete" className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(i)}
                      disabled={Boolean(deletingId)}
                      className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center"
                      aria-label="Edit recording"
                      title="Edit"
                    >
                      <img src={editIcon} alt="Edit" className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}

        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (isLoggedIn) { setShowUploader(true) } else { setShowLogin(true) } }}
            className="inline-flex items-center rounded-full bg-[#0e1728] text-white px-8 py-3 font-semibold shadow-lg hover:opacity-95 transition"
          >
            + Upload
          </button>
        </div>
      </div>
      {/* Login modal */}
      {showLogin && createPortal(
        <div className="modal modal-open fixed inset-0 z-[99999]" style={{ zIndex: 2147483647 }}>
          <div className="modal-box relative z-[100000] w-[96vw] max-w-3xl sm:max-w-4xl md:max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto p-8 sm:p-10 text-base sm:text-lg">
            <button
              className="btn btn-md btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex justify-center">
              <LoginCard
                title="Admin Login"
                onSuccess={() => { setIsLoggedIn(true); setShowLogin(false); setShowUploader(true) }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Uploader modal */}
      {showUploader && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 2147483647 }}>
          <button onClick={() => !isUploading && setShowUploader(false)} className="absolute inset-0 bg-black/40 sm:bg-black/30" aria-label="Close overlay" />
          <div className="relative w-[96vw] max-w-5xl sm:max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-8 sm:p-10 text-base sm:text-lg shadow-2xl">
            <button
              className="btn btn-md btn-circle btn-ghost absolute right-3 top-3"
              onClick={() => !isUploading && setShowUploader(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-bold text-2xl sm:text-3xl text-[#460dff]">Upload Recording</h3>
            <p className="py-2 text-slate-600">Paste a Google Drive link (or file ID). Add a name and info.</p>

            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Name</span></label>
              <input
                type="text"
                className="input input-bordered input-lg h-14 text-lg w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                placeholder="Recording name"
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Info</span></label>
              <textarea
                className="textarea textarea-bordered textarea-lg min-h-[9rem] text-lg w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                rows={3}
                placeholder="Short description or notes"
                value={recInfo}
                onChange={(e) => setRecInfo(e.target.value)}
              />
            </div>
            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Google Drive link or File ID</span></label>
              <input
                type="text"
                className="input input-bordered input-lg h-14 text-lg w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                placeholder="https://drive.google.com/file/d/FILE_ID/view"
                value={recDriveLink}
                onChange={(e) => setRecDriveLink(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">Ensure the file is shared publicly (Anyone with the link can view).</p>
            </div>

            {saveError && <p className="mt-3 text-red-600 text-sm">{saveError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn" onClick={() => !isUploading && setShowUploader(false)} disabled={isUploading}>Close</button>
              <button
                className={`btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90 px-8 text-lg ${isUploading ? 'opacity-80 cursor-not-allowed' : ''}`}
                disabled={isUploading}
                onClick={async () => {
                  if (!recDriveLink.trim()) { setSaveError('Please paste a Google Drive link or file ID'); return }
                  if (!recName.trim()) { setSaveError('Please enter a name'); return }
                  setSaveError('')
                  setIsUploading(true)
                  const { src, fileId } = normalizeDriveAudioLink(recDriveLink, { mode: 'download' })
                  if (!fileId) {
                    setSaveError('Invalid Google Drive link or file ID')
                    setIsUploading(false)
                    return
                  }
                  try {
                    const payload = {
                      title: recName,
                      desc: recInfo || 'User provided recording link.',
                      src,
                      fileId,
                      rawLink: recDriveLink.trim(),
                      createdAt: serverTimestamp(),
                    }
                    await addDoc(collection(db, 'discussionsRecordings'), payload)
                    setShowUploader(false)
                    setRecDriveLink('')
                    setRecName('')
                    setRecInfo('')
                  } catch (e) {
                    console.error('Failed to save recording:', e)
                    setSaveError('Failed to save. Please check your connection and permissions, then try again.')
                  } finally {
                    setIsUploading(false)
                  }
                }}
              >
                {isUploading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm text-white"></span>
                    Uploading...
                  </span>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Edit modal */}
      {editOpen && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 2147483647 }}>
          <button onClick={() => setEditOpen(false)} className="absolute inset-0 bg-black/40 sm:bg-black/30" aria-label="Close overlay" />
          <div className="relative w-[96vw] max-w-5xl sm:max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-8 sm:p-10 text-base sm:text-lg shadow-2xl">
            <button
              className="btn btn-md btn-circle btn-ghost absolute right-3 top-3"
              onClick={() => setEditOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-bold text-2xl sm:text-3xl text-[#460dff]">Edit Recording</h3>
            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Name</span></label>
              <input
                type="text"
                className="input input-bordered input-lg h-14 text-lg w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Info</span></label>
              <textarea
                className="textarea textarea-bordered textarea-lg min-h-[9rem] text-lg w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            {editError && <p className="mt-3 text-red-600 text-sm">{editError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className={`btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90 px-8 text-lg ${editSaving ? 'opacity-80 cursor-not-allowed' : ''}`} disabled={editSaving} onClick={saveEdit}>
                {editSaving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="loading loading-spinner loading-sm text-white"></span>
                    Saving...
                  </span>
                ) : 'Save'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
    </section>
  )
}

export default Discussions