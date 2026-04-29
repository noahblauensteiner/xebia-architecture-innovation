import type { GenerateRequest, GenerateResponse } from '../types/architecture'

export async function generateProject(request: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Generation failed: ${text}`)
  }

  return response.json()
}
