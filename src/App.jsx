import React from 'react'
import Navbar from './Elements/Navbar/Navbar'
import Home from './Pages/Home/Home'
import Events from './Pages/Events/Events'
import Reviews from './Pages/Reviews/Reviews'
import Aboutp from './Pages/AboutP/Aboutp'
import Contact from './Pages/Contact/Contact'
import AdminGate from './Pages/Admin/AdminGate'

const App = () => {

  return (
    <div className="overflow-x-hidden bg-white pt-20 sm:pt-24">
      <Navbar />
      {/* Home section */}
      <section id="home" className="relative scroll-mt-28">
        <Home />
      </section>

      {/* Events section */}
      <section id="events" className="bg-white scroll-mt-28">
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

      {/* Contact section (after About) */}
      <section id="contact" className="bg-white scroll-mt-28">
        <Contact />
      </section>

      {/* Admin section */}
      <section id="admin" className="bg-white scroll-mt-28">
        <AdminGate />
      </section>
    </div>
  )
}

export default App