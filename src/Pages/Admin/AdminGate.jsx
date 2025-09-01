import React, { useState } from 'react'
import Admin from './Admin'
import LoginCard from '../../Elements/LoginCard/LoginCard'

const AdminGate = () => {
  const [authed, setAuthed] = useState(false)
  

  if (authed) return <Admin />

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <LoginCard title="Admin Login" onSuccess={() => setAuthed(true)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminGate
