import CopyButton from './CopyButton';

const ConnectionInfo = ({ data }) => {
  const isRTMP = data.type === 'rtmp';

  // Opción 1: Tonos más oscuros/profundos
  const styles = {
    rtmp: {
      container: 'bg-slate-800',
      title: 'text-yellow-500',
      button: 'bg-purple-700 hover:bg-purple-600'
    },
    srt: {
      container: 'bg-slate-800',
      title: 'text-red-500',
      button: 'bg-cyan-700 hover:bg-cyan-600'
    }
  };

  // O Opción 2: Tonos más sutiles
  // const styles = {
  //   rtmp: {
  //     container: 'bg-gray-800',
  //     title: 'text-fuchsia-400',
  //     button: 'bg-fuchsia-700 hover:bg-fuchsia-600'
  //   },
  //   srt: {
  //     container: 'bg-gray-800',
  //     title: 'text-teal-400',
  //     button: 'bg-teal-700 hover:bg-teal-600'
  //   }
  // };
  
  const currentStyle = isRTMP ? styles.rtmp : styles.srt;


  // Función para extraer la URL base RTMP y streamkey
  const getRTMPDetails = (rtmpUrl) => {
    const lastSlashIndex = rtmpUrl.lastIndexOf('/');
    return {
      baseUrl: rtmpUrl.substring(0, lastSlashIndex + 1),
      streamKey: rtmpUrl.substring(lastSlashIndex + 1)
    };
  };

  // Función para obtener la URL SRT limpia
  const getSRTDetails = () => {
    const srtUrl = new URL(data.defaultOutputs.SRT);
    return {
      url: `srt://${srtUrl.hostname}`,
      port: srtUrl.port,
      mode: 'caller',
      streamId: `${data.streamId}.stream,mode:publish`,
      id: `${data.streamId}`
    };
  };

  // Función para generar las URLs en formato one-line
  const getOneLine = () => {
    if (isRTMP) {
      return data.defaultOutputs.RTMP;
    }
    const details = getSRTDetails();
    return `${details.url}:${details.port}?type=caller&streamid=${data.streamId}.stream,mode:publish`;
  };

  return (
<div className="mb-4">
      <div className={`p-4 rounded-lg ${currentStyle.container}`}>
        <div className="mb-4">
          <h3 className="text-lg">
            Información de Conexión
            <span className={`ml-2 font-bold ${currentStyle.title}`}>
              {isRTMP ? 'RTMP' : 'SRT'}
            </span>
          </h3>
        </div>

        {isRTMP ? (
          // Información RTMP
          <>
           <div className="flex flex-col gap-2 mb-2">
            <span className="font-semibold">Stream ID:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getRTMPDetails(data.defaultOutputs.RTMP).baseUrl}</span>
                <CopyButton text={getRTMPDetails(data.defaultOutputs.RTMP).baseUrl} />
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-2">
            <span className="font-semibold">Stream Key:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getRTMPDetails(data.defaultOutputs.RTMP).streamKey}</span>
                <CopyButton text={getRTMPDetails(data.defaultOutputs.RTMP).streamKey} />
              </div>
            </div>
          </>
        ) : (
          // Información SRT
          <>
            <div className="flex flex-col gap-2 mb-2">
            <span className="font-semibold">URL:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getSRTDetails().url}</span>
                <CopyButton text={getSRTDetails().url} />
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-2">
            <span className="font-semibold">Puerto:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getSRTDetails().port}</span>
                <CopyButton text={getSRTDetails().port} />
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-2">
            <span className="font-semibold">Mode:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getSRTDetails().mode}</span>
                <CopyButton text={getSRTDetails().mode} />
              </div>
            </div>
            <div className="mt-4">
          <div className="flex flex-col gap-2 mb-2">
            <span className="font-semibold">Stream ID:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getSRTDetails().streamId}</span>
                <CopyButton text={getSRTDetails().streamId} />
              </div>
              </div>

            </div>
          </>
        )}

        {/* One-Line al final */}
        <div className="mt-4">
          <div className="flex flex-col gap-2">
            <span className="font-semibold">One-Line:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">
                {getOneLine()}
              </span>
              <CopyButton 
                text={getOneLine()} 
                label="Copiar"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex flex-col gap-2">
            <span className="font-semibold">ID:</span>
            <div className="flex items-center justify-between font-mono bg-black/30 p-2 rounded">
              <span className="text-sm text-gray-300 break-all mr-4">{getSRTDetails().id}</span>
                <CopyButton text={getSRTDetails().id} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionInfo;