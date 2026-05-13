import type { GenerateRequest, GenerateResponse } from '../types/architecture'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function generateProject(request: GenerateRequest): Promise<GenerateResponse> {
  const response = await fetch(`${API_BASE}/api/generate`, {
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
