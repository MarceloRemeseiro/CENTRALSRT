import { NextResponse } from 'next/server';
import { authenticatedRequest } from '../../../../../services/restreamer';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Obtener los datos del input
    const inputData = await authenticatedRequest('GET', `/api/v3/process/${id}`);

    // Obtener todos los procesos
    const allProcesses = await authenticatedRequest('GET', `/api/v3/process`);

    // Filtrar los outputs personalizados
    const customOutputs = allProcesses.filter(process => 
      process.reference === inputData.reference && process.id.includes(':egress:')
    );

    // Formatear la respuesta
    const formattedInput = {
      id: inputData.id,
      name: inputData.metadata?.['restreamer-ui']?.meta?.name || 'Sin nombre',
      description: inputData.metadata?.['restreamer-ui']?.meta?.description || 'Sin descripción',
      streamId: inputData.reference,
      state: inputData.state?.exec || 'Desconocido',
      createdAt: inputData.created_at,
      createdAtFormatted: new Date(inputData.created_at * 1000).toLocaleString(),
      type: inputData.config?.input?.[0]?.address?.startsWith('{rtmp') ? 'rtmp' : 'srt',
      inputAddress: inputData.config?.input?.[0]?.address,
      defaultOutputs: {
        SRT: `srt://core.streamingpro.es:6000/?mode=caller&transtype=live&streamid=${inputData.reference},mode:request`,
        RTMP: `rtmp://core.streamingpro.es/${inputData.reference}.stream`,
        HLS: `https://core.streamingpro.es/memfs/${inputData.reference}.m3u8`,
        HTML: `https://core.streamingpro.es/${inputData.reference}.html`,
      },
      customOutputs: customOutputs.map(output => ({
        id: output.id,
        name: output.metadata?.['restreamer-ui']?.name || 'Sin nombre',
        address: output.config?.output?.[0]?.address || 'Dirección no disponible',
        state: output.state?.exec || 'Desconocido',
        order: output.state?.order || 'Desconocido',
        key: output.config?.output?.[0]?.options?.[13] || "--", // Validación para evitar errores
      })),
    };

    return NextResponse.json(formattedInput);
  } catch (error) {
    console.error('Error fetching input data:', error);
    return NextResponse.json({ error: 'Error fetching input data' }, { status: 500 });
  }
}