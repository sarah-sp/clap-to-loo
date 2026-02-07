import DepartureBoard from "@/components/DepartureBoard";

function Roundel() {
  return (
    <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
      <div className="absolute inset-0 rounded-full border-[5px] sm:border-[7px] md:border-[9px] border-[#E1251B]" />
      <div className="absolute top-1/2 left-0 right-0 h-5 sm:h-7 md:h-8 -translate-y-1/2 bg-[#003688] flex items-center justify-center">
        <span className="text-white text-sm sm:text-lg md:text-xl font-bold tracking-tight">CtL</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#003688] text-white pb-12">
      <header className="bg-[#003688] border-b-4 border-white/20 px-3 sm:px-4 py-3 sm:py-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Roundel />
          <h1 className="text-2xl sm:text-3xl tracking-tight">
            <span className="font-bold">Clap</span>
            <span className="font-normal"> to </span>
            <span className="font-bold">Loo</span>
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <DepartureBoard />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#002255] text-white/60 text-[10px] sm:text-xs text-center py-1.5 sm:py-2 safe-bottom">
        Not affiliated with TfL or National Rail
      </footer>
    </main>
  );
}
