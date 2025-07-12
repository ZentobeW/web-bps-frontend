"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Layout from "../components/Layout"
import { useNavigate } from "react-router-dom"
import usePublications from "../hooks/usePublications"

const PublicationList = () => {
  const { publications, loading, contextError, deletePublication } = usePublications()
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [error, setError] = useState("")
  const [imageErrors, setImageErrors] = useState({})
  const [deletingItems, setDeletingItems] = useState(new Set()) // Changed to track multiple items
  const [viewMode, setViewMode] = useState("table") // "table" or "grid"
  
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Memoized sorted publications
  const sortedPublications = useMemo(() => {
    if (!Array.isArray(publications)) return []
    
    return [...publications].sort((a, b) => {
      if (a.releaseDate && b.releaseDate) {
        return new Date(b.releaseDate) - new Date(a.releaseDate)
      }
      return b.id - a.id
    })
  }, [publications])

  // Memoized filtered publications
  const filteredPublications = useMemo(() => {
    if (!searchTerm.trim()) return sortedPublications
    
    return sortedPublications.filter((pub) =>
      pub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sortedPublications, searchTerm])

  // Set error dari context
  useEffect(() => {
    if (contextError) {
      setError(contextError)
    }
  }, [contextError])

  // Debounced search with suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!searchTerm.trim()) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      const suggestionList = sortedPublications
        .filter((pub) => 
          pub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pub.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((pub) => pub.title)
        .slice(0, 5)

      setSuggestions(suggestionList)
      setShowSuggestions(suggestionList.length > 0 && searchTerm.length > 0)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm, sortedPublications])

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchTerm(value)
    setSelectedSuggestionIndex(-1)
  }, [])

  // Handle suggestion selection
  const selectSuggestion = useCallback((suggestion) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    searchInputRef.current?.focus()
  }, [])

  // Handle keyboard navigation for suggestions
  const handleKeyDown = useCallback((e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => Math.max(prev - 1, -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex])
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex, selectSuggestion])

  // Handle delete publication - Modified to track individual items
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Yakin ingin menghapus publikasi ini?")) {
      return
    }

    // Add this item to deleting set
    setDeletingItems(prev => new Set([...prev, id]))
    setError("")

    try {
      await deletePublication(id)
      // Success message bisa menggunakan toast notification
      alert("Publikasi berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting publication:", error)
      
      let errorMessage = "Terjadi kesalahan yang tidak terduga"
      
      if (error.response) {
        const { status, data } = error.response
        const message = data?.message || "Terjadi kesalahan saat menghapus publikasi"
        
        switch (status) {
          case 404:
            errorMessage = "Publikasi tidak ditemukan"
            break
          case 403:
            errorMessage = "Anda tidak memiliki izin untuk menghapus publikasi ini"
            break
          case 500:
            errorMessage = "Terjadi kesalahan server. Silakan coba lagi nanti"
            break
          default:
            errorMessage = message
        }
      } else if (error.request) {
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda"
      }
      
      setError(errorMessage)
      alert("Terjadi kesalahan saat menghapus publikasi. Silakan coba lagi.")
    } finally {
      // Remove this item from deleting set
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [deletePublication])

  // Handle image error
  const handleImageError = useCallback((id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }))
  }, [])

  // Handle image load success
  const handleImageLoad = useCallback((id) => {
    setImageErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[id]
      return newErrors
    })
  }, [])

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }, [])

  // Highlight search term in text
  const highlightSearchTerm = useCallback((text, term) => {
    if (!term || !text) return text
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }, [])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Loading state
  if (loading) {
    return (
      <Layout currentPage="daftar">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat daftar publikasi...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout currentPage="daftar">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Daftar Publikasi BPS Provinsi Gorontalo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan dan kelola publikasi statistik yang telah diterbitkan oleh BPS Provinsi Gorontalo
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Search and View Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Publikasi
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (suggestions.length > 0 && searchTerm.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Cari publikasi..."
                  autoComplete="off"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        index === selectedSuggestionIndex 
                          ? "bg-blue-50 text-blue-700" 
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {highlightSearchTerm(suggestion, searchTerm)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tampilan:</span>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-700 font-medium">
                Ditemukan {filteredPublications.length} publikasi untuk "{searchTerm}"
              </span>
            </div>
          </div>
        )}

        {/* Publications Display */}
        {viewMode === "table" ? (
          <TableView 
            publications={filteredPublications}
            searchTerm={searchTerm}
            highlightSearchTerm={highlightSearchTerm}
            formatDate={formatDate}
            imageErrors={imageErrors}
            handleImageError={handleImageError}
            handleImageLoad={handleImageLoad}
            handleDelete={handleDelete}
            deletingItems={deletingItems} // Pass Set instead of boolean
            navigate={navigate}
          />
        ) : (
          <GridView 
            publications={filteredPublications}
            searchTerm={searchTerm}
            highlightSearchTerm={highlightSearchTerm}
            formatDate={formatDate}
            imageErrors={imageErrors}
            handleImageError={handleImageError}
            handleImageLoad={handleImageLoad}
            handleDelete={handleDelete}
            deletingItems={deletingItems} // Pass Set instead of boolean
            navigate={navigate}
          />
        )}

        {/* Statistics */}
        {filteredPublications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{filteredPublications.length}</div>
              <div className="text-sm text-gray-600">{searchTerm ? "Hasil Pencarian" : "Publikasi Ditampilkan"}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{sortedPublications.length}</div>
              <div className="text-sm text-gray-600">Total Semua Publikasi</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">2025</div>
              <div className="text-sm text-gray-600">Tahun Aktif</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

// Table View Component - Updated to use deletingItems Set
const TableView = ({ 
  publications, 
  searchTerm, 
  highlightSearchTerm, 
  formatDate, 
  imageErrors, 
  handleImageError, 
  handleImageLoad, 
  handleDelete, 
  deletingItems, // Changed from isDeleting to deletingItems
  navigate 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Rilis</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sampul</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {publications.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <EmptyState searchTerm={searchTerm} />
              </td>
            </tr>
          ) : (
            publications.map((publication, index) => (
              <tr key={publication.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                  <div className="line-clamp-2">
                    {searchTerm ? highlightSearchTerm(publication.title, searchTerm) : publication.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(publication.releaseDate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="line-clamp-2">
                    {publication.description ? (
                      searchTerm ? highlightSearchTerm(publication.description, searchTerm) : publication.description
                    ) : "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CoverImage 
                    publication={publication}
                    imageErrors={imageErrors}
                    handleImageError={handleImageError}
                    handleImageLoad={handleImageLoad}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons 
                    publication={publication}
                    handleDelete={handleDelete}
                    deletingItems={deletingItems} // Pass Set
                    navigate={navigate}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)

// Grid View Component - Updated to use deletingItems Set
const GridView = ({ 
  publications, 
  searchTerm, 
  highlightSearchTerm, 
  formatDate, 
  imageErrors, 
  handleImageError, 
  handleImageLoad, 
  handleDelete, 
  deletingItems, // Changed from isDeleting to deletingItems
  navigate 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {publications.length === 0 ? (
      <div className="col-span-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <EmptyState searchTerm={searchTerm} />
        </div>
      </div>
    ) : (
      publications.map((publication) => (
        <div key={publication.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-48 bg-gray-100">
            {!imageErrors[publication.id] && publication.coverUrl ? (
              <img
                src={publication.coverUrl}
                alt={`Sampul ${publication.title}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(publication.id)}
                onLoad={() => handleImageLoad(publication.id)}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">No Image</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {searchTerm ? highlightSearchTerm(publication.title, searchTerm) : publication.title}
            </h3>
            
            <p className="text-sm text-gray-500 mb-3">
              {formatDate(publication.releaseDate)}
            </p>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {publication.description ? (
                searchTerm ? highlightSearchTerm(publication.description, searchTerm) : publication.description
              ) : "Tidak ada deskripsi"}
            </p>
            
            <ActionButtons 
              publication={publication}
              handleDelete={handleDelete}
              deletingItems={deletingItems} // Pass Set
              navigate={navigate}
              variant="grid"
            />
          </div>
        </div>
      ))
    )}
  </div>
)

// Cover Image Component
const CoverImage = ({ publication, imageErrors, handleImageError, handleImageLoad }) => (
  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
    {!imageErrors[publication.id] && publication.coverUrl ? (
      <img
        src={publication.coverUrl}
        alt={`Sampul ${publication.title}`}
        className="w-full h-full object-cover"
        onError={() => handleImageError(publication.id)}
        onLoad={() => handleImageLoad(publication.id)}
      />
    ) : (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-gray-500">No Image</span>
        </div>
      </div>
    )}
    
    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    </div>
  </div>
)

// Action Buttons Component - Updated to check individual item deletion status
const ActionButtons = ({ publication, handleDelete, deletingItems, navigate, variant = "table" }) => {
  const isDeleting = deletingItems.has(publication.id) // Check if this specific item is being deleted
  
  return (
    <div className={`flex items-center ${variant === "grid" ? "justify-center" : ""} space-x-3`}>
      <button
        onClick={() => navigate(`/edit-publication/${publication.id}`)}
        disabled={isDeleting} // Disable edit button when deleting
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Edit publikasi"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
      
      <button
        onClick={() => handleDelete(publication.id)}
        disabled={isDeleting}
        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Hapus publikasi"
      >
        {isDeleting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        )}
        {isDeleting ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  )
}

// Empty State Component
const EmptyState = ({ searchTerm }) => (
  <div className="flex flex-col items-center">
    <svg
      className="w-12 h-12 text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <p className="text-gray-500 text-lg font-medium">
      {searchTerm ? "Tidak ada publikasi yang ditemukan" : "Tidak ada publikasi yang tersedia"}
    </p>
    {searchTerm && (
      <p className="text-gray-400 text-sm mt-1">Coba gunakan kata kunci yang berbeda</p>
    )}
  </div>
)

export default PublicationList