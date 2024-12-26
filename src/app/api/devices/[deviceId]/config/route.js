import { NextResponse } from "next/server";
import prisma from '@/prisma';

// GET /api/devices/[deviceId]/config - Obtiene configuración del dispositivo
export async function GET(request, { params }) {
    try {
        const { deviceId } = params;
        
        const device = await prisma.device.update({
            where: { device_id: deviceId },
            data: {
                last_ping: new Date(),
                status: 'ONLINE'
            }
        });

        if (!device) {
            return NextResponse.json({ message: "Dispositivo no encontrado" }, { status: 404 });
        }

        let srt_url = null;
        if (device.assigned_srt) {
            const streamId = device.assigned_srt
                .replace('restreamer-ui:ingest:', '')
                .replace('?mode=request', '');
            
            srt_url = `srt://streamingpro.es:6000/?mode=caller&transtype=live&streamid=${streamId}`;
        }

        return NextResponse.json({ 
            srt_url,
            status: 'success'
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Error al obtener configuración" }, { status: 500 });
    }
}

// POST /api/devices/[deviceId]/config - Actualiza configuración del dispositivo
export async function POST(request, { params }) {
    try {
        const { deviceId } = params;
        const { srtUrl } = await request.json();

        await prisma.device.update({
            where: { device_id: deviceId },
            data: {
                last_ping: new Date(),
                status: 'ONLINE'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Error al actualizar configuración" }, { status: 500 });
    }
} 