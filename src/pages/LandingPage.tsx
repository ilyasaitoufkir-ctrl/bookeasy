import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Star, CheckCircle2, ChevronRight, Menu, X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const NAV_LINKS = [
  { label: 'Templates', href: '#templates' },
  { label: 'Vorteile',  href: '#features'  },
  { label: 'Preise',    href: '#pricing'   },
  { label: 'Buchen',    href: '/search'    },
];

const TEMPLATES_PREVIEW = [
  {
    emoji: '💆', name: 'Kosmetik & Beauty',
    desc: 'Elegantes Rosé Gold & Creme Design – für Beautystudios, Nagelstudios, Wimpernstudios',
    accent: '#c9a99a', bg: '#fdf6f0', text: '#3d2b2b',
    gradient: 'linear-gradient(135deg, #c9a99a 0%, #b8887a 50%, #fdf6f0 100%)',
    preview: ['Gesichtsbehandlung · 60 min · 65 €', 'Maniküre Gel · 45 min · 45 €', 'Wimpern Extensions · 90 min · 79 €'],
  },
  {
    emoji: '✂️', name: 'Friseur & Barbershop',
    desc: 'Sleek Schwarz & Gold Design – für Friseursalons, Barbershops, Styling-Studios',
    accent: '#d4a843', bg: '#111111', text: '#f5f5f5',
    gradient: 'linear-gradient(135deg, #111111 0%, #1c1c1c 50%, #d4a843 100%)',
    preview: ['Herrenhaarschnitt · 30 min · 28 €', 'Bart Trimmen & Fade · 45 min · 35 €', 'Color & Style · 90 min · 75 €'],
  },
  {
    emoji: '🧘', name: 'Massage & Wellness',
    desc: 'Natürliches Salbei & Beige Design – für Massagepraxen, Wellnessstudios, Physio',
    accent: '#5b8c5a', bg: '#f5f0e8', text: '#2e4a2e',
    gradient: 'linear-gradient(135deg, #5b8c5a 0%, #8ab07f 50%, #f5f0e8 100%)',
    preview: ['Rückenmassage · 60 min · 70 €', 'Hot Stone Massage · 90 min · 95 €', 'Lymphdrainage · 45 min · 55 €'],
  },
];

const STATS = [
  { value: '500+', label: 'Beauty Studios' },
  { value: '98%',  label: 'Zufriedenheit'  },
  { value: '50k+', label: 'Buchungen'      },
  { value: '4.9',  label: '★ Bewertung'   },
];

