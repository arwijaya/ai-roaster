import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if Google API key exists
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY tidak ditemukan. Silakan tambahkan di file .env.local" },
        { status: 500 }
      );
    }

    // Fetch available models from Google API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: "Gagal mengambil daftar model",
          status: response.status,
          statusText: response.statusText,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Error in debug API:", error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat mengambil daftar model",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

