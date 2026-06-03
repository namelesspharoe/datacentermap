import { useEffect, useState } from 'react'

/** Keep in sync with @media (max-width: …) in app.css */
export const LAYOUT_BREAKPOINT_PX = 900

export type LayoutMode = 'desktop' | 'mobile'

function getLayoutMode(): LayoutMode {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia(`(max-width: ${LAYOUT_BREAKPOINT_PX}px)`).matches
    ? 'mobile'
    : 'desktop'
}

export function useLayoutMode(): LayoutMode {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(getLayoutMode)

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${LAYOUT_BREAKPOINT_PX}px)`)
    const onChange = () => setLayoutMode(query.matches ? 'mobile' : 'desktop')

    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return layoutMode
}
