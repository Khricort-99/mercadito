import { forwardRef } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

const BASE =
  'w-full rounded-lg border bg-white px-3 text-[15px] text-fb-ink outline-none transition placeholder:text-fb-gray/80 disabled:cursor-not-allowed disabled:bg-fb-bg disabled:text-fb-gray'
const NORMAL = 'border-fb-border focus:border-fb-blue focus:ring-4 focus:ring-fb-blue/15'
const INVALID = 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'

export function Field({ label, htmlFor, hint, error, required = false, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-fb-ink">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle size={13} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-fb-gray">{hint}</p>
      ) : null}
    </div>
  )
}

export const TextInput = forwardRef(function TextInput(
  { className = '', error = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`${BASE} h-11 ${error ? INVALID : NORMAL} ${className}`}
      {...props}
    />
  )
})

export const TextArea = forwardRef(function TextArea(
  { className = '', error = false, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`${BASE} min-h-28 resize-y py-2.5 leading-6 ${error ? INVALID : NORMAL} ${className}`}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select(
  { className = '', error = false, children, ...props },
  ref
) {
  return (
    <div className={`relative ${className}`}>
      <select
        ref={ref}
        className={`${BASE} h-11 appearance-none pl-3 pr-9 ${error ? INVALID : NORMAL}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fb-gray"
      />
    </div>
  )
})
