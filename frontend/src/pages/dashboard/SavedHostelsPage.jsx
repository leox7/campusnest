import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HostelCard from '../../components/dashboard/HostelCard'
import StudentDashboardLayout from '../../components/dashboard/StudentDashboardLayout'
import { getSavedHostels, saveHostel } from '../../services/hostels.service'
import { normalizeHostel } from '../../utils/hostel.utils'
import '../../styles/dashboard/saved-hostels.css'

function SavedHostelsPage() {
  const navigate = useNavigate()
  const [hostels, setHostels] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true

    const fetchSaved = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await getSavedHostels()
        if (!active) return
        const normalized = (response.hostels ?? []).map(normalizeHostel)
        setHostels(normalized)
        setSavedIds(normalized.map((hostel) => hostel.id))
      } catch (error) {
        if (!active) return
        setLoadError(error.response?.data?.message || 'Failed to load saved hostels.')
        setHostels([])
      } finally {
        if (active) setIsLoading(false)
      }
    }

    fetchSaved()

    return () => {
      active = false
    }
  }, [])

  const toggleSave = async (id) => {
    try {
      const response = await saveHostel(id)
      if (!response.saved) {
        setHostels((prev) => prev.filter((hostel) => hostel.id !== id))
        setSavedIds((prev) => prev.filter((item) => item !== id))
      } else {
        setSavedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      }
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not update saved hostels.')
    }
  }

  const handleViewDetails = (id) => {
    navigate(`/dashboard/student/hostels/${id}`)
  }

  return (
    <StudentDashboardLayout activeNav="Saved">
      <main className="saved-hostels-page">
        <section className="saved-hostels-hero">
          <h1>Saved Hostels</h1>
          <p>Hostels you bookmarked for later</p>
        </section>

        {isLoading ? <p className="saved-status">Loading saved hostels...</p> : null}
        {!isLoading && loadError ? <p className="saved-status">{loadError}</p> : null}
        {!isLoading && !loadError && hostels.length === 0 ? (
          <div className="saved-empty">
            <p>You have not saved any hostels yet.</p>
            <button type="button" onClick={() => navigate('/dashboard/student')}>
              Browse hostels
            </button>
          </div>
        ) : null}

        {!isLoading && !loadError && hostels.length > 0 ? (
          <div className="hostels-grid">
            {hostels.map((hostel) => (
              <HostelCard
                key={hostel.id}
                hostel={hostel}
                isSaved={savedIds.includes(hostel.id)}
                onToggleSave={toggleSave}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : null}
      </main>
    </StudentDashboardLayout>
  )
}

export default SavedHostelsPage
