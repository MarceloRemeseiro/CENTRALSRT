import { NextResponse } from "next/server";
import { authenticatedRequest } from "@/services/restreamer";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description } = await request.json();

    console.log('Route - Starting metadata update');
    console.log('Route - Process ID:', id);
    console.log('Route - Received data:', { name, description });

    // Usar el endpoint específico de metadata con la key 'restreamer-ui'
    const updatedProcess = await authenticatedRequest(
      'PUT',
      `/api/v3/process/${encodeURIComponent(id)}/metadata/restreamer-ui`,
      {
        meta: {
          name,
          description
        }
      }
    );

    console.log('Route - Update response:', updatedProcess);

    return NextResponse.json({
      success: true,
      data: updatedProcess
    });

  } catch (error) {
    console.error("Route - Error updating metadata:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || 'No response data'
    });

    return NextResponse.json(
      {
        error: "Error updating metadata",
        details: error.message
      },
      { status: 500 }
    );
  }
}
