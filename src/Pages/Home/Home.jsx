 import React from 'react'
import homeImage from '../../assets/home.png'
import telegramIcon from '../../assets/telegram.png'

const Home = () => {
  return (
    <main className="relative min-h-[100svh] bg-white overflow-hidden">
      <div className="absolute inset-0">
        <img src={homeImage} alt="SCU community" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-white/70"></div>
      </div>
      <section className="relative z-10 flex min-h-[100svh] items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <p className="text-[#0e1728] text-2xl sm:text-3xl font-medium drop-shadow">Welcome to</p>
          <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-[#0e1728] drop-shadow">
            <span className="block">Speaking Community</span>
            <span className="mt-4 inline-block rounded-full bg-[#ff9000] text-[#0e1728] px-5 py-2 sm:px-6 sm:py-2.5">Uzbekistan</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#0e1728]/70">
            A place where we empower individuals to enhance their speaking skills, connect with others, and broaden their perspectives—completely free and every day. Join us for engaging debates, dynamic discussions, public speaking sessions, and casual chai chats, all designed to help you practice confidently and grow socially in a supportive online community.
          </p>

          {/* Telegram CTA */}
          <div className="mt-10 flex items-center justify-center">
            <a
              href="https://t.me/speaking_community_uzbekistan"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4"
              aria-label="Join our Telegram channel"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#0e1728] shadow-lg flex items-center justify-center">
                <img src={telegramIcon} alt="Telegram" className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <span className="inline-flex items-center rounded-full bg-white text-[#0e1728] px-6 sm:px-8 py-3 font-semibold shadow-md group-hover:bg-white/90 transition">
                Join channel to participate
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
