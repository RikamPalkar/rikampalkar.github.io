const PREFIX = 'chroniyamai:'

export const saveState = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage can fail (private mode, quota) - persistence is a nice-to-have, not critical
  }
}

export const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const clearState = (key: string): void => {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
