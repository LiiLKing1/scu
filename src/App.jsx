import React, { useRef } from 'react'
import Navbar from './Elements/Navbar/Navbar'
import Home from './Pages/Home/Home'
import Events from './Pages/Events/Events'
import Reviews from './Pages/Reviews/Reviews'
import Aboutp from './Pages/AboutP/Aboutp'
import AdminGate from './Pages/Admin/AdminGate'

const App = () => {
  const eventsRef = useRef(null)

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="overflow-x-hidden bg-white pt-20 sm:pt-24">
      <Navbar />
      {/* Home section */}
      <section id="home" className="relative scroll-mt-28">
        <Home />
        {/* Down arrow */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 text-[#0e1728]/70 font-medium">Scroll down</div>
        <button
          aria-label="Scroll to Events"
          onClick={scrollToEvents}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 rounded-full bg-white/80 backdrop-blur px-3 py-3 shadow-lg ring-1 ring-black/10 hover:bg-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111827" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 15.75a.75.75 0 0 1-.53-.22l-7-7a.75.75 0 1 1 1.06-1.06L12 13.94l6.47-6.47a.75.75 0 1 1 1.06 1.06l-7 7a.75.75 0 0 1-.53.22z" clipRule="evenodd" />
          </svg>
        </button>
      </section>

      {/* Events section */}
      <section id="events" ref={eventsRef} className="bg-white scroll-mt-28">
        <Events />
      </section>

      {/* Reviews section (3rd page) */}
      <section id="reviews" className="bg-white scroll-mt-28">
        <Reviews />
      </section>

      {/* AboutP section (4th page) */}
      <section id="aboutp" className="bg-white scroll-mt-28">
        <Aboutp />
      </section>

      {/* Admin section */}
      <section id="admin" className="bg-white scroll-mt-28">
        <AdminGate />
      </section>
    </div>
  )
}

export default App