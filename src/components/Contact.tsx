import { useEffect, useRef } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-title", {
        scrollTrigger: {
          trigger: ".contact-title",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".contact-card", {
        scrollTrigger: {
          trigger: ".contact-grid",
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".contact-cta", {
        scrollTrigger: {
          trigger: ".contact-cta",
          start: "top 85%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="contact" ref={sectionRef} className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-14 contact-title">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            تواصل معنا
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            هل لديك أسئلة حول منتجاتنا التأمينية؟ فريقنا هنا لمساعدتك في إيجاد التغطية المناسبة.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="contact-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="contact-card shadow-card border-border/50 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-7">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl hero-gradient flex items-center justify-center flex-shrink-0">
                    <Phone className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">اتصل بنا</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      تحدث مباشرة مع متخصصي التأمين لدينا
                    </p>
                    <a 
                      href="tel:+9647834855602" 
                      className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
                      dir="ltr"
                    >
                      +964 783 485 5602
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="contact-card shadow-card border-border/50 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-7">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0">
                    <Mail className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">راسلنا</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      أرسل لنا استفساراتك في أي وقت
                    </p>
                    <a 
                      href="mailto:info@alyamamah-insurance.com" 
                      className="text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
                      dir="ltr"
                    >
                      info@alyamamah-insurance.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="contact-card shadow-card border-border/50 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-7">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl product-icon-car flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">زورنا</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      موقع مكتبنا الرئيسي
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      بغداد، العراق
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="contact-card shadow-card border-border/50 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1">
              <CardContent className="p-7">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl product-icon-freight flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg mb-2">ساعات العمل</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      نحن متاحون لمساعدتك
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      الأحد - الخميس: ٩:٠٠ ص - ٥:٠٠ م
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-center contact-cta">
            <Button 
              size="lg" 
              className="hero-gradient hover:opacity-90 gap-3 text-lg px-10 py-6 glow-primary"
              asChild
            >
              <a href="tel:+9647834855602">
                <Phone className="w-5 h-5" />
                اتصل الآن للحصول على استشارة مجانية
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
