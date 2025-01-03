import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../../services/restreamer"; // Asegúrate de tener este servicio configurado

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const processData = await authenticatedRequest(
      "GET",
      `/api/v3/process/${id}`
    );

    return NextResponse.json({ state: processData.state.exec });
  } catch (error) {
    console.error("Error fetching process state:", error);
    return NextResponse.json(
      { error: "Error fetching process state" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  let { id } = params;
  
  id = id.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
  
  const { order } = await request.json();

  try {
    await authenticatedRequest(
      "PUT",
      `/api/v3/process/${id}/command`,
      {
        command: order,
      }
    );

    // Esperar un momento para que el cambio de estado se aplique
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Obtener el estado actualizado
    const updatedProcess = await authenticatedRequest(
      "GET",
      `/api/v3/process/${id}`
    );


    return NextResponse.json({ state: updatedProcess.state.exec });
  } catch (error) {
    console.error("Error toggling process state:", error);
    return NextResponse.json(
      { error: "Error toggling process state" },
      { status: 500 }
    );
  }
}
