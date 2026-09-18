const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

export function exerciseImageFrames(imageId: string): string[] {
  const encoded = encodeURIComponent(imageId)
  return [`${BASE_URL}/${encoded}/0.jpg`, `${BASE_URL}/${encoded}/1.jpg`]
}
