'use client'
import { useState, useEffect } from 'react'

interface Movie {
  id: number
  title: string
  poster_path: string
  overview: string
  vote_average: number
  release_date: string
  genre_ids: number[]
  backdrop_path: string
}

interface Genre {
  id: number
  name: string
}

interface Language {
  code: string
  name: string
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const languages: Language[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ]

  useEffect(() => {
    fetchGenres()
    fetchMovies()
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [selectedGenre, selectedLanguage])

  const fetchGenres = async () => {
    const res = await fetch('/api/genres')
    const data = await res.json()
    setGenres(data.genres)
  }

  const fetchMovies = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      genre: selectedGenre,
      language: selectedLanguage
    })
    
    const res = await fetch(`/api/movies?${params}`)
    const data = await res.json()
    setMovies(data.results || [])
    setLoading(false)
  }

  const openModal = (movie: Movie) => {
    setSelectedMovie(movie)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedMovie(null)
    document.body.style.overflow = 'unset'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4 tracking-tight">
            CINÉPOLIS
          </h1>
          <p className="text-xl text-gray-300 font-light">Descubre tu próxima película favorita</p>
        </div>

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-12 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Genre Selector */}
            <div className="group">
              <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wider">
                Género
              </label>
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all backdrop-blur-sm"
              >
                <option value="" className="text-gray-900">Todos los géneros</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id} className="text-gray-900">
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="group">
              <label className="block text-white/90 font-medium mb-3 text-sm uppercase tracking-wider">
                Idioma
              </label>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all backdrop-blur-sm"
              >
                <option value="" className="text-gray-900">Todos los idiomas</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="text-gray-900">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        )}

        {/* Movies Grid */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map(movie => (
              <div 
                key={movie.id}
                onClick={() => openModal(movie)}
                className="group cursor-pointer relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                        <span>⭐</span>
                        <span>{movie.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {movie.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedMovie && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={closeModal}
          >
            <div 
              className="relative max-w-5xl w-full bg-gradient-to-br from-slate-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all hover:scale-110 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row">
                {/* Backdrop/Poster */}
                <div className="md:w-2/5 relative">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                </div>

                {/* Info */}
                <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto max-h-[80vh]">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    {selectedMovie.title}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold">
                      <span>⭐</span>
                      <span className="text-lg">{selectedMovie.vote_average?.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                      <span>📅</span>
                      <span>{new Date(selectedMovie.release_date).getFullYear()}</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-purple-300 font-semibold mb-3 text-sm uppercase tracking-wider">Sinopsis</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {selectedMovie.overview || 'No hay descripción disponible.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-purple-300 font-semibold mb-3 text-sm uppercase tracking-wider">Géneros</h3>
                    <div className="flex gap-3 flex-wrap">
                      {selectedMovie.genre_ids?.map(id => {
                        const genre = genres.find(g => g.id === id)
                        return genre ? (
                          <span key={id} className="bg-purple-500/20 border border-purple-400/30 text-purple-200 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                            {genre.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
