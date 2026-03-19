"use client"

import { useEffect, useRef } from "react"

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple QR code visualization (in production, use a library like qrcode)
    const moduleCount = 21
    const moduleSize = size / moduleCount

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)

    // Generate deterministic pattern from value
    const seed = value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Draw position detection patterns (corners)
    const drawPositionPattern = (x: number, y: number) => {
      ctx.fillStyle = "#000000"
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize)
      ctx.fillStyle = "#000000"
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize)
    }

    drawPositionPattern(0, 0)
    drawPositionPattern(14, 0)
    drawPositionPattern(0, 14)

    // Draw data modules with deterministic pattern
    ctx.fillStyle = "#000000"
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip position patterns
        if ((row < 8 && col < 8) || (row < 8 && col > 12) || (row > 12 && col < 8)) {
          continue
        }
        
        // Timing patterns
        if (row === 6 || col === 6) {
          if ((row + col) % 2 === 0) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
          }
          continue
        }

        // Generate pattern from seed
        const idx = row * moduleCount + col
        const shouldFill = ((seed * (idx + 1)) % 100) > 50
        if (shouldFill) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-lg"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
