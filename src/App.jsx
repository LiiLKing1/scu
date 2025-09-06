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
      <section id="home" className="relative scroll-mt-28">
        <Home />
      </section>

      <section id="events" className="bg-white scroll-mt-28">
        <Events />
      </section>

      <section id="reviews" className="bg-white scroll-mt-28">
        <Reviews />
      </section>

      <section id="aboutp" className="bg-white scroll-mt-28">
        <Aboutp />
      </section>

      <section id="contact" className="bg-white scroll-mt-28">
        <Contact />
      </section>

      <section id="admin" className="bg-white scroll-mt-28">
        <AdminGate />
      </section>
    </div>
  )
}

export default App