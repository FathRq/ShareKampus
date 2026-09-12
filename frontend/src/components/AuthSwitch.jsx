import { motion } from "framer-motion";

export default function AuthSwitch({ isLogin = true, onChange = () => {}, initial = false }) {
  return (
    <div
      role="tablist"
      aria-label="Pilih mode autentikasi"
      className="relative flex w-full p-1 bg-pebble rounded-lg cursor-pointer"
    >
      <motion.div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-paper rounded-md shadow-card"
        initial={initial}
        animate={{ x: isLogin ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        type="button"
        role="tab"
        aria-selected={isLogin}
        onClick={() => onChange(true)}
        className={`relative z-10 flex-1 py-2 text-[15px] font-semibold transition-colors outline-none ${
          isLogin ? "text-ink-navy" : "text-slate-gray hover:text-ink-navy"
        }`}
      >
        Masuk
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!isLogin}
        onClick={() => onChange(false)}
        className={`relative z-10 flex-1 py-2 text-[15px] font-semibold transition-colors outline-none ${
          !isLogin ? "text-ink-navy" : "text-slate-gray hover:text-ink-navy"
        }`}
      >
        Daftar
      </button>
    </div>
  );
}
