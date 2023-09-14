import { FFmpeg } from '@ffmpeg/ffmpeg'

import coreURL from '../ffmpeg/ffmpeg-core.js?url'
import wasmURL from '../ffmpeg/ffmpeg-core.wasm?url'
import workerURL from '../ffmpeg/ffmpeg-worker.js?url'

let ffmpeg: FFmpeg | null

export async function getFFmpeg() { 
  // Essa função cria apenas uma instância do FFmpeg 

  if (ffmpeg) { // Se eu ja tiver criado uma função antes, ele vai reaproveitar
    return ffmpeg
  }

  ffmpeg = new FFmpeg() // Se não, recrio do zero...

  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL,
    })
  }

  return ffmpeg
}