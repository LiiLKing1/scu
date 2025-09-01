import React, { useState, useRef, useEffect, useMemo } from 'react'

import Icon1 from '../../assets/1.png'
import Icon2 from '../../assets/2.png'
import Icon3 from '../../assets/3.png'
import Icon4 from '../../assets/4.png'

// Panels for each category
import DebatesPanel from './Debates/Debates'
import ChatsPanel from './Chai Chats/Chats'
import DiscussionsPanel from './Discussions/Discussions'
import PublicSpeakingPanel from './Public Speaking Sessions/Publicspeaking'
import LoginCard from '../../Elements/LoginCard/LoginCard'

const _LegacyEvents = () => {
  const podcasts = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `English Podcast #${i + 1}`,
    subtitle: 'Practice listening and pronunciation with curated English recordings.',
    src: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 10) + 1}.mp3`,
  }))
  const [showLogin, setShowLogin] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [uploadFiles, setUploadFiles] = useState([])
  const [recName, setRecName] = useState('')
  const [recInfo, setRecInfo] = useState('')
  const [recBadge, setRecBadge] = useState('English')
  const [recRightLabel, setRecRightLabel] = useState('EP 1')
  const [showEditor, setShowEditor] = useState(false)
  const [editTargetId, setEditTargetId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editInfo, setEditInfo] = useState('')
  const [editBadge, setEditBadge] = useState('')
  const [editRightLabel, setEditRightLabel] = useState('')
  const [editError, setEditError] = useState('')
  const [uploads, setUploads] = useState([])
  const [saveError, setSaveError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [deletedIds, setDeletedIds] = useState([])
  const bars = useMemo(() => {
    const count = 64
    const arr = []
    for (let i = 0; i < count; i++) {
      const v = Math.abs(Math.sin(i * 0.33) + Math.sin(i * 0.12) * 0.6)
      const norm = Math.max(0.2, Math.min(1, 0.35 + v * 0.65))
      arr.push(norm)
    }
    return arr
  }, [currentTrack])

  // Animate tabs and content on first reveal (page load or when scrolled into view)
  const [entered, setEntered] = useState(false)
  const tabsWrapRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setEntered(true)
        obs.disconnect()
      }
    }, { threshold: 0.1 })
    if (tabsWrapRef.current) obs.observe(tabsWrapRef.current)
    if (gridRef.current) obs.observe(gridRef.current)
    return () => obs.disconnect()
  }, [])

  // Skeleton shimmer for cards; also re-triggers on tab change
  const [showSkeleton, setShowSkeleton] = useState(true)
  const skelTimerRef = useRef(null)
  const triggerSkeleton = (ms = 400) => {
    setShowSkeleton(true)
    if (skelTimerRef.current) clearTimeout(skelTimerRef.current)
    skelTimerRef.current = setTimeout(() => setShowSkeleton(false), ms)
  }
  useEffect(() => {
    if (!entered) return
    triggerSkeleton(400)
    return () => { if (skelTimerRef.current) clearTimeout(skelTimerRef.current) }
  }, [entered])

  const formatTime = (sec) => {
    if (!isFinite(sec) || sec <= 0) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleFiles = (fileList) => {
    const accepted = Array.from(fileList || []).filter(f => f.type?.startsWith('audio/'))
    if (accepted.length) setUploadFiles(prev => [...prev, ...accepted])
  }

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files) handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const openPlayer = (item) => {
    setCurrentTrack(item)
    setPlayerOpen(true)
    setCurrentTime(0)
  }

  const closePlayer = () => {
    setPlayerOpen(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
  }

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (a.paused) {
      a.play()
    } else {
      a.pause()
    }
  }

  const seekBy = (delta) => {
    const a = audioRef.current
    if (!a) return
    const next = Math.min(Math.max(0, (a.currentTime || 0) + delta), a.duration || 0)
    a.currentTime = next
    setCurrentTime(next)
  }

  const deleteTrack = (item) => {
    // Stop playback if deleting the current track
    if (currentTrack && currentTrack.id === item.id) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlaying(false)
      setPlayerOpen(false)
      setCurrentTrack(null)
    }
    // Revoke blob URL if applicable
    try {
      if (typeof item.src === 'string' && item.src.startsWith('blob:')) {
        URL.revokeObjectURL(item.src)
      }
    } catch {}
    // Remove from uploads (if it exists there)
    setUploads(prev => prev.filter(u => u.id !== item.id))
    // Track deletion to hide from static podcasts
    setDeletedIds(prev => prev.includes(item.id) ? prev : [...prev, item.id])
  }

  // Open edit modal prefilled with selected upload
  const openEditor = (item) => {
    setEditTargetId(item.id)
    setEditName(item.title || '')
    setEditInfo(item.subtitle || '')
    setEditBadge(item.badgeText || '')
    setEditRightLabel(item.rightLabel || '')
    setEditError('')
    setShowEditor(true)
  }

  // Persist edits into uploads array (and currentTrack if playing)
  const saveEdit = () => {
    if (!editName.trim()) { setEditError('Please enter a name'); return }
    setUploads(prev => prev.map(u => u.id === editTargetId ? {
      ...u,
      title: editName,
      subtitle: editInfo,
      badgeText: editBadge?.trim() || 'English',
      rightLabel: editRightLabel?.trim() || ''
    } : u))
    if (currentTrack && currentTrack.id === editTargetId) {
      setCurrentTrack(prev => ({
        ...prev,
        title: editName,
        subtitle: editInfo,
        badgeText: editBadge?.trim() || 'English',
        rightLabel: editRightLabel?.trim() || ''
      }))
    }
    setShowEditor(false)
  }

  const onWaveClick = (e) => {
    const a = audioRef.current
    if (!a || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = Math.min(Math.max(0, x / rect.width), 1)
    const t = ratio * duration
    a.currentTime = t
    setCurrentTime(t)
  }

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const handleLoaded = () => setDuration(a.duration || 0)
    const handleTime = () => setCurrentTime(a.currentTime || 0)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    a.addEventListener('loadedmetadata', handleLoaded)
    a.addEventListener('timeupdate', handleTime)
    a.addEventListener('play', handlePlay)
    a.addEventListener('pause', handlePause)
    a.addEventListener('ended', handleEnded)
    return () => {
      a.removeEventListener('loadedmetadata', handleLoaded)
      a.removeEventListener('timeupdate', handleTime)
      a.removeEventListener('play', handlePlay)
      a.removeEventListener('pause', handlePause)
      a.removeEventListener('ended', handleEnded)
    }
  }, [playerOpen, currentTrack])

  // Reusable grid to render podcasts and uploads inside tabs
  const CardsGrid = ({ innerRef }) => (
    <section
      ref={innerRef}
      className={`container mx-auto max-w-7xl px-4 pb-4 transform transition-all duration-300 ease-out ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {showSkeleton
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl p-4 bg-[#460dff]/5">
                <div className="skeleton !bg-gray-200 h-28 w-full rounded-xl"></div>
                <div className="skeleton !bg-gray-200 h-5 w-2/3 mt-4"></div>
                <div className="skeleton !bg-gray-200 h-4 w-full mt-2"></div>
                <div className="skeleton !bg-gray-200 h-4 w-5/6 mt-2"></div>
                <div className="skeleton !bg-gray-200 h-10 w-full mt-4 rounded-xl"></div>
                {/* shimmer light sweep */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 animate-skeleton-shimmer bg-[linear-gradient(100deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.75)_50%,rgba(255,255,255,0)_100%)]"></div>
              </div>
            ))
          : [...uploads, ...podcasts]
              .filter(p => !deletedIds.includes(p.id))
              .map(p => (
                <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-[#460dff]/10 text-[#460dff] text-xs font-semibold px-2 py-1">
                      {p.badgeText || 'English'}
                    </span>
                    <span className="text-xs text-slate-500">{p.rightLabel ? p.rightLabel : (typeof p.id === 'number' ? `EP ${p.id}` : '')}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900 line-clamp-2">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-3">{p.subtitle}</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => openPlayer(p)}
                      className="btn w-full border-[#460dff] text-[#460dff] bg-white hover:bg-[#460dff] hover:text-white"
                    >
                      Listen
                    </button>
                    {isLoggedIn && p.uploaded && (
                      <button
                        type="button"
                        onClick={() => openEditor(p)}
                        className="btn bg-[#460dff] border-[#460dff] text-white w-full mt-2 hover:opacity-90"
                      >
                        Edit
                      </button>
                    )}
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => deleteTrack(p)}
                        className="btn btn-outline btn-error w-full mt-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
      </div>
    </section>
  )

  return (
    <main className="bg-white">
      {/* Title and description */}
      <section className="container mx-auto max-w-7xl px-4 pt-24 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#460dff]">
          Events
        </h1>
        <div
          ref={tabsWrapRef}
          className={`mt-4 flex justify-center transition-all ${entered ? 'animate-slide-in-left' : 'opacity-0 -translate-y-2'}`}
          style={entered ? { animationDuration: '500ms' } : undefined}
        >
          {/* DaisyUI tabs - names must be unique per group */}
          <div className="tabs tabs-lifted w-full max-w-5xl">
            {/* Debates */}
            <input type="radio" name="events_tabs" className="tab rounded-t-xl !rounded-b-none px-4 md:px-5 text-sm md:text-base !bg-transparent !text-[#460dff] !opacity-100 hover:text-[#460dff] border-2 border-transparent checked:bg-[#460dff] checked:text-white checked:border-[#460dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#460dff] transition-all" aria-label="Debates" defaultChecked onChange={() => triggerSkeleton(400)} />
            <div className="tab-content bg-white border-t border-slate-200 p-6 rounded-t-2xl">
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (isLoggedIn) {
                      setShowUploader(true)
                    } else {
                      setShowLogin(true)
                    }
                  }}
                  className="btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90"
                >
                  Upload
                </button>
              </div>
              <CardsGrid innerRef={gridRef} />
            </div>

            {/* Discussions */}
            <input type="radio" name="events_tabs" className="tab rounded-t-xl !rounded-b-none px-4 md:px-5 text-sm md:text-base !bg-transparent !text-[#460dff] !opacity-100 hover:text-[#460dff] border-2 border-transparent checked:bg-[#460dff] checked:text-white checked:border-[#460dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#460dff] transition-all" aria-label="Discussions" onChange={() => triggerSkeleton(400)} />
            <div className="tab-content bg-white border-t border-slate-200 p-6 rounded-t-2xl">
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90"
                >
                  Upload
                </button>
              </div>
              <CardsGrid innerRef={gridRef} />
            </div>

            {/* Public Speaking */}
            <input type="radio" name="events_tabs" className="tab rounded-t-xl !rounded-b-none px-4 md:px-5 text-sm md:text-base !bg-transparent !text-[#460dff] !opacity-100 hover:text-[#460dff] border-2 border-transparent checked:bg-[#460dff] checked:text-white checked:border-[#460dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#460dff] transition-all" aria-label="Public Speaking" onChange={() => triggerSkeleton(400)} />
            <div className="tab-content bg-white border-t border-slate-200 p-6 rounded-t-2xl">
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90"
                >
                  Upload
                </button>
              </div>
              <CardsGrid innerRef={gridRef} />
            </div>

            {/* Chai Chats */}
            <input type="radio" name="events_tabs" className="tab rounded-t-xl !rounded-b-none px-4 md:px-5 text-sm md:text-base !bg-transparent !text-[#460dff] !opacity-100 hover:text-[#460dff] border-2 border-transparent checked:bg-[#460dff] checked:text-white checked:border-[#460dff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#460dff] transition-all" aria-label="Chai Chats" onChange={() => triggerSkeleton(400)} />
            <div className="tab-content bg-white border-t border-slate-200 p-6 rounded-t-2xl">
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90"
                >
                  Upload
                </button>
              </div>
              <CardsGrid innerRef={gridRef} />
            </div>
          </div>
        </div>
      </section>

      {/* Cards are now rendered inside tabs above via <CardsGrid /> */}
      {showLogin && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-3xl shadow-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <LoginCard
              title="Admin Login"
              onSuccess={() => {
                setIsLoggedIn(true)
                setShowLogin(false)
                setShowUploader(true)
              }}
            />
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditor && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-white rounded-3xl shadow-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowEditor(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-[#460dff]">Edit Recording</h3>
            <p className="py-2 text-slate-600">Update the details for this upload.</p>

            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Name</span></label>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                placeholder="Recording name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Info</span></label>
              <textarea
                className="textarea textarea-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                rows={3}
                placeholder="Short description or notes"
                value={editInfo}
                onChange={(e) => setEditInfo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="form-control">
                <label className="label"><span className="label-text text-slate-900">Badge text (left chip)</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                  placeholder="English"
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-slate-900">Right label (e.g., EP 1)</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                  placeholder="EP 1"
                  value={editRightLabel}
                  onChange={(e) => setEditRightLabel(e.target.value)}
                />
              </div>
            </div>

            {editError && <p className="mt-3 text-red-600 text-sm">{editError}</p>}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowEditor(false)}>Close</button>
              <button
                className={`btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90`}
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player modal */}
      {playerOpen && currentTrack && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white rounded-3xl shadow-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closePlayer}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-semibold text-lg text-slate-900">{currentTrack.title}</h3>
            <p className="mt-1 text-slate-600">{currentTrack.subtitle}</p>

            <div className="mt-4">
              <div
                className="relative w-full h-12 cursor-pointer select-none"
                onClick={onWaveClick}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={Math.floor(duration) || 0}
                aria-valuenow={Math.floor(currentTime) || 0}
                aria-label="Seek"
              >
                <div className="absolute inset-0 flex items-center gap-[2px]">
                  {bars.map((v, idx) => {
                    const progress = duration ? currentTime / duration : 0
                    const filled = idx / bars.length <= progress
                    const height = 8 + Math.round(v * 24)
                    return (
                      <span
                        key={idx}
                        className="inline-block w-[3px] rounded-sm"
                        style={{
                          height: `${height}px`,
                          backgroundColor: filled ? '#111827' : '#e5e7eb',
                        }}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4">
              <button className="btn btn-circle bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => seekBy(-10)} aria-label="Rewind 10 seconds">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 5v14l-8-7 8-7zm10 0v14l-8-7 8-7z"/></svg>
                </div>
              </button>
              <button className="btn btn-circle bg-[#460dff] text-white hover:opacity-90" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 5v14l11-7-11-7z"/></svg>
                )}
              </button>
              <button className="btn btn-circle bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => seekBy(10)} aria-label="Forward 10 seconds">
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 19V5l8 7-8 7zM2 19V5l8 7-8 7z"/></svg>
                </div>
              </button>
            </div>

            <audio
              ref={audioRef}
              src={currentTrack.src}
              preload="metadata"
              autoPlay
              className="hidden"
            />
          </div>
        </div>
      )}

      {showUploader && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-white rounded-3xl shadow-2xl">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowUploader(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-bold text-lg text-[#460dff]">Upload Recording</h3>
            <p className="py-2 text-slate-600">Drag & drop audio files, or click to select. Add a name and info.</p>

            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Name</span></label>
              <input
                type="text"
                className="input input-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                placeholder="Recording name"
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
              />
            </div>

            <div className="form-control mt-3">
              <label className="label"><span className="label-text text-slate-900">Info</span></label>
              <textarea
                className="textarea textarea-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                rows={3}
                placeholder="Short description or notes"
                value={recInfo}
                onChange={(e) => setRecInfo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="form-control">
                <label className="label"><span className="label-text text-slate-900">Badge text (left chip)</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                  placeholder="English"
                  value={recBadge}
                  onChange={(e) => setRecBadge(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-slate-900">Right label (e.g., EP 1)</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full rounded-xl bg-slate-100 text-slate-900 placeholder-slate-500 border-slate-300 focus:bg-white focus:border-[#460dff]"
                  placeholder="EP 1"
                  value={recRightLabel}
                  onChange={(e) => setRecRightLabel(e.target.value)}
                />
              </div>
            </div>

            <div
              className="mt-4 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center cursor-pointer hover:border-[#460dff]"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={() => document.getElementById('events-audio-file-input')?.click()}
            >
              <p className="text-slate-600">Drag & drop audio files here, or click to select</p>
              <input
                id="events-audio-file-input"
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {uploadFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-800 mb-2">Selected files</h4>
                <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1">
                  {uploadFiles.map((f, idx) => (
                    <li key={idx}>{f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {saveError && <p className="mt-3 text-red-600 text-sm">{saveError}</p>}

            <div className="modal-action">
              <button className="btn" onClick={() => !isUploading && setShowUploader(false)} disabled={isUploading}>Close</button>
              <button
                className={`btn bg-[#460dff] border-[#460dff] text-white hover:opacity-90 ${isUploading ? 'opacity-80 cursor-not-allowed' : ''}`}
                disabled={isUploading}
                onClick={() => {
                  if (uploadFiles.length === 0) { setSaveError('Please add at least one audio file'); return }
                  if (!recName.trim()) { setSaveError('Please enter a name'); return }
                  setSaveError('')
                  setIsUploading(true)
                  // Simulate async upload (replace with real API later)
                  setTimeout(() => {
                    const now = Date.now()
                    const newUploads = uploadFiles.map((f, i) => ({
                      id: `${now}-${i}`,
                      title: recName || f.name,
                      subtitle: recInfo || 'User uploaded recording.',
                      src: URL.createObjectURL(f),
                      uploaded: true,
                      badgeText: (recBadge && recBadge.trim()) || 'English',
                      rightLabel: (recRightLabel && recRightLabel.trim()) || `EP ${i + 1}`,
                    }))
                    setUploads(prev => [...prev, ...newUploads])
                    setIsUploading(false)
                    setShowUploader(false)
                    setUploadFiles([])
                    setRecName('')
                    setRecInfo('')
                    setRecBadge('English')
                    setRecRightLabel('EP 1')
                  }, 1500)
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
        </div>
      )}
      {/* Bottom loading toast */}
      <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] transform transition-all duration-300 ${isUploading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="rounded-full bg-slate-900 text-white px-4 py-2 shadow-lg flex items-center gap-2">
          <span className="loading loading-spinner loading-sm text-white"></span>
          <span className="text-sm">Uploading, please wait...</span>
        </div>
      </div>
    </main>
  )
}

// New simple Events UI
const cards = [
  { key: 'debates', title: 'Debates', icon: Icon1 },
  { key: 'chats', title: 'Chai Chats', icon: Icon2 },
  { key: 'discussion', title: 'Discussion', icon: Icon3 },
  { key: 'public', title: 'Public Speaking Sessions', icon: Icon4 },
]

// Per-card descriptions displayed inside the SimpleEvents grid cards
const cardDescriptions = {
  debates: (
    <ul className="list-disc pl-5 space-y-2">
      <li>Debating is a battle of ideas—sharp minds clash, arguments ignite, and the strongest logic wins.</li>
      <li>In our debates, we have 2 professionals. One to organize the debates and one to give personal and specific feedbacks. The feedbacks are essential to improve and only we offer that. For our debates, we choose a controversial topic and usually have 5v5 battles.(We divide teams randomly)</li>
      <li>In the main part, participants state their arguments. Then, we have Rebuttal, where people can counterargument the arguments of their opponents. In the end, we provide feedbacks, choose the best debate, and decide which team</li>
    </ul>
  ),
  chats: (
    <ul className="list-disc pl-5 space-y-2">
      <li>A Chai Chat is a warm discussion where people can share ideas and do this over a cup of tea. Unfortunately, we organize it online, and can’t provide tea, but the discussion part is still there). The organizer will ask the participants about their life experiences, challenging situations in their lives and other thought-provoking questions.</li>
      <li>Overall, it is a great way to socialize, to unwind, and catch up on the words and collocations in English that you may have forgotten.</li>
    </ul>
  ),
  discussion: (
    <ul className="list-disc pl-5 space-y-2">
      <li>It is a formal type of discussion.The topic is chosen, and a small group starts speaking</li>
      <li>1 part-Icebreakers. People get engaged into the topic with some personal and interesting questions from the organizer.</li>
      <li>2 part-Make ups of short stories related to the topic</li>
      <li>3 part-Agree/Disagree. The organizer gives a statement, and participant can either agree or disagree. They need to back-up their point.</li>
    </ul>
  ),
  public: (
    <ul className="list-disc pl-5 space-y-2">
      <li>Public speaking is the act of delivering a structured, purposeful speech to an audience with the goal of informing, persuading, or entertaining. It involves clear communication, audience engagement, and effective use of voice and body language.</li>
      <li>Participants have to deliver a speech about some interesting topic (it should not be a basic one but the one you truly wish to learn more about)</li>
      <li>The speech should last 3-5 minutes with good usage of academic vocabulary</li>
    </ul>
  ),
}

const SimpleEvents = () => {
  const [activePanel, setActivePanel] = useState(null) // 'debates' | 'chats' | 'discussion' | 'public' | null
  const [panelIn, setPanelIn] = useState(false)

  const openPanel = (key) => {
    setActivePanel(key)
    // next tick to allow transition
    requestAnimationFrame(() => setPanelIn(true))
  }
  const closePanel = () => {
    setPanelIn(false)
    setTimeout(() => setActivePanel(null), 300)
  }

  return (
    <main className="bg-white min-h-screen">
      <section className="container mx-auto px-4 pt-28 pb-12">
        <h1 className="text-[#0e1728] text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-center">
          Events
        </h1>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {cards.map((c) => (
            <div
              key={c.title}
              className="flex items-center justify-between gap-6 rounded-3xl bg-[#0e1728] text-white p-6 sm:p-8 shadow-lg transform-gpu"
            >
              <div className="max-w-[60%]">
                <h3 className="text-xl sm:text-2xl font-semibold">{c.title}</h3>
                <div className="mt-2 text-white/80 text-sm sm:text-base leading-relaxed">
                  {cardDescriptions[c.key]}
                </div>
                <button
                  onClick={() => openPanel(c.key)}
                  className="mt-4 inline-flex items-center rounded-full bg-white text-[#0e1728] px-5 py-2 font-semibold shadow hover:bg-white/90 transition"
                >
                  Open
                </button>
              </div>
              <img src={c.icon} alt={`${c.title} icon`} className="w-24 sm:w-28 md:w-32 h-auto object-contain select-none brightness-0 invert" />
            </div>
          ))}
        </div>
      </section>

      {activePanel && (
        <div className="fixed inset-0 z-[3000] flex items-end justify-center">
          {/* Backdrop */}
          <button
            aria-label="Close overlay"
            onClick={closePanel}
            className={`absolute inset-0 bg-white/80 backdrop-blur-md sm:backdrop-blur-lg transition-opacity duration-300 ${panelIn ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Panel container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full sm:max-w-6xl mx-auto px-4 transform-gpu transition-all duration-500 ease-out ${panelIn ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
          >
            <div className="absolute -top-10 right-6 hidden sm:block">
              <button
                onClick={closePanel}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#0e1728] shadow hover:bg-white/90 transition"
              >
                ✕
              </button>
            </div>
            {activePanel === 'debates' && <DebatesPanel />}
            {activePanel === 'chats' && <ChatsPanel />}
            {activePanel === 'discussion' && <DiscussionsPanel />}
            {activePanel === 'public' && <PublicSpeakingPanel />}
          </div>
        </div>
      )}
    </main>
  )
}

export default SimpleEvents
