import prisma from '@/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { deviceId } = params;
    
    await prisma.device.delete({
      where: {
        device_id: deviceId
      }
    });

    return NextResponse.json({ message: 'Dispositivo eliminado' });
  } catch (error) {
    console.error('Error al eliminar dispositivo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar dispositivo' },
      { status: 500 }
    );
  }
}