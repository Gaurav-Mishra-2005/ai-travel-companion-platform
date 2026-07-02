import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import { Compass, Sparkles, MapPin, Calendar, Layers, ArrowRight, Play, RefreshCw, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const { user } = useAuth();
  
  // LIVE AI DEMO Animation States
  const [demoStep, setDemoStep] = useState(0); // 0: Idle, 1: Typing, 2: Thinking, 3: Success Itinerary
  const [demoInputText, setDemoInputText] = useState("");
  const targetText = "3 Day Goa Trip under ₹20,000";
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const demoRef = React.useRef(null);
  
  const allThinkingMessages = [
    "Understanding preferences...",
    "Checking weather...",
    "Finding attractions...",
    "Optimizing route...",
    "Scheduling activities..."
  ];

  // Viewport intersection observer to start animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          setDemoStep(1); // Begin typing animation
        }
      },
      { threshold: 0.15 }
    );
    
    if (demoRef.current) {
      observer.observe(demoRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasStarted]);

  // Demo Control Loop (Play Once)
  useEffect(() => {
    let timer;
    if (!hasStarted) return;

    if (demoStep === 1) {
      // Type letter by letter
      if (demoInputText.length < targetText.length) {
        timer = setTimeout(() => {
          setDemoInputText(targetText.slice(0, demoInputText.length + 1));
        }, 60);
      } else {
        // Typing done, start thinking
        timer = setTimeout(() => {
          setDemoStep(2);
        }, 800);
      }
    } else if (demoStep === 2) {
      // Show thinking steps sequentially
      if (thinkingSteps.length < allThinkingMessages.length) {
        timer = setTimeout(() => {
          setThinkingSteps(prev => [...prev, allThinkingMessages[prev.length]]);
        }, 800);
      } else {
        // Thinking done, show result
        timer = setTimeout(() => {
          setDemoStep(3);
        }, 850);
      }
    }
    return () => clearTimeout(timer);
  }, [demoStep, demoInputText, thinkingSteps, hasStarted]);

  return (
    <div className="flex flex-col items-center pt-8 sm:pt-16 pb-20 overflow-hidden relative min-h-[calc(100vh-64px)] bg-[#0d2a2a] text-zinc-900 dark:text-zinc-100 transition-colors px-4 w-full">
      {/* Travel Themed Stylized Vector Background with Slow Zoom */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none bg-no-repeat opacity-100"
        style={{ backgroundImage: "url('/travel_vector_bg.png')" }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Dark Overlay for Reading Contrast */}
      <div className="absolute inset-0 bg-zinc-950/20 dark:bg-zinc-950/40 pointer-events-none backdrop-brightness-[0.98]" />

      {/* Floating Gradient Blurs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/10 dark:bg-indigo-400/5 blur-[120px] pointer-events-none"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/10 dark:bg-teal-400/5 blur-[150px] pointer-events-none"
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hero Section Container with glassmorphic backing card for absolute legibility */}
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 z-10 bg-white/70 dark:bg-zinc-950/75 px-6 py-10 sm:px-12 sm:py-14 rounded-3xl backdrop-blur-md border border-white/30 dark:border-zinc-850/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm text-zinc-550 dark:text-zinc-405 text-xs font-semibold transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-650 dark:text-indigo-400" />
          <span>Generative Travel Planner Powered by Gemini AI</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-display font-extrabold text-zinc-950 dark:text-zinc-50 tracking-tight leading-[1.1] max-w-3xl"
        >
          Plan your next adventure <br className="hidden sm:inline" />
          <span className="text-indigo-650 dark:text-indigo-400 font-extrabold">in milliseconds.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 max-w-xl leading-relaxed font-light"
        >
          Ditch the spreadsheets. Describe your dates, budget, and style, and let AI synthesize a customized, day-by-day itinerary mapped out via OpenStreetMap.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto"
        >
          {user ? (
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" icon={ArrowRight} variant="accent" className="w-full bg-[#242b47] hover:bg-[#2f395e] text-white border border-[#2f395e]/50 py-2.5 px-6 rounded-md font-medium text-sm transition-all shadow-md">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" icon={ArrowRight} variant="accent" className="w-full bg-[#242b47] hover:bg-[#2f395e] text-white border border-[#2f395e]/50 py-2.5 px-6 rounded-md font-medium text-sm transition-all shadow-md">
                  Start Planning
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-zinc-700 dark:text-zinc-300 border-zinc-350 dark:border-zinc-700 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </motion.div>
      </div>

      {/* LIVE AI DEMO CONTAINER */}
      <div ref={demoRef} className="w-full max-w-5xl mt-16 sm:mt-24 z-10">
        <div className="text-center mb-6">
          <span className="text-[11px] text-indigo-400 dark:text-indigo-350 font-black uppercase tracking-widest drop-shadow-md">Live Experience Simulator</span>
          <h2 className="text-2xl font-display font-extrabold text-white mt-1 drop-shadow-md">See Gemini Synthesis In Action</h2>
        </div>

        <div className="border border-white/10 dark:border-zinc-900/20 bg-white/80 dark:bg-zinc-900/50 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
          
          {/* Demo Left Panel: Chat Input & Logs (2 Columns) */}
          <div className="lg:col-span-2 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 pb-6 lg:pb-0 lg:pr-6 justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono ml-2">atc.travel/prompt</span>
              </div>

              {/* Mock Chat Input Field */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col gap-2 relative">
                <span className="text-[9px] text-zinc-400 font-bold uppercase">Prompt Input</span>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-mono text-zinc-800 dark:text-zinc-200 flex-1 min-h-[24px] flex items-center">
                    {demoInputText || <span className="text-zinc-400 dark:text-zinc-650">e.g. 3 Day Goa Trip under ₹20,000</span>}
                    {demoStep === 1 && (
                      <motion.span 
                        animate={{ opacity: [1, 0, 1] }} 
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="ml-0.5 inline-block w-1.5 h-4 bg-indigo-500" 
                      />
                    )}
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* AI Processing Logs */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">AI Steps</span>
                <div className="flex flex-col gap-2.5 min-h-[160px] bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl p-3 border border-zinc-250/20">
                  {demoStep >= 2 ? (
                    <div className="flex flex-col gap-2">
                      {thinkingSteps.map((stepMsg, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300"
                        >
                          <span className="text-emerald-500">✓</span>
                          <span>{stepMsg}</span>
                        </motion.div>
                      ))}
                      {thinkingSteps.length < allThinkingMessages.length && (
                        <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium">
                          <svg className="animate-spin h-3 w-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Synthesizing...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400 dark:text-zinc-600 flex items-center justify-center h-28 italic">
                      Waiting for query input...
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-[10px] text-zinc-400 dark:text-zinc-650 flex items-center justify-between">
              <span>Status: {demoStep === 3 ? "Complete" : demoStep === 2 ? "Thinking" : "Idle"}</span>
              {demoStep === 3 && (
                <button 
                  onClick={() => {
                    setDemoStep(0);
                    setDemoInputText("");
                    setThinkingSteps([]);
                  }}
                  className="flex items-center gap-1 text-indigo-500 font-bold hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Replay
                </button>
              )}
            </div>
          </div>

          {/* Demo Right Panel: Generated Itinerary & Map (3 Columns) */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-[350px]">
            <AnimatePresence mode="wait">
              {demoStep === 3 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full"
                >
                  {/* Itinerary Column */}
                  <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col text-left">
                        <h4 className="font-display font-bold text-sm text-zinc-800 dark:text-zinc-100">Goa Sun & Surf Escapade</h4>
                        <span className="text-[10px] text-zinc-450 mt-0.5">3 Days • Couple stay</span>
                      </div>
                      <div className="px-2 py-0.5 text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 rounded-full font-bold uppercase">₹18,500 Spent</div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-1 flex gap-2">
                        <span className="text-[10px] text-zinc-800 dark:text-zinc-150 border-b-2 border-indigo-650 font-bold">Day 1</span>
                        <span className="text-[10px] text-zinc-400">Day 2</span>
                        <span className="text-[10px] text-zinc-400">Day 3</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }} 
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850"
                        >
                          <span className="text-base shrink-0 mt-0.5">🏨</span>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Checking in Taj Exotica Resort</span>
                            <span className="text-[9px] text-zinc-450 mt-0.5">09:00 AM • Benaulim Beach</span>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ opacity: 0, x: -5 }} 
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          className="flex gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850"
                        >
                          <span className="text-base shrink-0 mt-0.5">🏖️</span>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Relaxing Calangute Shoreline Walk</span>
                            <span className="text-[9px] text-zinc-455 mt-0.5">02:00 PM • Calangute</span>
                          </div>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, x: -5 }} 
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-150 dark:border-zinc-850"
                        >
                          <span className="text-base shrink-0 mt-0.5">🍽️</span>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Sunset Seafood Dinner at Curlies</span>
                            <span className="text-[9px] text-zinc-455 mt-0.5">07:05 PM • Anjuna Beach</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Map Column */}
                  <div className="md:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase mb-2">Simulated Route Map</span>
                    
                    {/* Visual Mock Map SVG */}
                    <div className="flex-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg relative overflow-hidden flex items-center justify-center">
                      <svg className="w-full h-full text-zinc-200 dark:text-zinc-800" viewBox="0 0 100 100" fill="none">
                        {/* Land outlines */}
                        <path d="M10 20Q30 40 50 20T90 40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                        <path d="M5 60Q40 50 60 80T95 70" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                        
                        {/* Simulated route line animation */}
                        <motion.path 
                          d="M30 45 L50 60 L75 40" 
                          stroke="#6366f1" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeDasharray="100"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        
                        {/* Marker dots */}
                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} cx="30" cy="45" r="4" fill="#6366f1" />
                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} cx="50" cy="60" r="4" fill="#6366f1" />
                        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} cx="75" cy="40" r="4" fill="#6366f1" />
                        
                        {/* Number tags */}
                        <text x="29" y="39" fill="currentColor" className="text-[6px] font-bold font-sans">1</text>
                        <text x="49" y="54" fill="currentColor" className="text-[6px] font-bold font-sans">2</text>
                        <text x="74" y="34" fill="currentColor" className="text-[6px] font-bold font-sans">3</text>
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[8px] text-zinc-500 font-mono mt-3">
                      <span>Goa, India</span>
                      <span>OSM Enriched</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center p-8 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-900 rounded-xl h-full"
                >
                  <Compass className="h-10 w-10 text-zinc-300 dark:text-zinc-800 animate-pulse mb-3" />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Itinerary Render Zone</span>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-650 max-w-xs mt-1">
                    Once the query has finished typing and the AI complete calculations, the day schedule and routing map details will display here automatically.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="max-w-6xl mx-auto mt-24 sm:mt-32 w-full text-center z-10">
        <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-widest">Workflow</span>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-zinc-950 dark:text-zinc-50 mt-1 mb-12">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6">
          {/* Step 1 */}
          <div className="flex flex-col gap-3 border border-white/15 dark:border-zinc-900/30 p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md shadow-lg text-left">
            <div className="h-9 w-9 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-bold">1</div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2">Describe Trip</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
              Tell us your destination, dates, budget limit in Rs, and stay preferences in natural, easy-to-use inputs.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="flex flex-col gap-3 border border-white/15 dark:border-zinc-900/30 p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md shadow-lg text-left">
            <div className="h-9 w-9 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-bold">2</div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2">AI Generates</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
              Gemini AI analyzes variables to synthesize a customized day-by-day itinerary with localized coordinates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-3 border border-white/15 dark:border-zinc-900/30 p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md shadow-lg text-left">
            <div className="h-9 w-9 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-indigo-650 dark:text-indigo-400 font-bold">3</div>
            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2">Travel Better</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-light">
              Tweak timelines on-the-fly, regenerate slot activities, check routes via Leaflet map, and manage expenses.
            </p>
          </div>
        </div>
      </div>

      {/* POWERED BY SECTION */}
      <div className="max-w-6xl mx-auto mt-24 sm:mt-32 w-full text-center z-10">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-widest">Stack Integrations</span>
        <h2 className="text-lg font-display font-bold text-zinc-700 dark:text-zinc-400 mt-1 mb-8">Powered By Enterprise Tech</h2>
        
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-70 grayscale hover:opacity-100 transition-opacity duration-300">
          {/* Gemini logo */}
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            <span className="font-display font-black text-sm tracking-tighter text-white">Google Gemini</span>
          </div>
          {/* React logo */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-display font-black text-sm tracking-tighter text-white">React 19</span>
          </div>
          {/* MongoDB logo */}
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">🍃</span>
            <span className="font-display font-black text-sm tracking-tighter text-white">MongoDB</span>
          </div>
          {/* OpenStreetMap logo */}
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-rose-500" />
            <span className="font-display font-black text-sm tracking-tighter text-white">OpenStreetMap</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
