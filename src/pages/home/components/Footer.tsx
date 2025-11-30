import { GraduationCap, Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">{t("Eduverse", "إيدوفيرس")}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t(
                "AI-powered learning management system for modern universities.",
                "نظام إدارة التعلم الذكي للجامعات الحديثة."
              )}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4">{t("Product", "المنتج")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">{t("AI Features", "الميزات الذكية")}</a></li>
              <li><a href="#roles" className="hover:text-foreground transition-colors">{t("User Roles", "أدوار المستخدم")}</a></li>
              <li><a href="#gamification" className="hover:text-foreground transition-colors">{t("Gamification", "التحفيز")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("Integrations", "التكاملات")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4">{t("Resources", "الموارد")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">{t("Documentation", "التوثيق")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("Help Center", "مركز المساعدة")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("Blog", "المدونة")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("Community", "المجتمع")}</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">{t("Support", "الدعم")}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4">{t("Contact", "اتصل بنا")}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>support@eduverse.ai</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Education St, Tech City</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              {t("© 2024 Eduverse. All rights reserved.", "© 2024 إيدوفيرس. جميع الح��وق محفوظة.")}
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">{t("Privacy Policy", "سياسة الخصوصية")}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t("Terms of Service", "شروط الخدمة")}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t("Cookie Policy", "سياسة ملفات تعريف الارتباط")}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
