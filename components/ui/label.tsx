import { cn } from '@/lib/utils'
import { LabelHTMLAttributes, forwardRef } from 'react'

const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-bold text-brand-dark-gray mb-1', className)}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }
