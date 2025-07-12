"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"

const mockGalleryData = [
  {
    id: 1,
    gambar: "gambar1.jpg",
    judul: "Sosialisasi Sensus Penduduk 2025",
    tanggal: "1 Mei 2025",
    views: 256,
  },
  {
    id: 2,
    gambar: "gambar2.jpg",
    judul: "Workshop Pengolahan Data Statistik",
    tanggal: "1 April 2025",
    views: 189,
  },
  {
    id: 3,
    gambar: "gambar3.jpg",
    judul: "Pelatihan Enumerator Survei Ekonomi",
    tanggal: "1 Maret 2025",
    views: 342,
  },
  {
    id: 4,
    gambar: "gambar4.jpg",
    judul: "Rapat Koordinasi Statistik Daerah",
    tanggal: "1 Februari 2025",
    views: 178,
  },
  {
    id: 5,
    gambar: "gambar5.jpg",
    judul: "Launching Aplikasi Mobile BPS",
    tanggal: "1 Januari 2025",
    views: 423,
  },
  {
    id: 6,
    gambar: "gambar6.jpg",
    judul: "Seminar Nasional Statistik 2024",
    tanggal: "1 Desember 2024",
    views: 567,
  },
]

const Gallery = () => {
  const [galleryData, setGalleryData] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoading, setImageLoading] = useState(false)

  useEffect(() => {
    const fetchGalleryData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setGalleryData(mockGalleryData)
      setSelectedImage(mockGalleryData[0])
      setIsLoading(false)
    }

    fetchGalleryData()
  }, [])

  const handleImageClick = (item) => {
    if (selectedImage?.id === item.id) return
    setImageLoading(true)
    setTimeout(() => {
      setSelectedImage(item)
      setImageLoading(false)
    }, 150)
  }

  const getImageSrc = (filename) => `/assets/${filename}`

  return (
    <Layout currentPage="galeri">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Galeri Kegiatan</h1>
          <p className="text-secondary max-w-2xl mx-auto">
            Dokumentasi kegiatan dan program yang telah dilaksanakan oleh BPS Provinsi Gorontalo
          </p>
        </div>
        { isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bps-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat galeri...</p>
            </div>
          </div> ) : (
        <>
         <div className="gallery-wrapper grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
             <div className="preview-container bg-gray-50 rounded-xl overflow-hidden shadow-card">
               {selectedImage ? (
                 <>
                   <div className="relative aspect-video bg-gray-200">
                     {imageLoading && (
                       <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bps-blue"></div>
                       </div>
                     )}
                     <img
                       src={getImageSrc(selectedImage.gambar)}
                       alt={selectedImage.judul}
                       className={`w-full h-full object-cover transition-opacity duration-300 ${
                         imageLoading ? "opacity-0" : "opacity-100"
                       }`}
                       onError={(e) => {
                         console.warn("Preview image not found:", e.target.src)
                         e.target.src = "/placeholder.svg?text=Gambar+Tidak+Tersedia"
                         e.target.alt = "Gambar tidak tersedia"
                       }}
                     />
                     <div className="absolute bottom-4 left-4 bg-bps-blue bg-opacity-90 text-white px-3 py-1 rounded-lg text-sm font-medium">
                       {selectedImage.tanggal}
                     </div>
                   </div>
                   <div className="p-6">
                     <h3 className="text-xl font-semibold text-primary mb-2">{selectedImage.judul}</h3>
                     <div className="flex items-center text-secondary text-sm">
                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       <span>{selectedImage.views} views</span>
                     </div>
                   </div>
                 </>
               ) : (
                 <div className="aspect-video flex items-center justify-center bg-gray-100 text-secondary">
                   <p>Tidak ada kegiatan</p>
                 </div>
               )}
             </div>
           </div>

           <div className="lg:col-span-1">
             <div className="gallery-container space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
               {galleryData.map((item) => (
                 <div
                   key={item.id}
                   className={`cursor-pointer rounded-lg overflow-hidden shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${
                     selectedImage?.id === item.id
                       ? "ring-2 ring-bps-accent shadow-lg"
                       : "hover:ring-1 hover:ring-bps-blue hover:ring-opacity-50"
                   }`}
                   onClick={() => handleImageClick(item)}
                 >
                   <div className="aspect-video bg-gray-200 relative">
                     <img
                       src={getImageSrc(item.gambar)}
                       alt={item.judul}
                       className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                       onError={(e) => {
                         console.warn("Thumbnail not found:", e.target.src)
                         e.target.src = "/placeholder.svg?text=Thumbnail+Tidak+Tersedia"
                         e.target.alt = "Thumbnail tidak tersedia"
                       }}
                     />
                     <div className="absolute bottom-2 left-2 bg-bps-blue bg-opacity-80 text-white px-2 py-1 rounded text-xs font-medium">
                       {item.tanggal}
                     </div>
                   </div>
                   <div className="p-3">
                     <h4 className="font-medium text-sm text-primary line-clamp-2 leading-tight">{item.judul}</h4>
                     <div className="flex items-center justify-between mt-2 text-xs text-secondary">
                       <span>{item.views} views</span>
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
           <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
             <div className="text-2xl font-bold text-bps-blue mb-2">{galleryData.length}</div>
             <div className="text-sm text-secondary">Total Kegiatan</div>
           </div>
           <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
             <div className="text-2xl font-bold text-green-600 mb-2">
               {galleryData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
             </div>
             <div className="text-sm text-secondary">Total Views</div>
           </div>
           <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
             <div className="text-2xl font-bold text-purple-600 mb-2">2025</div>
             <div className="text-sm text-secondary">Tahun Aktif</div>
           </div>
         </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Gallery
