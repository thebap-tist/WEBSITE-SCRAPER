import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCheck, Signal, Wifi, Battery, Check, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import NetworkBg from './NetworkBg';
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
      <div
        className="mb-3 flex aspect-video w-full items-center justify-center rounded-xl text-2xl font-bold text-white/90"
        style={{ backgroundColor: color }}
      >
        {title.split(' ')[0].toUpperCase()}
      </div>
      <div className="mb-2 text-[13px] font-bold leading-tight" style={{ color }}>
        NOV {platform.toUpperCase()} OGLAS!
      </div>
      <div className="space-y-1 text-[13px] text-white/90">
        <p><span className="font-bold">Naziv:</span> {title}</p>
        <p><span className="text-[#4ade80]">💰</span> <span className="font-bold">Cena:</span> {price}</p>
        <p><span className="text-red-400">📍</span> {location}</p>
        <p><span className="text-blue-400">🔗</span> <span className="text-blue-400 underline decoration-blue-400/30 underline-offset-2">{link}</span></p>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-white/40">
        <span>{time}</span>
        <CheckCheck size={12} className="text-[#22c55e]" />
      </div>
    </div>
  );
};

/* ── Pricing card with shimmer + 3D tilt + Dynamic Island ── */
interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  isPro?: boolean;
  stripeLink: string;
}

