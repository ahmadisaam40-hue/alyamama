import { useEffect, useRef } from "react";
import { Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.jpg";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-content > div", {
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power2.out",
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="hero-gradient py-14">
      <div className="container">
        <div className="footer-content grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-5">
              <img src={logo} alt="شركة اليمامة للتأمين" className="h-16 w-auto rounded-lg bg-primary-foreground/90 p-1.5" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary-foreground leading-tight">اليمامة</span>
                <span className="text-sm text-primary-foreground/70">شركة التأمين</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-base max-w-xs leading-relaxed">
              نقدم حلول تأمينية شاملة لحماية ما يهمك أكثر - أنت وعملك.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-primary-foreground text-lg mb-5">المنتجات التأمينية</h4>
            <ul className="space-y-3">
              {[
                { ar: "الهندسي", en: "Engineering" },
                { ar: "الصحي", en: "Health" },
                { ar: "السيارات", en: "Car" },
                { ar: "الحريق", en: "Fire" },
                { ar: "الشحن", en: "Freight" },
                { ar: "النقود", en: "Cash" },
              ].map((product) => (
                <li key={product.en}>
                  <a 
                    href="#products" 
                    className="text-primary-foreground/70 hover:text-secondary text-base transition-colors"
                  >
                    التأمين {product.ar}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-primary-foreground text-lg mb-5">اتصل بنا</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="tel:+9647834855602" 
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-secondary text-base transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span dir="ltr">+964 783 485 5602</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:info@alyamamah-insurance.com" 
                  className="flex items-center gap-3 text-primary-foreground/70 hover:text-secondary text-base transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span dir="ltr">info@alyamamah-insurance.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10">
          <p className="text-center text-primary-foreground/60 text-base">
            © {currentYear} شركة اليمامة للتأمين. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
