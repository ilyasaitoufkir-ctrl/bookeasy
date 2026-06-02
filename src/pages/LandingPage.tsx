import { Link } from 'react-router-dom';
import { Calendar, Star, Shield, Zap, CheckCircle2, ChevronRight, Users, BarChart3, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-lg text-navy-700">
            <div className="h-8 w-8 rounded-xl bg-navy-700 flex items-center justify-center text-white font-bold text-sm">B</div>
            BookEasy
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-navy-700">Features</a>
            <a href="#pricing" className="hover:text-navy-700">Preise</a>
            <Link to="/search" className="hover:text-navy-700">Termin buchen</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Anmelden</Button></Link>
            <Link to="/register"><Button size="sm">Kostenlos starten</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 h-48 w-48 rounded-full bg-sky-300 blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 border border-white/20">
            <Zap size={14} className="text-yellow-300" />
            Kostenlos starten – keine Kreditkarte nötig
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Termine einfach<br />
            <span className="text-sky-300">online buchen</span>
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto mb-10">
            Das moderne Buchungssystem für Friseure, Kosmetiker und alle Dienstleister.
            Deine Kunden buchen 24/7 – du sparst Zeit und siehst immer den Überblick.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register?role=business">
              <Button size="lg" className="bg-white text-navy-700 hover:bg-navy-50 font-semibold px-8">
                Einrichtung anmelden
                <ChevronRight size={18} />
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8">
                Termin buchen
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-navy-300">
            Bereits von <strong className="text-white">500+</strong> Einrichtungen genutzt
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Aktive Einrichtungen', value: '500+' },
              { label: 'Termine gebucht', value: '50k+' },
              { label: 'Bewertung', value: '4.9 ★' },
              { label: 'Verfügbarkeit', value: '99.9%' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-navy-700">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">Alles was du brauchst</h2>
            <p className="mt-3 text-lg text-gray-500">Professionell, einfach und immer verfügbar</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Calendar size={24} />, title: 'Online-Buchung 24/7', desc: 'Kunden buchen jederzeit – auch wenn du schläfst. Keine Telefonate mehr nötig.' },
              { icon: <Users size={24} />, title: 'Mitarbeiter verwalten', desc: 'Eigene Kalender pro Mitarbeiter. Urlaubsplanung und Sperrzeiten in Sekunden.' },
              { icon: <Smartphone size={24} />, title: 'PWA für iPhone', desc: 'Wie eine echte App – ohne App Store. Auf dem iPhone-Homescreen speichern.' },
              { icon: <Shield size={24} />, title: 'White Label', desc: 'Eigenes Logo, eigene Farben. Fühlt sich an wie deine eigene Buchungsapp.' },
              { icon: <BarChart3 size={24} />, title: 'Erinnerungen', desc: 'Automatische Erinnerungen 24h vorher – weniger No-Shows, mehr Umsatz.' },
              { icon: <Star size={24} />, title: 'Stripe Payments', desc: 'Online bezahlen beim Buchen oder vor Ort – du entscheidest.' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
                <div className="h-12 w-12 rounded-xl bg-navy-100 flex items-center justify-center text-navy-700 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">In 3 Minuten live</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Einrichtung anlegen', desc: 'Kostenlos registrieren, Profil ausfüllen, Logo hochladen.' },
              { step: '02', title: 'Dienste eintragen', desc: 'Dienstleistungen, Preise und Mitarbeiter in wenigen Klicks.' },
              { step: '03', title: 'Link teilen', desc: 'Dein Link: bookeasy.app/dein-name – Kunden buchen sofort.' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-700 text-white font-bold text-lg mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-700">Faire Preise</h2>
            <p className="mt-3 text-lg text-gray-500">Transparent, keine versteckten Kosten</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Kostenlos',
                price: '0 €',
                period: 'für immer',
                features: ['1 Mitarbeiter', '50 Termine/Monat', 'Online-Buchung', 'Kalenderansicht'],
                cta: 'Kostenlos starten',
                highlighted: false,
              },
              {
                name: 'Basic',
                price: '29 €',
                period: 'pro Monat',
                features: ['3 Mitarbeiter', 'Unbegrenzte Termine', 'Email-Erinnerungen', 'Stripe Zahlungen', 'White Label'],
                cta: 'Basic wählen',
                highlighted: true,
              },
              {
                name: 'Pro',
                price: '59 €',
                period: 'pro Monat',
                features: ['Unbegrenzte Mitarbeiter', 'Unbegrenzte Termine', 'Prioritäts-Support', 'API-Zugang', 'Alles aus Basic'],
                cta: 'Pro wählen',
                highlighted: false,
              },
            ].map(plan => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border ${
                  plan.highlighted
                    ? 'bg-navy-700 border-navy-700 text-white shadow-2xl scale-105'
                    : 'bg-white border-gray-100 shadow-card'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-semibold text-sky-300 mb-2 uppercase tracking-wider">Beliebteste Wahl</div>
                )}
                <h3 className={`text-xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="mt-3 mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-navy-700'}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlighted ? 'text-navy-200' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className={plan.highlighted ? 'text-sky-300' : 'text-green-500'} />
                      <span className={plan.highlighted ? 'text-navy-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register?role=business">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'secondary' : 'primary'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-700 text-white py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Bereit loszulegen?</h2>
          <p className="text-navy-200 text-lg mb-8">Kostenlos starten – in 3 Minuten live.</p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-navy-700 hover:bg-navy-50 font-semibold px-10">
              Jetzt kostenlos registrieren
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-navy-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2024 BookEasy. Alle Rechte vorbehalten.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-white transition-colors">AGB</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
