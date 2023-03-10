import { sync } from "./lib.js"

export const { code, size, name, digest } = await sync()
