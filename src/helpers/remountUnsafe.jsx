import { useEffect, useRef } from "react"

export function useOnMountUnsafe(effect, deps = []) {
  if (!effect) {
    throw new Error("useOnMountUnsafe: effect is not a function")
  }
  if (typeof effect !== "function") {
    throw new Error("useOnMountUnsafe: effect is not a function")
  }

  // This is a custom hook that runs the effect only once when the component mounts.
  // This is because React.StrictMode calls the component twice in development mode to check for bugs or errors.
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      effect()
    }
  }, deps)
}