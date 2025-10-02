/**
 * Janus WebRTC Gateway wrapper
 * This file provides a wrapper around the Janus WebRTC Gateway client
 * to ensure compatibility with the build process.
 */

// Import the Janus script dynamically
let Janus = null;

// Function to load Janus
export const loadJanus = async () => {
  if (Janus) return Janus;
  
  try {
    // Always load from CDN to avoid Vite build issues with dynamic imports
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/janus-gateway@0.8.0/dist/janus.min.js';
      script.async = true;
      script.onload = () => {
        // The global Janus object should now be available
        if (window.Janus) {
          Janus = window.Janus;
          resolve(Janus);
        } else {
          reject(new Error('Failed to load Janus from CDN'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load Janus from CDN'));
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error loading Janus:', error);
    throw error;
  }
};

// Export the Janus object
export { Janus };
