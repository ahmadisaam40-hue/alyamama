import { useEffect, useRef } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
import gsap from "gsap";

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        duration: 1,
        ease: "back.out(1.7)",
      });
      
      gsap.from(".nav-link", {
        y: -20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            ref={logoRef}
            src={logo} 
            alt="شركة اليمامة للتأمين" 
            className="h-14 w-auto" 
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-foreground leading-tight">اليمامة</span>
            <span className="text-sm text-muted-foreground">شركة التأمين</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#products" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            المنتجات
          </a>
          <a href="#verify" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            التحقق من الوثيقة
          </a>
          <a href="#contact" className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            اتصل بنا
          </a>
        </nav>
        
        <a href="tel:+9647834855602" className="nav-link">
          <Button variant="outline" size="sm" className="gap-2 hover-glow transition-all duration-300">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">+964 783 485 5602</span>
          </Button>
        </a>
      </div>
    </header>
  );
};

export default Header;
