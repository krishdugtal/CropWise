import React, { useState, useRef, useEffect } from "react";
import { T } from './locales.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const API_BASE = "http://localhost:5000";

const CROP_EMOJIS = {
  "wheat": "🌾", "potatoes": "🥔", "sugar beet": "🧅", "vining peas": "🫛",
  "bulbs": "🧄", "field vegetables": "🥬", "paddy": "🌾", "sugarcane": "🎋",
  "cotton": "☁️", "broccoli": "🥦", "groundnut": "🥜", "millet": "🌾",
  "watermelon": "🍉", "carrot": "🥕", "rice": "🍚", "maize": "🌽",
  "soybean": "🫘", "vegetables": "🥗", "root vegetables": "🥕", "salad crops": "🥗",
  "spinach": "🥬", "beets": "🍠", "cabbage": "🥬", "sweetcorn": "🌽",
  "grapes": "🍇", "onions": "🧅", "tomatoes": "🍅", "peppers": "🌶️",
  "carrots": "🥕", "melons": "🍈", "asparagus": "🌿", "berries": "🍓",
  "corn": "🌽", "soybeans": "🫘", "general vegetables": "🥗", "small fruits": "🍒",
  "ferns": "🌿", "grasses": "🌾", "sorghum": "🌾", "cowpeas": "🌱",
  "alfalfa": "🌿", "sunflowers": "🌻", "heavy grains": "🌾", "barley": "🌾",
  "oats": "🌾", "deep-rooted trees": "🌳", "orchard fruits": "🍎", "forage crops": "🌿",
  "sand": "🏜️", "loamy sand": "🏖️", "sandy loam": "🏜️", "loam": "🏞️", "silt loam": "🏞️", "silt": "🌫️",
  "sandy clay loam": "🪨", "clay loam": "🪨", "silty clay loam": "🪨", "sandy clay": "🧱", "silty clay": "🧱", "clay": "🧱",
  "pears": "🍐", "cassava": "🍠", "peaches": "🍑", "pecans": "🌰", "guava": "🍈",
  "sweet potatoes": "🍠", "garlic": "🧄", "turnips": "🧅", "raspberries": "🍓", "plums": "🍑", "figs": "🍈",
  "citrus": "🍋", "radishes": "🍅", "apples": "🍎", "apricots": "🍑", "zucchini": "🥒",
  "strawberries": "🍓", "cherries": "🍒", "peas": "🫛", "lettuce": "🥬", "parsnips": "🥕",
  "hops": "🌿", "flax": "🌾", "pomegranates": "🍎", "chili peppers": "🌶️", "beans": "🫘", "pumpkin": "🎃",
  "hemp": "🌿", "safflower": "🌻", "canola": "🌼", "sugar cane": "🎋", "tobacco": "🍂",
  "mustard": "🌼", "faba beans": "🫘", "chickpeas": "🧆", "lentils": "🍛", "flaxseed": "🌾",
  "walnuts": "🌰", "almonds": "🌰", "pistachios": "🌰", "hazelnut": "🌰",
  "clover": "☘️", "ryegrass": "🌾", "buckwheat": "🌾", "cauliflower": "🥦", "brussels sprouts": "🥬",
  "kale": "🥬", "taro": "🍠", "lotus root": "🪷"
};

const CROP_CATEGORIES = {
  "wheat": "Grain", "potatoes": "Root", "sugar beet": "Root", "vining peas": "Legume",
  "bulbs": "Root", "field vegetables": "Vegetable", "paddy": "Grain", "sugarcane": "Grass",
  "cotton": "Fiber", "broccoli": "Vegetable", "groundnut": "Legume", "millet": "Grain",
  "watermelon": "Fruit", "carrot": "Root", "rice": "Grain", "maize": "Grain",
  "soybean": "Legume", "vegetables": "Vegetable", "root vegetables": "Root", "salad crops": "Vegetable",
  "spinach": "Vegetable", "beets": "Root", "cabbage": "Vegetable", "sweetcorn": "Grain",
  "grapes": "Fruit", "onions": "Root", "tomatoes": "Fruit", "peppers": "Vegetable",
  "carrots": "Root", "melons": "Fruit", "asparagus": "Vegetable", "berries": "Fruit",
  "corn": "Grain", "soybeans": "Legume", "general vegetables": "Vegetable", "small fruits": "Fruit",
  "ferns": "Plant", "grasses": "Grass", "sorghum": "Grain", "cowpeas": "Legume",
  "alfalfa": "Legume", "sunflowers": "Flower", "heavy grains": "Grain", "barley": "Grain",
  "oats": "Grain", "deep-rooted trees": "Tree", "orchard fruits": "Fruit", "forage crops": "Grass",
  "pears": "Fruit", "cassava": "Root", "peaches": "Fruit", "pecans": "Nut", "guava": "Fruit",
  "sweet potatoes": "Root", "garlic": "Root", "turnips": "Root", "raspberries": "Fruit", "plums": "Fruit", "figs": "Fruit",
  "citrus": "Fruit", "radishes": "Root", "apples": "Fruit", "apricots": "Fruit", "zucchini": "Vegetable",
  "strawberries": "Fruit", "cherries": "Fruit", "peas": "Legume", "lettuce": "Vegetable", "parsnips": "Root",
  "hops": "Flower", "flax": "Crop", "pomegranates": "Fruit", "chili peppers": "Vegetable", "beans": "Legume", "pumpkin": "Fruit",
  "hemp": "Crop", "safflower": "Crop", "canola": "Crop", "sugar cane": "Grass", "tobacco": "Crop",
  "mustard": "Crop", "faba beans": "Legume", "chickpeas": "Legume", "lentils": "Legume", "flaxseed": "Crop",
  "walnuts": "Nut", "almonds": "Nut", "pistachios": "Nut", "hazelnut": "Nut",
  "clover": "Grass", "ryegrass": "Grass", "buckwheat": "Grain", "cauliflower": "Vegetable", "brussels sprouts": "Vegetable",
  "kale": "Vegetable", "taro": "Root", "lotus root": "Root"
};

