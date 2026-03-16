// components/common/Input.jsx
import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  icon: Icon, 
  error, 
  type = 'text', 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-gray-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-[#0A0A0F] border border-white/8 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_2px_rgba(124,92,240,0.2)] transition-all ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-sm text-red-500 flex items-center gap-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;