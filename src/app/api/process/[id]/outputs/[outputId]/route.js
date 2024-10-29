import { NextResponse } from 'next/server';
import { authenticatedRequest } from '../../../../../../services/restreamer';

export async function PUT(request, { params }) {
  const { id, outputId } = params;
  let data;

  try {
    data = await request.json();
    console.log('1. Datos recibidos:', {
      nombre: data.nombre,
      url: data.url,
      streamKey: data.streamKey
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error al procesar la solicitud' }, { status: 400 });
  }

  try {
    // 1. Obtener el proceso actual
    const currentProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    
    // 2. Actualizar la configuración
    const updatedConfig = {
      id: currentProcess.config.id,
      type: currentProcess.config.type,
      reference: currentProcess.config.reference,
      input: currentProcess.config.input,
      output: [{
        id: "output_0",
        address: data.url,
        options: [
          "-map",
          "0:0",
          "-codec:v",
          "copy",
          "-map",
          "0:1",
          "-codec:a",
          "copy",
          "-f",
          "flv",
          "-rtmp_enhanced_codecs",
          "hvc1,av01,vp09",
          "-rtmp_playpath",
          data.streamKey,
          "-rtmp_flashver",
          "FMLE/3.0"
        ]
      }],
      options: currentProcess.config.options,
      reconnect: currentProcess.config.reconnect,
      reconnect_delay_seconds: currentProcess.config.reconnect_delay_seconds,
      autostart: currentProcess.config.autostart,
      stale_timeout_seconds: currentProcess.config.stale_timeout_seconds,
      limits: currentProcess.config.limits
    };

    // 3. Preparar los metadatos
    const metadata = {
      name: data.nombre,
      outputs: [{
        address: data.url,
        options: [
          "-f",
          "flv",
          "-rtmp_enhanced_codecs",
          "hvc1,av01,vp09",
          "-rtmp_playpath",
          data.streamKey,
          "-rtmp_flashver",
          "FMLE/3.0"
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

    // 4. Realizar ambas actualizaciones
    const [updatedProcess, updatedMetadataResponse] = await Promise.all([
      authenticatedRequest('PUT', `/api/v3/process/${outputId}`, updatedConfig),
      authenticatedRequest('PUT', `/api/v3/process/${outputId}/metadata/restreamer-ui`, metadata)
    ]);

    // 5. Verificar que los cambios se aplicaron
    const verifyProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    console.log('5. Verificación final:', {
      finalAddress: verifyProcess.config.output[0].address,
      finalStreamKey: verifyProcess.config.output[0].options[
        verifyProcess.config.output[0].options.indexOf('-rtmp_playpath') + 1
      ],
      finalMetadata: verifyProcess.metadata['restreamer-ui']
    });

    return NextResponse.json({
      message: 'Punto de publicación actualizado con éxito',
      updatedOutput: {
        id: outputId,
        name: data.nombre,
        address: data.url,
        state: verifyProcess.state?.exec || "unknown",
        key: data.streamKey,
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