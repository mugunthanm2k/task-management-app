// components/common/Card.jsx
const Card = ({ children, className = '', hover = false, padding = 'p-5' }) => {
  return (
    <div className={`bg-[#12121A] border border-white/8 rounded-2xl ${padding} ${
      hover ? 'hover:border-white/16 hover:translate-y-[-2px] hover:shadow-lg transition-all' : ''
    } ${className}`}>
      {children}
    </div>
  );
};

export default Card;