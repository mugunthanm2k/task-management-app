// components/NotificationButton.jsx
import { useState, useEffect, useRef } from 'react';
import { FiBell, FiBellOff, FiHelpCircle, FiX } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import toast from 'react-hot-toast';

const NotificationButton = () => {
  const { sendTestNotification, requestPermission } = useNotifications();
  const [permission, setPermission] = useState('default');
  const [showHelp, setShowHelp] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('right');
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check button position and adjust tooltip alignment
  useEffect(() => {
    if (buttonRef.current && showHelp) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // If button is on the right side of screen, align tooltip to right
      // If button is near the edge, adjust position
      if (buttonRect.right > viewportWidth - 100) {
        setTooltipPosition('right');
      } else {
        setTooltipPosition('left');
      }
    }
  }, [showHelp]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowHelp(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowHelp(false);
    };
    
    if (showHelp) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showHelp]);

  const getBrowserInstructions = () => {
    const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
    const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
    const isSafari = navigator.userAgent.indexOf('Safari') > -1;

    if (isChrome) {
      return {
        browser: 'Chrome',
        steps: [
          'Click the lock icon 🔒 next to the URL in the address bar',
          'Click "Site settings"',
          'Find "Notifications" and change it from "Block" to "Allow"',
          'Refresh the page'
        ]
      };
    } else if (isFirefox) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the shield icon 🛡️ next to the URL',
          'Click "Clear permissions"',
          'Refresh the page and try again'
        ]
      };
    } else if (isSafari) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari > Preferences > Websites',
          'Find "Notifications" in the left sidebar',
          'Find this site and change it to "Allow"'
        ]
      };
    } else {
      return {
        browser: 'your browser',
        steps: [
          'Look for the site settings in the address bar',
          'Find notification permissions',
          'Change from "Block" to "Allow"'
        ]
      };
    }
  };

  const handleClick = async () => {
    if (permission === 'granted') {
      sendTestNotification();
    } else if (permission === 'default') {
      const result = await requestPermission();
      if (result) {
        setPermission('granted');
      }
    } else {
      // permission is 'denied' - toggle help
      setShowHelp(!showHelp);
    }
  };

  const instructions = getBrowserInstructions();

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={handleClick}
        className={`p-2 transition-colors relative group ${
          permission === 'granted' 
            ? 'text-purple-400 hover:text-purple-300' 
            : permission === 'denied'
            ? 'text-red-400 hover:text-red-300'
            : 'text-gray-400 hover:text-purple-400'
        }`}
        title={
          permission === 'granted' 
            ? 'Send test notification' 
            : permission === 'denied'
            ? 'Notifications blocked - click for help'
            : 'Enable notifications'
        }
      >
        {permission === 'granted' ? (
          <FiBell className="w-5 h-5" />
        ) : (
          <FiBellOff className="w-5 h-5" />
        )}
        <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full transition-opacity ${
          permission === 'granted' 
            ? 'bg-purple-500 opacity-100' 
            : permission === 'denied'
            ? 'bg-red-500 opacity-100'
            : 'bg-yellow-500 opacity-0 group-hover:opacity-100'
        }`} />
      </button>

      {/* Help tooltip for denied permission */}
      {showHelp && permission === 'denied' && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowHelp(false)}
          />
          
          {/* Tooltip/Dialog */}
          <div 
            ref={tooltipRef}
            className={`
              fixed md:absolute
              left-1/2 md:left-auto
              top-1/2 md:top-full
              -translate-x-1/2 md:translate-x-0
              -translate-y-1/2 md:translate-y-2
              ${tooltipPosition === 'right' ? 'md:right-0' : 'md:left-0'}
              w-[90%] md:w-96
              max-h-[80vh] overflow-y-auto
              bg-[#1A1A22] border border-white/8 rounded-xl shadow-2xl
              p-5 z-50
              animate-slide-up
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-15 p-20 sm:p-5 md:p-0 md:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <FiHelpCircle className="text-red-500 w-4 h-4" />
                </div>
                <h4 className="font-semibold text-white">Notifications Blocked</h4>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              Chrome has automatically blocked notifications after several dismissals. 
              Here's how to fix it in <span className="text-purple-400">{instructions.browser}</span>:
            </p>
            
            <div className="space-y-3 mb-4">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-300">{step}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-500 mb-4">
              <strong className="block mb-1">🔒 Browser Privacy Feature:</strong>
              This is a browser protection to prevent notification spam. Once you reset it, 
              notifications will work normally.
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://support.google.com/chrome/answer/3220216"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center text-sm bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View Official Guide
              </a>
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}

      {/* Simple tooltip for granted/default state */}
      {!showHelp && permission !== 'denied' && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A22] border border-white/8 rounded-lg shadow-lg p-2 text-xs text-gray-400 text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
          {permission === 'granted' 
            ? 'Click to send test notification' 
            : 'Click to enable notifications'}
        </div>
      )}
    </div>
  );
};

export default NotificationButton;