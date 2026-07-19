"use client"
import React from 'react'
import { useParams } from 'next/navigation'
const page = () => {
    const params = useParams()
  return (
    <div>
      userid {params.userID}
    </div>
  )
}

export default page
