export type StrategicProfileSource = {
  niche: string
  toneOfVoice: string
  contentFrequency: string
  mainObjective: string
  targetAudience: string
  restrictions: string
  differentials: string
  operationalGuidelines: string
}

export type StrategicProfileField = {
  label: string
  value: string
}

export function buildStrategicProfileFields(
  profile: StrategicProfileSource,
): StrategicProfileField[] {
  return [
    { label: 'Nicho', value: profile.niche },
    { label: 'Tom de voz', value: profile.toneOfVoice },
    { label: 'Frequência', value: profile.contentFrequency },
    { label: 'Objetivo principal', value: profile.mainObjective },
    { label: 'Público-alvo', value: profile.targetAudience },
    { label: 'Diferenciais', value: profile.differentials },
    { label: 'Restrições', value: profile.restrictions },
    { label: 'Diretrizes operacionais', value: profile.operationalGuidelines },
  ].filter((field) => field.value.trim() !== '')
}
