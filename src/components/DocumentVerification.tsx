import { useState, useEffect, useRef } from "react";
import { QrCode, Search, FileText, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSearchParams } from "react-router-dom";
import { publicVerifyPolicy } from "@/lib/publicVerify";

gsap.registerPlugin(ScrollTrigger);

interface DocumentData {
  policyNo: string;
  policyType: string;
  insuredName: string;
  startsAt: string;
  endsAt: string;
  status: string;
  pdfSignedUrl: string | null;
}

const DocumentVerification = () => {
  const [searchParams] = useSearchParams();
  const policyParam = searchParams.get("policy");
  const tokenParam = searchParams.get("token");

  const [searchCode, setSearchCode] = useState(policyParam || tokenParam || "");
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".verify-icon", {
        scrollTrigger: {
          trigger: ".verify-icon",
          start: "top 80%",
        },
        scale: 0,
        rotation: -180,
        duration: 1,
        ease: "back.out(1.7)",
      });

      gsap.from(".verify-title", {
        scrollTrigger: {
          trigger: ".verify-title",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".verify-card", {
        scrollTrigger: {
          trigger: ".verify-card",
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Handle automatic search if policy or token is present in URL
  useEffect(() => {
    if (policyParam || tokenParam) {
      handleSearch(policyParam || tokenParam || "");
    }
  }, [policyParam, tokenParam]);

  useEffect(() => {
    if (document && resultRef.current) {
      gsap.from(resultRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [document]);

  const handleSearch = async (c?: string) => {
    const finalCode = c || searchCode.trim();

    if (!finalCode) {
      toast.error("الرجاء إدخال رمز الوثيقة أو رقمها");
      return;
    }

    setIsSearching(true);
    setNotFound(false);
    setDocument(null);

    try {
      // Determine if we are searching by policy number or token
      // For simplicity, we send the code to our backend which handles both
      const result = await publicVerifyPolicy(finalCode);

      if (result.ok && result.data) {
        setDocument(result.data);
        toast.success("تم التحقق من الوثيقة بنجاح");

        // Scroll to results
        if (resultRef.current) {
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } else {
        console.warn("Policy not found:", finalCode);
        setNotFound(true);
      }
    } catch (error: any) {
      console.error("Supabase / API Connection Error:", error);
      setNotFound(true);
      toast.error("حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadPDF = () => {
    if (document?.pdfSignedUrl) {
      window.open(document.pdfSignedUrl, '_blank');
    } else {
      // User specifically requested this Arabic message if PDF is missing
      toast.error("الملف غير متوفر حالياً. يرجى التواصل مع الدعم.");
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "نشط";
      case "expired": return "منتهي";
      case "pending": return "قيد الانتظار";
      default: return status || "غير معروف";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "expired": return "bg-destructive/10 text-destructive border-destructive/20";
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section id="verify" ref={sectionRef} className="py-24 bg-muted/50">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <div className="verify-icon inline-flex items-center justify-center w-20 h-20 rounded-2xl hero-gradient mb-8 glow-primary">
            <QrCode className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="verify-title text-3xl md:text-5xl font-bold text-foreground mb-6">
            التحقق من وثيقتك
          </h2>
          <p className="text-xl text-muted-foreground">
            أدخل رمز QR أو معرف الوثيقة من نموذج التأمين الخاص بك للتحقق من صحتها وعرض التفاصيل.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <Card className="verify-card shadow-card border-border/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Search className="w-6 h-6 text-primary" />
                البحث عن وثيقة
              </CardTitle>
              <CardDescription className="text-base">
                أدخل رمز QR أو رقم الوثيقة المطبوع على نموذج التأمين الخاص بك.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="أدخل رمز الوثيقة..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="text-lg h-12"
                  dir="ltr"
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="hero-gradient hover:opacity-90 px-8 h-12 text-base min-w-[120px]"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جارٍ البحث...</span>
                    </div>
                  ) : "بحث"}
                </Button>
              </div>

              {notFound && (
                <div className="flex items-center gap-4 p-5 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive">لم يتم العثور على الوثيقة</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      يرجى التحقق من الرقم والمحاولة مرة أخرى أو الاتصال بالدعم.
                    </p>
                  </div>
                </div>
              )}

              {document && (
                <div ref={resultRef} className="space-y-5">
                  <div className="flex items-center gap-4 p-5 rounded-xl bg-success/10 border border-success/20">
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    <p className="font-semibold text-success">تم التحقق من الوثيقة بنجاح</p>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-lg">{document.policyType}</p>
                          <p className="text-sm text-muted-foreground" dir="ltr">{document.policyNo}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(document.status)}`}>
                        {getStatusText(document.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pt-5 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">اسم العميل</p>
                        <p className="font-semibold text-foreground">{document.insuredName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">رقم الوثيقة</p>
                        <p className="font-semibold text-foreground" dir="ltr">{document.policyNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">تاريخ الإصدار</p>
                        <p className="font-semibold text-foreground" dir="ltr">{document.startsAt?.split('T')[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">تاريخ الانتهاء</p>
                        <p className="font-semibold text-foreground" dir="ltr">{document.endsAt?.split('T')[0] || 'دائم'}</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleDownloadPDF}
                      className="w-full gap-3 gold-gradient text-secondary-foreground hover:opacity-90 h-12 text-base glow-gold"
                    >
                      <Download className="w-5 h-5" />
                      تحميل PDF
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default DocumentVerification;
