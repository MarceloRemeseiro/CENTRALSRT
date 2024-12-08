import { NextResponse } from "next/server";
import prisma from '@/prisma';

export async function PUT(request, { params }) {
  try {
    const { deviceId } = params;
    const { displayName } = await request.json();

    const device = await prisma.device.update({
      where: { device_id: deviceId },
      data: {
        display_name: displayName
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error al actualizar nombre:", error);
    return NextResponse.json(
      { message: "Error al actualizar nombre" },
      { status: 500 }
    );
  }
} 