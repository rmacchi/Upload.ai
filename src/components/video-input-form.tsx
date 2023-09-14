import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from '@ffmpeg/util'

export function VideInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  /*
  -> Dentro do useState() e onde sera armazenado o video selecionado pelo user

  -> O "estado" no React e toda aquela variável que eu quero monitorar a troca de valor dela, ou seja, se eu estou criando uma variável e com base nessa variável eu quero trocar algo na minha interface, isso precisa ser um "estado" e não uma variável tradicional do JavaScript.

  -> Toda vez que o user selecionar um video novo aparecera uma preview

  -> "videoFile" estado inicial
  -> "setVideoFile" função para alterar o valor desse estado
  -> <File | null> Significa que dentro desse estado, sera armazenado um File ou um nulo
  */
  
  const promptInputRef = useRef<HTMLTextAreaElement>(null)

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget
    /*
    -> currentTarget (Quem disparou o evento, no caso, o <Input> )
    -> Queremos buscar os { files }
    */

    if (!files) { // Se não houver nenhum arquivo selecionado pelo user, não faz nada
      return 
    }

    const selectedFile = files[0]
    /*
    -> Como o files sempre sera um array, pegamos sempre o primeiro "[0]"
    */

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) { 
    // Como estou usando 'await' a função por volta deve conter o 'async'
    console.log('Convert started.')

    const ffmpeg = await getFFmpeg() 
    // Como o getFFmpeg e uma função assíncrona, tenho que utilizar o 'await'

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))
    /* 
    -> "writeFile" Essa função serve para botarmos um arquivo dentro do contexto do ffmpeg
    -> fetchFile() Essa função recebe um arquivo e o converte em uma representação binaria do arquivo
    */

    /* 

    ffmpeg.on('log', log => { -> Usar apenas se estiver dando algum erro
    console.log(log)
    });
    
    */

    ffmpeg.on('progress', progress => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio.mpeg', 
    })

    console.log('Convert finished.')

    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // Evita o recarregamento da tela após o envio do formulário

    const prompt = promptInputRef.current?.value

    if (!videoFile) {
      return
    }

    // converter o video em audio

    const audioFile = await convertVideoToAudio(videoFile)

    console.log(audioFile)
  }

  const previewURL = useMemo(() => {
    /*
    -> useMemo() permite que a variável seja recarregada/recriada, somente se, o "[o que estiver aqui dentro mudar]"
    */

    if(!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile) // Cria uma URL de pré-visualização de um arquivo, seja uma imagem, arquivo...o que for legível pelo browser
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label 
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/10"
      >
        {previewURL ? ( // Se há um previewURL ele ira mostrar o preview do video
          <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0"/>
          /* 
           -> controls={false} Tira o botão de play, pause, prosseguir... 
           -> "pointer-events-none" Permite que o user não interaja de qualquer forma com video, como se o click do user não fosse na tag video
          */
          ) : ( 
          <>
            <FileVideo className="w-4 h-4"/>
            Selecione um vídeo 
          </>
        )}
      </label>

      <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected}/>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição </Label>
        <Textarea
          ref={promptInputRef}
          id="transcription_prompt" 
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
          />
      </div>

      <Button type="submit" className="w-full">
        Carregar vídeo
        <Upload className="w-4 h-4 ml-2"/>
      </Button>
    </form>
  )

}