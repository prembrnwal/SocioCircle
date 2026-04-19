import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoHomeOutline, IoArrowBack, IoMusicalNotesOutline } from 'react-icons/io5';
import { ROUTES } from '../config/constants';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto px-6"
      >
        {/* Animated 404 number */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
          className="relative mb-6"
        >
          {/* Decorative icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
            <IoMusicalNotesOutline className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-8xl sm:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-500 leading-none select-none">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3 mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Lost in the music?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to the jam.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
          >
            <IoArrowBack className="w-5 h-5" />
            Go Back
          </button>
          <button
            onClick={() => navigate(ROUTES.FEED)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
          >
            <IoHomeOutline className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
