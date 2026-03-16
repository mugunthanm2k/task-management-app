// components/common/Button.jsx
const Button = ({ children, variant = 'primary', icon: Icon, loading = false, className = '', ...props }) => {
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/8',
    danger: 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20'
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;