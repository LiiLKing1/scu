import React, { useState } from 'react'

const LoginCard = ({ title = 'Admin Login', onSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const u = (username || '').trim()
    const p = (password || '').trim()
    if (u === 'admin' && p === '666666aa') {
      setError('')
      if (typeof onSuccess === 'function') onSuccess()
    } else {
      setError('Wrong credentials')
    }
  }

  return (
    <div className="card bg-white shadow-xl rounded-2xl">
      <div className="card-body p-6">
        <h2 className="card-title justify-center text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
        {error && <p className="text-red-600 text-sm text-center mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-gray-700">Username</span></label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="write login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-gray-700">Password</span></label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="write password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="btn w-full bg-[#460dff] border-[#460dff] text-white hover:opacity-90">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginCard
