import { NextResponse } from "next/server";
import prisma from '@/prisma';

// GET /api/devices - Lista todos los dispositivos
export async function GET() {
  try {
    const tenSecondsAgo = new Date(Date.now() - 10000);
    
    // Actualizar estados
    await prisma.device.updateMany({
      where: {
        last_ping: { lt: tenSecondsAgo },
        status: 'ONLINE'
      },
      data: { status: 'OFFLINE' }
    });

    // Obtener lista
    const devices = await prisma.device.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: "Error al obtener dispositivos" }, { status: 500 });
  }
}

// POST /api/devices - Registra un nuevo dispositivo
export async function POST(request) {
  try {
    const { device_id, local_ip, public_ip, status } = await request.json();
    
    const device = await prisma.device.upsert({
      where: { device_id: device_id },
      update: {
        local_ip: local_ip,
        public_ip: public_ip,
        status: status,
        last_ping: new Date()
      },
      create: {
        device_id: device_id,
        local_ip: local_ip,
        public_ip: public_ip,
        status: status,
        last_ping: new Date()
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Error al registrar dispositivo" },
      { status: 500 }
    );
  }
}