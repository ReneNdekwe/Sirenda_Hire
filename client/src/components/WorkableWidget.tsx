import React, { useEffect } from 'react';

declare global {
  interface Window {
    whr: any;
    whr_embed: any;
  }
}

export default function WorkableWidget() {
  useEffect(() => {
    // Add custom styles for Workable widget
    const style = document.createElement('style');
    style.textContent = `
      .whr-item {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%) !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        padding: 24px !important;
        margin-bottom: 16px !important;
        transition: all 0.3s ease-in-out !important;
        border: 1px solid rgba(99, 102, 241, 0.1) !important;
      }
      
      .whr-item:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
        border-color: rgba(99, 102, 241, 0.2) !important;
        background: linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%) !important;
      }

      .whr-title {
        color: #4F46E5 !important;
        font-size: 1.25rem !important;
        font-weight: 600 !important;
        margin-bottom: 8px !important;
        background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }

      .whr-location {
        color: #6366F1 !important;
        font-size: 0.875rem !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }

      .whr-department {
        color: #7C3AED !important;
        background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%) !important;
        padding: 6px 14px !important;
        border-radius: 9999px !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        display: inline-block !important;
        margin-bottom: 12px !important;
        border: 1px solid rgba(124, 58, 237, 0.1) !important;
      }

      .whr-description {
        color: #4B5563 !important;
        font-size: 0.875rem !important;
        line-height: 1.6 !important;
        margin-bottom: 16px !important;
      }

      .whr-apply {
        background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%) !important;
        color: white !important;
        padding: 10px 20px !important;
        border-radius: 8px !important;
        font-weight: 500 !important;
        transition: all 0.2s !important;
        border: none !important;
        box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2) !important;
      }

      .whr-apply:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3) !important;
        background: linear-gradient(135deg, #4338CA 0%, #6D28D9 100%) !important;
      }

      .whr-group {
        margin-bottom: 32px !important;
      }

      .whr-group-title {
        color: #4F46E5 !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        margin-bottom: 16px !important;
        background: linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
      }

      /* Add some decorative elements */
      .whr-item::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 4px !important;
        height: 100% !important;
        background: linear-gradient(to bottom, #4F46E5, #7C3AED) !important;
        border-radius: 4px 0 0 4px !important;
      }

      /* Add icons to location */
      .whr-location::before {
        content: '📍' !important;
        font-size: 1em !important;
      }
    `;
    document.head.appendChild(style);

    // Load the Workable script
    const script = document.createElement('script');
    script.src = 'https://www.workable.com/assets/embed.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);

    // Initialize the widget once the script is loaded
    script.onload = () => {
      if (window.whr && window.whr_embed) {
        window.whr(document).ready(() => {
          window.whr_embed(704831, {
            base: 'jobs',
            detail: 'titles',
            zoom: 'country',
            grouping: 'none'
          });
        });
      }
    };

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return <div id="whr_embed_hook"></div>;
} 