import React from 'react'
import instagramIcon from '../../assets/instagram.png'
import linkedinIcon from '../../assets/linkedin.png'
import telegramIcon from '../../assets/telegram.png'

const Contact = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        {/* Header band (matches site style: dark navy with white text) */}
        <div className="relative rounded-[2rem] bg-[#0e1728] text-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
          {/* Top row: title */}
          <div className="flex items-center justify-start">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">Speaking Community Uzbekistan</h3>
          </div>
          {/* Icons centered vertically on the right */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 inline-flex items-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/15 rounded-full p-2 sm:p-3">
            <a href="https://www.instagram.com/speaking_community_uzbekistan/" target="_blank" rel="noreferrer" aria-label="Instagram" className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition">
              <img src={instagramIcon} alt="Instagram" className="w-8 h-8 sm:w-9 sm:h-9" style={{ filter: 'brightness(0) saturate(100%) invert(57%) sepia(96%) saturate(1066%) hue-rotate(359deg) brightness(102%) contrast(102%)' }} />
            </a>
            <a href="https://www.linkedin.com/company/speaking-community-uzbekistan/?viewAsMember=true" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition">
              <img src={linkedinIcon} alt="LinkedIn" className="w-8 h-8 sm:w-9 sm:h-9" style={{ filter: 'brightness(0) saturate(100%) invert(57%) sepia(96%) saturate(1066%) hue-rotate(359deg) brightness(102%) contrast(102%)' }} />
            </a>
            <a href="https://t.me/speaking_community_uzbekistan" target="_blank" rel="noreferrer" aria-label="Telegram" className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition">
              <img src={telegramIcon} alt="Telegram" className="w-8 h-8 sm:w-9 sm:h-9" style={{ filter: 'brightness(0) saturate(100%) invert(57%) sepia(96%) saturate(1066%) hue-rotate(359deg) brightness(102%) contrast(102%)' }} />
            </a>
          </div>

          {/* Bottom row: two simple columns similar to the reference layout */}
          <div className="mt-8 grid grid-cols-1 gap-6">
            <div>
              <div className="flex items-center gap-3">
                <a
                  href="https://t.me/speakingcommunity_uz"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/80 text-base sm:text-lg hover:text-white transition"
                  aria-label="Contact us on Telegram"
                >
                  Contact Us
                </a>
                <span className="text-white/80 text-base sm:text-lg">*admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
