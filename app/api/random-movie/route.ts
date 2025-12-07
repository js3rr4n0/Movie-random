export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const genre = searchParams.get('genre')
  const language = searchParams.get('language')
  
  const randomPage = Math.floor(Math.random() * 50) + 1
  
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&page=${randomPage}&language=es`
  
  if (genre) url += `&with_genres=${genre}`
  if (language) url += `&with_original_language=${language}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  const randomIndex = Math.floor(Math.random() * data.results.length)
  const randomMovie = data.results[randomIndex]
  
  return Response.json(randomMovie)
}
