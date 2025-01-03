import { NextResponse } from "next/server";
import { authenticatedRequest } from "../../../../../services/restreamer";
import { uuid } from "uuidv4";

export async function GET() {
  try {
    const data = await restreamerAPIConnection();
    
    
    return NextResponse.json(data); // Devuelve los datos obtenidos de la API de Restreamer
  } catch (error) {
    return NextResponse.json({ message: "Error al obtener los datos" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id } = params;
  let data;

  try {
    data = await request.json();

    // Validación inicial de datos
    if (!data || !data.type) {
      throw new Error('Tipo de output no especificado');
    }

    const referenceId = id.replace("restreamer-ui:ingest:", "");
    const idAleatorio = uuid();

    let newOutput;
    let metadata;

    if (data.type === 'srt') {
      // Validación de datos SRT
      if (!data.metadata?.['restreamer-ui']?.settings?.address) {
        throw new Error('SRT address is required');
      }

      const outputId = `restreamer-ui:egress:srt:${idAleatorio}`;
      const srtSettings = data.metadata['restreamer-ui'].settings;
      const srtAddress = `srt://${srtSettings.address}?${new URLSearchParams(srtSettings.params).toString()}`;
      

      newOutput = {
        id: outputId,
        type: "ffmpeg",
        reference: referenceId,
        input: [{
          id: "input_0",
          address: `{memfs}/${referenceId}.m3u8`,
          options: ["-re"]
        }],
        output: [{
          id: "output_0",
          address: srtAddress,
          options: [
            "-map", "0:0",
            "-codec:v", "copy",
            "-map", "0:1",
            "-codec:a", "copy",
            "-bsf:v", "dump_extra",
            "-f", "mpegts"
          ]
        }],
        options: ["-loglevel", "level+info", "-err_detect", "ignore_err"],
        reconnect: true,
        reconnect_delay_seconds: 15,
        autostart: false,
        stale_timeout_seconds: 30
      };

      metadata = data.metadata['restreamer-ui'];

    } else {
      // Validación RTMP
      if (!data.address) {
        throw new Error('RTMP address is required');
      }

      // Configuración para RTMP (mantener el código existente)
      const outputId = `restreamer-ui:egress:rtmp:${idAleatorio}`;
      newOutput = {
        id: outputId,
        type: "ffmpeg",
        reference: referenceId,
        input: [{
          id: "input_0",
          address: `{memfs}/${referenceId}.m3u8`,
          options: ["-re"]
        }],
        output: [{
          id: "output_0",
          address: `${data.address}/${data.streamKey}`,
          options: [
            "-map", "0:0",
            "-codec:v", "copy",
            "-map", "0:1",
            "-codec:a", "copy",
            "-f", "flv"
          ]
        }],
        options: ["-loglevel", "level+info", "-err_detect", "ignore_err"],
        reconnect: true,
        reconnect_delay_seconds: 15,
        autostart: false,
        stale_timeout_seconds: 30
      };

      metadata = {
        name: data.name,
        outputs: [{
          address: data.address,
          options: [
            "-f", "flv",
            "-rtmp_enhanced_codecs", "hvc1,av01,vp09",
            "-rtmp_playpath", data.streamKey,
            "-rtmp_flashver", "FMLE/3.0"
          ]
        }],
        settings: {
          address: new URL(data.address).hostname,
          protocol: "rtmp://",
          options: {
            rtmp_playpath: data.streamKey,
            rtmp_flashver: "FMLE/3.0"
          }
        }
      };
    }

    
    const createdEgressProcess = await authenticatedRequest(
      "POST",
      "/api/v3/process",
      newOutput
    );


    await authenticatedRequest(
      "PUT",
      `/api/v3/process/${createdEgressProcess.id}/metadata/restreamer-ui`,
      metadata
    );

    const formattedOutput = data.type === 'srt' ? {
      id: createdEgressProcess.id,
      name: metadata.name,
      address: newOutput.output[0].address,
      state: createdEgressProcess.state?.exec || "unknown",
      order: "stop",
      streamKey: "--",
      type: 'srt'
    } : {
      id: createdEgressProcess.id,
      name: data.name,
      address: data.address,
      state: createdEgressProcess.state?.exec || "unknown",
      order: "stop",
      streamKey: data.streamKey
    };

    return NextResponse.json(formattedOutput);

  } catch (error) {
    console.error("Error detallado:", {
      message: error.message,
      stack: error.stack,
      data: data,
      params: params
    });
    return NextResponse.json(
      {
        error: "Error al agregar el output o la metadata",
        details: error.message,
        data: data
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  
  let outputId;
  try {
    const body = await request.json();
    outputId = body.outputId;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!outputId) {
    return NextResponse.json({ error: 'outputId is required' }, { status: 400 });
  }


  try {
    // No necesitamos corregir el ID aquí, ya que lo hicimos en el cliente
    const result = await authenticatedRequest('DELETE', `/api/v3/process/${outputId}`);
    
    
    return NextResponse.json({ message: 'Output eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el output:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el output', details: error.message },
      { status: 500 }
    );
  }
}
