import { useEffect, useState, useRef } from 'react';
import { useNavigation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
const mssnLogo = new URL('../../imports/mssn_logo-removebg-preview__3_.png', import.meta.url).href;

/* ─── Initial app splash (shown once on first visit) ─── */
function AppSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #040E09 0%, #081C15 60%, #0B2A1A 100%)' }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(11,93,59,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 18 }}
        className="relative mb-6"
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            boxShadow: '0 0 50px rgba(11,93,59,0.5), 0 0 100px rgba(11,93,59,0.2)',
          }}
        >
          <img
            src={mssnLogo}
            alt="MSSN Logo"
            style={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 14px rgba(255,255,255,0.5))',
            }}
          />
        </div>
        {/* Spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid transparent',
            borderTopColor: '#C8A951',
            borderRightColor: 'rgba(200,169,81,0.3)',
          }}
        />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <p className="text-white font-black tracking-wide" style={{ fontSize: 22 }}>
          MSSN Quiz
          <span style={{ color: '#C8A951' }}> Championship</span>
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Jihad Week · Interfaculty Platform
        </p>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-2 mt-8"
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
            className="w-2 h-2 rounded-full"
            style={{ background: '#C8A951' }}
          />
        ))}
      </motion.div>

      {/* Bismillah */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-xs"
        style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'serif' }}
      >
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
      </motion.p>
    </motion.div>
  );
}

/* ─── Route-transition progress bar ─── */
function RouteProgressBar() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 85) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 85;
          }
          return p + 8;
        });
      }, 60);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 350);
      return () => clearTimeout(t);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  if (progress === 0 && !isLoading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99998] h-[3px] overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      <motion.div
        animate={{ scaleX: progress / 100, opacity: progress === 100 ? 0 : 1 }}
        transition={{ scaleX: { ease: 'easeOut', duration: 0.3 }, opacity: { duration: 0.3, delay: 0.1 } }}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #0B5D3B, #C8A951, #157A49)',
          transformOrigin: 'left',
          boxShadow: '0 0 8px rgba(200,169,81,0.6)',
        }}
      />
    </div>
  );
}

/* ─── Exported PageLoader ─── */
export function PageLoader() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem('mssn-splash-shown') === '1';
  });

  const handleSplashDone = () => {
    sessionStorage.setItem('mssn-splash-shown', '1');
    setSplashDone(true);
  };

  return (
    <>
      <AnimatePresence>
        {!splashDone && <AppSplash key="splash" onDone={handleSplashDone} />}
      </AnimatePresence>
      <RouteProgressBar />
    </>
  );
}
