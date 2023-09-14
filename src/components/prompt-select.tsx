import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { api } from "@/lib/axios";

interface Prompt {
  id: string,
  title: string,
  template: string,
}

export function PromptSelect() {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)

  useEffect(() => {
    // O useEffect() dispara uma função quando alguma informação muda
    api.get('/prompts').then(response => {
      setPrompts(response.data)
    })
  }, [])

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt..."/>
      </SelectTrigger>
      <SelectContent>
        {prompts?.map(prompt => {
          return (
            <SelectItem 
              key={prompt.id} // No React, quando utilizamos ".map" o primeiro elemento que vem depois dele precisa conter uma "key={}"
              value={prompt.id}
            >
            {prompt.title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}