export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  
  if (!query) {
    return Response.json({ error: 'Query required' }, { status: 400 })
  }
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
    )
    const data = await response.json()
    
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to search movies' }, { status: 500 })
  }
}
