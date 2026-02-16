import { useEffect, useRef } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import gsap from "gsap";

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(".hero-badge", {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      })
        .from(titleRef.current, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
        }, "-=0.4")
        .from(subtitleRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
        }, "-=0.6")
        .from(".hero-btn", {
          y: 20,
          opacity: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
        }, "-=0.4");

      // Floating animation for decorative elements
      gsap.to(".float-element", {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden hero-gradient py-28 md:py-36">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="float-element absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="float-element absolute bottom-20 left-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />
        <div className="float-element absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full glass border-secondary/30 animate-pulse-glow">
            <Shield className="w-5 h-5 text-secondary" />
            <span className="text-base font-medium text-primary-foreground">حماية موثوقة منذ اليوم الأول</span>
          </div>

          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-primary-foreground mb-8 leading-tight"
          >
            أمّن مستقبلك مع{" "}
            <span className="text-gradient-gold">اليمامة</span>{" "}
            للتأمين
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            حلول تأمينية شاملة للأفراد والشركات.
            من التأمين الصحي إلى التأمين الهندسي، نحمي ما يهمك أكثر.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="hero-btn gold-gradient text-secondary-foreground hover:opacity-90 gap-2 shadow-hero text-lg px-8 py-6 glow-gold"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              استكشف المنتجات
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hero-btn bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6"
              onClick={() => document.getElementById('verify')?.scrollIntoView({ behavior: 'smooth' })}
            >
              التحقق من الوثيقة
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
