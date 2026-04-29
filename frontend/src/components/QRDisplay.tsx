import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  url: string
  zipUrl: string
}

export function QRDisplay({ url, zipUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 80,
        margin: 1,
        color: { dark: '#f3f4f6', light: '#111827' },
      })
    }
  }, [url])

  return (
    <div className="flex items-center gap-3">
      {url ? (
        <>
          <div className="text-right">
            <div className="text-[10px] text-gray-400">Scan to get your</div>
            <div className="text-[10px] text-gray-400">project on GitHub</div>
            <a
              href={zipUrl}
              className="text-[10px] text-xebia underline mt-0.5 block"
            >
              or download ZIP
            </a>
          </div>
          <canvas ref={canvasRef} className="rounded" />
        </>
      ) : (
        <div className="text-[11px] text-gray-600 italic">
          QR code appears after generation
        </div>
      )}
    </div>
  )
}
