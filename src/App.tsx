import React, { useLayoutEffect, useRef, useState, FormEvent, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCheck, Signal, Wifi, Battery, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

gsap.registerPlugin(ScrollTrigger);

interface CardProps {
  platform: 'Bolha' | 'Willhaben' | 'Nepremičnine' | 'Avto.net';
  title: string;
  price: string;
  location: string;
  time: string;
  color: string;
  emoji: string;
  link: string;
}

const MessageCard = ({ platform, title, price, location, time, color, emoji, link }: CardProps) => {
  return (
    <div className="mb-4 w-full max-w-[280px] self-start rounded-2xl bg-[#1c242f] p-3 shadow-lg ring-1 ring-white/5">
      {/* Platform Image Placeholder */}
      <div 
        className="mb-3 flex aspect-video w-full items-center justify-center rounded-xl text-2xl font-bold text-white/90"
        style={{ backgroundColor: color }}
      >
        {title.split(' ')[0].toUpperCase()}
      </div>
      
      {/* Alert Text */}
      <div className="mb-2 text-[13px] font-bold leading-tight" style={{ color: color }}>
        NOV {platform.toUpperCase()} OGLAS!
      </div>
      
      {/* Details */}
      <div className="space-y-1 text-[13px] text-white/90">
        <p><span className="font-bold">Naziv:</span> {title}</p>
        <p><span className="text-green-400">💰</span> <span className="font-bold">Cena:</span> {price}</p>
        <p><span className="text-red-400">📍</span> {location}</p>
        <p><span className="text-blue-400">🔗</span> <span className="text-blue-400 underline decoration-blue-400/30 underline-offset-2">{link}</span></p>
      </div>
      
      {/* Footer */}
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-white/40">
        <span>{time}</span>
        <CheckCheck size={12} className="text-green-500" />
      </div>
    </div>
  );
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isTosModalOpen, setIsTosModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(() => {
    const stored = localStorage.getItem('cookie-consent');
    return stored === null ? null : stored === 'true';
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isTrialModalOpen || isTosModalOpen || isPrivacyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, isTrialModalOpen, isTosModalOpen, isPrivacyModalOpen]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>, formType: 'contact' | 'trial') => {
  e.preventDefault();
  
  // 1. TAKOJ shrani referenco na obrazec
  const form = e.currentTarget;

  if (!captchaToken) {
    alert("Prosimo, potrdite, da niste robot.");
    return;
  }

  setFormStatus('loading');

  try {
    const formData = new FormData(form); // Uporabi 'form' namesto e.currentTarget
    
    formData.set("access_key", import.meta.env.VITE_WEB3FORMS_KEY);
    formData.set("h-captcha-response", captchaToken);
    // ... ostali appendi ...
    formData.set("subject", `Novo povpraševanje: ${formType === 'contact' ? 'Kontakt' : 'Brezplačni preizkus'}`);
    formData.set("from_name", "Oglasni Radar");

    if (formType === 'trial') {
      const selectedPortals = formData.getAll('portals');
      formData.delete('portals');
      formData.set('portals', selectedPortals.join(', '));
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok || data.success) {
      setFormStatus('success');
      
      // 2. UPORABI 'form' spremenljivko za reset
      form.reset(); 
      
      setCaptchaToken(null);
      
      setTimeout(() => {
        setIsModalOpen(false);
        setIsTrialModalOpen(false);
        setFormStatus('idle');
      }, 6000);
    } else {
      setFormStatus('error');
    }
  } catch (error) {
    // Zdaj se ta del ne bo več sprožil zaradi "reset" napake!
    console.error("Critical Error:", error);
    setFormStatus('error');
  }
};

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!feedRef.current || !containerRef.current) return;

      const feedHeight = feedRef.current.scrollHeight;
      const screenHeight = 500; // Approximate height of the phone screen area
      const scrollDistance = feedHeight - screenHeight + 40; // 40 for padding

      gsap.to(feedRef.current, {
        y: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1115] text-white selection:bg-green-500/30">
      {/* Hero / Intro Section */}
      <section className="flex h-[80vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-6 text-5xl font-black tracking-tighter md:text-7xl">
          Oglasni <span className="text-green-500">Radar</span>
        </h1>
        <p className="max-w-xl text-lg text-gray-400 md:text-xl">
          Prejemajte obvestila o novih oglasih v realnem času neposredno v vaš Telegram. 
          Nikoli več ne zamudite dobre priložnosti.
        </p>
        <div className="mt-10 animate-bounce">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500">Pomaknite se navzdol</p>
        </div>
      </section>

      {/* Main Animation Section */}
      <section ref={containerRef} className="relative h-[250vh] w-full">
        {/* Sticky Container */}
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          
          {/* Background Glows */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px]" />
          <div className="absolute left-1/4 top-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[100px]" />

          {/* iPhone Mockup Wrapper for Scaling */}
          <div className="scale-[0.7] sm:scale-[0.85] md:scale-100 flex items-center justify-center">
            {/* iPhone Mockup */}
            <div 
              ref={phoneRef}
              className="relative h-[720px] w-[350px] rounded-[55px] border-[12px] border-[#1a1a1a] bg-[#0a0a0a] shadow-[0_0_0_2px_#2a2a2a,0_40px_100px_-20px_rgba(0,0,0,0.8)]"
            >
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-4 z-50 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            
            {/* Status Bar */}
            <div className="absolute left-0 top-0 flex w-full items-center justify-between px-8 pt-5 text-[12px] font-semibold text-white">
              <span>14:41</span>
              <div className="flex items-center gap-1.5">
                <Signal size={14} />
                <Wifi size={14} />
                <Battery size={16} className="rotate-0" />
              </div>
            </div>

            {/* Screen Content */}
            <div className="absolute inset-0 overflow-hidden rounded-[43px] bg-[#0e1621]">
              {/* App Header */}
              <div className="absolute left-0 top-0 z-40 flex w-full items-center gap-3 bg-[#17212b]/95 px-5 pb-3 pt-14 backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-[14px] font-bold text-white">
                  OR
                </div>
                <div>
                  <h3 className="text-[15px] font-bold leading-tight">Oglasni Radar</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[12px] text-green-500">v spletu</span>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div 
                ref={feedRef}
                className="flex flex-col px-4 pt-32 pb-10"
              >
                <MessageCard 
                  platform="Bolha"
                  title={'Woom 4 otroški kolesar 20"'}
                  price="189 €"
                  location="Ljubljana"
                  time="14:33"
                  color="#9b2c2c"
                  emoji="🔴"
                  link="bolha.com/..."
                />
                
                <MessageCard 
                  platform="Willhaben"
                  title="Woom 4 — top Zustand"
                  price="329 €"
                  location="Graz"
                  time="14:37"
                  color="#2f6f4e"
                  emoji="🟢"
                  link="willhaben.at/..."
                />

                <MessageCard 
                  platform="Nepremičnine"
                  title="2-sobno stanovanje, Šiška"
                  price="210.000 €"
                  location="Ljubljana"
                  time="14:39"
                  color="#2c5282"
                  emoji="🔵"
                  link="nepremicnine.net/..."
                />

                <MessageCard 
                  platform="Avto.net"
                  title="VW Golf 7 1.6 TDI"
                  price="11.500 €"
                  location="Celje"
                  time="14:41"
                  color="#c05621"
                  emoji="🟠"
                  link="avto.net/..."
                />
              </div>

              {/* Input Bar Placeholder */}
              <div className="absolute bottom-0 left-0 flex w-full items-center bg-[#17212b] px-4 py-3 pb-8">
                <div className="h-9 w-full rounded-full bg-[#242f3d] px-4 py-2 text-[14px] text-gray-500">
                  Sporočilo
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Side Content (Desktop only) */}
          <div className="ml-20 hidden max-w-sm lg:block">
            <h2 className="mb-4 text-4xl font-bold">Hitrost je ključna.</h2>
            <p className="text-gray-400">
              Naš sistem pregleduje največje oglasnike vsakih nekaj sekund. 
              Bodite prvi, ki pokliče prodajalca in si zagotovite najboljšo ceno.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
                  <CheckCheck size={20} />
                </div>
                <div>
                  <p className="font-bold">Takojšnja obvestila</p>
                  <p className="text-sm text-gray-500">Brez zamika, direktno na telefon.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                  <CheckCheck size={20} />
                </div>
                <div>
                  <p className="font-bold">Vsi oglasniki na enem mestu</p>
                  <p className="text-sm text-gray-500">Bolha, Avto.net, Willhaben in več.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kako deluje Section */}
      <section className="bg-[#0a0a0a] py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">Kako deluje</h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group relative">
              <span className="font-mono text-8xl font-black text-white/5 transition-colors group-hover:text-green-500/10">01</span>
              <div className="absolute top-12 left-0">
                <h3 className="mb-3 text-xl font-bold">Povejte, kaj iščete</h3>
                <p className="text-gray-400">
                  Sporočite nam portal, ključne besede, lokacijo in cenovni razpon. Primer: <span className="italic text-green-500/80">"Woom kolo na Bolhi pod 250 €."</span>
                </p>
              </div>
            </div>
            <div className="group relative">
              <span className="font-mono text-8xl font-black text-white/5 transition-colors group-hover:text-green-500/10">02</span>
              <div className="absolute top-12 left-0">
                <h3 className="mb-3 text-xl font-bold">Nastavimo vaš radar</h3>
                <p className="text-gray-400">
                  Konfiguriramo sistem po vaših kriterijih. Spremljanje se zažene v nekaj minutah.
                </p>
              </div>
            </div>
            <div className="group relative">
              <span className="font-mono text-8xl font-black text-white/5 transition-colors group-hover:text-green-500/10">03</span>
              <div className="absolute top-12 left-0">
                <h3 className="mb-3 text-xl font-bold">Prejmete obvestilo</h3>
                <p className="text-gray-400">
                  Ob novem zadetku pride Telegram sporočilo s fotografijo, ceno, lokacijo in direktno povezavo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Podprti portali Section */}
      <section className="bg-[#0f1115] py-24 px-6 border-y border-white/5">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">Podprti portali</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-6">
            {[
              { name: 'Bolha.com', desc: 'Splošni oglasi', color: '#9b2c2c', initial: 'B', flag: '🇸🇮' },
              { name: 'Facebook', desc: 'Marketplace', color: '#3b5998', initial: 'f', flag: '🇸🇮' },
              { name: 'Nepremičnine', desc: 'Nepremičnine', color: '#b7791f', initial: 'N', flag: '🇸🇮' },
              { name: 'Avto.net', desc: 'Vozila', color: '#2d3748', initial: 'A', flag: '🇸🇮' },
              { name: 'Willhaben', desc: 'Avstrijski trg', color: '#2f6f4e', initial: 'W', flag: '🇦🇹' },
              { name: 'Mercatino', desc: 'Italijanski trg', color: '#008C45', initial: 'M', flag: '🇮🇹' },
            ].map((portal) => (
              <div 
                key={portal.name} 
                className="group relative flex flex-col rounded-2xl bg-white/5 p-5 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 ring-1 ring-white/10 overflow-hidden"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-black text-white shadow-lg"
                    style={{ backgroundColor: portal.color }}
                  >
                    {portal.initial}
                  </div>
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{portal.flag}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{portal.name}</h3>
                <p className="text-sm text-gray-500">{portal.desc}</p>
                
                {/* Bottom Accent Line */}
                <div 
                  className="absolute bottom-0 left-0 h-1 w-full opacity-50 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: portal.color }}
                />
              </div>
            ))}
          </div>
          <p className="mt-16 text-center text-gray-500">
            Iščete na drugem portalu? <span className="text-green-500 font-medium">Pišite nam</span> — sistem je razširljiv.
          </p>
        </div>
      </section>

      {/* Telegram obvestila Section */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-2 text-green-500 font-bold uppercase tracking-wider">Telegram obvestila</h2>
              <h3 className="mb-6 text-4xl font-bold md:text-5xl">Oglasi pridejo k vam.</h3>
              <p className="mb-10 text-xl text-gray-400">
                Vsako obvestilo vsebuje fotografijo, naziv, ceno, lokacijo, čas objave in direktno povezavo.
              </p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {[
                  "Fotografija, cena, lokacija v enem sporočilu",
                  "Direktna povezava do izvirnega oglasa",
                  "Barvno označen portal za hitro prepoznavo",
                  "Brez duplikatov — nikoli istega oglasa dvakrat"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative flex items-center justify-center rounded-3xl bg-gradient-to-br from-green-500/10 to-blue-500/10 p-4 sm:p-8 ring-1 ring-white/10">
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="h-64 w-64 rounded-full bg-green-500/20 blur-[80px]" />
              </div>
              <div className="relative w-full max-w-[360px] rounded-2xl bg-[#17212b] p-4 sm:p-6 shadow-2xl ring-1 ring-white/10">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center font-bold text-white shadow-lg shadow-green-500/20">OR</div>
                  <div>
                    <p className="text-[15px] font-bold leading-tight">Oglasni Radar</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#242f3d] p-3 text-[13px] shadow-sm">
                    <div className="mb-3 aspect-[4/3] w-full rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-500/50 font-bold border border-blue-500/10">
                      <img 
                        src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&h=300&q=80" 
                        alt="VW Golf 7" 
                        className="h-full w-full rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="font-bold text-white mb-2">🔵🔵🔵 NOV AVTO.NET OGLAS! 🔵🔵🔵</p>
                    <div className="space-y-1 text-gray-200">
                      <p><span className="font-bold text-white">Naziv:</span> VW Golf 7 1.6 TDI, Highline</p>
                      <p><span className="text-green-400">💰</span> <span className="font-bold text-white">Cena:</span> 11.500 €</p>
                      <p><span className="text-red-400">📍</span> <span className="font-bold text-white">Lokacija:</span> Celje, Slovenija</p>
                      <p><span className="text-blue-400">🕒</span> <span className="font-bold text-white">Objavljeno:</span> 14:41 — 12.04.2026</p>
                      <p className="mt-2">
                        <span className="text-blue-400">🔵</span> <span className="font-bold text-white">Link:</span> 
                        <span className="ml-1 text-blue-400 underline decoration-blue-400/30 underline-offset-2 break-all">avto.net/Ads/details...</span>
                      </p>
                    </div>
                    <div className="mt-2 flex justify-end text-[10px] text-white/30">
                      14:42
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Začni brezplačno Section */}
      <section className="bg-[#0f1115] py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">Začni brezplačno</h2>
          <div className="flex justify-center">
            <div className="flex w-full max-w-sm flex-col rounded-3xl bg-[#151619] p-8 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:ring-white/20">
              <h3 className="mb-2 text-xl font-bold">Preizkus (Free-trial)</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">0 €</span>
                <span className="text-gray-500 text-sm"> / 10 dni</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Osveževanje na 3 minute</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> VSI portali po izbiri</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Telegram obvestila</li>
              </ul>
              <button 
                onClick={() => setIsTrialModalOpen(true)}
                className="mt-auto w-full rounded-xl bg-green-500 py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Preizkusi brezplačno
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cenik Section */}
      <section className="bg-[#0a0a0a] py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">Cenik</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Začetnik */}
            <div className="flex flex-col rounded-3xl bg-[#151619] p-8 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:ring-white/20">
              <h3 className="mb-2 text-xl font-bold">Začetnik</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">10 €</span>
                <span className="text-gray-500 text-sm"> / mesec</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Osveževanje na 60 minut</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 portal po izbiri</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Telegram obvestila</li>
              </ul>
              <a href="https://buy.stripe.com/test_7sYeVe7uJ3Yk89I7j6gQE00" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-xl bg-white/5 py-3 text-center font-bold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10">
                Izberi paket
              </a>
            </div>

            {/* Card 2: Raziskovalec */}
            <div className="flex flex-col rounded-3xl bg-[#151619] p-8 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:ring-white/20">
              <h3 className="mb-2 text-xl font-bold">Raziskovalec</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">19 €</span>
                <span className="text-gray-500 text-sm"> / mesec</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Osveževanje na 60 minut</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> VSI portali</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Telegram obvestila</li>
              </ul>
              <a href="https://buy.stripe.com/test_cNi14oaGV0M861AbzmgQE01" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-xl bg-white/5 py-3 text-center font-bold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10">
                Izberi paket
              </a>
            </div>

            {/* Card 3: Pro (Highlighted) */}
            <div className="relative flex flex-col rounded-3xl bg-[#151619] p-8 ring-2 ring-green-500 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.4)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-4 py-1 text-xs font-bold uppercase text-black whitespace-nowrap">
                Najboljša izbira
              </div>
              <h3 className="mb-2 text-xl font-bold">Pro</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">29 €</span>
                <span className="text-gray-500 text-sm"> / mesec</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Osveževanje na 3 minute</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1 portal po izbiri</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Telegram obvestila</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Prednostna podpora</li>
              </ul>
              <a href="https://buy.stripe.com/test_14A9AU4ix9iE0Hg0UIgQE02" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-xl bg-green-500 py-3 text-center font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Izberi paket
              </a>
            </div>

            {/* Card 4: VIP / Agencija */}
            <div className="flex flex-col rounded-3xl bg-[#151619] p-8 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:ring-white/20">
              <h3 className="mb-2 text-xl font-bold">VIP / Agencija</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold">49 €</span>
                <span className="text-gray-500 text-sm"> / mesec</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Osveževanje na 3 minute</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> VSI portali</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Telegram obvestila</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Prednostna podpora</li>
              </ul>
              <a href="https://buy.stripe.com/test_14A5kE2ap3Yk0HgdHugQE03" target="_blank" rel="noopener noreferrer" className="mt-auto block w-full rounded-xl bg-white/5 py-3 text-center font-bold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10">
                Izberi paket
              </a>
            </div>
          </div>
          <div className="flex justify-center mt-10">
            <a
              href="https://billing.stripe.com/p/login/test_7sYeVe7uJ3Yk89I7j6gQE00"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors border border-white/10 rounded-xl px-5 py-2 hover:border-white/20"
            >
              Že naročnik? Upravljaj naročnino →
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#0f1115] py-32 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl leading-tight">
            Pripravljeni, da ujamete naslednji oglas pred vsemi?
          </h2>
          <p className="mb-10 text-xl text-gray-400 text-center">
  Povejte nam, kaj iščete, in skupaj bomo nastavili vaš osebni radar. <br />
  Odgovorimo še isti dan!
