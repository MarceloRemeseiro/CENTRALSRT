import { NextResponse } from 'next/server';
import { authenticatedRequest } from '../../../../../../services/restreamer';

export async function PUT(request, { params }) {
  const { id, outputId } = params;
  let data;

  try {
    data = await request.json();
  } catch (error) {
    console.error('Error al parsear el cuerpo de la solicitud:', error);
    return NextResponse.json({ message: 'Error al procesar la solicitud' }, { status: 400 });
  }

  console.log('Datos recibidos para actualización:', { id, outputId, data });

  try {
    // Obtener el proceso actual
    const currentProcess = await authenticatedRequest('GET', `/api/v3/process/${outputId}`);
    console.log('Proceso actual:', JSON.stringify(currentProcess, null, 2));

    // Verificar la estructura del proceso actual
    if (!currentProcess || !currentProcess.config || !currentProcess.config.output || !Array.isArray(currentProcess.config.output) || currentProcess.config.output.length === 0) {
      console.error('La estructura del proceso actual no es la esperada:', currentProcess);
      throw new Error('La estructura del proceso actual no es la esperada');
    }

    // Actualizar el proceso
    const updatedProcess = {
      ...currentProcess,
      config: {
        ...currentProcess.config,
        output: [
          {
            ...currentProcess.config.output[0],
            address: data.url,
            options: currentProcess.config.output[0].options.map(option => 
              option === '-rtmp_playpath' ? '-rtmp_playpath' : 
              option === currentProcess.config.output[0].options[currentProcess.config.output[0].options.indexOf('-rtmp_playpath') + 1] ? data.streamKey : 
              option
            )
          }
        ]
      }
    };

    console.log('Proceso actualizado:', JSON.stringify(updatedProcess, null, 2));

    // Enviar la actualización a la API de Restreamer
    const updatedEgressProcess = await authenticatedRequest('PUT', `/api/v3/process/${outputId}`, updatedProcess);
    console.log('Respuesta de la actualización:', JSON.stringify(updatedEgressProcess, null, 2));

    // Actualizar la metadata
    const metadata = {
      name: data.nombre,
      outputs: [
        {
          address: data.url,
          options: [
            "-f",
            "flv",
            "-rtmp_enhanced_codecs",
            "hvc1,av01,vp09",
            "-rtmp_playpath",
            data.streamKey,
            "-rtmp_flashver",
            "FMLE/3.0",
          ],
        },
      ],
      settings: {
        address: new URL(data.url).hostname,
        protocol: "rtmp://",
        options: {
          rtmp_playpath: data.streamKey,
          rtmp_flashver: "FMLE/3.0",
        },
      },
    };

    await authenticatedRequest('PUT', `/api/v3/process/${outputId}/metadata/restreamer-ui`, metadata);

    // Formatear la respuesta
    const formattedOutput = {
      id: outputId,
      name: data.nombre,
      address: data.url,
      state: updatedEgressProcess.state?.exec || "unknown",
      key: data.streamKey,
    };

    return NextResponse.json({
      message: 'Punto de publicación actualizado con éxito',
      updatedOutput: formattedOutput
    });
  } catch (error) {
    console.error('Error detallado al actualizar el punto de publicación:', error);
    return NextResponse.json({ 
      message: 'Error al actualizar el punto de publicación', 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
