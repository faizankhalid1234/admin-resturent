import BrandIcon from "./BrandIcon";

function AdminAuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1a2340] px-4 py-10">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-orange/20 blur-3xl" />

      <div className="relative w-full max-w-[400px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-white/10 p-2 ring-2 ring-white/20">
            <BrandIcon size={64} className="rounded-2xl" />
          </div>
          <p className="mt-4 text-[20px] font-bold text-white">Bhandu Khan</p>
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-orange/90">
            Staff Portal
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-[24px] font-bold text-navy">{title}</h1>
            {subtitle && <p className="mt-2 text-[14px] text-gray-muted">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-[14px] text-white/80">{footer}</div>}
      </div>
    </div>
  );
}

export default AdminAuthLayout;
