import { NextResponse } from "next/server";
import { authenticatedRequest } from "@/services/restreamer";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description } = await request.json();

  

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
