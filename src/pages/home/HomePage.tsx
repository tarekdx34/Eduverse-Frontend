import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WhatIsEduverse } from './components/WhatIsEduverse';
import { AIFeaturesSection } from './components/AIFeaturesSection';
import { BenefitsSection } from './components/BenefitsSection';
import { UserRolesSection } from './components/UserRolesSection';
import { GamificationSection } from './components/GamificationSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

export default function HomePage() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen">
          <Header />
          <main>
            <HeroSection />
            <WhatIsEduverse />
            <AIFeaturesSection />
            <BenefitsSection />
            <UserRolesSection />
            <GamificationSection />
            <CTASection />
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
