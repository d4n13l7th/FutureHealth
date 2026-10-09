import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, LogOut, AlertCircle, Loader2, Pencil, X, Image } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getProfile, updateProfile } from '../services/profileService.js'
import PageContainer from '../components/layout/PageContainer.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'

const FALLBACK_NAME = 'Pengguna FutureHealth'
const FALLBACK_VALUE = '-'

const GENDER_OPTIONS = ['Perempuan', 'Laki-laki']

/**
 * Formats an ISO date string into Indonesian long-form date
 * (e.g. "14 Juni 2026"). Falls back to "-" if missing or invalid.
 */
function formatJoinDate(createdAt) {
  if (!createdAt) return FALLBACK_VALUE

  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return FALLBACK_VALUE

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Coerces a raw profile value to a safe display string, falling
 * back to FALLBACK_VALUE when null/undefined/empty.
 */
function displayValue(value) {
  if (value === null || value === undefined || value === '') return FALLBACK_VALUE
  return String(value)
}

/**
 * ProfilePage
 * ----------------------------------------------------------------
 * Authenticated route ("/profile") — user profile and settings
 * area.
 *
 * - Profile details card: avatar placeholder, full name (falls back
 *   to "Pengguna FutureHealth"), email, and account creation date.
 * - "Data Kesehatan" card: age, gender, height, weight loaded from
 *   the worker API via profileService. Expandable inline edit form
 *   saves through PUT /profile (upsert) and feeds back via toast.
 * - Actions section: danger-themed sign-out button. Handles the
 *   async signOut() flow defensively — shows a loading state on the
 *   button and surfaces any error via an inline AlertCircle banner.
 * - On successful sign-out, redirects to "/" (matching Navbar's
 *   post-signout behavior).
 * ----------------------------------------------------------------
 */
export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [profileLoadError, setProfileLoadError] = useState(null)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const [nameField, setNameField] = useState('')
  const [ageField, setAgeField] = useState('')
  const [genderField, setGenderField] = useState(GENDER_OPTIONS[1])
  const [heightField, setHeightField] = useState('')
  const [weightField, setWeightField] = useState('')

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [logoutError, setLogoutError] = useState(null)

  // Load the health profile once on mount.
  useEffect(() => {
    let isMounted = true

    getProfile().then(({ data, error }) => {
      if (!isMounted) return
      if (error) {
        setProfileLoadError(error.message)
        return
      }
      setProfile(data)
      setNameField(data?.full_name ?? '')
      setAgeField(data?.age != null ? String(data.age) : '')
      setGenderField(data?.gender ?? GENDER_OPTIONS[1])
      setHeightField(data?.height != null ? String(data.height) : '')
      setWeightField(data?.weight != null ? String(data.weight) : '')
    })

    return () => {
      isMounted = false
    }
  }, [])

  const fullName = profile?.full_name || user?.user_metadata?.full_name || FALLBACK_NAME
  const email = user?.email || FALLBACK_VALUE
  const joinDate = formatJoinDate(user?.created_at)

  function getEditValue(value, fallback) {
    return value || displayValue(fallback)
  }

  async function handleSave() {
    setSaveError(null)
    setIsSaving(true)

    const payload = {
      full_name: nameField,
      gender: genderField,
      ...(ageField !== '' && { age: Number(ageField) }),
      ...(heightField !== '' && { height: Number(heightField) }),
      ...(weightField !== '' && { weight: Number(weightField) }),
    }

    try {
      const { data, error } = await updateProfile(user.id, payload)

      if (error) {
        setSaveError(error.message)
        setIsSaving(false)
        return
      }

      setProfile(data)
      setNameField(data?.full_name ?? '')
      setAgeField(data?.age != null ? String(data.age) : '')
      setGenderField(data?.gender ?? GENDER_OPTIONS[1])
      setHeightField(data?.height != null ? String(data.height) : '')
      setWeightField(data?.weight != null ? String(data.weight) : '')
      setIsEditing(false)
      setIsSaving(false)

      addToast('Data profil berhasil diperbarui.', 'success')
    } catch {
      setSaveError('Terjadi kesalahan tak terduga. Silakan coba lagi.')
      setIsSaving(false)
    }
  }

  function handleCancelEdit() {
    setNameField(profile?.full_name ?? '')
    setAgeField(profile?.age != null ? String(profile.age) : '')
    setGenderField(profile?.gender ?? GENDER_OPTIONS[1])
    setHeightField(profile?.height != null ? String(profile.height) : '')
    setWeightField(profile?.weight != null ? String(profile.weight) : '')
    setSaveError(null)
    setIsEditing(false)
  }

  async function handleSignOut() {
    setLogoutError(null)
    setIsLoggingOut(true)

    try {
      const { error } = await signOut()

      if (error) {
        setLogoutError('Gagal keluar. Silakan coba lagi.')
        setIsLoggingOut(false)
        return
      }

      navigate('/')
    } catch {
      setLogoutError('Terjadi kesalahan tak terduga. Silakan coba lagi.')
      setIsLoggingOut(false)
    }
  }

  const supportedFormats = ['image/png', 'image/jpeg', 'image/webp']

  function handleAvatarFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!supportedFormats.includes(file.type)) {
      addToast('Format foto tidak didukung. Gunakan PNG, JPEG, atau WebP.', 'error')
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Foto terlalu besar. Maksimal 5MB.', 'error')
      setAvatarFile(null)
      setAvatarPreview(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setAvatarFile(file)
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const { data, error } = await fetch('/profile/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (error) throw new Error(error.message)

      setAvatarPreview(null)
      setAvatarFile(null)
      addToast('Foto profil berhasil diunggah.', 'success')

      getProfile().then(({ data, error }) => {
        if (!error && data?.avatar_url) {
          setAvatarPreview(data.avatar_url)
        }
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga.'
      addToast(message, 'error')
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageContainer className="py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Page header */}
        <div>
          <h1 className="section-title">Profil Saya</h1>
          <p className="mt-2 text-slate-500">
            Kelola informasi akun dan preferensi FutureHealth Anda.
          </p>
        </div>

        {/* Profile details card */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full relative bg-emerald-50 text-emerald-500">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="foto profil"
                  className="rounded-full w-full h-full object-cover"
                />
              ) : (
                <User size={28} />
              )}
              {avatarFile ? (
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  <CheckCircle size={12} />
                </div>
              ) : null}
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                <Camera size={16} />
              </label>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">{fullName}</h2>
              <p className="text-sm text-slate-400">Anggota FutureHealth</p>
            </div>
          </div>

          <dl className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                <Mail size={16} />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Email</dt>
                <dd className="truncate text-sm font-medium text-slate-900">{email}</dd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">Bergabung Sejak</dt>
                <dd className="text-sm font-medium text-slate-900">{joinDate}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Health data card (editable) */}
        <div className="card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">Data Kesehatan</h3>
              <p className="mt-1 text-sm text-slate-500">
                Umur, jenis kelamin, tinggi, dan berat badan untuk simulasi yang lebih akurat.
              </p>
            </div>

            {!isEditing && !profileLoadError && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Pencil size={14} />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </div>

          {profileLoadError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>Gagal memuat data kesehatan: {profileLoadError}</span>
            </div>
          )}

          {!isEditing && !profileLoadError && (
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
              <div>
                <dt className="text-xs font-medium text-slate-400">Umur</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {getEditValue(profile?.age, `${profile?.age ?? FALLBACK_VALUE} tahun`)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Jenis Kelamin</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {displayValue(profile?.gender)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Tinggi</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {profile?.height != null ? `${profile.height} cm` : FALLBACK_VALUE}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400">Berat</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {profile?.weight != null ? `${profile.weight} kg` : FALLBACK_VALUE}
                </dd>
              </div>
            </dl>
          )}

          {isEditing && (
            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>
                <Input
                  value={nameField}
                  onChange={(e) => setNameField(e.target.value)}
                  placeholder="Nama lengkap Anda"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Umur</label>
                <Input
                  type="number"
                  min={10}
                  max={100}
                  value={ageField}
                  onChange={(e) => setAgeField(e.target.value)}
                  placeholder="cth. 25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Jenis Kelamin
                </label>
                <Select
                  value={genderField}
                  onChange={(e) => setGenderField(e.target.value)}
                  options={GENDER_OPTIONS.map((option) => ({ value: option, label: option }))}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tinggi (cm)
                </label>
                <Input
                  type="number"
                  min={80}
                  max={250}
                  value={heightField}
                  onChange={(e) => setHeightField(e.target.value)}
                  placeholder="cth. 165"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Berat (kg)
                </label>
                <Input
                  type="number"
                  min={30}
                  max={300}
                  value={weightField}
                  onChange={(e) => setWeightField(e.target.value)}
                  placeholder="cth. 60"
                />
              </div>

              {saveError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row">
                <Button
                  isLoading={isSaving}
                  onClick={handleSave}
                  className="sm:flex-1"
                >
                  Simpan
                </Button>
                <Button
                  variant="ghost"
                  leftIcon={<X size={16} />}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error banner */}
        {logoutError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{logoutError}</span>
          </div>
        )}

        {/* Actions */}
        <div className="card">
          <h3 className="font-semibold text-slate-900">Akun</h3>
          <p className="mt-1 text-sm text-slate-500">
            Keluar dari akun FutureHealth Anda di perangkat ini.
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isLoggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            Keluar
          </button>
        </div>
      </div>
    </PageContainer>
  )
}