"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import usePublication  from "../hooks/usePublications"
import { uploadImageToCloudinary } from "../services/publicationService"

const EditPublication = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { publications, loading, error, editPublication } = usePublication(id)

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    releaseDate: "",
    description: "",
    coverUrl: "",
    newCoverFile: null,
  })

  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState(null)
  const [showOldCover, setShowOldCover] = useState(true)

  useEffect(() => {
  const fetchPublicationData = async (id) => {
    setIsLoading(true)
    try {
      const publication = publications.find((p) => String(p.id) === String(id))
      if (publication) {
        setFormData({
          id: publication.id.toString(),
          title: publication.title || "",
          releaseDate: publication.releaseDate || "",
          description: publication.description || "",
          coverUrl: publication.coverUrl || "",
          newCoverFile: null,
        })
        setErrors([])
      } else {
        setErrors(["Publikasi tidak ditemukan"])
      }
    } catch (error) {
      setErrors([error.message || "Terjadi kesalahan saat mengambil data publikasi"])
    } finally {
      setIsLoading(false)
    }
  }

  if (id) {
    fetchPublicationData(id)
  } else {
    setErrors(["ID publikasi tidak ditemukan."])
    setIsLoading(false)
  }
  }, [id, publications])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors.length > 0) setErrors([])
  }

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/bmp", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        setErrors(["Format file tidak didukung. Gunakan: JPG, PNG, JPEG, GIF, BMP, atau WEBP"])
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(["Ukuran file terlalu besar. Maksimal 5MB"])
        return
      }
      setFormData((prev) => ({
        ...prev,
        newCoverFile: file,
      }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
        setShowOldCover(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Validation function
  const validateForm = () => {
    const { title, releaseDate } = formData
    const err = []
    
    if (title.trim() === "") {
      err.push("Judul tidak boleh kosong")
    }
    
    if (releaseDate === "") {
      err.push("Tanggal Rilis tidak boleh kosong")
    }
    
    return err
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors([])
    
    try {
      let coverUrl = formData.coverUrl
      
      // Upload new cover if provided
      if (formData.newCoverFile) {
        try {
          coverUrl = await uploadImageToCloudinary(formData.newCoverFile)
        } catch (uploadError) {
          setErrors(["Gagal mengupload gambar: " + uploadError.message])
          setIsSubmitting(false)
          return
        }
      }

      const updatedPublication = {
        id: parseInt(formData.id),
        title: formData.title.trim(),
        releaseDate: formData.releaseDate,
        description: formData.description.trim(),
        coverUrl: coverUrl
      }

      await editPublication(updatedPublication)
      alert("Publikasi berhasil diperbarui!")
      navigate("/daftar-publikasi")
    } catch (error) {
      console.error("Error updating publication:", error)
      setErrors([error.message || "Terjadi kesalahan saat menyimpan data. Silakan coba lagi."])
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset new cover
  const resetNewCover = () => {
    setFormData((prev) => ({ ...prev, newCoverFile: null }))
    setPreviewImage(null)
    setShowOldCover(true)
    const fileInput = document.getElementById("newCoverFile")
    if (fileInput) fileInput.value = ""
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  if ( loading || isLoading) {
    return (
      <Layout currentPage="edit">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data publikasi...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout currentPage="edit">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Edit Publikasi</h1>
          <p className="text-gray-600">Perbarui informasi publikasi BPS Provinsi Gorontalo</p>
        </div>

        {/* Form Wrapper */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Error Messages */}
          {(errors.length > 0 || error ) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">Terdapat kesalahan pada form:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {error && <li>• {error}</li>}
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Judul dan Tanggal Rilis dalam satu baris */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judul */}
              <div className="form-group">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan judul publikasi"
                  required
                />
              </div>

              {/* Tanggal Rilis */}
              <div className="form-group">
                <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Rilis <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formatDate(formData.releaseDate)}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan deskripsi publikasi (opsional)"
              />
            </div>

            {/* Current Cover */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sampul Saat Ini</label>
              {showOldCover && formData.coverUrl && (
                <div className="relative inline-block">
                  <img
                    src={formData.coverUrl}
                    alt="Sampul lama"
                    className="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow-sm"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=160&width=160&text=Sampul+Tidak+Tersedia"
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Saat Ini
                  </div>
                </div>
              )}

              {(!formData.coverUrl || formData.coverUrl === "") && (
                <div className="w-40 h-40 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs">Tidak ada sampul</p>
                  </div>
                </div>
              )}
            </div>

            {/* New Cover Upload */}
            <div className="form-group">
              <label htmlFor="newCoverFile" className="block text-sm font-medium text-gray-700 mb-2">
                Ganti Sampul Baru
              </label>
              <div className="space-y-4">
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="newCoverFile"
                    name="newCoverFile"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/bmp,image/webp"
                    className="hidden"
                  />
                  <label
                    htmlFor="newCoverFile"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload sampul baru</span> atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, JPEG, GIF, BMP, WEBP (Maks. 5MB)</p>
                    </div>
                  </label>
                </div>

                {/* Preview New Image */}
                {previewImage && (
                  <div className="relative">
                    <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Preview sampul baru"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Baru
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">{formData.newCoverFile?.name}</p>
                        <p className="text-xs text-green-600">
                          {formData.newCoverFile && (formData.newCoverFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-green-600 mt-1">✓ Sampul baru akan menggantikan sampul lama</p>
                      </div>
                      <button
                        type="button"
                        onClick={resetNewCover}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Batalkan perubahan sampul"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Menyimpan Perubahan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Perubahan
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Yakin ingin membatalkan perubahan?")) {
                    navigate("/daftar-publikasi")
                  }
                }}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Panduan Edit Publikasi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Judul Publikasi:</h4>
              <p>Pastikan judul sesuai dengan isi publikasi dan mudah dipahami</p>
            </div>
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Tanggal Rilis:</h4>
              <p>Ubah tanggal jika ada koreksi atau perubahan jadwal rilis</p>
            </div>
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Deskripsi:</h4>
              <p>Berikan deskripsi yang jelas dan informatif tentang publikasi</p>
            </div>
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Sampul Publikasi:</h4>
              <p>Upload sampul baru jika ingin mengganti. Sampul lama akan tetap ada jika tidak diubah</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EditPublication