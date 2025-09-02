import React from 'react'
import photoImg from '../../assets/photo.jpg'

const Aboutp = () => {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#ff9000]">About us</h2>
          {/* Removed placeholder lorem ipsum heading */}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-6 text-[#0e1728]">
            {/* headings moved above for full-width centering */}

            {/* Single card (orange variant) */}
            <div className="relative rounded-3xl bg-[#ff9000] p-6 sm:p-8 shadow-xl ring-1 ring-black/10">
              <h4 className="text-xl font-semibold text-white mt-8">About us:</h4>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                The IELTS trend came to Uzbekistan a few years ago. People were spending years in preparation, but is a language all about getting a certificate?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                Language is about speaking. It is a form of exchanging information with others, and this area needed practice. Learning centers were not focusing on this; people that could not afford LCs had nothing to do, maybe attend some offline meetings barely organized once a month.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/90">Coming up with the solution was necessary.</p>
              <ul className="mt-3 space-y-1 text-sm text-white/95 list-disc list-inside">
                <li><span className="font-semibold">Free</span> - so that it is accessible to everyone</li>
                <li><span className="font-semibold">Online</span> - so that there would be no transportation costs</li>
                <li><span className="font-semibold">Daily</span> - regular practice and opportunity to build friendships</li>
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-white/90">
                Having helped over 1500 people so far, we are continuing to grow with a clear vision and boundless enthusiasm
              </p>
            </div>
          </div>

          <div className="flex md:justify-end">
            <div className="flex flex-col items-center">
              <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[26rem] lg:h-[26rem] rounded-full overflow-hidden bg-[#0e1728] ring-1 ring-black/10 shadow-2xl">
                <img src={photoImg} alt="About visual" className="w-full h-full object-cover" />
              </div>
              {/* Role label above name */}
              <div className="mt-4 sm:mt-6 text-[#0e1728] text-sm font-semibold">Founder and PM</div>
              {/* Larger name pill */}
              <div className="mt-2 sm:mt-3 inline-flex items-center justify-center px-8 sm:px-10 py-3 rounded-full bg-[#ff9000] text-[#0e1728] font-extrabold text-lg sm:text-xl shadow">
                Safar Choriev
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Aboutp