'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll the main window
    window.scrollTo(0, 0);

    // Also scroll any overflow containers (like dashboard layout)
    const scrollContainers = document.querySelectorAll('main[class*="overflow"]');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
