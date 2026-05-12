import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getScrollEl = () =>
      document.getElementById('main-scroll') ?? document.documentElement;

    const onScroll = () => {
      const el = document.getElementById('main-scroll');
      const scrollTop = el ? el.scrollTop : window.scrollY;
      setVisible(scrollTop > 300);
    };

    // Listen to both window and #main-scroll container
    window.addEventListener('scroll', onScroll, { passive: true });
    const el = document.getElementById('main-scroll');
    if (el) el.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      const elCleanup = document.getElementById('main-scroll');
      if (elCleanup) elCleanup.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    const el = document.getElementById('main-scroll');
    if (el) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-7 right-7 z-[9999] w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #0B5D3B, #157A49)',
            boxShadow: '0 6px 24px rgba(11,93,59,0.45), 0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          <ArrowUp style={{ width: 20, height: 20, color: '#fff' }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
