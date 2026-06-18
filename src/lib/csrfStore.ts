let token: string | null = null

export const csrfStore = {
  get: () => token,
  set: (t: string) => { token = t },
  clear: () => { token = null },
}
