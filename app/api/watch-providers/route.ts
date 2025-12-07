export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const movieId = searchParams.get('movieId')
  
  if (!movieId) {
    return Response.json({ error: 'Movie ID required' }, { status: 400 })
  }
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${process.env.TMDB_API_KEY}`
    )
    const data = await response.json()
    
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch watch providers' }, { status: 500 })
  }
}
