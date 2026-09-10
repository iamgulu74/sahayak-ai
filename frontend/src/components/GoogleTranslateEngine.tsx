'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

export default function GoogleTranslateEngine() {
  // Initialize Google Translate script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,or',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      } catch (e) {
        console.warn('Google Translate Init notice:', e);
      }
    };

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Eradicate Google Translate top banner frame & prevent body layout shift
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const killBanner = () => {
      // Force body and html top to 0px
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
        document.documentElement.style.setProperty('top', '0px', 'important');
      }

      // Hide all Google banner frames and tooltips
      const bannerElements = document.querySelectorAll<HTMLElement>(
        'iframe.goog-te-banner-frame, .goog-te-banner-frame, iframe[class*="goog-te-banner"], iframe[class*="VIpgJd"], .VIpgJd-ZVi9od-OR9Gof-OEkNCe, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-xl07Ob-OJaStb, #goog-gt-tt, .goog-te-balloon-frame'
      );
      bannerElements.forEach((el) => {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('height', '0px', 'important');
        el.style.setProperty('width', '0px', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      });
    };

    killBanner();

    const observer = new MutationObserver(() => {
      killBanner();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
    });

    const interval = setInterval(killBanner, 150);
    const timeout = setTimeout(() => clearInterval(interval), 5000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: 1,
        height: 1,
        opacity: 0.001,
        pointerEvents: 'none',
        zIndex: -9999,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
