import { forwardRef } from 'react'

const VARIANTS = {
  primary: 'bg-fb-blue text-white hover:bg-fb-blue-dark',
  whatsapp: 'bg-wa text-white hover:bg-wa-dark',
  secondary: 'bg-fb-soft text-fb-ink hover:bg-[#d8dadf]',
  outline: 'border border-fb-border bg-white text-fb-ink hover:bg-fb-bg',
  ghost: 'text-fb-gray hover:bg-fb-bg hover:text-fb-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  softDanger: 'bg-red-50 text-red-600 hover:bg-red-100'
}

const SIZES = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-[15px]',
  icon: 'h-10 w-10'
}

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return `inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
    VARIANTS[variant] || VARIANTS.primary
  } ${SIZES[size] || SIZES.md} ${className}`
}

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      {...props}
    />
  )
})
