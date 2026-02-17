import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedLogo from "./AnimatedLogo";
import AuthForm from "./AuthForm";
import { LifeBuoy } from "lucide-react";
import "./style.css";

const SLIDES = [
  {
    title: "Reach financial goals faster",
    description: "Analyzing previous trends ensures that businesses always make the right decision. And as the scale of the decision and its impact magnifies...",
    price: "₱500.40",
    label: "Earnings"
  },
  {
    title: "Track assets professionally",
    description: "Our comprehensive asset management system provides real-time tracking and detailed reporting for all your inventory needs.",
    price: "₱1,240.00",
    label: "Asset Value"
  },
  {
    title: "Optimize your workflow",
    description: "Integrate seamlessly with your existing tools and automate repetitive tasks. Scale your business with confidence and precision.",
    price: "98.5%",
    label: "Efficiency"
  }
];

export default function LoginPage() {
  const [animationStage, setAnimationStage] = useState("initial");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [view, setView] = useState("login");

  useEffect(() => {
    setTimeout(() => setAnimationStage("pop"), 100);

    setTimeout(() => setAnimationStage("moving"), 1600);

    setTimeout(() => setAnimationStage("form"), 2000);
  }, []);

  useEffect(() => {
    if (animationStage === "form" && view === "login") {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [animationStage, view]);

  return (
    <div className={`login-page ${view === 'forgot' ? 'forgot' : ''}`}>
      { }
      <AnimatePresence>
        {animationStage !== "form" && animationStage !== "moving" && (
          <motion.div
            className="animation-overlay"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <AnimatedLogo animationStage={animationStage} />
          </motion.div>
        )}
      </AnimatePresence>

      {view === "login" ? (
        <>
          { }
          <div className="login-left">
            <header style={{ marginBottom: 'auto' }}>
              <AnimatedLogo animationStage={animationStage === "form" ? "form" : "hidden"} />
            </header>

            <main className="auth-container">
              <AnimatePresence>
                {animationStage === "form" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <AuthForm setView={setView} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <footer style={{ marginTop: 'auto', fontSize: '13px', color: '#666' }}>
              © 2026 FitTrends. All rights reserved.
            </footer>
          </div>

          { }
          <motion.div
            className="login-right"
            initial={{ x: '100%' }}
            animate={{ x: animationStage === "form" ? 0 : '100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="support-link">
              <LifeBuoy size={18} />
              <span>Support</span>
            </div>

            <div className="info-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="preview-container">
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/10',
                      background: 'linear-gradient(135deg, #243b53 0%, #102a43 100%)',
                      borderRadius: '24px',
                      boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: '240px',
                        height: '150px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '20px'
                      }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', opacity: 0.2, marginBottom: '20px' }}></div>
                        <div style={{ width: '100%', height: '10px', background: 'white', opacity: 0.1, marginBottom: '10px', borderRadius: '4px' }}></div>
                        <div style={{ width: '60%', height: '10px', background: 'white', opacity: 0.1, borderRadius: '4px' }}></div>
                      </div>
                      <motion.div
                        key={currentSlide + '-price'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          position: 'absolute',
                          bottom: '20px',
                          right: '30px',
                          color: 'white',
                          textAlign: 'right'
                        }}
                      >
                        <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{SLIDES[currentSlide].price}</div>
                        <div style={{ fontSize: '14px', opacity: 0.7 }}>{SLIDES[currentSlide].label}</div>
                      </motion.div>
                    </div>
                  </div>

                  <h1 className="info-title">{SLIDES[currentSlide].title}</h1>
                  <p className="info-description">
                    {SLIDES[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div style={{ display: 'flex', gap: '8px', marginTop: '32px' }}>
                {SLIDES.map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: idx === currentSlide ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'white',
                      opacity: idx === currentSlide ? 1 : 0.3,
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          className="forgot-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AuthForm view={view} setView={setView} />
        </motion.div>
      )}
    </div>
  );
}
