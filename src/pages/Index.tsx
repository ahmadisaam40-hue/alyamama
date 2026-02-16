import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Products from "@/components/Products";
import DocumentVerification from "@/components/DocumentVerification";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Products />
        <DocumentVerification />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
