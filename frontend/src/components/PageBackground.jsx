/**
 * Latar dekoratif global untuk halaman aplikasi & auth.
 * Gradasi muda biru → nila → ungu + blob blur — kartu putih tetap kontras.
 * Landing tidak memakai ini (mempertahankan ritme section putih/abu).
 */
export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-purple-200/50 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
    </div>
  );
}
