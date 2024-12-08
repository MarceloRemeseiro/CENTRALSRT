import { NextResponse } from "next/server";
import prisma from '@/prisma';

// GET - Obtener todos los dispositivos
export async function GET() {
  try {
    // Primero actualizamos el estado de los dispositivos inactivos
    const thirtySecondsAgo = new Date(Date.now() - 10000); // 10 segundos
    
    await prisma.device.updateMany({
      where: {
        last_ping: {
          lt: thirtySecondsAgo
        },
        status: 'ONLINE'
      },
      data: {
        status: 'OFFLINE'
      }
    });

    // Luego obtenemos la lista actualizada
    const devices = await prisma.device.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    return NextResponse.json(devices);
  } catch (error) {
    console.error("Error al obtener dispositivos:", error);
    return NextResponse.json(
      { message: "Error al obtener dispositivos" },
      { status: 500 }
    );
  }
}

// POST - Registrar o actualizar un dispositivo
export async function POST(request) {
  try {
    const { device_id, ip_address } = await request.json();

    if (!device_id || !ip_address) {
      return NextResponse.json(
        { message: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const device = await prisma.device.upsert({
      where: { device_id: device_id },
      update: {
        ip_address: ip_address,
        status: 'ONLINE',
        last_ping: new Date()
      },
      create: {
        device_id: device_id,
        ip_address: ip_address,
        status: 'ONLINE',
        last_ping: new Date()
      }
    });

    return NextResponse.json(device);
  } catch (error) {
    console.error("Error al registrar dispositivo:", error);
    return NextResponse.json(
      { message: "Error al registrar dispositivo" },
      { status: 500 }
    );
  }
}