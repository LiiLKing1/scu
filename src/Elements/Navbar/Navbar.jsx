 import React, { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import logo from '../../assets/logos.png'

const Navbar = () => {
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

  // Register GSAP plugin once
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const handleNavClick = (e, id) => {
    e.preventDefault()
    setActive(id)
    setMenuOpen(false)
    const header = document.querySelector('header')
    const offsetY = header?.offsetHeight || 96
    gsap.to(window, {
      duration: 0.9,
      ease: 'power2.out',
      scrollTo: { y: `#${id}`, offsetY },
    })
  }

  useEffect(() => {
    const ids = ['home', 'events', 'reviews', 'aboutp', 'admin']
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) {
          setActive(visible[0].target.id)
        }
      },
      { root: null, rootMargin: '-50% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const NavItems = (
    <>
      <li>
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className={active === 'home' ? 'rounded-full px-4 py-1.5 bg-[#ff9000] text-[#0e1728] font-semibold transition-colors' : 'hover:text-white/90 transition-colors'}
        >
          Home
        </a>
      </li>
      <li>
        <a
          href="#events"
          onClick={(e) => handleNavClick(e, 'events')}
          className={active === 'events' ? 'rounded-full px-4 py-1.5 bg-[#ff9000] text-[#0e1728] font-semibold transition-colors' : 'hover:text-white/90 transition-colors'}
        >
          Events
        </a>
      </li>
      <li>
        <a
          href="#reviews"
          onClick={(e) => handleNavClick(e, 'reviews')}
          className={active === 'reviews' ? 'rounded-full px-4 py-1.5 bg-[#ff9000] text-[#0e1728] font-semibold transition-colors' : 'hover:text-white/90 transition-colors'}
        >
          Reviews
        </a>
      </li>
      <li>
        <a
          href="#aboutp"
          onClick={(e) => handleNavClick(e, 'aboutp')}
          className={active === 'aboutp' ? 'rounded-full px-4 py-1.5 bg-[#ff9000] text-[#0e1728] font-semibold transition-colors' : 'hover:text-white/90 transition-colors'}
        >
          About
        </a>
      </li>
      <li>
        <a
          href="#admin"
          onClick={(e) => handleNavClick(e, 'admin')}
          className={active === 'admin' ? 'rounded-full px-4 py-1.5 bg-[#ff9000] text-[#0e1728] font-semibold transition-colors' : 'hover:text-white/90 transition-colors'}
        >
          Admin
        </a>
      </li>
    </>
  )

  return (
    <header className="fixed top-0 inset-x-0 z-[2000]">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between rounded-full bg-[#0e1728] px-4 sm:px-6 py-2 sm:py-3 shadow-lg transform-gpu">
          <a href="#home" className="flex items-center gap-3 select-none">
            <img src={logo} alt="SCU logo" className="h-12 sm:h-14 w-auto object-contain" />
          </a>
          <ul className="hidden md:flex items-center gap-4 sm:gap-6 text-white text-[15px]">
            {NavItems}
          </ul>
          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-white text-[#0e1728] shadow hover:bg-white/90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 0 1 4.5 6h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75zm0 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75zm.75 4.5a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
        {/* Mobile drawer overlay + panel */}
        <div
          className={`fixed inset-0 z-[2500] transition-opacity duration-300 ${
            menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!menuOpen}
        >
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          {/* Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 top-0 h-full w-80 max-w-[85%] bg-[#0e1728] text-white shadow-2xl transform-gpu transition-transform duration-300 ${
              menuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <a href="#home" className="flex items-center gap-3 select-none" onClick={(e) => handleNavClick(e, 'home')}>
                <img src={logo} alt="SCU logo" className="h-10 w-auto object-contain" />
              </a>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#0e1728] shadow hover:bg-white/90 transition"
              >
                ✕
              </button>
            </div>
            <ul className="p-4 space-y-2 text-white text-[16px]">
              {NavItems}
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar