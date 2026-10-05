import { Loader2 } from 'lucide-react'
import { FormEvent } from 'react'
import { AP_DISTRICTS } from '../../constants'
import { headingClass, useApp } from '../../context/AppContext'

export interface ProfileFormState {
  fullName: string
  phoneNumber: string
  age: number
  gender: string
  casteCategory: string
  occupation: string
  annualIncome: number
  isDisabled: boolean
  isFarmer: boolean
  district: string
}

interface ProfilePageProps {
  form: ProfileFormState
  saving: boolean
  onChange: <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void
  onSubmit: (e: FormEvent) => void
}

export function ProfilePage({ form, saving, onChange, onSubmit }: ProfilePageProps) {
  const { tr, fontSize, isDark } = useApp()

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none ring-amber-500/30 focus:ring-2 ${
    isDark ? 'border-white/10 bg-[#0a0f1a] text-stone-100' : 'border-stone-200 bg-white text-stone-900'
  }`

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 rounded-2xl border p-6 ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-stone-200 bg-white'}`}
    >
      <div>
        <h1 className={`font-display font-semibold ${headingClass(fontSize, 1)}`}>{tr('profileTitle')}</h1>
        <p className="mt-2 text-sm text-stone-500">{tr('profileBody')}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={tr('fullName')}>
          <input required className={inputClass} value={form.fullName} onChange={(e) => onChange('fullName', e.target.value)} />
        </Field>
        <Field label={tr('phone')}>
          <input className={inputClass} value={form.phoneNumber} onChange={(e) => onChange('phoneNumber', e.target.value)} />
        </Field>
        <Field label={tr('age')}>
          <input
            required
            type="number"
            min={1}
            max={120}
            className={inputClass}
            value={form.age}
            onChange={(e) => onChange('age', Number(e.target.value))}
          />
        </Field>
        <Field label={tr('gender')}>
          <select className={inputClass} value={form.gender} onChange={(e) => onChange('gender', e.target.value)}>
            <option value="Male">{tr('male')}</option>
            <option value="Female">{tr('female')}</option>
            <option value="Other">{tr('other')}</option>
          </select>
        </Field>
        <Field label={tr('caste')}>
          <select className={inputClass} value={form.casteCategory} onChange={(e) => onChange('casteCategory', e.target.value)}>
            <option value="General">{tr('general')}</option>
            <option value="OBC">{tr('obc')}</option>
            <option value="SC">{tr('sc')}</option>
            <option value="ST">{tr('st')}</option>
            <option value="EBC">{tr('ebc')}</option>
          </select>
        </Field>
        <Field label={tr('occupation')}>
          <select className={inputClass} value={form.occupation} onChange={(e) => onChange('occupation', e.target.value)}>
            <option value="Student">{tr('student')}</option>
            <option value="Farmer">{tr('farmerOcc')}</option>
            <option value="Job Seeker">{tr('jobSeeker')}</option>
            <option value="Women / Homemaker">{tr('homemaker')}</option>
            <option value="Senior Citizen">{tr('senior')}</option>
            <option value="Entrepreneur">{tr('entrepreneur')}</option>
            <option value="Other">{tr('otherOcc')}</option>
          </select>
        </Field>
        <Field label={tr('income')}>
          <input
            required
            type="number"
            min={0}
            className={inputClass}
            value={form.annualIncome}
            onChange={(e) => onChange('annualIncome', Number(e.target.value))}
          />
        </Field>
        <Field label={tr('district')}>
          <select className={inputClass} value={form.district} onChange={(e) => onChange('district', e.target.value)}>
            {AP_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-3 pt-2 text-sm font-medium">
          <input type="checkbox" checked={form.isFarmer} onChange={(e) => onChange('isFarmer', e.target.checked)} />
          {tr('farmer')}
        </label>
        <label className="flex items-center gap-3 pt-2 text-sm font-medium">
          <input type="checkbox" checked={form.isDisabled} onChange={(e) => onChange('isDisabled', e.target.checked)} />
          {tr('disabled')}
        </label>
      </div>

      <div className="flex justify-end border-t border-white/8 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {tr('saveProfile')}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
      {children}
    </label>
  )
}
