import { NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "@/lib/r2"
import { requireAuth } from "@/lib/auth"

console.log({
  bucket: process.env.R2_BUCKET_NAME,
  account: process.env.R2_ACCOUNT_ID,
  key: process.env.R2_ACCESS_KEY_ID,
})

export async function POST(req: Request) {
  try {
    await requireAuth()

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${Date.now()}-${file.name}`

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
