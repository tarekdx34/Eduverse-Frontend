import { Sparkles } from 'lucide-react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

export function HeroSection({ 
  title = 'Supercharge Your Learning with AI',
  subtitle = 'Access cutting-edge AI tools designed to accelerate your academic success and transform how you learn'
}: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-6 text-white shadow-xl">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Powered by AI</span>
        </div>
        <h1 className="text-3xl mb-3">{title}</h1>
        <p className="text-indigo-100 text-lg">{subtitle}</p>
      </div>
    </div>
  );
}
