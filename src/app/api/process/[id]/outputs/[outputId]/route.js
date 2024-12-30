import { NextResponse } from 'next/server';
import { authenticatedRequest } from '../../../../../../services/restreamer';

export async function PUT(request, { params }) {
  const { id, outputId } = params;
  let data;

  try {
    data = await request.json();
    console.log('1. Datos recibidos:', data);
  } catch (error) {
    return NextResponse.json({ message: 'Error al procesar la solicitud' }, { status: 400 });
  }

  try {
    // 1. Obtener el proceso actual
    const currentProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    
    // 2. Actualizar la configuración
    let updatedConfig;
    let metadata;

    if (data.type === 'srt') {
      // Configuración para SRT
      updatedConfig = {
        ...currentProcess.config,
        output: [{
          id: "output_0",
          address: `${data.settings.protocol}${data.settings.address}?${new URLSearchParams(data.settings.params).toString()}`,
          options: [
            "-map", "0:0",
            "-codec:v", "copy",
            "-map", "0:1",
            "-codec:a", "copy",
            "-bsf:v", "dump_extra",
            "-f", "mpegts"
          ]
        }]
      };

      metadata = {
        name: data.nombre,
        outputs: [{
          address: updatedConfig.output[0].address,
          options: updatedConfig.output[0].options
        }],
        settings: {
          address: data.settings.address,
          protocol: data.settings.protocol,
          params: data.settings.params
        }
      };
    } else {
      // Configuración para RTMP
      updatedConfig = {
        ...currentProcess.config,
        output: [{
          id: "output_0",
          address: data.url, // Solo la URL base
          options: [
            "-map", "0:0",
            "-codec:v", "copy",
            "-map", "0:1",
            "-codec:a", "copy",
            "-f", "flv",
            "-rtmp_enhanced_codecs", "hvc1,av01,vp09",
            "-rtmp_playpath", data.streamKey, // StreamKey separado
            "-rtmp_flashver", "FMLE/3.0"
          ]
        }]
      };

      metadata = {
        name: data.nombre,
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
          address: new URL(data.url).hostname,
          protocol: "rtmp://",
          options: {
            rtmp_playpath: data.streamKey,
            rtmp_flashver: "FMLE/3.0"
          }
        }
      };
    }

    // 4. Realizar ambas actualizaciones
    const [updatedProcess, updatedMetadataResponse] = await Promise.all([
      authenticatedRequest('PUT', `/api/v3/process/${outputId}`, updatedConfig),
      authenticatedRequest('PUT', `/api/v3/process/${outputId}/metadata/restreamer-ui`, metadata)
    ]);

    // 5. Verificar que los cambios se aplicaron
    const verifyProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    console.log('5. Verificación final:', {
      finalAddress: verifyProcess.config.output[0].address,
      finalMetadata: verifyProcess.metadata['restreamer-ui']
    });

    return NextResponse.json({
      message: 'Punto de publicación actualizado con éxito',
      updatedOutput: {
        id: outputId,
        name: data.nombre,
        address: data.type === 'srt' ? updatedConfig.output[0].address : data.url,
        streamKey: data.type === 'srt' ? undefined : data.streamKey,
        state: verifyProcess.state?.exec || "unknown",
        type: data.type || 'rtmp'
      }
    });

  } catch (error) {
    console.error('Error completo:', error);
    return NextResponse.json({ 
      message: 'Error al actualizar el punto de publicación', 
      error: error.message
    }, { status: 500 });
  }
}