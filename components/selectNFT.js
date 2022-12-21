import { Puff } from 'react-loading-icons'
import React, { useState, useEffect } from 'react'

export function SelectNFT() {
  const [modalOpen, setModalOpen] = useState(false)

  const openSelectModal = async () => {
    console.log('Opening select modal')
    setModalOpen(true)
  }

  return (
    <div>
      <div className="custom-card" onClick={openSelectModal}>
        <p>Click to Select NFT</p>
      </div>
    </div>
  )
}
