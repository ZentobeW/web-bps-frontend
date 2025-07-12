const Footer = () => {
  return (
    <footer className="relative w-full bg-bps-blue text-white mt-16 z-10">
      {/* Wave Effect */}
      <div className="absolute -top-24 left-0 w-full h-24 overflow-hidden leading-none transform rotate-180">
        <svg className="relative block w-full h-24" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative z-10">
        {/* Logo Section */}
        <div className="flex items-center mb-10 pb-8 border-b border-white border-opacity-20">
          <div className="relative">
            <img
              src="https://res.cloudinary.com/djcm0swgo/image/upload/v1751775675/bps-logo_1_ldppzk.png"
              alt="Logo BPS"
              className="w-16 h-16 mr-6 bg-white rounded-xl p-2 shadow-logo"
            />
            <div className="absolute -inset-1 bg-gradient-to-r from-white to-transparent opacity-20 rounded-xl blur-sm"></div>
          </div>
          <div className="flex flex-col">
            <h3 className="m-0 mb-2 font-poppins text-xl lg:text-2xl font-bold text-white">BPS PROVINSI GORONTALO</h3>
            <p className="m-0 text-sm text-white text-opacity-80 font-medium">Badan Pusat Statistik</p>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Section */}
          <div className="space-y-6">
            <h4 className="footer-section-title text-lg font-semibold text-white">Kontak</h4>
            <div className="space-y-4">
              <div className="flex items-start group">
                <svg
                  className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 fill-current text-white text-opacity-80 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                    fill="currentColor"
                  />
                </svg>
                <p className="text-sm text-white text-opacity-80 group-hover:text-white transition-colors leading-relaxed">
                  Jl. Prof. Dr. Aloe Saboe No.117
                  <br />
                  96128 Gorontalo, Gorontalo
                </p>
              </div>
              <div className="flex items-center group">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0 fill-current text-white text-opacity-80 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" 
                    fill="currentColor"
                  />
                </svg>
                <p className="text-sm text-white text-opacity-80 group-hover:text-white transition-colors">
                  0811-431-0075
                </p>
              </div>
              <div className="flex items-center group">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0 fill-current text-white text-opacity-80 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" 
                    fill="currentColor"
                  />
                </svg>
                <a
                  href="mailto:pstgorontalo@bps.go.id"
                  className="text-sm text-white text-opacity-80 hover:text-white transition-colors no-underline"
                >
                  pstgorontalo@bps.go.id
                </a>
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-6">
            <h4 className="footer-section-title text-lg font-semibold text-white">Tautan Penting</h4>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <a
                  href="https://www.bps.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-sm text-white text-opacity-80 hover:text-white transition-all duration-300 no-underline inline-block"
                >
                  BPS Indonesia
                </a>
              </li>
              <li>
                <a
                  href="https://gorontalo.bps.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link text-sm text-white text-opacity-80 hover:text-white transition-all duration-300 no-underline inline-block"
                >
                  BPS Gorontalo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="footer-link text-sm text-white text-opacity-80 hover:text-white transition-all duration-300 no-underline inline-block"
                >
                  Peta Situs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="footer-link text-sm text-white text-opacity-80 hover:text-white transition-all duration-300 no-underline inline-block"
                >
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="space-y-6">
            <h4 className="footer-section-title text-lg font-semibold text-white">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="group block w-12 h-12 rounded-xl bg-white bg-opacity-10 transition-all duration-300 hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 shadow-social flex items-center justify-center"
                aria-label="Facebook"
              >
              <svg 
                className="w-6 h-6 fill-current text-blue-600 hover:scale-110 transition-transform duration-300" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z" 
                  fill="currentColor"
                />
              </svg>
              </a>
              <a
                href="#"
                className="group block w-12 h-12 rounded-xl bg-white bg-opacity-10 transition-all duration-300 hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 shadow-social flex items-center justify-center"
                aria-label="X"
              >
              <svg 
                className="w-6 h-6 fill-current text-black group-hover:scale-110 transition-transform duration-300" 
                viewBox="0 0 50 50" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5.9199219 6L20.582031 27.375L6.2304688 44H9.4101562L21.986328 29.421875L31.986328 44H44L28.681641 21.669922L42.199219 6H39.029297L27.275391 19.617188L17.933594 6H5.9199219zM9.7167969 8H16.880859L40.203125 42H33.039062L9.7167969 8z" 
                  fill="currentColor" 
                />
              </svg>
              </a>
              <a
                href="#"
                className="group block w-12 h-12 rounded-xl bg-white bg-opacity-10 transition-all duration-300 hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 shadow-social flex items-center justify-center"
                aria-label="Instagram"
              >
              <svg 
                className="w-6 h-6 fill-current text-pink-600 group-hover:scale-110 transition-transform duration-300" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M7.75 2h8.5C19.55 2 22 4.45 22 7.75v8.5c0 3.3-2.45 5.75-5.75 5.75h-8.5C4.45 22 2 19.55 2 16.25v-8.5C2 4.45 4.45 2 7.75 2zm0 1.5C5.68 3.5 4 5.18 4 7.25v9.5C4 18.32 5.68 20 7.75 20h8.5c2.07 0 3.75-1.68 3.75-3.75v-8.5C20 5.68 18.32 4 16.25 4h-8.5zm4.25 3a5.25 5.25 0 1 1 0 10.5A5.25 5.25 0 0 1 12 7.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm4.88-.88a.88.88 0 1 1 0 1.75.88.88 0 0 1 0-1.75z" 
                  fill="currentColor"
                />
              </svg>
              </a>
              <a
                href="#"
                className="group block w-12 h-12 rounded-xl bg-white bg-opacity-10 transition-all duration-300 hover:bg-white hover:bg-opacity-20 hover:-translate-y-1 shadow-social flex items-center justify-center"
                aria-label="YouTube"
              >
              <svg 
                className="w-6 h-6 fill-current text-red-600 group-hover:scale-110 transition-transform duration-300" 
                viewBox="0 0 48 48" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M43.2,33.9c-0.4,2.1-2.1,3.7-4.2,4c-3.3,0.5-8.8,1.1-15,1.1c-6.1,0-11.6-0.6-15-1.1c-2.1-0.3-3.8-1.9-4.2-4C4.4,31.6,4,28.2,4,24
                  c0-4.2,0.4-7.6,0.8-9.9c0.4-2.1,2.1-3.7,4.2-4C12.3,9.6,17.8,9,24,9c6.2,0,11.6,0.6,15,1.1c2.1,0.3,3.8,1.9,4.2,4
                  c0.4,2.3,0.9,5.7,0.9,9.9C44,28.2,43.6,31.6,43.2,33.9z" 
                  fill="currentColor"
                />
                <path 
                  d="M20 31L20 17 32 24z" 
                  fill="#FFFFFF"
                />
              </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-black bg-opacity-20 border-t border-white border-opacity-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-white text-opacity-80 text-center md:text-left">
              <p className="mb-1">© 2025 Politeknik Statistik STIS. All rights reserved.</p>
              <p className="mb-0">
                Created by Farhan Kadhafi Azuansyah (
                <a
                  href="mailto:ken@stis.ac.id"
                  className="text-white text-opacity-90 hover:text-white transition-colors duration-300 no-underline hover:underline"
                >
                  ken@stis.ac.id
                </a>
                )
              </p>
            </div>
            <div className="text-xs text-white text-opacity-60">
              <p>Badan Pusat Statistik Provinsi Gorontalo</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer