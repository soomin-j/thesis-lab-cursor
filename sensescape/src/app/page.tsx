import Link from "next/link";
import { MoodSelector } from "@/components/Mood/MoodSelector";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-500">
      <div className="w-full max-w-4xl flex flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800/90 drop-shadow-sm">
            Sensescape
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Your emotional compass for the city. Find spaces that match your mood.
          </p>
        </div>

        <MoodSelector />

        <Link 
          href="/map"
          className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
        >
          Explore Your City
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </main>
  );
}
