import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  MapPin, 
  Bell, 
  Star, 
  Check, 
  ArrowRight, 
  Play,
  Menu,
  X,
  Music,
  Trophy,
  Palette,
  Lightbulb,
  ChevronDown,
  Shield,
  Clock,
  Zap,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  TrendingUp,
  Globe,
  Heart,
  Award,
  Target,
  Sparkles
} from 'lucide-react'
import SearchBar from '@/components/events/SearchBar'
import { ModeToggle } from '@/components/mode-toggle'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'

const CATEGORIES = [
  { key: 'musique', label: 'Musique', icon: Music, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' },
  { key: 'sport', label: 'Sport', icon: Trophy, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300' },
  { key: 'culture', label: 'Culture', icon: Palette, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300' },
  { key: 'tech', label: 'Tech', icon: Lightbulb, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' },
]

const FEATURES = [
  { 
    title: 'Organisation simplifiée', 
    desc: 'Créez et gérez vos événements en quelques clics avec notre interface intuitive et nos outils impressionnants.',
    icon: Calendar,
    color: 'text-blue-600 dark:text-blue-300',
    gradient: 'from-blue-500/10 to-blue-600/10'
  },
  { 
    title: 'Découverte fluide', 
    desc: 'Trouvez des événements pertinents grâce à notre recherche en fonction de vos préférences.',
    icon: MapPin,
    color: 'text-green-600 dark:text-green-300',
    gradient: 'from-green-500/10 to-green-600/10'
  },
  { 
    title: 'Participations fluides', 
    desc: 'Inscrivez-vous instantanément et recevez toutes vos confirmations par email, de facon automatique.',
    icon: Bell,
    color: 'text-purple-600 dark:text-purple-300',
    gradient: 'from-purple-500/10 to-purple-600/10'
  },
]

const HOW_IT_WORKS = [
  { 
    step: '1', 
    title: 'Créez votre profil', 
    desc: 'Inscription gratuite en 30 secondes avec vérification email', 
    icon: Users,
    detail: 'Renseignez vos préférences pour des recommandations personnalisées'
  },
  { 
    step: '2', 
    title: 'Explorez et découvrez', 
    desc: 'Parcourez par catégorie, localisation et plein d\'autres filtres', 
    icon: MapPin,
    detail: 'Filtres avancés et recherche rapide pour trouver l\'événement parfait'
  },
  { 
    step: '3', 
    title: 'Participez ou organisez', 
    desc: 'Rejoignez des événements ou créez les vôtres en quelques clics', 
    icon: Calendar,
    detail: 'Gestion complète des inscriptions et communication fluide'
  }
]

const TESTIMONIALS = [
  { 
    name: 'Alexandra Martin', 
    role: 'Organisatrice événementielle', 
    quote: "EventConnect a révolutionné ma façon d'organiser des événements. L'interface est intuitive et mes participants adorent la simplicité du processus. J'ai augmenté ma productivité de 300%.",
    rating: 5, 
    avatar: 'AM',
    company: 'Events Pro Paris'
  },
  { 
    name: 'Maya Dubois', 
    role: 'Passionnée de musique', 
    quote: 'Grâce à EventConnect, je ne rate plus jamais les concerts qui m\'intéressent. Les notifications sont parfaites et l\'inscription se fait en un clic. Une révolution !',
    rating: 5, 
    avatar: 'MD',
    company: 'Mélomane depuis 2010'
  },
  { 
    name: 'Thomas Rodriguez', 
    role: 'Coach sportif', 
    quote: 'Parfait pour organiser mes cours et ateliers. Mes clients peuvent s\'inscrire facilement et je peux gérer les places disponibles en temps réel. Indispensable !',
    rating: 5, 
    avatar: 'TR',
    company: 'FitCoach Studio'
  }
]

const STATS = [
  { number: '15K+', label: 'Événements organisés', icon: Calendar },
  { number: '75K+', label: 'Utilisateurs actifs', icon: Users },
  { number: '98%', label: 'Taux de satisfaction', icon: Heart },
  { number: '50+', label: 'Villes couvertes', icon: Globe }
]

const BENEFITS = [
  { 
    title: 'Gain de temps', 
    desc: 'Automatisation complète du processus d\'organisation', 
    icon: Clock,
    stat: '80% plus rapide'
  },
  { 
    title: 'Portée maximale', 
    desc: 'Diffusion sur tous les canaux et réseaux sociaux', 
    icon: TrendingUp,
    stat: '3x plus de participants'
  },
  { 
    title: 'Qualité garantie', 
    desc: 'Outils professionnels et support dédié', 
    icon: Award,
    stat: '99.9% de disponibilité'
  }
]

const FAQ = [
  {
    question: 'Comment créer mon premier événement ?',
    answer: 'Après inscription, cliquez sur "Créer un événement" et suivez notre assistant en 3 étapes simples : informations de base, détails et publication. Notre interface intuitive vous guide à chaque étape.'
  },
  {
    question: 'EventConnect est-il vraiment gratuit ?',
    answer: 'Oui ! Notre plan gratuit vous permet d\'organiser jusqu\'à 5 événements par mois avec 100 participants maximum. Aucune carte bancaire requise pour commencer.'
  },
  {
    question: 'Puis-je personnaliser mes invitations ?',
    answer: 'Absolument ! Vous pouvez personnaliser vos invitations avec votre branding, couleurs et messages. Les plans Pro et Enterprise offrent encore plus d\'options de personnalisation.'
  },
  {
    question: 'Comment mes participants reçoivent-ils leurs confirmations ?',
    answer: 'Les participants reçoivent automatiquement un email de confirmation avec tous les détails, plus des rappels avant l\'événement. Ils peuvent aussi ajouter l\'événement à leur calendrier en un clic.'
  },
  {
    question: 'Puis-je intégrer EventConnect à mes outils existants ?',
    answer: 'Oui dans la prochaine version ! Nous proposons des intégrations avec Google Calendar, Outlook, Zoom, Teams, Slack et bien d\'autres. Notre API permet aussi des intégrations personnalisées.'
  },
  {
    question: 'Que se passe-t-il si j\'ai besoin d\'aide ?',
    answer: 'Notre équipe support est disponible 24/7 par chat, email ou téléphone. Nous proposons aussi une base de connaissances complète et des tutoriels vidéo.'
  }
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <Calendar className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-foreground/80 bg-clip-text text-transparent">
                  EventConnect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
                Accueil
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link to="/events" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
                Événements
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <a href="#features" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
                Fonctionnalités
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </a>
              <a href="#faq" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
                FAQ
                <span className="absolute bottom-0 left-0 w-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
              </a>
              <div className="w-[280px]">
                <SearchBar />
              </div>
              <ModeToggle />
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                <Link to="/auth/register">
                  Créer un compte
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <ModeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/50 bg-background/95 backdrop-blur-md">
                <Link to="/" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                  Accueil
                </Link>
                <Link to="/events" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                  Événements
                </Link>
                <a href="#features" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                  Fonctionnalités
                </a>
                <a href="#faq" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                  FAQ
                </a>
                <div className="px-3 py-2">
                  <SearchBar />
                </div>
                <Link to="/auth/register" className="block px-3 py-2 bg-primary text-primary-foreground rounded-md text-center font-medium">
                  Créer un compte
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex flex-col">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex-1 flex">
         {/* <div className="text-center flex-1 flex flex-col justify-center">*/}
          <div className="text-center">
            {/* Hero Badge */}
            <div className="mb-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary rounded-full text-sm font-medium backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 mr-2" />
              🚀 EventConnect : Organiser • Gérer • Simplifier
            </div>
            
            {/* Hero Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              <span className="block mb-2">Trouvez.</span>
              <span className="block mb-2">Participez.</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-foreground/70 bg-clip-text text-transparent">
                Connectez.
              </span>
            </h1>
            
            {/* Hero Description */}
            <p className="mt-6 max-w-4xl mx-auto text-xl md:text-2xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              La plateforme tout-en-un qui révolutionne l'organisation et la découverte d'événements. 
              <span className="text-foreground font-medium"> Rejoignez plus de 75 000 organisateurs</span> qui font confiance à notre solution.
            </p>
            
            {/* Hero CTAs */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Link to="/events" className="flex items-center">
                  Découvrir les événements
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button variant="outline" asChild size="lg" className="px-10 py-4 text-lg rounded-xl border-2 hover:bg-muted/50 transition-all duration-300 group">
                <Link to="/auth/register" className="flex items-center">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Commencer gratuitement
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Gratuit pour commencer</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Données sécurisées</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.number}</div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi 75 000+ organisateurs nous choisissent
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des résultats concrets qui transforment votre façon d'organiser des événements
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">{benefit.stat}</div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fonctionnalités qui font la différence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une suite complète d'outils professionnels pour organiser des événements exceptionnels
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer bg-gradient-to-br from-background to-muted/20 hover:scale-105">
                  <CardHeader className="pb-6">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un processus simple et efficace pour démarrer en quelques minutes
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 relative">
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="text-center relative group">
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-primary/10 transform translate-x-8 z-0"></div>
                  )}
                  
                  <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-3xl mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300 z-10">
                    <span className="absolute -top-3 -right-3 w-10 h-10 bg-background text-primary rounded-full flex items-center justify-center text-lg font-bold shadow-lg border-2 border-primary/20">
                      {step.step}
                    </span>
                    <Icon className="h-12 w-12" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground text-lg mb-3">{step.desc}</p>
                  <p className="text-sm text-muted-foreground/80 italic">{step.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Events Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Événements populaires
              </h2>
              <p className="text-xl text-muted-foreground">
                Découvrez les événements qui font le buzz en ce moment
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex group">
              <Link to="/events">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {(() => {
            const { data: popular, isLoading: loadingPopular, isError: errorPopular } = useQuery({
              queryKey: ['popular-events'],
              queryFn: () => eventsApi.popular(),
            })
            const { data: latest, isLoading: loadingLatest, isError: errorLatest } = useQuery({
              queryKey: ['latest-events'],
              queryFn: () => eventsApi.list({ page: 1 }),
            })

            const popularItems = (Array.isArray(popular) ? popular : []) as Event[]
            const latestItems = Array.isArray((latest as any)?.data) ? (latest as any).data as Event[] : []
            const chosen = (popularItems.length ? popularItems : latestItems).slice(0, 3)

            const isLoading = loadingPopular && loadingLatest
            const isError = errorPopular && errorLatest

            return (
              <>
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Chargement des événements...</span>
                  </div>
                )}
                {isError && (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">Erreur lors du chargement des événements.</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Réessayer
                    </Button>
                  </div>
                )}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {(chosen.length ? chosen : [1,2,3]).map((e: any, idx: number) => (
                    <Card key={chosen.length ? e.id : idx} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 hover:scale-105">
                      <div className="aspect-video bg-gradient-to-br from-primary/60 via-primary/40 to-foreground/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-medium">
                            Populaire
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <div className="flex items-center text-sm mb-2 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{chosen.length ? new Date(e.date).toLocaleDateString('fr-FR') : '25 Mars 2024'}</span>
                          </div>
                          <div className="flex items-center text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{chosen.length ? e.location : 'Paris, France'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                          {chosen.length ? e.title : `Événement populaire #${idx+1}`}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                          {chosen.length ? e.description : 'Une expérience unique vous attend dans cet événement exceptionnel. Rejoignez-nous pour une aventure inoubliable avec des moments de partage authentiques.'}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{chosen.length ? `${e.capacity} places` : '120 participants'}</span>
                          </div>
                          <Button asChild size="sm" className="group/btn shadow-md hover:shadow-lg">
                            <Link to={chosen.length ? `/events/${e.id}` : '/events'} className="flex items-center">
                              Voir détails
                              <ArrowRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )
          })()}

          <div className="text-center mt-12 sm:hidden">
            <Button asChild size="lg">
              <Link to="/events">Voir tous les événements</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explorez par catégorie
            </h2>
            <p className="text-xl text-muted-foreground">
              Trouvez exactement ce qui correspond à vos passions
            </p>
          </div>

          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon
              return (
                <Link 
                  key={category.key} 
                  to={`/events?category=${category.key}`} 
                  className="group p-8 bg-background rounded-2xl border hover:shadow-xl transition-all duration-300 text-center hover:scale-105 hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${category.color} mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                    {category.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrir les événements {category.label.toLowerCase()}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ils transforment leurs événements avec EventConnect
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez les témoignages de nos utilisateurs les plus satisfaits
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group bg-gradient-to-br from-background to-muted/20 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground font-medium">5/5</span>
                  </div>
                  
                  <blockquote className="mb-8 leading-relaxed text-lg italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mr-4 shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{testimonial.name}</div>
                      <div className="text-muted-foreground">{testimonial.role}</div>
                      <div className="text-sm text-muted-foreground/80">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-muted-foreground">
              Tout ce que vous devez savoir sur EventConnect
            </p>
          </div>

          <div className="space-y-4">
            {FAQ.map((faq, idx) => (
              <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200 group"
                >
                  <span className="font-semibold text-lg group-hover:text-primary transition-colors">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''} group-hover:text-primary`} />
                </button>
                {openFaq === idx && (
                  <div className="px-8 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-muted-foreground leading-relaxed text-lg">{faq.answer}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
            <Target className="h-8 w-8" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Prêt à révolutionner vos événements ?
          </h2>
          <p className="text-xl mb-12 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Rejoignez EventConnect dès aujourd'hui et découvrez pourquoi plus de 75 000 organisateurs 
            nous font confiance pour créer des expériences inoubliables.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-muted px-10 py-4 text-lg rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <Link to="/auth/register" className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Créer un compte gratuit
              </Link>
            </Button>
            <Button  asChild size="lg" className="border-2 border-white/30 text-primary-foreground hover:bg-white/10 backdrop-blur-sm px-10 py-4 text-lg rounded-xl group">
              <Link to="/events" className="flex items-center">
                Parcourir les événements
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm opacity-90">
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Shield className="h-4 w-4 mr-2" />
              <span>Données sécurisées RGPD</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Clock className="h-4 w-4 mr-2" />
              <span>Support 24/7</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 mr-2" />
              <span>Démarrage en 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-br from-muted to-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6 group">
                <Calendar className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-200" />
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-primary to-foreground/80 bg-clip-text text-transparent">
                  EventConnect
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                La plateforme de référence pour organiser et découvrir des événements exceptionnels. 
                Simplicité, efficacité et innovation au service de vos projets.
              </p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Twitter" className="group p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                  <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" aria-label="Facebook" className="group p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                  <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" aria-label="Instagram" className="group p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                  <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" aria-label="LinkedIn" className="group p-3 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                  <Linkedin className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-foreground">Produit</h3>
              <div className="space-y-3">
                <Link to="/events" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Événements
                </Link>
                <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Fonctionnalités
                </a>
                <a href="#faq" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  FAQ
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  API & Intégrations
                </a>
              </div>
            </div>
            
            {/* Support Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-foreground">Support</h3>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Centre d'aide
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Contact
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Documentation
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Statut des services
                </a>
              </div>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-foreground">Entreprise</h3>
              <div className="space-y-3">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  À propos
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Carrières
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Presse
                </a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform">
                  Partenaires
                </a>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} EventConnect. Tous droits réservés. Fait avec ❤️ by terravidhal.
            </p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200">
                Politique de confidentialité
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors duration-200">
                Gestion des cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}