const CHART_COLORS = ['#A2C181', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#10B981'];


export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  
  // View State
  const [view, setView] = useState("landing"); // landing | dashboard
  const [history, setHistory] = useState([]);
  const [lang, setLang] = useState("en");

  // Live Location & Weather State
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState(null);

  // Scroll references
  const aboutRef = useRef(null);
  const tryItRef = useRef(null);
  const resultsRef = useRef(null);
  const reportRef = useRef(null);
  const chatRef = useRef(null);
  
  const [values, setValues] = useState(Array(10).fill(""));
  const [useSatellite, setUseSatellite] = useState(false);
  const [isFetchingSatellite, setIsFetchingSatellite] = useState(false);

  // SaaS Interactivity States
  const [toast, setToast] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{role: 'assistant', content: 'Hello! I am the CropWise AI Assistant. How can I assist you with your agricultural needs and analysis today?'}]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatClosingOverlay, setIsChatClosingOverlay] = useState(false);

  const showToast = (message, type='success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const t = T[lang];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMessages]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    let systemContext = "You are CropWise AI, an expert agricultural assistant. Answer politely and accurately in a single, short, and smoothly written paragraph. Do not write very long texts or use markdown asterisks.";
    if (result && result.recommended_crops) {
       systemContext += `\n\nFARMER CURRENT CONTEXT:\nThe farmer just generated an AI analysis and is looking at the screen.\nSoil Type Detected: ${result.soil_type}\nTop Recommendation array: ${result.recommended_crops.join(', ')}.\nThey may ask questions regarding this analysis. Help them!`;
    }

    const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const res = await fetch(`${API_BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemContext },
                    ...newMessages
                ],
                model: 'openai'
            })
        });
        
        if (!res.ok) throw new Error("Chat engine overloaded.");
        
        const data = await res.json();
        const reply = data.reply || "Connection dropped. Try again.";
        setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
        console.error("AI Error:", e);
        showToast("AI network timeout or blocked request", "error");
    } finally {
        setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchHistory();
  }, [user]);

  const handleSatelliteFetch = async () => {
    if (!navigator.geolocation) {
       showToast("Geolocation is not supported by your browser", "error");
       return;
    }
    setIsFetchingSatellite(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
            // Fetch from ISRIC SoilGrids REST API
            const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=sand&property=silt&property=clay&depth=5-15cm&value=mean`;
            const r = await fetch(url);
            const d = await r.json();
            
            // ISRIC returns values in cg/kg (divide by 10 to get percentage)
            let sand = 0, silt = 0, clay = 0;
            const props = d.properties.layers;
            props.forEach(layer => {
                if (layer.name === 'sand') sand = layer.depths[0].values.mean / 10;
                if (layer.name === 'silt') silt = layer.depths[0].values.mean / 10;
                if (layer.name === 'clay') clay = layer.depths[0].values.mean / 10;
            });
            
            const total = sand + silt + clay || 1;
            const pSand = sand / total;
            const pSilt = silt / total;
            const pClay = clay / total;
            
            // Reverse engineer to 10 grain boundaries perfectly aligned with ML probability bounds
            const arr = [];
            let sandCount = Math.round(pSand * 10);
            let siltCount = Math.round(pSilt * 10);
            let clayCount = 10 - sandCount - siltCount;
            
            for(let i=0; i<sandCount; i++) arr.push((Math.random() * (2.0 - 0.05) + 0.05).toFixed(4));
            for(let i=0; i<siltCount; i++) arr.push((Math.random() * (0.05 - 0.002) + 0.002).toFixed(4));
            for(let i=0; i<clayCount; i++) arr.push((Math.random() * (0.002 - 0.0001) + 0.0001).toFixed(4));
            
            const shuffled = arr.sort(() => 0.5 - Math.random());
            setValues(shuffled);
            setUseSatellite(true);
        } catch (e) {
            console.error(e);
            showToast("No satellite data available for this specific coordinate.", "error");
            setUseSatellite(false);
        } finally {
            setIsFetchingSatellite(false);
        }
    }, () => {
        setIsFetchingSatellite(false);
        showToast("Location access denied.", "error");
    });
  };

  // Boot Geolocation Hooks Natively
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
             // Free Open-Meteo API
             const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
             const wData = await weatherRes.json();
             setWeather(wData.current_weather);

             // Free Reverse Geocoding via BigDataCloud
             const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
             const gData = await geoRes.json();
             setLocationName(`${gData.city || gData.locality}, ${gData.countryName}`);
          } catch (e) {
             console.error("Geo fetch failed:", e);
          }
        },
        (err) => { console.error("Geolocation denied or failed.", err); }
      );
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('cropwise_token');
      const res = await fetch(`${API_BASE}/history?user_id=${user.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data);
    } catch(e) { console.error("History fetch error:", e) }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = authMode === "login" ? "/login" : "/signup";
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // JWT token handshake
      localStorage.setItem('cropwise_token', data.token);
      setUser(data);
      setShowAuthModal(false);
      setView("dashboard");
      showToast(authMode === "login" ? "Secure handshake successful." : "Enterprise profile created.", "success");
    } catch(err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const siltLoamDemo = ["0.015", "0.080", "0.003", "0.022", "0.045", "0.012", "0.008", "0.060", "0.030", "0.005"];
    setValues(siltLoamDemo);
  };

  const handleInputChange = (idx, val) => {
    const newVals = [...values];
    newVals[idx] = val;
    setValues(newVals);
  };

  const scrollToSection = (ref) => {
    if (!ref.current) return;
    const targetPosition = ref.current.getBoundingClientRect().top + window.scrollY - 72;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200; // Normal scrolling speed (1.2 seconds)
    let start = null;

    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const t = progress / duration;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, startPosition + distance * ease);
      if (progress < duration) window.requestAnimationFrame(step);
      else window.scrollTo(0, targetPosition);
    });
  };

  const handleSubmit = async () => {
    const nums = values.map(v => parseFloat(v));
    if (nums.some(isNaN)) {
      showToast("Ensure all 10 fields have valid numerical data.", "error");
      setError("Data Validation Failed.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const headers = { "Content-Type": "application/json" };
      const token = localStorage.getItem('cropwise_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST", headers,
        body: JSON.stringify({ values: nums }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      if (user) fetchHistory();
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("CropWise_Soil_Analysis.pdf");
  };

  // Chart Data Processing
  const pieData = history.reduce((acc, curr) => {
    const existing = acc.find(c => c.name === curr.soil_type);
    if (existing) existing.value += 1;
    else acc.push({ name: curr.soil_type, value: 1 });
    return acc;
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        
        :root {
          --primary: #A2C181; --primary-dark: #83A55D; --bg-light: #F8FAFC;
          --text-dark: #0F172A; --text-light: #64748B; --border-color: #E2E8F0;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; height: 100%; }
        html { scroll-behavior: smooth; }
        
        body { background-color: var(--bg-light); color: var(--text-dark); font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        .navbar { background-color: white; padding: 16px 40px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 50; }
        .navbar-brand { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 700; color: var(--primary-dark); text-decoration: none; display: flex; align-items: center; gap: 8px; justify-self: start; }
        
        .navbar-center { display: flex; gap: 32px; align-items: center; justify-self: center; }
        .navbar-center a { color: var(--text-dark); text-decoration: none; font-weight: 500; font-size: 15px; cursor: pointer; transition: color 0.2s; }
        .navbar-center a:hover { color: var(--primary-dark); }
        
        .navbar-right { display: flex; gap: 16px; align-items: center; justify-self: end; }
        .lang-select { border: none; background: transparent; font-family: 'Inter'; font-size: 15px; font-weight: 500; color: var(--text-dark); outline: none; cursor: pointer; padding: 0; transition: color 0.2s; }
        .lang-select:hover { color: var(--primary-dark); }
        
        .btn-outline { background: white; border: 1px solid var(--border-color); color: var(--text-dark); padding: 10px 24px; border-radius: 40px; cursor: pointer; font-weight: 600; font-family: 'Inter'; transition: 0.2s; }
        .btn-outline:hover { background: #F1F5F9; }
        .btn-primary { background-color: #3b82f6; color: white; border: none; padding: 10px 24px; border-radius: 40px; font-weight: 600; cursor: pointer; transition: 0.2s; font-family: 'Inter'; }
        .btn-primary:hover { background-color: #2563eb; }

        .hero { position: relative; height: calc(100vh - 72px); background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('/farmer_hero.jpg'); background-size: cover; background-position: center; display: flex; align-items: center; padding: 0 10%; }
        .hero-title { font-family: 'Outfit', sans-serif; font-size: 5rem; font-weight: 800; color: white; line-height: 1.1; margin-bottom: 24px; }
        .hero-title span { color: var(--primary); }
        .hero-subtitle { font-size: 1.2rem; color: #E2E8F0; max-width: 600px; line-height: 1.6; margin-bottom: 40px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal { background: white; padding: 40px; border-radius: 24px; width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .modal h2 { font-family: 'Outfit'; font-size: 28px; margin-bottom: 24px; color: var(--text-dark); }
        .modal input { width: 100%; padding: 12px 16px; margin-bottom: 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 15px; }
        .modal-tabs { display: flex; gap: 16px; margin-bottom: 24px; }
        .modal-tabs button { flex: 1; padding: 10px; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-weight: 600; font-size: 16px; color: var(--text-light); }
        .modal-tabs button.active { color: var(--primary-dark); border-bottom-color: var(--primary-dark); }

        .dashboard-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; animation: fadeUp 0.4s ease-out; }
        .widget-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 40px; }
        .widget { background: white; padding: 24px; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .widget h3 { font-family: 'Outfit'; font-size: 20px; margin-bottom: 16px; color: var(--text-dark); }
        
        .weather-banner { background: white; padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-around; align-items: center; }
        .weather-banner .temp { font-size: 32px; font-family: 'Outfit'; font-weight: 700; color: #F59E0B; }
        .weather-banner .desc { font-size: 16px; color: var(--text-light); font-weight: 500; }
        .weather-banner .rain { font-size: 15px; color: #3B82F6; font-weight: 600; }

        .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .history-card { background: white; border: 1px solid var(--border-color); padding: 24px; border-radius: 16px; display: flex; flex-direction: column; gap: 10px; transition: transform 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .history-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.04); border-color: var(--primary); }
        .history-card .date { font-size: 13px; color: var(--text-light); }
        .history-card .soil { font-family: 'Outfit'; font-size: 24px; font-weight: 600; color: var(--primary-dark); }
        .history-card .crops { font-size: 14px; color: var(--text-dark); line-height: 1.5; }

        .input-grid { background: white; border-radius: 24px; padding: 48px; box-shadow: 0 20px 40px rgba(0,0,0,0.02); border: 1px solid var(--border-color); }
        .form-row { display: flex; align-items: center; gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--border-color); }
        .form-label { min-width: 120px; font-weight: 500; font-size: 15px; }
        .form-input { flex: 1; background: transparent; border: none; outline: none; font-size: 16px; font-family: 'Outfit', monospace; }

        .results-wrapper { background: white; padding: 60px; border-radius: 24px; border: 1px dashed var(--primary-dark); margin-top: 40px; text-align: center; }
        .crops-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin: 32px 0; }
        .crop-card { background: #F8FAFC; border: 1px solid var(--border-color); padding: 20px; border-radius: 16px; transition: transform 0.2s; }
        .crop-card:hover { transform: translateY(-4px); border-color: var(--primary); }
        .crop-icon { font-size: 32px; margin-bottom: 8px; }
        .crop-info { font-family: 'Outfit'; font-weight: 600; text-transform: capitalize; }
        .crop-badge { background: var(--border-color); color: var(--text-dark); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; float: right; }
        
        .toast { position: fixed; bottom: 32px; right: 32px; padding: 16px 24px; border-radius: 12px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 12px; font-weight: 600; font-family: 'Inter'; z-index: 1000; animation: slideUp 0.3s ease-out; }
        .toast.success { border-left: 6px solid #10B981; }
        .toast.error { border-left: 6px solid #EF4444; }

        .chat-widget-wrapper { position: fixed; bottom: 32px; right: 32px; z-index: 999; display: flex; flex-direction: column; align-items: flex-end; }
        .chat-fab { background: var(--primary-dark); color: white; border: none; border-radius: 40px; padding: 16px 32px; font-size: 16px; font-weight: 700; font-family: 'Inter'; cursor: pointer; box-shadow: 0 10px 20px rgba(131,165,93,0.3); transition: 0.2s; }
        .chat-fab:hover { transform: translateY(-4px); }
        .chat-window { width: 380px; height: 500px; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column; margin-bottom: 16px; overflow: hidden; animation: fadeUp 0.3s ease-out; border: 1px solid var(--border-color); }
        .chat-header { background: var(--primary-dark); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; padding: 20px; overflow-y: auto; background: #F8FAFC; display: flex; flex-direction: column; gap: 12px; scroll-behavior: smooth; }
        .chat-bubble { padding: 12px 16px; border-radius: 12px; font-size: 15px; max-width: 85%; line-height: 1.5; }
        .user-bubble { background: var(--primary); color: white; align-self: flex-end; border-bottom-right-radius: 0; }
        .bot-bubble { background: white; color: var(--text-dark); border: 1px solid var(--border-color); align-self: flex-start; border-bottom-left-radius: 0; }
        .chat-footer { padding: 16px; background: white; border-top: 1px solid var(--border-color); display: flex; gap: 12px; }
        .chat-footer input { flex: 1; padding: 12px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-family: 'Inter'; outline: none; }
        .chat-footer button { background: var(--text-dark); color: white; border: none; border-radius: 8px; padding: 0 20px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .chat-footer button:hover { background: var(--primary-dark); }

        .spinner { width: 24px; height: 24px; animation: spin 1s linear infinite; }
        .spinner circle { stroke: white; stroke-width: 4; stroke-dasharray: 90, 150; stroke-dashoffset: 0; stroke-linecap: round; }
        
        details { background: white; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 16px; padding: 24px; cursor: pointer; transition: 0.2s; }
        details[open] { border-color: var(--primary-dark); }
        summary { font-family: 'Outfit'; font-size: 20px; font-weight: 600; color: var(--text-dark); outline: none; display: flex; align-items: center; justify-content: space-between; }
        summary::-webkit-details-marker { display: none; }
        details p { color: var(--text-light); margin-top: 16px; line-height: 1.8; padding-top: 16px; border-top: 1px dashed var(--border-color); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Navbar */}
      <nav className="navbar">
        <a href="#" className="navbar-brand" onClick={(e) => { e.preventDefault(); setView('landing'); window.scrollTo({top:0}); }}>
          <span style={{fontSize: "24px"}}>🪴</span> {t.appTitle}
        </a>

        <div className="navbar-center">
          {view === 'landing' && <a onClick={() => scrollToSection(aboutRef)}>{t.about}</a>}
          {view === 'landing' && <a onClick={() => scrollToSection(tryItRef)}>{t.tryIt}</a>}
          <a onClick={() => setView('dashboard')}>{t.dashboard}</a>
        </div>

        <div className="navbar-right">
          <select className="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="ml">മലയാളം</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </select>
          {user ? (
            <button className="btn-outline" onClick={() => { localStorage.removeItem('cropwise_token'); setUser(null); setView('landing'); }}>{t.logout}</button>
          ) : (
            <button className="btn-primary" onClick={() => setShowAuthModal(true)}>{t.login}</button>
          )}
        </div>
      </nav>

      {/* Conditional Rendering: Landing vs Dashboard */}
      {view === 'dashboard' ? (
        user ? (
          <div className="dashboard-container">
            <h2 style={{fontFamily:'Outfit', fontSize:'32px', marginBottom:'32px', display:'flex', alignItems:'center', gap:'12px'}}>
              {t.welcome}, {user.username}
            </h2>
          
          <div className="widget-grid">
            <div className="widget">
              <h3>{t.history1}</h3>
              {history.length > 0 ? (
                <div style={{height: '240px', marginTop: '20px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{fontFamily:'Outfit', fontSize: 13}} />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{fill: '#F1F5F9'}} />
                      <Bar dataKey="value" fill="var(--primary-dark)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <p style={{color:'var(--text-light)'}}>{t.noHistory}</p>}
            </div>
          </div>

          <h3 style={{fontFamily:'Outfit', fontSize:'24px', marginBottom:'24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t.history2}</h3>
          <div className="history-grid">
            {history.map(plot => (
               <div className="history-card" key={plot.id}>
                 <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                   <span className="soil">{plot.soil_type}</span>
                   <span style={{fontSize:'28px'}}>{CROP_EMOJIS[plot.soil_type.toLowerCase()] || "🏞️"}</span>
                 </div>
                 <div className="crops"><strong>Recommended Crops:</strong><br/>{plot.recommended_crops.join(", ")}</div>
                 <div className="date">{plot.timestamp}</div>
               </div>
            ))}
            {history.length === 0 && <p style={{color: 'var(--text-light)'}}>{t.noHistory}</p>}
          </div>

        </div>
        ) : (
          <div className="dashboard-container" style={{textAlign: 'center', padding: '120px 20px', minHeight: 'calc(100vh - 80px)'}}>
             <div style={{fontSize: '80px', marginBottom: '24px'}}>🔒</div>
             <h2 style={{fontFamily: 'Outfit', fontSize: '40px', color: 'var(--text-dark)', marginBottom: '16px'}}>{t.dashLocked}</h2>
             <p style={{color: 'var(--text-light)', fontSize: '18px', maxWidth: '500px', margin: '0 auto 32px auto', lineHeight: '1.6'}}>
               {t.dashLockedSub}
             </p>
             <button className="btn-primary" onClick={() => setShowAuthModal(true)} style={{padding: '16px 40px', fontSize: '18px'}}>
               {t.login}
             </button>
          </div>
        )
      ) : (
        <>
          <div className="hero">
            <div className="hero-content">
              <h1 className="hero-title">{t.hero1}<br/><span>{t.hero2}</span></h1>
              <p className="hero-subtitle">{t.heroSub}</p>
              <button className="btn-primary" style={{padding:'20px 48px', fontSize:'18px'}} onClick={() => scrollToSection(tryItRef)}>{t.tryIt}</button>
            </div>
          </div>

          <div style={{background: 'white', padding: '40px 20px', borderBottom: '1px solid var(--border-color)', textAlign: 'center'}}>
             <p style={{color: 'var(--text-light)', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '32px'}}>{t.trustedBy}</p>
             <div style={{display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', filter: 'grayscale(100%) opacity(0.5)', opacity: '0.8'}}>
                 <h3 style={{fontFamily: 'Outfit', display:'flex', alignItems:'center', gap:'8px'}}>🌾 ISRIC Global</h3>
                 <h3 style={{fontFamily: 'Outfit', display:'flex', alignItems:'center', gap:'8px'}}>🌐 UN Agri-Tech</h3>
                 <h3 style={{fontFamily: 'Outfit', display:'flex', alignItems:'center', gap:'8px'}}>📉 Live Matrix Market</h3>
                 <h3 style={{fontFamily: 'Outfit', display:'flex', alignItems:'center', gap:'8px'}}>🧠 SK-Learn AI Council</h3>
             </div>
          </div>

          <div className="weather-banner">
            <div style={{display:'flex', alignItems: 'center', gap: '20px'}}>
              <span style={{fontSize:'48px'}}>
                 {weather?.weathercode <= 3 ? '⛅' : (weather?.weathercode > 50 ? '☔' : '☁️')}
              </span>
              <div>
                <div className="temp">{weather ? `${Math.round(weather.temperature)}°C` : '...°C'}</div>
                <div className="desc">{weather ? t.weatherLive : t.detectingGeo}</div>
              </div>
            </div>
            <div className="rain" style={{textAlign: 'right'}}>
              <div style={{fontSize: '18px'}}>📍 {locationName || t.awaitingLoc}</div>
              {weather && <div style={{marginTop:'4px', fontSize:'13px', color:'var(--text-light)', fontWeight: 500}}>{t.wind}: {weather.windspeed} km/h</div>}
            </div>
          </div>

          <div className="about-section" ref={aboutRef} style={{maxWidth:'1200px', margin:'0 auto', padding:'100px 20px', display:'flex', gap:'60px', alignItems:'center'}}>
            <div style={{flex: 1}}>
               <h4 style={{color:'#A855F7', textTransform:'uppercase', letterSpacing:'2px', marginBottom:'12px', fontWeight:600}}>{t.about}</h4>
               <h2 style={{fontFamily:'Outfit', fontSize:'40px', marginBottom:'24px'}}>{t.aboutTitle2}</h2>
               <p style={{color:'var(--text-light)', lineHeight:'1.8', marginBottom:'16px'}}>{t.aboutP1}</p>
               <p style={{color:'var(--text-light)', lineHeight:'1.8', marginBottom:'16px'}}>{t.aboutP2}</p>
               <p style={{color:'var(--text-light)', lineHeight:'1.8'}}>{t.aboutP3}</p>
            </div>
            <div style={{flex: 1, textAlign:'right'}}>
               <img style={{borderRadius:'16px', maxWidth:'100%', border:'1px solid var(--border-color)'}} src="/triangle.png" alt="Soil field" />
            </div>
          </div>

          <div style={{maxWidth: '1200px', margin: '0 auto'}}>
            <hr style={{border: 'none', borderTop: '2px dashed var(--border-color)', margin: '0 20px'}} />
          </div>

          <div className="page-container" style={{maxWidth: '900px', margin:'0 auto', padding: '80px 20px 120px 20px'}} ref={tryItRef}>
            <div style={{textAlign: 'center', marginBottom:'48px'}}>
              <h2 style={{fontFamily:'Outfit', fontSize:'32px', color:'var(--primary-dark)', letterSpacing:'1px', marginBottom:'12px'}}>{t.runAnalysis}</h2>
              <p style={{color:'var(--text-light)'}}>{t.runAnalysisSub} {user ? t.runAnalysisSuffix : ""}</p>
            </div>
            
            <div className="input-grid">
              <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px", borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
                <button onClick={() => setUseSatellite(false)} className={!useSatellite ? "btn-primary" : "btn-outline"}>📏 {t.manual}</button>
                <button onClick={handleSatelliteFetch} disabled={isFetchingSatellite} className={useSatellite ? "btn-primary" : "btn-outline"} style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  🛰️ {isFetchingSatellite ? t.scanningOrbit : t.auto}
                </button>
              </div>

              {!useSatellite ? (
                values.map((val, idx) => (
                  <div className="form-row" key={idx}>
                    <div className="form-label">{t.samplePl} {idx + 1} *</div>
                    <input type="number" className="form-input" placeholder="0.000" value={val} step="0.001" min="0" onChange={(e) => handleInputChange(idx, e.target.value)} />
                  </div>
                ))
              ) : (
                <div style={{textAlign: 'center', padding: '40px 0', color: 'var(--primary-dark)', background: '#F1F5F9', borderRadius: '16px', marginBottom: '24px'}}>
                   <div style={{fontSize: '48px', marginBottom: '16px'}}>🛰️🌍</div>
                   <h3 style={{fontFamily: 'Outfit', fontSize: '24px', marginBottom: '8px'}}>{t.isric}</h3>
                   <p style={{color: 'var(--text-light)', maxWidth: '500px', margin: '0 auto'}}>{t.isricSub}</p>
                </div>
              )}
              
              {error && <div style={{ color: "#EF4444", marginTop: "24px", textAlign: "center", fontWeight: 500 }}>{error}</div>}
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "40px" }}>
                {!useSatellite && <button onClick={fillDemo} className="btn-outline">{t.demo}</button>}
                <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{minWidth: "200px", padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  {loading ? 
                    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <svg className="spinner" viewBox="0 0 50 50" fill="none"><circle cx="25" cy="25" r="20" /></svg>
                      {t.runningML}
                    </div>
                  : t.submit}
                </button>
              </div>
            </div>

            {result && (
              <div className="results-wrapper" ref={resultsRef} id="report-view">
                <div ref={reportRef} style={{padding: '24px', background:'white'}}>
                  <h1 style={{fontFamily:'Outfit', fontSize:'40px', color:'var(--primary-dark)', marginBottom:'12px'}}>
                    {result.soil_type}
                  </h1>
                  <p style={{color:'var(--text-light)', fontSize:'18px', maxWidth:'600px', margin: '0 auto 20px auto'}}>
                    {t.mlConf}
                  </p>
                  
                  {/* ML Confidence Chart */}
                  <div style={{height: '240px', width: '100%', marginBottom: '40px', display: 'flex', justifyContent: 'center'}}>
                    <ResponsiveContainer width={500} height="100%">
                      <PieChart>
                        <Pie 
                          data={Object.entries(result.all_probabilities || {}).map(([name, value]) => ({ name, value })).filter(d => d.value > 0.02).sort((a,b) => b.value - a.value)} 
                          dataKey="value" nameKey="name" 
                          cx="50%" cy="50%" outerRadius={80} 
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {Object.entries(result.all_probabilities || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {result.agronomy_details && Object.keys(result.agronomy_details).length > 0 && (
                    <div style={{background: '#F8FAFC', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', textAlign: 'left', marginBottom: '40px'}}>
                      <h3 style={{fontFamily: 'Outfit', fontSize: '22px', color: 'var(--primary-dark)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px'}}>
                         {t.usda}
                      </h3>
                      <ul style={{color: 'var(--text-dark)', fontSize: '16px', lineHeight: '2', paddingLeft: '24px', listStyleType: 'circle'}}>
                        <li><strong>{t.ph}</strong> {result.agronomy_details.ph_level}</li>
                        <li><strong>{t.irrigation}</strong> {result.agronomy_details.water_retention}</li>
                        <li><strong>{t.aeration}</strong> {result.agronomy_details.porosity}</li>
                        <li><strong>{t.erosion}</strong> {result.agronomy_details.erosion_risk}</li>
                      </ul>
                    </div>
                  )}

                  <p style={{color:'var(--text-light)', fontSize:'18px', maxWidth:'600px', margin: '0 auto 20px auto'}}>
                    {t.rec}
                  </p>
                  <div className="crops-grid">
                    {result.recommended_crops.map(c => (
                      <div className="crop-card" key={c}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems: 'flex-start'}}>
                           <div className="crop-icon">{CROP_EMOJIS[c.toLowerCase()] || "🌱"}</div>
                           <span className="crop-badge">{CROP_CATEGORIES[c.toLowerCase()] || "Crop"}</span>
                        </div>
                        <div className="crop-info">{c}</div>
                        {result.market_pricing && result.market_pricing[c] && (
                           <div style={{marginTop: '16px', fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', color: 'var(--text-dark)', fontWeight: '500'}}>
                             {result.market_pricing[c]}
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="btn-outline" onClick={downloadPDF} style={{marginTop:'24px', borderColor: 'var(--primary-dark)', color: 'var(--primary-dark)'}}>
                  📄 {t.dlBtn}
                </button>
              </div>
            )}
          </div>
          
          <div style={{maxWidth: '800px', margin: '0 auto 120px auto', padding: '0 20px'}}>
             <h2 style={{fontFamily:'Outfit', fontSize:'32px', textAlign:'center', marginBottom:'40px'}}>{t.faqTitle}</h2>
             
             <details>
               <summary>{t.faq1}</summary>
               <p>{t.faq1a}</p>
             </details>

             <details>
               <summary>How accurate is the Manual Measure mode? 🔬</summary>
               <p>{t.faq2a}</p>
             </details>
             
             <details>
               <summary>{t.faq3}</summary>
               <p>{t.faq3a}</p>
             </details>
             <details>
               <summary>{t.faq4}</summary>
               <p>{t.faq4a}</p>
             </details>
          </div>

          <footer style={{background: 'var(--primary-dark)', color: 'white', padding: '80px 40px', fontFamily: 'Inter'}}>
            <div style={{maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px'}}>
               <div>
                 <h2 style={{fontFamily: 'Outfit', fontSize: '28px', marginBottom: '16px'}}>🪴 CropWise</h2>
                 <p style={{color: '#E2E8F0', lineHeight: '1.6'}}>{t.footer1}</p>
               </div>
               <div>
                 <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px'}}>{t.footer2}</h4>
                 <ul style={{listStyle: 'none', padding: 0, color: '#CBD5E1', lineHeight: '2.4'}}>
                   <li>{t.footer2_1}</li>
                   <li>{t.footer2_2}</li>
                   <li>{t.footer2_3}</li>
                   <li>{t.footer2_4}</li>
                 </ul>
               </div>
               <div>
                 <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px'}}>{t.footer3}</h4>
                 <ul style={{listStyle: 'none', padding: 0, color: '#CBD5E1', lineHeight: '2.4'}}>
                   <li>{t.footer3_1}</li>
                   <li>{t.footer3_2}</li>
                   <li>{t.footer3_3}</li>
                 </ul>
               </div>
               <div>
                 <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px'}}>{t.footer4}</h4>
                 <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                    <input type="email" placeholder={t.emailPlaceholder} style={{flex: 1, padding: '12px', borderRadius: '8px', border: 'none', outline: 'none'}} />
                    <button style={{background: 'var(--text-dark)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor:'pointer', fontWeight: 600}}>{t.syncBtn}</button>
                 </div>
               </div>
            </div>
            <div style={{maxWidth: '1200px', margin: '40px auto 0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', textAlign: 'center', color: '#CBD5E1'}}>
              {t.footerCopyright}
            </div>
          </footer>

        </>
      )}

      {/* Floating Chat Widget */}
      <div className="chat-widget-wrapper">
         {isChatOpen && (
            <div className="chat-window">
               <div className="chat-header">
                 <span style={{fontFamily: 'Outfit', fontSize: '18px', fontWeight: '600'}}>{t.chatHub}</span>
                 <button onClick={() => {
                   if (isChatClosingOverlay) {
                     setIsChatClosingOverlay(false);
                     setIsChatOpen(false); // Just hide if clicked again
                   } else {
                     setIsChatClosingOverlay(true);
                   }
                  }} style={{background: 'none', border:'none', color:'white', fontSize:'20px', cursor:'pointer'}}>✕</button>
               </div>
               {isChatClosingOverlay ? (
                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px', textAlign: 'center', background: '#F8FAFC'}}>
                     <h3 style={{fontFamily: 'Outfit', fontSize: '20px', marginBottom: '24px', color: 'var(--text-dark)'}}>{t.chatHelp}</h3>
                     <div style={{display: 'flex', gap: '16px'}}>
                        <button onClick={() => { 
                           setIsChatClosingOverlay(false); 
                        }} style={{padding: '10px 32px', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px'}}>Yes</button>
                        <button onClick={() => { 
                           setChatMessages([{role: 'assistant', content: 'Hello! I am the CropWise AI Assistant. How can I assist you with your agricultural needs and analysis today?'}]); 
                           setIsChatClosingOverlay(false); 
                           setIsChatOpen(false); 
                        }} style={{padding: '10px 32px', background: 'white', color: 'var(--text-dark)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '16px'}}>No</button>
                     </div>
                  </div>
               ) : (
                 <>
                   <div className="chat-body" ref={chatRef}>
                      {chatMessages.map((msg, i) => msg.role !== 'system' && (
                        <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                           {msg.content}
                        </div>
                      ))}
                      {isChatLoading && <div className="chat-bubble bot-bubble">Connecting to core...</div>}
                   </div>
                   <form className="chat-footer" onSubmit={handleChatSubmit}>
                      <input type="text" placeholder="Consult the Ag-Intelligence UI..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
                      <button type="submit" disabled={isChatLoading}>Send</button>
                   </form>
                 </>
               )}
            </div>
         )}
         {!isChatOpen && (
            <button className="chat-fab" onClick={() => setIsChatOpen(!isChatOpen)}>
               💬 Chat With AI
            </button>
         )}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAuthModal(false)}>
          <div className="modal">
            <div className="modal-tabs">
              <button className={authMode==='login'?'active':''} onClick={()=>setAuthMode('login')}>Login</button>
              <button className={authMode==='signup'?'active':''} onClick={()=>setAuthMode('signup')}>Sign Up</button>
            </div>
            <form onSubmit={handleAuth}>
              <input required type="text" placeholder={t.usernamePl} value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
              <input required type="password" placeholder={t.passwordPl} value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              <button type="submit" className="btn-primary" style={{width:'100%', padding:'14px', marginTop:'8px'}} disabled={loading}>
                {loading ? "Processing..." : (authMode === 'login' ? "Login" : "Create Account")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
