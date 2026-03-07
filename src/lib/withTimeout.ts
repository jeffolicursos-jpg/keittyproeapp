export function withTimeout<T>(promise: Promise<T>, ms = 10_000): Promise<T> {
  let timer: NodeJS.Timeout | null = null
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('request_timeout')), ms)
  })
  return Promise.race([promise, timeout]).then(
    (value) => {
      if (timer) clearTimeout(timer)
      return value as T
    },
    (err) => {
      if (timer) clearTimeout(timer)
      throw err
    }
  )
}

