'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [movie, setMovie] = useState(null)
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [loading, setLoading] = useState(false)

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ]

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    const res = await fetch('/api/genres')
    const data = await res.json()
    setGenres(data.genres)
  }

  const getRandomMovie = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      genre: selectedGenre,
      language: selectedLanguage
    })
    
    const res = await fetch(`/api/random-movie?${params}`)
    const data = await res.json()
    setMovie(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <h1 className="text-5xl md:text-7xl font-bold text-center text-white mb-12 animate-pulse">
          🎬 Película Sorpresa 🍿
        </h1>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-8 bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            
            {/* Genre Selector */}
            <div>
              <label className="block text-white font-semibold mb-2">
                🎭 Género
              </label>
              <select 
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 text-white border-2 border-white/30 focus:border-pink-400 focus:outline-none transition-all"
              >
                <option value="">Todos los géneros</option>
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id} className="text-black">
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-white font-semibold mb-2">
                🌍 Idioma
              </label>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/20 text-white border-2 border-white/30 focus:border-pink-400 focus:outline-none transition-all"
              >
                <option value="">Todos los idiomas</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="text-black">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Random Button */}
          <button
            onClick={getRandomMovie}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '🎲 Buscando...' : '🎲 ¡Sorpréndeme!'}
          </button>
        </div>

        {/* Movie Card */}
        {movie && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="md:flex">
              
              {/* Poster */}
              <div className="md:w-1/3">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="md:w-2/3 p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  {movie.title}
                </h2>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full font-bold">
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    📅 {movie.release_date}
                  </span>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {movie.overview}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {movie.genre_ids?.slice(0, 3).map(id => {
                    const genre = genres.find(g => g.id === id)
                    return genre ? (
                      <span key={id} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {genre.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!movie && !loading && (
          <div className="text-center text-white text-xl mt-12">
            👆 Selecciona tus filtros y presiona el botón para descubrir una película
          </div>
        )}
      </div>
    </div>
  )
}
