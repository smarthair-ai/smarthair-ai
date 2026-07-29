import Navbar from "@/sections/Navbar";
import Hero from "@/sections/Hero";
import PainVsSolution from "@/sections/PainVsSolution";
import Architecture from "@/sections/Architecture";
import FeatureDemo from "@/sections/FeatureDemo";
import DemoSection from "@/sections/DemoSection";
import BusinessModel from "@/sections/BusinessModel";
import ContactForm from "@/sections/ContactForm";
import Footer from "@/sections/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Global background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <Navbar />
      <main>
        <Hero />
        <PainVsSolution />
        <Architecture />
        <FeatureDemo />
        <DemoSection />
        <BusinessModel />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
