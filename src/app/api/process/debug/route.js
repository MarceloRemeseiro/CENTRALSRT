import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../services/restreamer";

export async function GET() {
  try {
    // Obtener el proceso directamente de restreamer
    const process = await authenticatedRequest('GET', '/api/v3/process');
    console.log('Proceso completo de Restreamer:', JSON.stringify(process, null, 2));
    return NextResponse.json(process);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: "Error al obtener los datos", error: error.message },
      { status: 500 }
    );
  }
} 