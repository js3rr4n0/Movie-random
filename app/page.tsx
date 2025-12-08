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
}

interface Genre {
  id: number
  name: string
}

interface StreamingProvider {
  logo_path: string
  provider_name: string
  provider_id: number
}

export default function Home() {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState<StreamingProvider[]>([])
  
  // Búsqueda y favoritos
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [favorites, setFavorites] = useState<Movie[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [useOnlyFavorites, setUseOnlyFavorites] = useState(false)

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ]

  // Cargar favoritos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('movieFavorites')
    if (saved) {
      setFavorites(JSON.parse(saved))
    }
  }, [])

  // Guardar favoritos en localStorage
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem('movieFavorites', JSON.stringify(favorites))
    }
  }, [favorites])

  useEffect(() => {
    fetch('/api/genres').then(r => r.json()).then(d => setGenres(d.genres || []))
  }, [])

  const getProviderLink = (providerId: number) => {
    const links: { [key: number]: string } = {
      8: `https://www.netflix.com/search?q=${encodeURIComponent(movie?.title || '')}`,
      119: `https://www.primevideo.com/search?phrase=${encodeURIComponent(movie?.title || '')}`,
      337: `https://www.disneyplus.com/search?q=${encodeURIComponent(movie?.title || '')}`,
      384: `https://www.hbomax.com/search?q=${encodeURIComponent(movie?.title || '')}`,
      350: `https://tv.apple.com/search?q=${encodeURIComponent(movie?.title || '')}`,
      531: `https://www.paramountplus.com/search/${encodeURIComponent(movie?.title || '')}`
    }
    return links[providerId] || `https://www.google.com/search?q=${encodeURIComponent(movie?.title || '')}+watch+online`
  }

  // Buscar películas
  const searchMovies = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/search-movies?query=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Error searching:', error)
    }
    setLoading(false)
  }

  // Agregar a favoritos
  const addToFavorites = (movie: Movie) => {
    if (!favorites.find(f => f.id === movie.id)) {
      setFavorites([...favorites, movie])
    }
    setSearchResults([])
    setSearchQuery('')
  }

  // Quitar de favoritos
  const removeFromFavorites = (movieId: number) => {
    setFavorites(favorites.filter(f => f.id !== movieId))
  }

  // Obtener película random (de favoritos o general)
  const getRandomMovie = async () => {
    setLoading(true)
    
    if (useOnlyFavorites && favorites.length > 0) {
      // Random de favoritos
      const randomFav = favorites[Math.floor(Math.random() * favorites.length)]
      setMovie(randomFav)
      
      if (randomFav.id) {
        fetch(`/api/watch-providers?movieId=${randomFav.id}`)
          .then(r => r.json())
          .then(d => setProviders(d.results?.US?.flatrate || []))
      }
    } else {
      // Random general
      const params = new URLSearchParams({ genre: selectedGenre, language: selectedLanguage })
      const res = await fetch(`/api/random-movie?${params}`)
      const data = await res.json()
      setMovie(data)
      
      if (data.id) {
        fetch(`/api/watch-providers?movieId=${data.id}`)
          .then(r => r.json())
          .then(d => setProviders(d.results?.US?.flatrate || []))
      }
    }
    
    setLoading(false)
  }

  const isFavorite = (movieId: number) => favorites.some(f => f.id === movieId)

  return (
    <div className="app-container">
      <div className="content-wrapper">
        
        <header className="header">
          <h1>Película Sorpresa</h1>
          <p>Descubre tu próxima aventura cinematográfica</p>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={`tab ${!showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(false)}
          >
            Descubrir
          </button>
          <button 
            className={`tab ${showFavorites ? 'active' : ''}`}
            onClick={() => setShowFavorites(true)}
          >
            Mis Favoritos ({favorites.length})
          </button>
        </div>

        {!showFavorites ? (
          <>
            {/* Búsqueda */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar película para agregar a favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
                className="search-input"
              />
              <button onClick={searchMovies} className="search-btn">
                🔍
              </button>
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.slice(0, 5).map(result => (
                  <div key={result.id} className="search-item">
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                      alt={result.title}
                    />
                    <div className="search-item-info">
                      <h4>{result.title}</h4>
                      <span>{new Date(result.release_date).getFullYear()}</span>
                    </div>
                    <button 
                      onClick={() => addToFavorites(result)}
                      className="btn-add"
                      disabled={isFavorite(result.id)}
                    >
                      {isFavorite(result.id) ? '✓' : '+'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="controls">
              <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} className="select">
                <option value="">Género</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              
              <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="select">
                <option value="">Idioma</option>
                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
              
              <button onClick={getRandomMovie} disabled={loading} className="btn-primary">
                {loading ? 'Buscando...' : 'Sorpréndeme'}
              </button>
            </div>

            {/* Opción de usar solo favoritos */}
            {favorites.length > 0 && (
              <div className="favorites-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={useOnlyFavorites}
                    onChange={(e) => setUseOnlyFavorites(e.target.checked)}
                  />
                  <span>Solo elegir de mis favoritos</span>
                </label>
              </div>
            )}
          </>
        ) : (
          /* Lista de favoritos */
          <div className="favorites-list">
            {favorites.length === 0 ? (
              <div className="empty-state">
                <p>No tienes favoritos aún. Busca películas para agregarlas.</p>
              </div>
            ) : (
              favorites.map(fav => (
                <div key={fav.id} className="favorite-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${fav.poster_path}`} 
                    alt={fav.title}
                  />
                  <div className="favorite-item-info">
                    <h4>{fav.title}</h4>
                    <span>⭐ {fav.vote_average.toFixed(1)} • {new Date(fav.release_date).getFullYear()}</span>
                  </div>
                  <button 
                    onClick={() => removeFromFavorites(fav.id)}
                    className="btn-remove"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Movie Card */}
        {movie && !showFavorites && (
          <div className="movie-card">
            <div className="movie-poster">
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
            </div>
            
            <div className="movie-info">
              <h2>{movie.title}</h2>
              
              <div className="movie-meta">
                <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
                <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                {movie.genre_ids?.slice(0, 2).map(id => {
                  const genre = genres.find(g => g.id === id)
                  return genre ? <span key={id} className="genre">{genre.name}</span> : null
                })}
              </div>

              {movie.overview && (
                <p className="overview">{movie.overview}</p>
              )}

              {providers.length > 0 && (
                <div className="providers">
                  <span className="providers-label">Ver en:</span>
                  {providers.slice(0, 5).map(p => (
                    <a
                      key={p.provider_id}
                      href={getProviderLink(p.provider_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="provider-link"
                      title={`Ver en ${p.provider_name}`}
                    >
                      <img 
                        src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                        alt={p.provider_name}
                      />
                    </a>
                  ))}
                </div>
              )}

              {!isFavorite(movie.id) && (
                <button 
                  onClick={() => addToFavorites(movie)}
                  className="btn-add-favorite"
                >
                  ➕ Agregar a favoritos
                </button>
              )}
            </div>
          </div>
        )}

        {!movie && !loading && !showFavorites && searchResults.length === 0 && (
          <div className="empty-state">
            <p>👆 Selecciona tus preferencias y descubre una película</p>
          </div>
        )}
      </div>
    </div>
  )
}
