"use client"

import React, { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import ImageWithFallback from "../components/ImageWithFallback"
import usePublcations from "../hooks/usePublications" // Import the custom hook for publications
import { uploadImageToCloudinary } from '../services/publicationService' // Import the Cloudinary upload service
import { publicationService } from "../services/publicationService" // Fallback service if context is not available

const VALIDATION_RULES = {
  title: {
    required: true,
    pattern: /^[a-zA-Z0-9 :-]+$/,
    message: "Judul hanya boleh mengandung huruf, angka, spasi, titik dua, dan tanda hubung"
  },
  releaseDate: {
    required: true
  },
  description: {
    required: false,
    maxLength: 1000,
    message: "Deskripsi maksimal 1000 karakter"
  }
}

const FILE_CONSTRAINTS = {
  allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  maxSize: 5 * 1024 * 1024,
  acceptAttribute: "image/jpeg,image/png,image/jpg,image/webp"
}

const INITIAL_FORM_STATE = {
  title: "",
  releaseDate: "",
  description: "",
  coverUrl: null
}

const AddPublication = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const navigate = useNavigate()
  const { addPublication } = usePublcations() // Use the custom hook to get publications

  const validateForm = useMemo(() => {
    return () => {
      const { title, releaseDate, description } = formData
      const validationErrors = []

      if (!title.trim()) {
        validationErrors.push("Judul tidak boleh kosong")
      } else if (!VALIDATION_RULES.title.pattern.test(title)) {
        validationErrors.push(VALIDATION_RULES.title.message)
      }

      if (!releaseDate) {
        validationErrors.push("Tanggal Rilis tidak boleh kosong")
      }

      if (description && description.length > VALIDATION_RULES.description.maxLength) {
        validationErrors.push(VALIDATION_RULES.description.message)
      }

      return validationErrors
    }
  }, [formData])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors.length > 0) setErrors([])
  }, [errors.length])

  const validateFile = useCallback((file) => {
    if (!FILE_CONSTRAINTS.allowedTypes.includes(file.type)) {
      return "Format file tidak didukung. Gunakan: JPEG, PNG, JPG, atau WEBP"
    }
    if (file.size > FILE_CONSTRAINTS.maxSize) {
      return "Ukuran file terlalu besar. Maksimal 5MB"
    }
    return null
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileError = validateFile(file)
    if (fileError) {
      setErrors([fileError])
      return
    }

    setFormData(prev => ({
      ...prev,
      coverUrl: file
    }))

    const reader = new FileReader()
    reader.onload = (e) => setPreviewImage(e.target.result)
    reader.onerror = () => setErrors(["Gagal memuat preview gambar"])
    reader.readAsDataURL(file)
  }, [validateFile])

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE)
    setPreviewImage(null)
    setErrors([])
    setUploadProgress(0)
    const fileInput = document.getElementById("Cover")
    if (fileInput) fileInput.value = ""
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors([])
    setUploadProgress(0)

    try {
      let finalCoverUrl = ''

      if (formData.coverUrl) {
        try {
          setUploadProgress(30)
          finalCoverUrl = await uploadImageToCloudinary(formData.coverUrl)
          setUploadProgress(60)
        } catch (err) {
          setErrors([`Gagal upload gambar: ${err.message}`])
          return
        }
      } else {
        finalCoverUrl = `https://placehold.co/200x280/7f8c8d/ffffff?text=${encodeURIComponent(formData.title)}`
      }

      setUploadProgress(80)

      const newPublication = {
        // Remove id from here - let the database auto-increment
        title: formData.title,
        releaseDate: formData.releaseDate,
        coverUrl: finalCoverUrl,
        description: formData.description
      }

      // GUNAKAN service atau context saja
      if (addPublication) {
        await addPublication(newPublication) // Context akan handle API call
      } else {
        // Fallback jika context tidak ada
        await publicationService.addPublication(newPublication)
      }
      
      setUploadProgress(100)
      alert("Publikasi berhasil ditambahkan!")
      resetForm()
      navigate("/publications")
    } catch (err) {
      console.error('Error adding publication:', err)
      setErrors([`Gagal menambah publikasi: ${err.message || 'Terjadi kesalahan saat menyimpan data'}`])
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }, [formData, validateForm, resetForm, navigate, addPublication])

  const removeFile = useCallback(() => {
    setPreviewImage(null)
    setFormData(prev => ({ ...prev, coverUrl: null }))
    const fileInput = document.getElementById("Cover")
    if (fileInput) fileInput.value = ""
  }, [])

  const fileSizeDisplay = useMemo(() => {
    if (!formData.coverUrl) return null
    return (formData.coverUrl.size / 1024 / 1024).toFixed(2)
  }, [formData.coverUrl])

  const remainingChars = useMemo(() => {
    return VALIDATION_RULES.description.maxLength - formData.description.length
  }, [formData.description])

  return (
    <Layout currentPage="tambah">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Form Tambah Publikasi Baru</h1>
          <p className="text-secondary">Tambahkan publikasi baru ke dalam sistem BPS Provinsi Gorontalo</p>
        </div>

        {/* Form Wrapper */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-800">Mengupload gambar... {uploadProgress}%</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
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
                <label htmlFor="judul" className="block text-sm font-medium text-primary mb-2">
                  Judul <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bps-accent focus:border-bps-accent transition-colors"
                  placeholder="Masukkan judul publikasi"
                  required
                  aria-describedby="judul-help"
                />
                <small id="judul-help" className="text-secondary text-sm mt-1 block">
                  Hanya boleh mengandung huruf, angka, spasi, titik dua (:), dan tanda hubung (-)
                </small>
              </div>

              {/* Tanggal Rilis */}
              <div className="form-group">
                <label htmlFor="tanggalRilis" className="block text-sm font-medium text-primary mb-2">
                  Tanggal Rilis <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bps-accent focus:border-bps-accent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-medium text-primary mb-2">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bps-accent focus:border-bps-accent transition-colors resize-vertical"
                placeholder="Masukkan deskripsi publikasi (opsional)"
                aria-describedby="description-help"
                maxLength={VALIDATION_RULES.description.maxLength}
              />
              <div className="flex justify-between items-center mt-1">
                <small id="description-help" className="text-secondary text-sm">
                  Berikan ringkasan singkat tentang publikasi ini
                </small>
                <small className={`text-sm ${remainingChars < 100 ? 'text-orange-600' : 'text-secondary'}`}>
                  {remainingChars} karakter tersisa
                </small>
              </div>
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label htmlFor="Sampul" className="block text-sm font-medium text-primary mb-2">
                Sampul Publikasi
              </label>
              <div className="space-y-4">
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    id="Sampul"
                    name="Sampul"
                    onChange={handleFileChange}
                    accept={FILE_CONSTRAINTS.acceptAttribute}
                    className="hidden"
                    aria-describedby="sampul-help"
                  />
                  <label
                    htmlFor="Sampul"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors focus-within:ring-2 focus-within:ring-bps-accent"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPEG, PNG, JPG, WEBP (Maks. 5MB)</p>
                    </div>
                  </label>
                </div>
                <small id="sampul-help" className="text-secondary text-sm">
                  Format yang didukung: JPEG, PNG, JPG, WEBP dengan ukuran maksimal 5MB
                </small>

                {/* Preview Image */}
                {previewImage && (
                  <div className="relative">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <ImageWithFallback
                        src={previewImage}
                        alt="Preview sampul publikasi"
                        className="w-20 h-20 object-cover rounded-lg"
                        width={80}
                        height={80}
                        fallbackText="Preview Error"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">{formData.coverUrl?.name}</p>
                        <p className="text-xs text-secondary">
                          {fileSizeDisplay} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Hapus file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                className="flex-1 sm:flex-none px-8 py-3 bg-bps-blue text-white font-medium rounded-lg hover:bg-bps-blue-dark focus:ring-2 focus:ring-bps-accent focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Tambah Publikasi
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset Form
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <section className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-bps-blue mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Panduan Pengisian Form
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary">
            <div>
              <h4 className="font-medium text-primary mb-2">Judul Publikasi:</h4>
              <p>Judul harus jelas dan deskriptif, gunakan huruf, angka, spasi, titik dua, dan tanda hubung</p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Tanggal Rilis:</h4>
              <p>Pilih tanggal publikasi akan dirilis atau sudah dirilis</p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Deskripsi:</h4>
              <p>Berikan ringkasan singkat tentang publikasi (maksimal 1000 karakter). Field ini bersifat opsional.</p>
            </div>
            <div>
              <h4 className="font-medium text-primary mb-2">Sampul Publikasi:</h4>
              <p>Upload gambar sampul dengan format JPEG, PNG, JPG, atau WEBP (maksimal 5MB). Gambar akan diupload ke Cloudinary untuk penyimpanan yang optimal.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default AddPublication