const PLANS = [
  {
    name: 'Starter', price: '0 €', period: 'für immer',
    features: ['1 Mitarbeiterin', '50 Termine/Monat', 'Online-Buchung', 'Buchungsseite'],
    cta: 'Kostenlos starten', highlight: false,
  },
  {
    name: 'Basic', price: '29 €', period: '/Monat',
    features: ['3 Mitarbeiterinnen', 'Unbegrenzte Termine', 'Email-Erinnerungen', 'Zahlungen', 'White Label'],
    cta: 'Basic wählen', highlight: true,
  },
  {
    name: 'Pro', price: '59 €', period: '/Monat',
    features: ['Unbegrenzt alles', 'Prioritäts-Support', 'Analytics', 'API-Zugang', 'Alles aus Basic'],
    cta: 'Pro wählen', highlight: false,
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-100 text-mauve-900 overflow-x-hidden">

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-rose-gradient shadow-rose flex items-center justify-center">
              <span className="text-white font-bold text-sm font-serif">B</span>
            </div>
            <span className="font-display font-semibold text-mauve-900">BookEasy</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              l.href.startsWith('/') ? (
                <Link key={l.label} to={l.href}
                  className="px-4 py-2 rounded-full text-sm text-mauve-500 hover:text-mauve-900 hover:bg-cream-200 transition-all">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href}
                  className="px-4 py-2 rounded-full text-sm text-mauve-500 hover:text-mauve-900 hover:bg-cream-200 transition-all">
                  {l.label}
                </a>
              )
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Anmelden</Button></Link>
            <Link to="/register"><Button size="sm">Kostenlos starten</Button></Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-mauve-600 hover:bg-cream-200">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden bg-cream-50/95 backdrop-blur-sm border-t border-cream-200 px-4 py-4 space-y-1 animate-fade-in">
            {NAV_LINKS.map(l =>
              l.href.startsWith('/') ? (
                <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm text-mauve-600 hover:bg-cream-200">
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-2xl text-sm text-mauve-600 hover:bg-cream-200">
                  {l.label}
                </a>
              )
            )}
            <div className="flex gap-2 pt-3">
              <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Anmelden</Button></Link>
              <Link to="/register" className="flex-1"><Button size="sm" className="w-full">Starten</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        {/* Decorative blobs */}
        <div className="absolute top-32 right-0 h-96 w-96 blob bg-rose-300/30 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-80 w-80 blob bg-cream-300/50 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 blob bg-rose-200/25 blur-2xl" />

        {/* Floating petals / decorative circles */}
        <div className="absolute top-40 right-1/4 h-3 w-3 rounded-full bg-rose-400/40 animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-60 right-1/3 h-2 w-2 rounded-full bg-rose-500/30 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-48 left-1/4 h-2.5 w-2.5 rounded-full bg-mauve-300/40 animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="text-center lg:text-left animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs text-rose-700 font-medium mb-6 border border-rose-200/60 shadow-sm">
              <Sparkles size={12} className="text-rose-500" />
              Buchungssystem · 3 Templates · Sofort live
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight text-mauve-900 mb-2">
              Online buchen.
            </h1>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight text-rose-500 italic mb-6">
              Professionell.
            </h1>
            <p className="text-lg text-mauve-500 mb-3 font-light tracking-wide">
              Kosmetik · Friseur · Massage
            </p>
            <p className="text-mauve-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Das elegante Buchungssystem mit 3 vorgefertigten Designs für Kosmetikstudios,
              Friseursalons und Massagepraxen. In 5 Minuten live – kein Login für Kunden nötig.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register?role=business">
                <Button size="xl" className="shadow-rose-xl">
                  Studio anmelden
                  <ChevronRight size={18} />
                </Button>
              </Link>
              <Link to="/search">
                <Button size="xl" variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50">
                  Termin buchen
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-1 mt-8">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#c9a99a" className="text-rose-400" />)}
              <span className="text-sm text-mauve-400 ml-2">4.9 · Über 500 Studios vertrauen uns</span>
            </div>
          </div>

          {/* Visual: mock booking card */}
          <div className="hidden lg:flex justify-center items-center animate-fade-in">
            <div className="relative">
              {/* Main card */}
              <div className="glass-rose rounded-3xl shadow-rose-xl border border-white/60 p-6 w-72 animate-float">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-2xl bg-rose-gradient flex items-center justify-center text-white font-bold shadow-rose">
                    B
                  </div>
                  <div>
                    <p className="font-display font-semibold text-mauve-900 text-sm">Beauty Studio</p>
                    <p className="text-xs text-mauve-400">Online Buchung</p>
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  {['Gesichtsbehandlung', 'Wimpern Extensions', 'Maniküre Gel'].map((s, i) => (
                    <div key={s} className={`flex items-center justify-between p-2.5 rounded-xl ${i === 0 ? 'bg-rose-gradient text-white' : 'bg-cream-100'}`}>
                      <span className={`text-xs font-medium ${i === 0 ? 'text-white' : 'text-mauve-700'}`}>{s}</span>
                      <CheckCircle2 size={14} className={i === 0 ? 'text-white/80' : 'text-rose-300'} />
                    </div>
                  ))}
                </div>
                <div className="bg-cream-100 rounded-2xl p-3 text-center">
                  <p className="text-xs text-mauve-400 mb-0.5">Nächster freier Termin</p>
                  <p className="text-sm font-semibold text-mauve-900">Heute · 14:30 Uhr</p>
                </div>
              </div>

              {/* Floating mini cards */}
              <div className="absolute -top-6 -right-8 glass rounded-2xl shadow-rose px-3 py-2 flex items-center gap-2 border border-white/60" style={{ animationDelay: '1.5s' }}>
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-green-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-mauve-800">Gebucht!</p>
                  <p className="text-xs text-mauve-400">Di, 14:00 Uhr</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-10 glass rounded-2xl shadow-rose px-3 py-2 border border-white/60">
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#c9a99a" className="text-rose-400" />)}
                </div>
                <p className="text-xs text-mauve-600 font-medium mt-0.5">„Wunderschön!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <section className="bg-white/70 backdrop-blur-sm border-y border-cream-300/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="font-display text-3xl font-semibold text-rose-500">{s.value}</p>
              <p className="text-sm text-mauve-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Templates ──────────────────────────────────────────────────── */}
      <section id="templates" className="py-24 bg-beauty-gradient">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-rose-500 uppercase tracking-widest mb-3">3 Designs inklusive</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-mauve-900">
              Für jede Branche<br />das perfekte Design
            </h2>
            <p className="mt-4 text-mauve-400 max-w-lg mx-auto">
              Wähle das passende Template – deine Kunden sehen sofort, dass du professionell bist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {TEMPLATES_PREVIEW.map(t => (
              <div key={t.name} className="group rounded-3xl overflow-hidden border border-cream-200 shadow-card hover:shadow-rose-lg hover:-translate-y-1 transition-all duration-300 bg-white">
                {/* Color header */}
                <div className="h-3 w-full" style={{ background: t.gradient }} />

                {/* Mock booking UI */}
                <div className="p-5" style={{ backgroundColor: t.bg }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ background: t.gradient }}>{t.emoji}</div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: t.text }}>{t.name}</p>
                      <p className="text-xs opacity-50" style={{ color: t.text }}>bookeasy.app/mein-studio</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {t.preview.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                        style={{ backgroundColor: i === 0 ? t.accent + '22' : t.accent + '0a', color: t.text }}>
                        <span className="font-medium">{item}</span>
                        {i === 0 && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: t.accent, color: t.bg }}>Wählen</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="p-5 bg-white border-t border-cream-100">
                  <p className="text-sm text-mauve-500 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-rose-500 uppercase tracking-widest mb-3">Für Studio-Inhaber</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-mauve-900">
              Alles was du brauchst
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '📅', title: 'Online-Buchung 24/7', desc: 'Kunden buchen jederzeit – auch wenn du schläfst. Keine Telefonanrufe mehr.' },
              { emoji: '💅', title: 'White Label Seite',   desc: 'Dein Logo, deine Farben. Eigene URL: bookeasy.app/dein-studio' },
              { emoji: '📱', title: 'iPhone App (PWA)',    desc: 'Wie eine native App – ohne App Store. Direkt auf dem Homescreen.' },
              { emoji: '🔔', title: 'Automatische Erinnerungen', desc: '24h vorher automatisch – weniger No-Shows, mehr Umsatz.' },
              { emoji: '👥', title: 'Mitarbeiter-Kalender', desc: 'Jede Mitarbeiterin hat ihren eigenen Kalender und Buchungslink.' },
              { emoji: '💳', title: 'Online-Zahlung',      desc: 'Stripe-Integration für sichere Online-Bezahlung beim Buchen.' },
            ].map(f => (
              <div key={f.title} className="group p-6 rounded-3xl bg-cream-50 border border-cream-200 hover:bg-white hover:shadow-rose hover:border-rose-200 transition-all duration-300">
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="font-display font-semibold text-mauve-900 mb-2">{f.title}</h3>
                <p className="text-sm text-mauve-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="py-24 bg-beauty-gradient">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-rose-500 uppercase tracking-widest mb-3">Schnell & einfach</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-mauve-900">In 3 Minuten live</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: '01', title: 'Studio anmelden', desc: 'Kostenlos registrieren und Profil in 2 Minuten ausfüllen.' },
              { n: '02', title: 'Services eintragen', desc: 'Dienstleistungen, Preise und Mitarbeiterinnen in Sekunden.' },
              { n: '03', title: 'Link teilen',  desc: 'Dein Link: bookeasy.app/dein-studio – Kunden buchen sofort.' },
            ].map(s => (
              <div key={s.n} className="text-center group">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-gradient text-white font-display text-xl font-bold shadow-rose mb-5 group-hover:scale-105 transition-transform">
                  {s.n}
                </div>
                <h3 className="font-display font-semibold text-mauve-900 mb-2">{s.title}</h3>
                <p className="text-sm text-mauve-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-rose-500 uppercase tracking-widest mb-3">Preise</p>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold text-mauve-900">Faire Preise</h2>
            <p className="mt-4 text-mauve-400">Transparent, monatlich kündbar, keine versteckten Kosten.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`rounded-3xl p-7 border transition-all ${
                  plan.highlight
                    ? 'bg-rose-gradient text-white border-transparent shadow-rose-xl scale-105'
                    : 'bg-white border-cream-200 shadow-card hover:shadow-rose hover:border-rose-200'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-medium text-white/70 uppercase tracking-widest mb-2">Beliebt</div>
                )}
                <h3 className={`font-display text-xl font-semibold mb-1 ${plan.highlight ? 'text-white' : 'text-mauve-900'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-rose-500'}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-mauve-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className={plan.highlight ? 'text-white/70' : 'text-rose-400'} />
                      <span className={plan.highlight ? 'text-white/90' : 'text-mauve-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register?role=business">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'secondary' : 'outline'}
                    style={plan.highlight ? { background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' } : {}}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-rose-gradient relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 blob bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 blob bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl mx-auto text-center px-4">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-3 font-medium">Jetzt starten</p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mb-4">
            Bereit zu glänzen?
          </h2>
          <p className="text-white/70 mb-10 text-lg">Kostenlos starten – in 3 Minuten live.</p>
          <Link to="/register">
            <Button size="xl" className="bg-white text-rose-600 hover:bg-cream-100 hover:text-rose-700 shadow-rose-xl font-semibold">
              Jetzt kostenlos registrieren
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-mauve-900 text-mauve-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <span className="text-rose-300 text-xs font-serif font-bold">B</span>
            </div>
            <span className="text-mauve-300 font-medium">BookEasy</span>
          </div>
          <p className="text-xs">© 2024 BookEasy · Alle Rechte vorbehalten</p>
          <div className="flex gap-5 text-xs">
            <a href="#" className="hover:text-rose-300 transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-rose-300 transition-colors">AGB</a>
            <a href="#" className="hover:text-rose-300 transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
