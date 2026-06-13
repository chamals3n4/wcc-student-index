"use client"

import { useCallback, useState } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function useDownloadPDF() {
  const [downloading, setDownloading] = useState(false)

  const download = useCallback(
    async (element: HTMLElement, filename: string) => {
      setDownloading(true)
      try {
        // Temporarily show the element for capture
        element.style.display = "block"
        element.style.position = "fixed"
        element.style.top = "-9999px"
        element.style.left = "-9999px"

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: async (_clonedDoc, clonedElement) => {
            _clonedDoc
              .querySelectorAll('style, link[rel="stylesheet"]')
              .forEach((el) => el.remove())
            clonedElement.style.display = "block"

            // Proxy external images through the server to avoid CORS errors.
            // html2canvas cannot fetch cross-origin images directly.
            const imgs = Array.from(clonedElement.querySelectorAll("img"))
            await Promise.all(
              imgs.map(async (img) => {
                const src = img.getAttribute("src")
                if (!src || src.startsWith("data:") || src.startsWith("/")) return
                try {
                  const res = await fetch(
                    `/api/proxy-image?url=${encodeURIComponent(src)}`
                  )
                  if (!res.ok) return
                  const blob = await res.blob()
                  const dataUrl = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.readAsDataURL(blob)
                  })
                  img.src = dataUrl
                } catch {
                  // Leave src unchanged if proxy fails
                }
              })
            )
          },
        })

        // Hide again
        element.style.display = "none"
        element.style.position = ""
        element.style.top = ""
        element.style.left = ""

        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "mm", "a4")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 0

        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          imgY,
          imgWidth * ratio,
          imgHeight * ratio
        )
        pdf.save(filename)
      } catch (error) {
        console.error("PDF generation failed:", error)
        throw error
      } finally {
        setDownloading(false)
      }
    },
    []
  )

  return { download, downloading }
}
