import { motion } from "framer-motion";

export default function AuthSwitch({ isLogin = true, onChange = () => {}, initial = false }) {
  return (
    <div
      role="tablist"
      aria-label="Pilih mode autentikasi"
      className="relative flex w-full cursor-pointer rounded-xl bg-gray-100 p-1"
    >
      <motion.div
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm"
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
          isLogin ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
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
          !isLogin ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
        }`}
      >
        Daftar
      </button>
    </div>
  );
}
