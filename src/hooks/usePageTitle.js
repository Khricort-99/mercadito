import { useEffect } from 'react'

const DEFAULT_TITLE = 'Mercadito | Compra y vende en tu comunidad'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Mercadito` : DEFAULT_TITLE
  }, [title])
}
