type TranslationPair = {
  path: string
  source: string
  target: string
  assign: (value: string) => void
}

type BaselineValue = { source: string; target: string }

function collectTranslationPairs(root: unknown) {
  const pairs: TranslationPair[] = []
  const walk = (value: unknown, path: string) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const stableId = item && typeof item === 'object' && typeof (item as Record<string, unknown>).id === 'string' ? (item as Record<string, unknown>).id : ''
        walk(item, stableId ? `${path}[id:${stableId}]` : `${path}[${index}]`)
      })
      return
    }

    const object = value as Record<string, any>
    for (const key of Object.keys(object)) {
      if (!key.endsWith('Zh')) continue
      const englishKey = `${key.slice(0, -2)}En`
      const sourceValue = object[key]
      if (typeof sourceValue === 'string') {
        pairs.push({
          path: `${path}.${englishKey}`,
          source: sourceValue.trim(),
          target: typeof object[englishKey] === 'string' ? object[englishKey].trim() : '',
          assign: value => { object[englishKey] = value }
        })
      } else if (Array.isArray(sourceValue)) {
        if (!Array.isArray(object[englishKey])) object[englishKey] = []
        if (object[englishKey].length > sourceValue.length) object[englishKey].length = sourceValue.length
        sourceValue.forEach((item, index) => {
          if (typeof item !== 'string') return
          pairs.push({
            path: `${path}.${englishKey}[${index}]`,
            source: item.trim(),
            target: typeof object[englishKey][index] === 'string' ? object[englishKey][index].trim() : '',
            assign: value => { object[englishKey][index] = value }
          })
        })
      }
    }

    for (const [key, child] of Object.entries(object)) {
      if (key.endsWith('Zh') || key.endsWith('En')) continue
      walk(child, `${path}.${key}`)
    }
  }
  walk(root, '$')
  return pairs
}

export function useAdminAutoTranslation() {
  const translating = ref(false)
  const translatedCount = ref(0)
  const baseline = new Map<string, BaselineValue>()

  function captureTranslationBaseline(root: unknown) {
    baseline.clear()
    for (const pair of collectTranslationPairs(root)) baseline.set(pair.path, { source: pair.source, target: pair.target })
  }

  async function translateChangedFields(root: unknown) {
    const candidates = collectTranslationPairs(root).filter((pair) => {
      if (!pair.source) return false
      const original = baseline.get(pair.path)
      const sourceChanged = !original || original.source !== pair.source
      const targetChangedByEditor = original ? original.target !== pair.target : Boolean(pair.target)
      const targetNeedsTranslation = !pair.target || /[\u3400-\u9fff]/.test(pair.target)
      return (targetNeedsTranslation || sourceChanged) && !targetChangedByEditor
    })
    translatedCount.value = 0
    if (!candidates.length) return 0

    const uniqueSources = [...new Set(candidates.map(pair => pair.source))]
    translating.value = true
    try {
      const translatedBySource = new Map<string, string>()
      let batch: string[] = []
      let batchLength = 0
      const flush = async () => {
        if (!batch.length) return
        const sources = batch
        batch = []
        batchLength = 0
        const result = await $fetch<{ translations: string[] }>('/api/admin/translate', {
          method: 'POST',
          body: { texts: sources }
        })
        if (!Array.isArray(result.translations) || result.translations.length !== sources.length) throw new Error('翻译结果数量不一致。')
        sources.forEach((source, index) => translatedBySource.set(source, result.translations[index]))
      }
      for (const source of uniqueSources) {
        if (batch.length && (batch.length >= 100 || batchLength + source.length > 28000)) await flush()
        batch.push(source)
        batchLength += source.length
      }
      await flush()
      for (const pair of candidates) pair.assign(translatedBySource.get(pair.source) || pair.target)
      translatedCount.value = candidates.length
      return candidates.length
    } finally {
      translating.value = false
    }
  }

  return { translating, translatedCount, captureTranslationBaseline, translateChangedFields }
}
