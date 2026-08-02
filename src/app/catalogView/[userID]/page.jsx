'use client'
// This route is no longer the primary entry point.
// The kiosk runs as a single-page state machine at / (root).
// This file is kept for reference — the deviceVID param is equivalent to machine_id.
import { useParams } from 'next/navigation'
import KioskApp from '../../../components/KioskApp'

export default function CatalogViewPage() {
  // deviceVID param available here if needed for deep-linking
  const params = useParams()
  const deviceVID = params.userID

  // Redirect to root state machine which handles the full boot flow
  if (typeof window !== 'undefined') {
    window.location.replace('/')
    return null
  }

  return <KioskApp />
}