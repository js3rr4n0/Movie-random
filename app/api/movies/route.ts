export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre')
  const page = searchParams.get('page') || '1'
  
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=es&sort_by=popularity.desc&page=${page}`
  
  if (genre) url += `&with_genres=${genre}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return Response.json(data)
}
