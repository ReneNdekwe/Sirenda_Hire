'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    whr: any;
    whr_embed: any;
  }
}

export default function WorkableWidget() {
  useEffect(() => {
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
    };
  }, []);

  return <div id="whr_embed_hook"></div>;
} 