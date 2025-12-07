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

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ]

  // Enlaces directos por plataforma
  const getProviderLink = (providerId: number, movieId: number) => {
    const links: { [key: number]: string } = {
      8: `https://www.netflix.com/search?q=${encodeURIComponent(movie?.title || '')}`, // Netflix
      119: `https://www.primevideo.com/search?phrase=${encodeURIComponent(movie?.title || '')}`, // Prime Video
      337: `https://www.disneyplus.com/search?q=${encodeURIComponent(movie?.title || '')}`, // Disney+
      384: `https://www.hbomax.com/search?q=${encodeURIComponent(movie?.title || '')}`, // HBO Max
      350: `https://tv.apple.com/search?q=${encodeURIComponent(movie?.title || '')}`, // Apple TV+
      531: `https://www.paramountplus.com/search/${encodeURIComponent(movie?.title || '')}` // Paramount+
    }
    return links[providerId] || `https://www.google.com/search?q=${encodeURIComponent(movie?.title || '')}+watch+online`
  }

  useEffect(() => {
    fetch('/api/genres').then(r => r.json()).then(d => setGenres(d.genres || []))
  }, [])

  const getRandomMovie = async () => {
    setLoading(true)
    const params = new URLSearchParams({ genre: selectedGenre, language: selectedLanguage })
    const res = await fetch(`/api/random-movie?${params}`)
    const data = await res.json()
    setMovie(data)
    
    if (data.id) {
      fetch(`/api/watch-providers?movieId=${data.id}`)
        .then(r => r.json())
        .then(d => setProviders(d.results?.US?.flatrate || []))
    }
    setLoading(false)
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        
        <header className="header">
          <h1>Película Sorpresa</h1>
          <p>Descubre tu próxima aventura cinematográfica</p>
        </header>

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

        {movie && (
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
                      href={getProviderLink(p.provider_id, movie.id)}
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
            </div>
          </div>
        )}

        {!movie && !loading && (
          <div className="empty-state">
            <p>👆 Selecciona tus preferencias y descubre una película</p>
          </div>
        )}
      </div>
    </div>
  )
}
