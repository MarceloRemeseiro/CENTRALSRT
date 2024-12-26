import { NextResponse } from "next/server";
import prisma from '@/prisma';

export async function PUT(request, { params }) {
  try {
    const { deviceId } = params;
    const { srtId } = await request.json();

    const device = await prisma.device.update({
      where: { device_id: deviceId },
      data: {
        assigned_srt: srtId
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error al actualizar SRT" }, { status: 500 });
  }
} 