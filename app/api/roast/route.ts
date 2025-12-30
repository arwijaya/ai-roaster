import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    // Check if Google API key exists
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY tidak ditemukan. Silakan tambahkan di file .env.local" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Gambar tidak ditemukan dalam request" },
        { status: 400 }
      );
    }

    // Clean base64 string (remove data URL prefix if exists)
    let base64String = image;
    let mimeType = "image/jpeg"; // default

    if (image.includes(",")) {
      const parts = image.split(",");
      const dataPart = parts[0];
      base64String = parts[1];

      // Extract mime type from data URL
      const mimeMatch = dataPart.match(/data:([^;]+)/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
    }

    // Initialize Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Format image for Gemini API
    const imagePart = {
      inlineData: {
        data: base64String,
        mimeType: mimeType,
      },
    };

    // System instruction
    const systemInstruction =
      "Analisis gambar ini. Bertindaklah sebagai komedian stand-up yang sarkastik dan 'roaster' profesional. Berikan komentar menghina yang tajam, lucu, dan menggunakan bahasa gaul Indonesia (slang) tentang apa yang ada di gambar. Maksimal 3 kalimat pendek. Jangan bertele-tele.";

    // Generate content with system instruction
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [imagePart],
        },
      ],
      systemInstruction: systemInstruction,
    });

    const response = await result.response;
    const roasting = response.text() || "Gagal mendapatkan roasting.";

    return NextResponse.json({ roasting: roasting });
  } catch (error: any) {
    console.error("Error in roast API:", error);

    // Handle specific Google AI errors
    if (error?.status === 401 || error?.message?.includes("API key")) {
      return NextResponse.json(
        { error: "API Key Google tidak valid" },
        { status: 401 }
      );
    }

    if (error?.status === 429 || error?.message?.includes("quota")) {
      return NextResponse.json(
        { error: "Rate limit atau quota tercapai. Silakan coba lagi nanti." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses gambar" },
      { status: 500 }
    );
  }
}
