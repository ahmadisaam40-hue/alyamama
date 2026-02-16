import { useEffect, useRef } from "react";
import {
  HardHat,
  HeartPulse,
  Car,
  Flame,
  Ship,
  Banknote,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    icon: HardHat,
    title: "التأمين الهندسي",
    description: "تغطية شاملة لمشاريع البناء، أعطال الآلات، ومخاطر المقاولين.",
    colorClass: "product-icon-engineering",
  },
  {
    icon: HeartPulse,
    title: "التأمين الصحي",
    description: "تغطية رعاية صحية عالية الجودة للأفراد والعائلات مع وصول لأفضل المرافق الطبية.",
    colorClass: "product-icon-health",
  },
  {
    icon: Car,
    title: "تأمين السيارات",
    description: "حماية كاملة لمركبتك ضد الحوادث، السرقة، ومسؤولية الطرف الثالث.",
    colorClass: "product-icon-car",
  },
  {
    icon: Flame,
    title: "تأمين الحريق",
    description: "حماية ممتلكاتك وأصولك ضد أضرار الحريق والمخاطر المرتبطة.",
    colorClass: "product-icon-fire",
  },
  {
    icon: Ship,
    title: "تأمين الشحن",
    description: "حماية بضائعك وشحناتك أثناء النقل براً، بحراً، أو جواً.",
    colorClass: "product-icon-freight",
  },
  {
    icon: Banknote,
    title: "تأمين النقود",
    description: "تغطية آمنة للنقود أثناء النقل، محتويات الخزائن، وعمليات التعامل بالأموال.",
    colorClass: "product-icon-cash",
  },
];

const Products = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".section-title", {
        scrollTrigger: {
          trigger: ".section-title",
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // Animate each card individually when it enters the viewport
      const cards = gsap.utils.toArray('.product-card');
      cards.forEach((card: any, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none"
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: (i % 3) * 0.1 // Stagger within rows
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="products" ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background elements for premium feel */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="container relative z-10">
        <div className="text-center mb-16 section-title">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            منتجاتنا التأمينية
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            حلول تأمينية مصممة لحماية كل جانب من جوانب حياتك وعملك.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.title} className="product-card flip-card group">
              <div className="flip-card-inner">
                {/* Front Face */}
                <div className="flip-card-front">
                  <div className={`w-20 h-20 rounded-2xl ${product.colorClass} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                    <product.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{product.title}</h3>
                  <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">حرك الماوس للتفاصيل</p>
                </div>

                {/* Back Face */}
                <div className="flip-card-back p-8">
                  <h3 className="text-2xl font-bold mb-4">{product.title}</h3>
                  <p className="text-slate-100 mb-8 text-base leading-relaxed font-medium">
                    {product.description}
                  </p>
                  <Button
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white gap-2 transition-all duration-300"
                  >
                    اعرف المزيد
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
