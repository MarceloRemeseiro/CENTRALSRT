import { NextResponse } from 'next/server';
import { authenticatedRequest } from '@/services/restreamer';

export async function POST(request, { params }) {
  try {
    const data = await request.json();
    const inputId = params.id;
    const cleanInputId = inputId.replace('restreamer-ui:ingest:', '');
    const outputId = `restreamer-ui:egress:rtmp:${crypto.randomUUID()}`;

    const processData = {
      id: outputId,
      type: "ffmpeg",
      reference: cleanInputId,
      input: [{
        id: "input_0",
        address: `{memfs}/${cleanInputId}.m3u8`,
        options: ["-re"]
      }],
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
      }],
      options: ["-loglevel", "level+info", "-err_detect", "ignore_err"],
      reconnect: true,
      reconnect_delay_seconds: 15,
      autostart: false,
      stale_timeout_seconds: 30,
      limits: {
        cpu_usage: 0,
        memory_mbytes: 0,
        waitfor_seconds: 5
      }
    };

    // Crear el proceso
    await authenticatedRequest('POST', '/api/v3/process', processData);

    // Actualizar metadata con toda la configuración necesaria
    const metadata = {
      name: data.name || 'RTMP Output',
      control: {
        limits: {
          cpu_usage: 0,
          memory_mbytes: 0,
          waitfor_seconds: 5
        },
        process: {
          autostart: false,
          delay: 15,
          reconnect: true,
          staleTimeout: 30
        },
        source: {
          source: "hls+memfs"
        }
      },
      outputs: [{
        address: data.url,
        options: [
          "-f", "flv",
          "-rtmp_enhanced_codecs", "hvc1,av01,vp09",
          "-rtmp_playpath", data.streamKey,
          "-rtmp_flashver", "FMLE/3.0"
        ]
      }],
      profiles: [
        {
          audio: {
            decoder: {
              coder: "default",
              mapping: {
                filter: [],
                global: [],
                local: []
              },
              settings: {}
            },
            encoder: {
              coder: "copy",
              mapping: {
                filter: [],
                global: [],
                local: [
                  "-codec:a",
                  "copy"
                ]
              },
              settings: {}
            },
            filter: {
              graph: "",
              settings: {}
            },
            source: 0,
            stream: 1
          },
          video: {
            decoder: {
              coder: "default",
              mapping: {
                filter: [],
                global: [],
                local: []
              },
              settings: {}
            },
            encoder: {
              coder: "copy",
              mapping: {
                filter: [],
                global: [],
                local: [
                  "-codec:v",
                  "copy"
                ]
              },
              settings: {}
            },
            filter: {
              graph: "",
              settings: {}
            },
            source: 0,
            stream: 0
          }
        }
      ],
      settings: {
        address: new URL(data.url).hostname,
        protocol: "rtmp://",
        options: {
          rtmp_app: "",
          rtmp_conn: "",
          rtmp_flashver: "FMLE/3.0",
          rtmp_flush_interval: "10",
          rtmp_pageurl: "",
          rtmp_playpath: data.streamKey,
          rtmp_swfhash: "",
          rtmp_swfsize: "",
          rtmp_tcurl: ""
        }
      },
      version: "1.14.0"
    };

    await authenticatedRequest(
      'PUT',
      `/api/v3/process/${outputId}/metadata/restreamer-ui`,
      metadata
    );

    // Devolver respuesta
    return NextResponse.json({
      id: outputId,
      name: data.name || 'RTMP Output',
      address: data.url,
      streamKey: data.streamKey,
      state: "stopped",
      order: "stop"
    });

  } catch (error) {
    console.error('Error en route RTMP:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}