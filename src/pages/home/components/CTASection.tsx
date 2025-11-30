import { Button } from '../../../components/ui/button';
import { GraduationCap, BookOpen, Building2, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
export function CTASection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 150, 255, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(index + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Particle Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 via-chart-2/20 to-chart-3/20"></div>

      {/* Content */}
      <div className="relative container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <Sparkles className="h-12 w-12 text-white animate-pulse" />
        </div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl text-white mb-4">
          {t('Ready to Transform Education?', 'هل أنت مستعد لتحويل التعليم؟')}
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl mx-auto">
          {t('Start your intelligent learning journey', 'ابدأ رحلتك التعليمية الذكية')}
        </p>
        <p className="text-white/80 mb-12 max-w-2xl mx-auto">
          {t(
            'Join thousands of students, instructors, and universities already using Eduverse',
            'انضم إلى آلاف الطلاب والمدرسين والجامعات الذين يستخدمون إيدوفيرس بالفعل'
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-xl"
          >
            <GraduationCap className="mr-2 h-5 w-5" />
            {t('For Students', 'للطلاب')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-xl"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            {t('For Instructors', 'للمدرسين')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-xl"
          >
            <Building2 className="mr-2 h-5 w-5" />
            {t('For Universities', 'للجامعات')}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { value: '50K+', label: t('Students', 'طالب') },
            { value: '500+', label: t('Instructors', 'مدرس') },
            { value: '100+', label: t('Universities', 'جامعة') },
            { value: '1M+', label: t('AI Interactions', 'تفاعل ذكي') },
          ].map((stat, index) => (
            <div key={index} className="text-white">
              <div className="text-3xl md:text-4xl mb-2">{stat.value}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
