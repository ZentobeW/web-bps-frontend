import { useContext } from 'react'
import { PublicationContext } from '../context/PublicationContext'

export function usePublications() {
  const context = useContext(PublicationContext)
  if (!context) {
    throw new Error('usePublications must be used within a PublicationProvider')
  }
  return context
}

export default usePublications