const PricingCard = ({ name, price, period, features, isPro, stripeLink }: PricingCardProps) => {
  const ref = React.useRef<HTMLDivElement>(null);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = 'box-shadow 0.2s ease';
    el.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px) scale(1.02)`;
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.3s ease';
    el.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`card-shimmer animated-border flex flex-col rounded-3xl bg-white p-8 transition-shadow duration-300 cursor-default ${
        isPro
          ? 'border-2 border-[#0d0d0d] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.18)]'
          : 'border border-gray-200 shadow-sm hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.14)] hover:outline hover:outline-[1.5px] hover:outline-[#0d0d0d]'
      }`}
      style={{ position: 'relative', willChange: 'transform' }}
    >
      {isPro && <div className="dynamic-island">Najboljša izbira</div>}

      <h3 className={`mb-2 text-xl font-bold text-[#0d0d0d] ${isPro ? 'mt-4' : ''}`}>{name}</h3>
      <div className="mb-6">
        <span className="text-3xl font-bold text-[#0d0d0d]">{price} €</span>
        <span className="text-gray-500 text-sm"> {period}</span>
      </div>
      <ul className="mb-8 space-y-4 text-sm text-gray-600 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2">
            <Check size={14} className="text-[#22c55e] flex-shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <a
        href={stripeLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full rounded-xl py-3 text-center font-bold transition-all hover:scale-[1.02] active:scale-[0.98] ${
          isPro
            ? 'bg-[#22c55e] text-black hover:bg-[#16a34a]'
            : 'bg-gray-100 text-[#0d0d0d] border border-gray-200 hover:bg-[#0d0d0d] hover:text-white hover:border-[#0d0d0d]'
        }`}
      >
        Izberi paket
      </a>
    </div>
  );
};

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isTosModalOpen, setIsTosModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navLinkClicked = useRef(false);
  const [cookieConsent, setCookieConsent] = useState<boolean | null>(() => {
    const stored = localStorage.getItem('cookie-consent');
    return stored === null ? null : stored === 'true';
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scrollEndTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      if (navLinkClicked.current) {
        lastScrollY.current = window.scrollY;
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(() => { navLinkClicked.current = false; }, 100);
        return;
      }
      const currentY = window.scrollY;
      if (currentY < 80) {
        setNavVisible(true);
      } else {
        setNavVisible(currentY < lastScrollY.current);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(scrollEndTimer); };
  }, []);

  useEffect(() => {
    if (isModalOpen || isTrialModalOpen || isTosModalOpen || isPrivacyModalOpen || isAboutModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isModalOpen, isTrialModalOpen, isTosModalOpen, isPrivacyModalOpen, isAboutModalOpen]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>, formType: 'contact' | 'trial') => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!captchaToken) { alert("Prosimo, potrdite, da niste robot."); return; }
    setFormStatus('loading');
    try {
      const formData = new FormData(form);
      formData.set("access_key", import.meta.env.VITE_WEB3FORMS_KEY);
      formData.set("h-captcha-response", captchaToken);
      formData.set("subject", `Novo povpraševanje: ${formType === 'contact' ? 'Kontakt' : 'Brezplačni preizkus'}`);
      formData.set("from_name", "Oglasni Radar");
      if (formType === 'trial') {
        const selectedPortals = formData.getAll('portals');
        formData.delete('portals');
        formData.set('portals', selectedPortals.join(', '));
      }
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok || data.success) {
        setFormStatus('success');
        form.reset();
        setCaptchaToken(null);
        setTimeout(() => { setIsModalOpen(false); setIsTrialModalOpen(false); setFormStatus('idle'); }, 6000);
      } else { setFormStatus('error'); }
    } catch (error) {
      console.error("Critical Error:", error);
      setFormStatus('error');
    }
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!feedRef.current || !containerRef.current) return;
      const feedHeight = feedRef.current.scrollHeight;
      const screenHeight = 500;
      const scrollDistance = feedHeight - screenHeight + 40;
      gsap.to(feedRef.current, {
        y: -scrollDistance,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 64px",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#0d0d0d] selection:bg-[#22c55e]/30">

      {/* ── Navbar (light) ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-transform duration-1000 ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <a href="#" onClick={() => { navLinkClicked.current = true; }} className="text-lg font-black tracking-tighter text-[#0d0d0d] hover:opacity-70 transition-opacity">
            Oglasni <span className="text-[#22c55e]">Radar</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            {[
              { href: '#kako-deluje', label: 'Kako deluje' },
              { href: '#portali', label: 'Portali' },
              { href: '#preizkus', label: 'Preizkus' },
              { href: '#cenik', label: 'Cenik' },
            ].map(({ href, label }) => (
              <a key={href} href={href} onClick={() => { navLinkClicked.current = true; }} className="hover:text-[#0d0d0d] transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsModalOpen(true)} className="rounded-full bg-[#22c55e] px-5 py-2 text-sm font-bold text-black hover:bg-[#4ade80] transition-colors">
              Pišite nam
            </button>
            <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="md:hidden text-gray-500 hover:text-[#0d0d0d] transition-colors">
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden border-t border-gray-200">
              <div className="flex flex-col items-end px-6 py-4 gap-5 text-sm text-gray-500">
                {[
                  { href: '#kako-deluje', label: 'Kako deluje' },
                  { href: '#portali', label: 'Portali' },
                  { href: '#preizkus', label: 'Preizkus' },
                  { href: '#cenik', label: 'Cenik' },
                ].map(({ href, label }) => (
                  <a key={href} href={href} onClick={() => { setIsMobileMenuOpen(false); navLinkClicked.current = true; }} className="hover:text-[#0d0d0d] transition-colors">{label}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero (light) ── */}
      <section className="relative flex h-[80vh] flex-col items-center justify-center px-6 text-center pt-16 overflow-hidden bg-[#f7f7f4] dot-grid">
        <h1 className="mb-6 text-5xl font-black tracking-tighter md:text-7xl text-[#0d0d0d]">
          Oglasni <span className="text-[#22c55e]">Radar</span>
        </h1>
        <p className="max-w-xl text-lg text-gray-600 md:text-xl">
          Prejemajte obvestila o novih oglasih v realnem času neposredno v vaš Telegram.
          Nikoli več ne zamudite dobre priložnosti.
        </p>
        <div className="mt-10 animate-bounce">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-400">Pomaknite se navzdol</p>
        </div>
      </section>

      {/* ── iPhone Mockup Section — LIGHT with dot grid ── */}
      <section ref={containerRef} className="relative h-[250vh] w-full bg-[#f7f7f4] dot-grid">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden">

          {/* iPhone Mockup */}
          <div className="scale-[0.7] sm:scale-[0.85] md:scale-100 flex items-center justify-center">
            <div
              ref={phoneRef}
              className="relative h-[720px] w-[350px] rounded-[55px] border-[12px] border-[#1a1a1a] bg-[#0f1115]"
              style={{ boxShadow: '0 70px 140px -20px rgba(0,0,0,0.35), 0 30px 60px -10px rgba(0,0,0,0.18), 0 0 0 2px rgba(0,0,0,0.06)' }}
            >
              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-4 z-50 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />

              {/* Status Bar */}
              <div className="absolute left-0 top-0 flex w-full items-center justify-between px-8 pt-5 text-[12px] font-semibold text-white">
                <span>14:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal size={14} /><Wifi size={14} /><Battery size={16} />
                </div>
              </div>

              {/* Screen */}
              <div className="absolute inset-0 overflow-hidden rounded-[43px] bg-[#0e1621]">
                {/* App Header */}
                <div className="absolute left-0 top-0 z-40 flex w-full items-center gap-3 bg-[#17212b]/95 px-5 pb-3 pt-14 backdrop-blur-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e] text-[14px] font-bold text-white">OR</div>
                  <div>
                    <h3 className="text-[15px] font-bold leading-tight text-white">Oglasni Radar</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                      <span className="text-[12px] text-[#22c55e]">v spletu</span>
                    </div>
                  </div>
                </div>

                {/* Message Feed */}
                <div ref={feedRef} className="flex flex-col px-4 pt-32 pb-10">
                  <MessageCard platform="Bolha" title={'Woom 4 otroški kolesar 20"'} price="189 €" location="Ljubljana" time="14:33" color="#9b2c2c" emoji="🔴" link="bolha.com/..." />
                  <MessageCard platform="Willhaben" title="Woom 4 — top Zustand" price="329 €" location="Graz" time="14:37" color="#2f6f4e" emoji="🟢" link="willhaben.at/..." />
                  <MessageCard platform="Nepremičnine" title="2-sobno stanovanje, Šiška" price="210.000 €" location="Ljubljana" time="14:39" color="#2c5282" emoji="🔵" link="nepremicnine.net/..." />
                  <MessageCard platform="Avto.net" title="VW Golf 7 1.6 TDI" price="11.500 €" location="Celje" time="14:41" color="#c05621" emoji="🟠" link="avto.net/..." />
                </div>

                {/* Input Bar */}
                <div className="absolute bottom-0 left-0 flex w-full items-center bg-[#17212b] px-4 py-3 pb-8">
                  <div className="h-9 w-full rounded-full bg-[#242f3d] px-4 py-2 text-[14px] text-gray-500">Sporočilo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Content */}
          <div className="ml-20 hidden max-w-sm lg:block">
            <h2 className="mb-4 text-4xl font-bold text-[#0d0d0d]">Hitrost je ključna.</h2>
            <p className="text-gray-600 leading-relaxed">
              Naš sistem pregleduje največje oglasnike vsakih nekaj sekund.
              Bodite prvi, ki pokliče prodajalca in si zagotovite najboljšo ceno.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e] flex-shrink-0">
                  <CheckCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-[#0d0d0d]">Takojšnja obvestila</p>
                  <p className="text-sm text-gray-500">Brez zamika, direktno na telefon.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-gray-200 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22c55e]/15 text-[#22c55e] flex-shrink-0">
                  <CheckCheck size={20} />
                </div>
                <div>
                  <p className="font-bold text-[#0d0d0d]">Vsi oglasniki na enem mestu</p>
                  <p className="text-sm text-gray-500">Bolha, Avto.net, Willhaben in več.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200" />

      {/* ── Kako deluje ── */}
      <section id="kako-deluje" className="relative bg-white py-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl text-[#0d0d0d]">Kako deluje</h2>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { n: '01', title: 'Povejte, kaj iščete', desc: 'Sporočite nam portal, ključne besede, lokacijo in cenovni razpon. Primer: "Woom kolo na Bolhi pod 250 €."', hi: '"Woom kolo na Bolhi pod 250 €."' },
              { n: '02', title: 'Nastavimo vaš radar', desc: 'Konfiguriramo sistem po vaših kriterijih. Spremljanje se zažene v nekaj minutah.', hi: null },
              { n: '03', title: 'Prejmete obvestilo', desc: 'Ob novem zadetku pride Telegram sporočilo s fotografijo, ceno, lokacijo in direktno povezavo.', hi: null },
            ].map(({ n, title, desc, hi }) => (
              <div key={n} className="group relative">
                <span className="font-mono text-8xl font-black text-black/5 transition-colors group-hover:text-[#22c55e]/12">{n}</span>
                <div className="absolute top-12 left-0">
                  <h3 className="mb-3 text-xl font-bold text-[#0d0d0d]">{title}</h3>
                  <p className="text-gray-600">
                    {hi ? (
                      <>
                        {desc.split(hi)[0]}
                        <span className="italic text-[#22c55e]">{hi}</span>
                        {desc.split(hi)[1]}
                      </>
                    ) : desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200" />

      {/* ── Telegram obvestila ── */}
      <section className="relative bg-[#f7f7f4] py-24 px-6 overflow-hidden dot-grid">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-2 text-[#22c55e] font-bold uppercase tracking-wider text-sm">Telegram obvestila</h2>
              <h3 className="mb-6 text-4xl font-bold md:text-5xl text-[#0d0d0d]">Oglasi pridejo k vam.</h3>
              <p className="mb-10 text-xl text-gray-600">
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
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full max-w-[360px] rounded-2xl bg-[#17212b] p-4 sm:p-6 shadow-2xl ring-1 ring-black/8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#22c55e] flex items-center justify-center font-bold text-white shadow-lg shadow-[#22c55e]/20">OR</div>
                  <div>
                    <p className="text-[15px] font-bold leading-tight text-white">Oglasni Radar</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl bg-[#242f3d] p-3 text-[13px] shadow-sm">
                    <div className="mb-3 aspect-[4/3] w-full rounded-lg overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&h=300&q=80" alt="VW Golf 7" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <p className="font-bold text-white mb-2">🔵🔵🔵 NOV AVTO.NET OGLAS! 🔵🔵🔵</p>
                    <div className="space-y-1 text-gray-200">
                      <p><span className="font-bold text-white">Naziv:</span> VW Golf 7 1.6 TDI, Highline</p>
                      <p><span className="text-[#4ade80]">💰</span> <span className="font-bold text-white">Cena:</span> 11.500 €</p>
                      <p><span className="text-red-400">📍</span> <span className="font-bold text-white">Lokacija:</span> Celje, Slovenija</p>
                      <p><span className="text-blue-400">🕒</span> <span className="font-bold text-white">Objavljeno:</span> 14:41 — 12.04.2026</p>
                      <p className="mt-2"><span className="text-blue-400">🔵</span> <span className="font-bold text-white">Link:</span> <span className="ml-1 text-blue-400 underline decoration-blue-400/30 underline-offset-2 break-all">avto.net/Ads/details...</span></p>
                    </div>
                    <div className="mt-2 flex justify-end text-[10px] text-white/30">14:42</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200" />

      {/* ── Podprti portali — marquee ── */}
      <section id="portali" className="relative bg-white py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 mb-8 text-center">
          <h2 className="text-3xl font-bold md:text-4xl text-[#0d0d0d] mb-8">Podprti portali</h2>
          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mb-10">
            {[['6','Portalov'],['4','Države'],['∞','Razširljivo']].map(([n,l],i,a) => (
              <React.Fragment key={l}>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#0d0d0d] leading-none">{n}</div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-1">{l}</div>
                </div>
                {i < a.length - 1 && <div className="w-px h-8 bg-gray-200"/>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div className="relative w-full overflow-hidden" style={{
          maskImage: 'linear-gradient(to right, transparent, black 120px, black calc(100% - 120px), transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 120px, black calc(100% - 120px), transparent)',
        }}>
          <div className="flex gap-3 w-max" style={{animation:'marquee 24s linear infinite'}}>
            {[...Array(2)].flatMap(() => [
              { name:'Bolha.com',    init:'B', flag:'🇸🇮', color:'#d9b0a8' },
              { name:'Facebook',     init:'f', flag:'🇸🇮', color:'#b5c4dd' },
              { name:'Nepremičnine', init:'N', flag:'🇸🇮', color:'#e2c49a' },
              { name:'Avto.net',     init:'A', flag:'🇸🇮', color:'#b4bcc5' },
              { name:'Willhaben',    init:'W', flag:'🇦🇹', color:'#a8ccb8' },
              { name:'Mercatino',    init:'M', flag:'🇮🇹', color:'#9ed0b4' },
              { name:'eBay',         init:'e', flag:'🇩🇪', color:'#d8d8d3', soon:true },
              { name:'Njuškalo',     init:'N', flag:'🇭🇷', color:'#d8d8d3', soon:true },
            ]).map((p, i) => (
              <div key={i} className="flex items-center gap-2.5 border border-gray-200 rounded-full px-4 py-2.5 whitespace-nowrap select-none hover:bg-white hover:border-[#0d0d0d] hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-default">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-black flex-shrink-0" style={{background:p.color}}>{p.init}</div>
                <span className="text-[13px] font-semibold text-[#0d0d0d]">{p.name}</span>
                <span className="text-[13px] opacity-60">{p.flag}</span>
                {p.soon && <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">kmalu</span>}
              </div>
            ))}
          </div>
        </div>

        <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>

        <p className="mt-10 text-center text-sm text-gray-400 px-6">
          Iščete drug portal?{' '}
          <button onClick={() => setIsModalOpen(true)} className="text-[#22c55e] font-semibold hover:underline">Pišite nam</button>
          {' '}— sistem je razširljiv.
        </p>
      </section>

      <div className="h-px bg-gray-200" />

      {/* ── Začni brezplačno ── */}
      <section id="preizkus" className="relative bg-[#f7f7f4] py-24 px-6 overflow-hidden dot-grid">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl text-[#0d0d0d]">Začni brezplačno</h2>
          <div className="flex justify-center">
            <div className="animated-border flex w-full max-w-sm flex-col rounded-3xl bg-white border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-lg">
              <h3 className="mb-2 text-xl font-bold text-[#0d0d0d]">Preizkus (Free-trial)</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[#0d0d0d]">0 €</span>
                <span className="text-gray-500 text-sm"> / 10 dni</span>
              </div>
              <ul className="mb-8 space-y-4 text-sm text-gray-600">
                <li className="flex items-center gap-2"><Check size={14} className="text-[#22c55e]" /> Osveževanje na 3 minute</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#22c55e]" /> VSI portali po izbiri</li>
                <li className="flex items-center gap-2"><Check size={14} className="text-[#22c55e]" /> Telegram obvestila</li>
              </ul>
              <button onClick={() => setIsTrialModalOpen(true)} className="mt-auto w-full rounded-xl bg-[#22c55e] py-3 font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Preizkusi brezplačno
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200" />

      {/* ── Cenik ── */}
      <section id="cenik" className="relative bg-white py-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-16 text-center text-4xl font-bold md:text-5xl text-[#0d0d0d]">Cenik</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <PricingCard name="Začetnik" price="10" period="/ mesec" features={['Osveževanje na 60 minut', '1 portal po izbiri', 'Telegram obvestila']} stripeLink="https://buy.stripe.com/test_7sYeVe7uJ3Yk89I7j6gQE00" />
            <PricingCard name="Raziskovalec" price="19" period="/ mesec" features={['Osveževanje na 60 minut', 'VSI portali', 'Telegram obvestila']} stripeLink="https://buy.stripe.com/test_cNi14oaGV0M861AbzmgQE01" />
            <PricingCard name="Pro" price="29" period="/ mesec" features={['Osveževanje na 3 minute', '1 portal po izbiri', 'Telegram obvestila', 'Prednostna podpora']} isPro stripeLink="https://buy.stripe.com/test_14A9AU4ix9iE0Hg0UIgQE02" />
            <PricingCard name="VIP / Agencija" price="49" period="/ mesec" features={['Osveževanje na 3 minute', 'VSI portali', 'Telegram obvestila', 'Prednostna podpora']} stripeLink="https://buy.stripe.com/test_14A5kE2ap3Yk0HgdHugQE03" />
          </div>
          <div className="flex justify-center mt-10">
            <a href="https://billing.stripe.com/p/login/test_7sYeVe7uJ3Yk89I7j6gQE00" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#0d0d0d] transition-colors border border-gray-200 rounded-xl px-5 py-2 hover:border-gray-300">
              Že naročnik? Upravljaj naročnino →
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200" />

      {/* ── Final CTA (light) ── */}
      <section className="relative bg-[#f7f7f4] py-32 px-6 text-center overflow-hidden dot-grid">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl leading-tight text-[#0d0d0d]">
            Pripravljeni, da ujamete naslednji oglas pred vsemi?
          </h2>
          <p className="mb-10 text-xl text-gray-600 text-center">
            Povejte nam, kaj iščete, in skupaj bomo nastavili vaš osebni radar. <br />
            Odgovorimo še isti dan!
          </p>
          <button onClick={() => setIsModalOpen(true)} className="group inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-10 py-4 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_8px_30px_-5px_rgba(34,197,94,0.4)] active:scale-95">
            Pišite nam <span className="transition-transform group-hover:translate-x-1">➔</span>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-[#f7f7f4] py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
          <p>© 2026 Oglasni Radar. Vse pravice pridržane.</p>
          <div className="flex gap-8">
            <a href="https://billing.stripe.com/p/login/test_7sYeVe7uJ3Yk89I7j6gQE00" target="_blank" rel="noopener noreferrer" className="hover:text-[#0d0d0d] transition-colors">Upravljanje naročnine</a>
            <button onClick={() => setIsTosModalOpen(true)} className="hover:text-[#0d0d0d] transition-colors">Pogoji poslovanja</button>
            <button onClick={() => setIsPrivacyModalOpen(true)} className="hover:text-[#0d0d0d] transition-colors">Politika zasebnosti</button>
            <button onClick={() => setIsAboutModalOpen(true)} className="hover:text-[#0d0d0d] transition-colors">O nas</button>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          MODALS — all kept dark (overlay context)
      ════════════════════════════════════════════ */}

      {/* Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#1e1e1e] p-8 shadow-2xl ring-1 ring-white/10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-500 transition-colors hover:text-white"><X size={24} /></button>
              <h3 className="mb-8 text-2xl font-bold text-white">Pošljite povpraševanje</h3>
              <form onSubmit={(e) => handleFormSubmit(e, 'contact')} className="space-y-6">
                {formStatus === 'success' ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#22c55e]/10 p-6 text-center text-[#22c55e] ring-1 ring-[#22c55e]/20">
                    <CheckCheck size={32} className="mx-auto mb-3" />
                    <p className="font-bold">Sporočilo je bilo uspešno poslano!</p>
                    <p className="mt-1 text-sm opacity-80">Odgovorili vam bomo v najkrajšem možnem času.</p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">Ime</label>
                      <input name="name" type="text" required className="w-full rounded-xl bg-white/5 p-4 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" placeholder="Vaše ime" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">E-pošta</label>
                      <input name="email" type="email" required className="w-full rounded-xl bg-white/5 p-4 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" placeholder="vas@email.com" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-400">Sporočilo</label>
                      <textarea name="message" required rows={4} className="w-full resize-none rounded-xl bg-white/5 p-4 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" placeholder="Npr. Iščem Woom 4 kolo na Bolhi do 200 €..." />
                    </div>
                    {formStatus === 'error' && <p className="text-sm text-red-500 text-center">Prišlo je do napake. Prosimo, poskusite znova.</p>}
                    <div className="flex justify-center mb-4">
                      <HCaptcha sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" reCaptchaCompat={false} onVerify={(token) => setCaptchaToken(token)} theme="dark" />
                    </div>
                    <button type="submit" disabled={formStatus === 'loading'} className="w-full rounded-xl bg-[#22c55e] py-4 font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTrialModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#1e1e1e] p-8 shadow-2xl ring-1 ring-white/10">
              <button onClick={() => setIsTrialModalOpen(false)} className="absolute top-6 right-6 text-gray-500 transition-colors hover:text-white"><X size={24} /></button>
              <h3 className="mb-2 text-2xl font-bold text-white">Brezplačni preizkus</h3>
              <p className="mb-8 text-sm text-gray-400">Izpolnite obrazec in začnite loviti oglase še danes.</p>
              <form onSubmit={(e) => handleFormSubmit(e, 'trial')} className="space-y-5">
                {formStatus === 'success' ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#22c55e]/10 p-6 text-center text-[#22c55e] ring-1 ring-[#22c55e]/20">
                    <CheckCheck size={32} className="mx-auto mb-3" />
                    <p className="font-bold">Sporočilo je bilo uspešno poslano!</p>
                    <p className="mt-1 text-sm opacity-80">Vaš preizkus bo aktiviran v kratkem.</p>
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-400">Ime in priimek</label>
                      <input name="full_name" type="text" required className="w-full rounded-xl bg-white/5 p-3.5 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" placeholder="Janez Novak" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-400">E-pošta</label>
                      <input name="email" type="email" required className="w-full rounded-xl bg-white/5 p-3.5 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" placeholder="janez@email.com" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-400">Telefonska številka (opcijsko)</label>
                      <input name="phone" type="tel" className="w-full rounded-xl bg-white/5 p-3.5 text-white ring-1 ring-white/10 transition-all focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22c55e]" placeholder="041 123 456" />
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-medium text-gray-400">Kateri portali vas zanimajo?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Bolha', 'Nepremičnine.net', 'Avto.net', 'Willhaben'].map((portal) => (
                          <label key={portal} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" name="portals" value={portal} className="h-5 w-5 rounded border-white/10 bg-white/5 text-[#22c55e] focus:ring-[#22c55e] focus:ring-offset-0" />
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{portal}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {formStatus === 'error' && <p className="text-sm text-red-500 text-center">Prišlo je do napake. Prosimo, poskusite znova.</p>}
                    <div className="flex justify-center mb-4">
                      <HCaptcha sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2" reCaptchaCompat={false} onVerify={(token) => setCaptchaToken(token)} theme="dark" />
                    </div>
                    <button type="submit" disabled={formStatus === 'loading'} className="w-full rounded-xl bg-[#22c55e] py-4 font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTosModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10 flex flex-col">
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1e1e1e] z-10">
                <h3 className="text-2xl font-bold text-white">Pogoji poslovanja</h3>
                <button onClick={() => setIsTosModalOpen(false)} className="text-gray-500 transition-colors hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar text-gray-400 space-y-8 leading-relaxed">
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">1. Splošne določbe</h4>
                  <p>Dobrodošli na spletni strani Oglasni Radar. Ti pogoji poslovanja določajo pravila in predpise za uporabo naše storitve obveščanja o oglasih. Z dostopom do te spletne strani in uporabo naših storitev potrjujete, da ste prebrali, razumeli in se strinjate s temi pogoji.</p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">2. Opis storitve in neodvisnost</h4>
                  <p>Oglasni Radar je neodvisno orodje za spremljanje javno dostopnih oglasov na različnih spletnih portalih (kot so Bolha, Avto.net, Willhaben itd.).</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>Nismo povezani, pooblaščeni ali kakorkoli uradno povezani z nobenim od zunanjih portalov, ki jih spremljamo.</li>
                    <li>Vse blagovne znamke in imena portalov so last njihovih lastnikov.</li>
                    <li>Storitev deluje kot posrednik informacij, ki uporabniku olajša iskanje s pošiljanjem obvestil v realnem času.</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">3. Omejitev odgovornosti</h4>
                  <p>Čeprav se trudimo zagotavljati čim hitrejša in natančnejša obvestila, ne moremo jamčiti za:</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li>100% razpoložljivost storitve v vsakem trenutku.</li>
                    <li>Točnost podatkov v oglasih (za vsebino oglasa je odgovoren prodajalec na izvornem portalu).</li>
                    <li>Morebitne zamude pri obvestilih zaradi tehničnih težav na strani tretjih ponudnikov (npr. Telegram, spletni oglasniki).</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">4. Politika vračila denarja</h4>
                  <p>Pri Oglasnem Radarju želimo, da ste s storitvijo popolnoma zadovoljni, zato ponujamo:</p>
                  <ul className="list-disc pl-5 mt-4 space-y-2">
                    <li><span className="text-white font-medium">Brezplačni preizkus:</span> Vsak nov uporabnik ima možnost 10-dnevnega brezplačnega preizkusa.</li>
                    <li><span className="text-white font-medium">Vračila:</span> Zaradi narave storitve in razpoložljivosti brezplačnega preizkusa, vračil denarja za že plačana obdobja ne nudimo.</li>
                    <li><span className="text-white font-medium">Preklic:</span> Naročnino lahko prekličete kadarkoli. Po preklicu bo vaša storitev ostala aktivna do konca trenutno plačanega obdobja.</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">5. Varovanje podatkov</h4>
                  <p>Vaše podatke (ime, e-pošta) uporabljamo izključno za namene zagotavljanja storitve in komunikacije z vami. Podatkov ne delimo s tretjimi osebami.</p>
                </section>
                <div className="pt-8 border-t border-white/5 text-sm italic">Zadnja posodobitev: 12. april 2026</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAboutModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10 flex flex-col">
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <h3 className="text-2xl font-bold text-white">O nas</h3>
                <button onClick={() => setIsAboutModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8 text-gray-400 space-y-4 leading-relaxed">
                <p><span className="text-white font-semibold">Oglasni Radar</span> je storitev podjetja:</p>
                <div className="bg-white/5 rounded-2xl p-5 space-y-1 text-sm">
                  <p className="text-white font-semibold">VALTOMAT, Jan Tobias s.p.</p>
                  <p>Davčna številka: SI10665374</p>
                </div>
                <p className="text-sm">Za vprašanja nas kontaktirajte prek kontaktnega obrazca na spletni strani.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPrivacyModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl bg-[#1e1e1e] shadow-2xl ring-1 ring-white/10 flex flex-col">
              <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#1e1e1e] z-10">
                <h3 className="text-2xl font-bold text-white">Politika zasebnosti</h3>
                <button onClick={() => setIsPrivacyModalOpen(false)} className="text-gray-500 transition-colors hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar text-gray-400 space-y-8 leading-relaxed">
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">1. Upravljavec podatkov</h4>
                  <p>Upravljavec osebnih podatkov je Oglasni Radar. Za vprašanja v zvezi z zasebnostjo nas kontaktirajte prek kontaktnega obrazca na spletni strani.</p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">2. Kateri podatki se zbirajo</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><span className="text-white font-medium">Ime in e-poštni naslov</span> — ob izpolnitvi kontaktnega obrazca ali prijavi na brezplačni preizkus.</li>
                    <li><span className="text-white font-medium">Podatki o uporabi</span> — anonimni podatki o obisku prek Vercel Analytics.</li>
                    <li><span className="text-white font-medium">Podatki o zmogljivosti</span> — anonimni podatki prek Vercel Speed Insights.</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">3. Namen obdelave</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Zagotavljanje in izboljševanje storitve Oglasni Radar.</li>
                    <li>Komunikacija z uporabniki.</li>
                    <li>Analiza uporabe spletne strani za namen izboljšav (anonimizirano).</li>
                  </ul>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">4. Pravna podlaga (GDPR)</h4>
                  <p>Obdelava podatkov temelji na vaši privolitvi (čl. 6(1)(a) GDPR) in na zakonitih interesih upravljavca (čl. 6(1)(f) GDPR).</p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">5. Hramba podatkov</h4>
                  <p>Osebne podatke hranimo le toliko časa, kolikor je potrebno za namen, za katerega so bili zbrani. Analitični podatki so anonimizirani.</p>
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
                  <p>V skladu z GDPR imate pravico do dostopa, popravka, izbrisa, omejitve obdelave, prenosljivosti podatkov in ugovora obdelavi.</p>
                  <p className="mt-4">Za uveljavljanje pravic nas kontaktirajte prek kontaktnega obrazca.</p>
                </section>
                <section>
                  <h4 className="text-white font-bold text-lg mb-4">8. Piškotki</h4>
                  <p>Spletna stran uporablja tehnične piškotke ter analitične piškotke prek Vercel Analytics za anonimno merjenje obiska.</p>
                </section>
                <div className="pt-8 border-t border-white/5 text-sm italic">Zadnja posodobitev: 17. april 2026</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {cookieConsent === null && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={{ delay: 1 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-xl px-4">
            <div className="bg-[#1e1e1e] ring-1 ring-white/10 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-sm text-gray-400 flex-1">
                Uporabljamo analitične piškotke za izboljšanje storitve.{' '}
                <button onClick={() => setIsPrivacyModalOpen(true)} className="text-[#4ade80] hover:underline">Več info</button>
              </p>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => { localStorage.setItem('cookie-consent', 'false'); setCookieConsent(false); }} className="px-4 py-2 text-sm rounded-xl text-gray-400 hover:text-white ring-1 ring-white/10 hover:ring-white/20 transition-colors">Zavrni</button>
                <button onClick={() => { localStorage.setItem('cookie-consent', 'true'); setCookieConsent(true); }} className="px-4 py-2 text-sm rounded-xl bg-[#22c55e] hover:bg-[#4ade80] text-black font-semibold transition-colors">Sprejmi</button>
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
