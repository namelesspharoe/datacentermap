import { useState, type FormEvent } from 'react'
import type { CountyRecord } from '../types/geo'
import { useAuth } from '../context/AuthContext'
import { getRepository } from '../services/getRepository'

interface ContributeFormProps {
  county: CountyRecord
  onClose: () => void
  onSuccess: () => void
}

export function ContributeForm({ county, onClose, onSuccess }: ContributeFormProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) {
      setError('Please sign in to contribute.')
      return
    }
    if (!name.trim() || !position.trim()) {
      setError('Name and position are required.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await getRepository().submitContribution(
        {
          countyFips: county.fips,
          name: name.trim(),
          position: position.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
        },
        user.id,
      )
      setDone(true)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Thank you</h2>
          <p>Your submission for {county.county} is pending review.</p>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>Add county official</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <p className="muted">
          Contributing to <strong>{county.county}, {county.state_abb}</strong>
        </p>
        <form className="contrib-form" onSubmit={handleSubmit}>
          <label>
            Name *
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Position / title *
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. County Commissioner"
              required
            />
          </label>
          <label>
            Phone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Website
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
            />
          </label>
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
