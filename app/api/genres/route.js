export async function GET() {
  const response = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=es`
  )
  const data = await response.json()
  return Response.json(data)
}
