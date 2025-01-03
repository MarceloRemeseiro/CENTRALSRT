import { NextResponse } from 'next/server';
import { authenticatedRequest } from '@/services/restreamer';

export async function PUT(request, { params }) {
  const { id, outputId } = params;
  let data;

  try {
    data = await request.json();
    // Normalizar el nombre
    const nombre = data.nombre || data.name; // Aceptamos ambos
    console.log('1. Datos recibidos normalizados:', { ...data, nombre });
  } catch (error) {
    return NextResponse.json({ message: 'Error al procesar la solicitud' }, { status: 400 });
  }

  try {
    // 1. Obtener el proceso actual
    const currentProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    const currentMetadata = currentProcess.metadata['restreamer-ui'];
    
    // 2. Actualizar la configuración del proceso
    const updatedConfig = {
      ...currentProcess.config,
      output: [{
        id: "output_0",
        address: data.url,
        options: [
          "-map", "0:0",
          "-codec:v", "copy",
          "-map", "0:1",
          "-codec:a", "copy",
          "-f", "flv",
          "-rtmp_enhanced_codecs", "hvc1,av01,vp09",
          "-rtmp_playpath", data.streamKey,
          "-rtmp_flashver", "FMLE/3.0"
        ]
      }]
    };

    // 3. Preparar metadata actualizada
    const metadata = {
      ...currentMetadata,
      name: data.nombre || data.name, // Aceptamos ambos
      outputs: [{
        address: data.url,
        options: [
          "-f", "flv",
          "-rtmp_enhanced_codecs", "hvc1,av01,vp09",
          "-rtmp_playpath", data.streamKey,
          "-rtmp_flashver", "FMLE/3.0"
        ]
      }],
      settings: {
        ...currentMetadata.settings,
        address: new URL(data.url).hostname,
        protocol: "rtmp://",
        options: {
          ...currentMetadata.settings.options,
          rtmp_playpath: data.streamKey
        }
      }
    };

    console.log('3. Metadata a actualizar:', metadata);

    // 4. Realizar ambas actualizaciones
    const [updatedProcess, updatedMetadataResponse] = await Promise.all([
      authenticatedRequest('PUT', `/api/v3/process/${outputId}`, updatedConfig),
      authenticatedRequest('PUT', `/api/v3/process/${outputId}/metadata/restreamer-ui`, metadata)
    ]);

    // 5. Verificar que los cambios se aplicaron
    const verifyProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    console.log('5. Proceso verificado:', verifyProcess);

    // 6. Devolver respuesta con el formato correcto
    return NextResponse.json({
      message: 'Output actualizado con éxito',
      updatedOutput: {
        id: outputId,
        name: data.nombre || data.name,
        address: data.url,
        streamKey: data.streamKey,
        state: verifyProcess.state?.exec || "unknown",
        type: 'rtmp'
      }
    });

  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json({ 
      message: 'Error al actualizar el output', 
      error: error.message
    }, { status: 500 });
  }
}