</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-[#4ade80] px-10 py-4 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.5)] active:scale-95"
          >
            Pišite nam <span className="transition-transform group-hover:translate-x-1">➔</span>
          </button>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© 2026 Oglasni Radar. Vse pravice pridržane.</p>
          <div className="flex gap-8">
            <a 
              href="https://billing.stripe.com/p/login/test_7sYeVe7uJ3Yk89I7j6gQE00" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Upravljanje naročnine
            </a>
            <button
              onClick={() => setIsTosModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Pogoji poslovanja
            </button>
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Politika zasebnosti
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#1e1e1e] p-8 shadow-2xl ring-1 ring-white/10"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 transition-colors hover:text-white"
              >
                <X size={24} />
              </button>

              <h3 className="mb-8 text-2xl font-bold">Pošljite povpraševanje</h3>
              
              <form 
                onSubmit={(e) => handleFormSubmit(e, 'contact')}
                className="space-y-6"
              >
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-green-500/10 p-6 text-center text-green-500 ring-1 ring-green-500/20"
                  >
                    <CheckCheck size={32} className="mx-auto mb-3" />
                    <p className="font-bold">Sporočilo je bilo uspešno poslano!</p>
                    <p className="mt-1 text-sm opacity-80">Odgovorili vam bomo v najkrajšem možnem času.</p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">Ime</label>
                      <input 
                        name="name"
                        type="text" 
                        required
                        className="w-full rounded-xl bg-white/5 p-4 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                        placeholder="Vaše ime"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">E-pošta</label>
                      <input 
                        name="email"
                        type="email" 
                        required
                        className="w-full rounded-xl bg-white/5 p-4 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                        placeholder="vas@email.com"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">Sporočilo</label>
                      <textarea 
                        name="message"
                        required
                        rows={4}
                        className="w-full resize-none rounded-xl bg-white/5 p-4 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                        placeholder="Npr. Iščem Woom 4 kolo na Bolhi do 200 €..."
                      />
                    </div>
                    {formStatus === 'error' && (
                      <p className="text-sm text-red-500 text-center">Prišlo je do napake. Prosimo, poskusite znova.</p>
                    )}

                    {/* 1. hCaptcha komponenta za kontaktni obrazec */}
                    <div className="flex justify-center mb-4">
                      <HCaptcha 
                        sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" 
                        reCaptchaCompat={false}
                        onVerify={(token) => setCaptchaToken(token)}
                        theme="dark"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={formStatus === 'loading'}
                      className="w-full rounded-xl bg-[#4ade80] py-4 font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formStatus === 'loading' ? 'Pošiljanje...' : 'Pošlji sporočilo'}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Free Trial Modal */}
      <AnimatePresence>
        {isTrialModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTrialModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#1e1e1e] p-8 shadow-2xl ring-1 ring-white/10"
            >
              <button 
                onClick={() => setIsTrialModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 transition-colors hover:text-white"
              >
                <X size={24} />
              </button>

              <h3 className="mb-2 text-2xl font-bold">Brezplačni preizkus</h3>
              <p className="mb-8 text-sm text-gray-400">Izpolnite obrazec in začnite loviti oglase še danes.</p>
              
              <form 
                onSubmit={(e) => handleFormSubmit(e, 'trial')}
                className="space-y-5"
              >
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-green-500/10 p-6 text-center text-green-500 ring-1 ring-green-500/20"
                  >
                    <CheckCheck size={32} className="mx-auto mb-3" />
                    <p className="font-bold">Sporočilo je bilo uspešno poslano!</p>
                    <p className="mt-1 text-sm opacity-80">Vaš preizkus bo aktiviran v kratkem.</p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-400">Ime in priimek</label>
                      <input 
                        name="full_name"
                        type="text" 
                        required
                        className="w-full rounded-xl bg-white/5 p-3.5 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                        placeholder="Janez Novak"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-400">E-pošta</label>
                      <input 
                        name="email"
                        type="email" 
                        required
                        className="w-full rounded-xl bg-white/5 p-3.5 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                        placeholder="janez@email.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-400">Telefonska številka (opcijsko)</label>
                      <input 
                        name="phone"
                        type="tel" 
                        className="w-full rounded-xl bg-white/5 p-3.5 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
                        placeholder="041 123 456"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-400">Kateri portali vas zanimajo?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Bolha', 'Nepremičnine.net', 'Avto.net', 'Willhaben'].map((portal) => (
                          <label key={portal} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              name="portals" 
                              value={portal} 
                              className="h-5 w-5 rounded border-white/10 bg-white/5 text-green-500 focus:ring-green-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{portal}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {formStatus === 'error' && (
                      <p className="text-sm text-red-500 text-center">Prišlo je do napake. Prosimo, poskusite znova.</p>
                    )}
                    
                    {/* 1. hCaptcha goes here, right before the button */}
                    <div className="flex justify-center mb-4">
                      <HCaptcha 
                        sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" 
                        reCaptchaCompat={false}
                        onVerify={(token) => setCaptchaToken(token)}
                        theme="dark"
                      />
                    </div>
                    
                    {/* 2. Your Submit Button */}
                    <button 
                      type="submit"
                      disabled={formStatus === 'loading'}
                      className="w-full rounded-xl bg-[#4ade80] py-4 font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formStatus === 'loading' ? 'Pošiljanje...' : 'Začni brezplačni preizkus'}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {isTosModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTosModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10 flex flex-col"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1e1e1e] z-10">
                <h3 className="text-2xl font-bold">Pogoji poslovanja</h3>
                <button 
                  onClick={() => setIsTosModalOpen(false)}
                  className="text-gray-500 transition-colors hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar text-gray-400 space-y-8 leading-relaxed">
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">1. Splošne določbe</h4>
                  <p>
                    Dobrodošli na spletni strani Oglasni Radar. Ti pogoji poslovanja določajo pravila in predpise za uporabo naše storitve obveščanja o oglasih. Z dostopom do te spletne strani in uporabo naših storitev potrjujete, da ste prebrali, razumeli in se strinjate s temi pogoji.
                  </p>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-4">2. Opis storitve in neodvisnost</h4>
                  <p>
                    Oglasni Radar je neodvisno orodje za spremljanje javno dostopnih oglasov na različnih spletnih portalih (kot so Bolha, Avto.net, Willhaben itd.). 
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>Nismo povezani, pooblaščeni ali kakorkoli uradno povezani z nobenim od zunanjih portalov, ki jih spremljamo.</li>
                    <li>Vse blagovne znamke in imena portalov so last njihovih lastnikov.</li>
                    <li>Storitev deluje kot posrednik informacij, ki uporabniku olajša iskanje s pošiljanjem obvestil v realnem času.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-4">3. Omejitev odgovornosti</h4>
                  <p>
                    Čeprav se trudimo zagotavljati čim hitrejša in natančnejša obvestila, ne moremo jamčiti za:
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>100% razpoložljivost storitve v vsakem trenutku.</li>
                    <li>Točnost podatkov v oglasih (za vsebino oglasa je odgovoren prodajalec na izvornem portalu).</li>
                    <li>Morebitne zamude pri obvestilih zaradi tehničnih težav na strani tretjih ponudnikov (npr. Telegram, spletni oglasniki).</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-4">4. Politika vračila denarja</h4>
                  <p>
                    Pri Oglasnem Radarju želimo, da ste s storitvijo popolnoma zadovoljni, zato ponujamo:
                  </p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li><span className="text-white font-medium">Brezplačni preizkus:</span> Vsak nov uporabnik ima možnost 10-dnevnega brezplačnega preizkusa, da se prepriča o delovanju sistema.</li>
                    <li><span className="text-white font-medium">Vračila:</span> Zaradi narave storitve in razpoložljivosti brezplačnega preizkusa, vračil denarja za že plačana obdobja ne nudimo.</li>
                    <li><span className="text-white font-medium">Preklic:</span> Naročnino lahko prekličete kadarkoli. Po preklicu bo vaša storitev ostala aktivna do konca trenutno plačanega obdobja.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-white font-bold text-lg mb-4">5. Varovanje podatkov</h4>
                  <p>
                    Vaše podatke (ime, e-pošta) uporabljamo izključno za namene zagotavljanja storitve in komunikacije z vami. Podatkov ne delimo s tretjimi osebami.
                  </p>
                </section>

                <div className="pt-8 border-t border-white/5 text-sm italic">
                  Zadnja posodobitev: 12. april 2026
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10 flex flex-col"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1e1e1e] z-10">
                <h3 className="text-2xl font-bold">Politika zasebnosti</h3>
                <button
                  onClick={() => setIsPrivacyModalOpen(false)}
                  className="text-gray-500 transition-colors hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar text-gray-400 space-y-8 leading-relaxed">
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">1. Upravljavec podatkov</h4>
                  <p>
                    Upravljavec osebnih podatkov je Oglasni Radar. Za vprašanja v zvezi z zasebnostjo nas kontaktirajte prek kontaktnega obrazca na spletni strani.
                  </p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">2. Kateri podatki se zbirajo</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="text-white font-medium">Ime in e-poštni naslov</span> — ob izpolnitvi kontaktnega obrazca ali prijavi na brezplačni preizkus.</li>
                    <li><span className="text-white font-medium">Podatki o uporabi</span> — anonimni podatki o obisku (strani, naprava, država) prek Vercel Analytics.</li>
                    <li><span className="text-white font-medium">Podatki o zmogljivosti</span> — anonimni podatki o hitrosti nalaganja prek Vercel Speed Insights.</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">3. Namen obdelave</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Zagotavljanje in izboljševanje storitve Oglasni Radar.</li>
                    <li>Komunikacija z uporabniki (odgovori na povpraševanja, obvestila o storitvi).</li>
                    <li>Analiza uporabe spletne strani za namen izboljšav (anonimizirano).</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">4. Pravna podlaga (GDPR)</h4>
                  <p>
                    Obdelava podatkov temelji na vaši privolitvi (čl. 6(1)(a) GDPR) in na zakonitih interesih upravljavca za zagotavljanje storitve (čl. 6(1)(f) GDPR).
                  </p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">5. Hramba podatkov</h4>
                  <p>
                    Osebne podatke hranimo le toliko časa, kolikor je potrebno za namen, za katerega so bili zbrani, oziroma dokler ne prekličete privolitve. Analitični podatki so anonimizirani in se ne vežejo na posameznika.
                  </p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">6. Posredovanje podatkov tretjim osebam</h4>
                  <p>Vaših osebnih podatkov ne prodajamo. Podatki se posredujejo izključno:</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li><span className="text-white font-medium">Web3Forms</span> — za dostavo sporočil iz kontaktnih obrazcev.</li>
                    <li><span className="text-white font-medium">Vercel</span> — za gostovanje spletne strani in anonimno analitiko.</li>
                    <li><span className="text-white font-medium">Stripe</span> — za obdelavo plačil (samo ob nakupu naročnine).</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">7. Vaše pravice</h4>
                  <p>V skladu z GDPR imate pravico do:</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>dostopa do svojih osebnih podatkov,</li>
                    <li>popravka netočnih podatkov,</li>
                    <li>izbrisa podatkov ("pravica do pozabe"),</li>
                    <li>omejitve obdelave,</li>
                    <li>prenosljivosti podatkov,</li>
                    <li>ugovora obdelavi.</li>
                  </ul>
                  <p className="mt-4">Za uveljavljanje pravic nas kontaktirajte prek kontaktnega obrazca.</p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">8. Piškotki</h4>
                  <p>
                    Spletna stran uporablja tehnične piškotke, potrebne za delovanje strani, ter analitične piškotke prek Vercel Analytics za anonimno merjenje obiska. Piškotki ne vsebujejo osebno določljivih podatkov.
                  </p>
                </section>
                <div className="pt-8 border-t border-white/5 text-sm italic">
                  Zadnja posodobitev: 17. april 2026
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {cookieConsent === null && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ delay: 1 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-4"
          >
            <div className="bg-[#1e1e1e] ring-1 ring-white/10 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-sm text-gray-400 flex-1">
                Uporabljamo analitične piškotke za izboljšanje storitve.{' '}
                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-green-400 hover:underline"
                >
                  Več info
                </button>
              </p>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    localStorage.setItem('cookie-consent', 'false');
                    setCookieConsent(false);
                  }}
                  className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:text-white ring-1 ring-white/10 hover:ring-white/20 transition-colors"
                >
                  Zavrni
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('cookie-consent', 'true');
                    setCookieConsent(true);
                  }}
                  className="px-4 py-2 text-sm rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold transition-colors"
                >
                  Sprejmi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {cookieConsent === true && <Analytics />}
      {cookieConsent === true && <SpeedInsights />}
    </div>
  );
}
