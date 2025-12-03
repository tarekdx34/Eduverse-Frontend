import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ArrowRight, Play, Brain } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function HeroSection() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cards = scene.querySelectorAll('.floating-card');

    const animateCards = () => {
      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        const time = Date.now() * 0.001;
        const offset = index * 0.5;

        const x = Math.sin(time + offset) * 30;
        const y = Math.cos(time + offset * 1.2) * 20;
        const rotateX = Math.sin(time + offset) * 10;
        const rotateY = Math.cos(time + offset * 0.8) * 15;

        element.style.transform = `
          translate3d(${x}px, ${y}px, 0) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg)
        `;
      });

      requestAnimationFrame(animateCards);
    };

    animateCards();
  }, []);

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Connecting Lines and Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-50">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <line
            x1="30%"
            y1="50%"
            x2="67%"
            y2="50%"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="animate-pulse"
          />
          <line
            x1="67%"
            y1="20%"
            x2="67%"
            y2="50%"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <line
            x1="67%"
            y1="50%"
            x2="95%"
            y2="50%"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <line
            x1="67%"
            y1="80%"
            x2="67%"
            y2="50%"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <circle
            cx="67%"
            cy="50%"
            r="140"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            className="animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </svg>

        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE - Content */}
          <div className="flex flex-col justify-center space-y-8 order-1 lg:order-1">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                  {t('EduVerse', 'ايدوفيرسا')}
                </span>
              </h1>

              <p className="text-3xl font-semibold text-muted-foreground">
                <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
                  {t('AI-Powered Learning', 'التعلم الذكي المدعوم بالذكاء الاصطناعي')}
                </span>{' '}
                {t('for the Future', 'للمستقبل')}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xl font-semibold text-foreground">
                {t('Intelligent Learning Management System', 'نظام إدارة التعلم الذكي')}
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {t(
                  'Transform education with AI-driven tools for universities. Bilingual support for Arabic and English learners.',
                  'تحويل التعليم بأدوات مدعومة بالذكاء الاصطناعي للجامعات. دعم ثنائي اللغة للمتعلمين باللغتين العربية والإنجليزية.'
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="w-full sm:w-auto">
                {t('Start Now', 'ابدأ الآن')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                {t('Learn More', 'اعرف المزيد')}
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE - Floating Student Avatars Scene */}
          <div className="relative mx-auto w-full h-96 lg:h-[500px] order-2 lg:order-2">
            <div
              ref={sceneRef}
              className="relative w-full h-full"
              style={{ perspective: '1000px' }}
            >
              {/* AI Attendance Card */}
              <div className="floating-card absolute top-16 left-20 w-40 h-24 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">AI Attendance</div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-chart-1 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-2 bg-muted rounded w-full"></div>
                    <div className="h-2 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>

              {/* Quiz Generator Card */}
              <div className="floating-card absolute top-32 right-16 w-36 h-28 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">Quiz AI</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-chart-2 rounded"></div>
                    <div className="h-2 bg-muted rounded flex-1"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-chart-3 rounded"></div>
                    <div className="h-2 bg-muted rounded flex-1"></div>
                  </div>
                </div>
              </div>

              {/* Chatbot Assistant Card */}
              <div className="floating-card absolute bottom-20 left-12 w-44 h-32 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">AI Chatbot</div>
                <div className="space-y-2">
                  <div className="h-3 bg-chart-1/20 rounded-full px-2 text-xs flex items-center">
                    🤖
                  </div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="h-2 bg-muted rounded w-4/5"></div>
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                </div>
              </div>

              {/* Analytics Dashboard Card */}
              <div className="floating-card absolute bottom-24 right-20 w-38 h-36 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">Analytics</div>
                <div className="space-y-2">
                  <div className="flex items-end space-x-1 h-16">
                    <div className="w-3 bg-chart-1 rounded-t" style={{ height: '60%' }}></div>
                    <div className="w-3 bg-chart-2 rounded-t" style={{ height: '80%' }}></div>
                    <div className="w-3 bg-chart-3 rounded-t" style={{ height: '45%' }}></div>
                    <div className="w-3 bg-chart-4 rounded-t" style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>

              {/* Smart Grading Card */}
              <div className="floating-card absolute top-20 right-32 w-32 h-20 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">Grading</div>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">✅</div>
                  <div className="text-xl text-chart-1">A+</div>
                </div>
              </div>

              {/* Study Planner Card */}
              <div className="floating-card absolute bottom-32 left-32 w-36 h-24 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">Planner 📅</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="w-6 h-6 bg-muted rounded text-xs flex items-center justify-center">
                    M
                  </div>
                  <div className="w-6 h-6 bg-chart-1 rounded text-xs flex items-center justify-center text-white">
                    T
                  </div>
                  <div className="w-6 h-6 bg-muted rounded text-xs flex items-center justify-center">
                    W
                  </div>
                </div>
              </div>

              {/* Summarization Card */}
              <div className="floating-card absolute top-40 left-40 w-40 h-28 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">AI Summary 📚</div>
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded w-full"></div>
                  <div className="h-2 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded w-5/6"></div>
                  <div className="h-1 bg-chart-2 rounded w-2/3 mt-2"></div>
                </div>
              </div>

              {/* Gamification Badge */}
              <div className="floating-card absolute top-12 right-48 w-34 h-26 bg-card border rounded-2xl shadow-lg p-4 transform-gpu">
                <div className="text-xs text-muted-foreground mb-2">Rewards</div>
                <div className="flex items-center justify-center space-x-1">
                  <div className="text-2xl">🏆</div>
                  <div className="text-2xl">⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
