import { Product, Category, Brand, Review, HeroSlide, ProductReview } from "./types";

export const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Android TV Box X96Q",
    subtitle: "Allwinner H313 Quad-Core · Android 10 · 4K Ultra HD · 2 Go RAM / 16 Go ROM",
    badge: "Bestseller",
    discount: "-20%",
    price: "55€",
    href: "/produits/android-tv-box-x96q",
    bgColor: "from-slate-900 to-slate-700",
    accentColor: "text-orange-400",
  },
  {
    id: 2,
    title: "X96Q Pro TV Box 4K",
    subtitle: "Android 10 · Affichage LED frontal · Audio Optique · Slot TF Card · HDMI 2.0",
    badge: "Nouveau",
    discount: "-17%",
    price: "70€",
    href: "/produits/x96q-pro-tv-box",
    bgColor: "from-indigo-950 to-slate-900",
    accentColor: "text-indigo-400",
  },
  {
    id: 3,
    title: "Android TV Stick Mortal Q8",
    subtitle: "Clé TV Android HDMI compacte – streaming & IPTV sur n'importe quelle TV",
    badge: "Promo",
    discount: "-25%",
    price: "60€",
    href: "/produits/android-tv-stick-mortal-q8",
    bgColor: "from-orange-950 to-orange-900",
    accentColor: "text-orange-400",
  },
];

export const categories: Category[] = [
  { id: 1, name: "Passerelle Multimédia", slug: "passerelle-multimedia", icon: "📡" },
  { id: 2, name: "Accessoires",           slug: "accessoires",           icon: "🎧" },
  { id: 3, name: "Caméra de Surveillance",slug: "camera-surveillance",   icon: "📷" },
];

// ─── Real Products ─────────────────────────────────────────────────────────────

const x96qBox: Product = {
  id: 1,
  name: "Android TV Box X96Q",
  description:
    "Box Android TV compacte 4K, processeur Allwinner H313 Quad-Core, 2 Go RAM / 16 Go ROM, Wi-Fi 2.4 GHz, HDMI 2.0 – idéale pour le streaming HD et les applications Android",
  originalPrice: 70,
  currentPrice: 55,
  image: "/products/Android%20Tv%20Box%20X96Q/1.jpg",
  images: [
    "/products/Android%20Tv%20Box%20X96Q/1.jpg",
    "/products/Android%20Tv%20Box%20X96Q/2.jpg",
    "/products/Android%20Tv%20Box%20X96Q/3.jpg",
    "/products/Android%20Tv%20Box%20X96Q/4.jpg",
    "/products/Android%20Tv%20Box%20X96Q/5.jpg",
  ],
  badge: "-20%",
  category: "passerelle-multimedia",
  brand: "X96",
  slug: "android-tv-box-x96q",
  sku: "X96Q-2G16G",
  condition: "Produit neuf",
  guarantee: "12 Mois",
  inStock: true,
  specs: [
    "Processeur : Allwinner H313 Quad-Core Cortex-A53 1.5 GHz",
    "GPU : Mali-G31 MP2",
    "RAM : 2 Go DDR3 | Stockage : 16 Go eMMC",
    "OS : Android 10",
    "Résolution : 4K Ultra HD (3840×2160) H.265/HEVC",
    "Wi-Fi : 2.4 GHz 802.11 b/g/n",
    "Ethernet : 100 Mbps",
    "USB : 2× USB 2.0",
    "Sortie vidéo : HDMI 2.0",
    "Alimentation : 5V / 2A",
  ],
  descriptionSections: [
    {
      title: "Streaming 4K Ultra HD sans compromis",
      body: "Propulsé par le processeur Allwinner H313 Quad-Core et doté d'Android 10, l'X96Q vous offre une fluidité exemplaire pour vos contenus 4K. Compatible H.265/HEVC, il décode les vidéos haute résolution sans effort.\n\nProfitez de Netflix, YouTube, MX Player et des milliers d'applications directement sur votre TV grâce à sa RAM DDR3 et son stockage eMMC réactif.",
      image: "/products/Android%20Tv%20Box%20X96Q/2.jpg",
      imageRight: true,
    },
    {
      title: "Connectivité complète pour tous vos appareils",
      body: "Deux ports USB 2.0 pour vos clés et disques durs, HDMI 2.0 pour une image impeccable, Ethernet 100 Mbps pour un streaming sans coupure et Wi-Fi 2.4 GHz intégré.\n\nUn concentré de connectivité dans un boîtier compact et élégant qui s'intègre discrètement sous votre téléviseur.",
      image: "/products/Android%20Tv%20Box%20X96Q/4.jpg",
      imageRight: false,
    },
  ],
  characteristics: [
    { label: "Marque",       value: "X96" },
    { label: "Modèle",       value: "X96Q" },
    { label: "Référence",    value: "X96Q-2G16G" },
    { label: "État",         value: "Neuf" },
    { label: "Garantie",     value: "12 Mois" },
    { label: "Processeur",   value: "Allwinner H313 Quad-Core Cortex-A53 1.5 GHz" },
    { label: "GPU",          value: "Mali-G31 MP2" },
    { label: "RAM",          value: "2 Go DDR3" },
    { label: "Stockage",     value: "16 Go eMMC" },
    { label: "Système d'exploitation", value: "Android 10" },
    { label: "Résolution",   value: "4K Ultra HD (3840 × 2160)" },
    { label: "Codec vidéo",  value: "H.265 / HEVC" },
    { label: "Wi-Fi",        value: "2.4 GHz 802.11 b/g/n" },
    { label: "Ethernet",     value: "100 Mbps" },
    { label: "USB",          value: "2× USB 2.0" },
    { label: "Sortie vidéo", value: "HDMI 2.0" },
    { label: "Alimentation", value: "5V / 2A" },
  ],
  productReviews: [
    { id: 1, author: "Yassine M.", rating: 5, date: "12 mai 2026", content: "Excellente box ! Installation rapide, image 4K parfaite et Android 10 fluide. Je regarde mes contenus sans aucune coupure.", verified: true },
    { id: 2, author: "Fatima B.", rating: 4, date: "8 mai 2026", content: "Très bon rapport qualité/prix. Wi-Fi stable, démarrage rapide. J'enlève une étoile car la télécommande incluse est basique.", verified: true },
    { id: 3, author: "Karim T.", rating: 5, date: "2 mai 2026", content: "Produit conforme à la description. Livraison en 48h comme promis. L'Ethernet 100 Mbps est un vrai plus pour le streaming HD.", verified: false },
  ],
};

const x96qPro: Product = {
  id: 2,
  name: "X96Q Pro TV Box 4K",
  description:
    "Box TV Android 10 haut de gamme avec affichage LED frontal de l'heure, Allwinner H313 Quad-Core, 2 Go/16 Go, port Audio Optique & AV, slot Micro SD – l'expérience multimédia complète",
  originalPrice: 85,
  currentPrice: 70,
  image: "/products/X96Q%20Pro%20TV%20Box/1.jpg",
  images: [
    "/products/X96Q%20Pro%20TV%20Box/1.jpg",
    "/products/X96Q%20Pro%20TV%20Box/2.jpg",
    "/products/X96Q%20Pro%20TV%20Box/3.jpg",
    "/products/X96Q%20Pro%20TV%20Box/4.jpg",
    "/products/X96Q%20Pro%20TV%20Box/5.jpg",
    "/products/X96Q%20Pro%20TV%20Box/6.jpg",
    "/products/X96Q%20Pro%20TV%20Box/7.jpg",
  ],
  badge: "Best Seller",
  category: "passerelle-multimedia",
  brand: "X96",
  slug: "x96q-pro-tv-box",
  sku: "X96QPRO-2G16G",
  condition: "Produit neuf",
  guarantee: "12 Mois",
  inStock: true,
  specs: [
    "Processeur : Allwinner H313 Quad-Core Cortex-A53 1.5 GHz",
    "GPU : Mali-G31 MP2",
    "RAM : 2 Go | Stockage : 16 Go eMMC",
    "OS : Android 10",
    "Résolution : 4K Ultra HD H.265/HEVC",
    "Affichage LED frontal (heure & statut)",
    "Wi-Fi : 2.4 GHz 802.11 b/g/n",
    "Ethernet : 100 Mbps",
    "Ports : HDMI 2.0 + Audio Optique + AV + 2× USB 2.0 + Slot TF",
    "Dimensions : 109 × 109 × 18 mm",
  ],
  descriptionSections: [
    {
      title: "Une box TV avec affichage LED unique",
      body: "Le X96Q Pro se distingue par son affichage LED sur la face avant qui indique l'heure et le statut du système en temps réel. Une fonctionnalité premium qui change votre rapport au salon.\n\nSon processeur Allwinner H313 et son OS Android 10 assurent une expérience fluide et réactive pour le streaming 4K, l'IPTV et vos applications préférées.",
      image: "/products/X96Q%20Pro%20TV%20Box/3.jpg",
      imageRight: true,
    },
    {
      title: "Connectique professionnelle tout-en-un",
      body: "HDMI 2.0 pour une image 4K impeccable, sortie audio optique pour un son Hi-Fi, AV composite pour les anciens téléviseurs, 2× USB 2.0 et un slot Micro SD pour étendre le stockage.\n\nTout cela dans un châssis ultra-plat de seulement 18 mm — un format discret qui s'intègre parfaitement dans votre installation.",
      image: "/products/X96Q%20Pro%20TV%20Box/6.jpg",
      imageRight: false,
    },
  ],
  characteristics: [
    { label: "Marque",       value: "X96" },
    { label: "Modèle",       value: "X96Q Pro" },
    { label: "Référence",    value: "X96QPRO-2G16G" },
    { label: "État",         value: "Neuf" },
    { label: "Garantie",     value: "12 Mois" },
    { label: "Processeur",   value: "Allwinner H313 Quad-Core Cortex-A53 1.5 GHz" },
    { label: "GPU",          value: "Mali-G31 MP2" },
    { label: "RAM",          value: "2 Go" },
    { label: "Stockage",     value: "16 Go eMMC" },
    { label: "Système d'exploitation", value: "Android 10" },
    { label: "Résolution",   value: "4K Ultra HD (3840 × 2160)" },
    { label: "Codec vidéo",  value: "H.265 / HEVC" },
    { label: "Affichage",    value: "LED frontal (heure & statut)" },
    { label: "Wi-Fi",        value: "2.4 GHz 802.11 b/g/n" },
    { label: "Ethernet",     value: "100 Mbps" },
    { label: "Sorties",      value: "HDMI 2.0 + Audio Optique + AV + 2× USB 2.0" },
    { label: "Slot mémoire", value: "Micro SD (TF Card)" },
    { label: "Dimensions",   value: "109 × 109 × 18 mm" },
  ],
  productReviews: [
    { id: 1, author: "Samira O.", rating: 5, date: "14 mai 2026", content: "L'affichage LED de l'heure sur la face avant est vraiment pratique. La qualité 4K est impressionnante, et l'audio optique fait la différence.", verified: true },
    { id: 2, author: "Hassan R.", rating: 5, date: "10 mai 2026", content: "Parfaite pour le streaming et Netflix. Le format compact et l'affichage LED la distinguent vraiment de la concurrence. Livraison très rapide.", verified: true },
    { id: 3, author: "Nadia K.", rating: 4, date: "5 mai 2026", content: "Très satisfaite. Le slot Micro SD est un plus appréciable pour étendre le stockage. Seul bémol : le Wi-Fi 2.4 GHz uniquement.", verified: false },
  ],
};

const mortalQ8: Product = {
  id: 3,
  name: "Android TV Stick Mortal Q8",
  description:
    "Clé TV Android ultra-compacte au format HDMI dongle – branchez directement sur n'importe quelle TV pour accéder au streaming, à l'IPTV et aux applications Android sans box supplémentaire",
  originalPrice: 79,
  currentPrice: 60,
  image: "/products/Android%20TV%20Stick%20Mortal%20Q8/1.avif",
  images: [
    "/products/Android%20TV%20Stick%20Mortal%20Q8/1.avif",
    "/products/Android%20TV%20Stick%20Mortal%20Q8/2.avif",
    "/products/Android%20TV%20Stick%20Mortal%20Q8/3.avif",
    "/products/Android%20TV%20Stick%20Mortal%20Q8/4.avif",
    "/products/Android%20TV%20Stick%20Mortal%20Q8/5.avif",
    "/products/Android%20TV%20Stick%20Mortal%20Q8/6.avif",
  ],
  badge: "Nouveau",
  category: "passerelle-multimedia",
  brand: "Mortal",
  slug: "android-tv-stick-mortal-q8",
  sku: "MORTAL-Q8",
  condition: "Produit neuf",
  guarantee: "12 Mois",
  inStock: true,
  specs: [
    "Format : HDMI Dongle compact (TV Stick)",
    "OS : Android",
    "Compatibilité : Toute TV équipée d'un port HDMI",
    "Wi-Fi : 2.4 GHz intégré",
    "Lecture : Streaming, IPTV, applications Android",
    "Alimentation : Via câble USB / adaptateur secteur inclus",
  ],
  descriptionSections: [
    {
      title: "Transformez n'importe quelle TV en Smart TV",
      body: "Il suffit de brancher le TV Stick Mortal Q8 sur le port HDMI de votre téléviseur pour accéder instantanément à l'univers Android : streaming, IPTV, jeux et des milliers d'applications.\n\nCompatible avec tous les téléviseurs équipés d'un port HDMI, il vous offre une seconde vie à votre TV sans aucun câblage complexe.",
      image: "/products/Android%20TV%20Stick%20Mortal%20Q8/2.avif",
      imageRight: true,
    },
    {
      title: "Compact, discret et transportable",
      body: "Avec son format clé HDMI ultra-compact, le Mortal Q8 se fait oublier derrière votre TV. Alimenté via USB, il ne prend aucune place et se transporte facilement en voyage ou chez des amis.\n\nPrêt à l'emploi en quelques secondes — branchez, démarrez, profitez.",
      image: "/products/Android%20TV%20Stick%20Mortal%20Q8/3.avif",
      imageRight: false,
    },
  ],
  characteristics: [
    { label: "Marque",       value: "Mortal" },
    { label: "Modèle",       value: "Q8 TV Stick" },
    { label: "Référence",    value: "MORTAL-Q8" },
    { label: "État",         value: "Neuf" },
    { label: "Garantie",     value: "12 Mois" },
    { label: "Format",       value: "HDMI Dongle (TV Stick)" },
    { label: "Système d'exploitation", value: "Android" },
    { label: "Wi-Fi",        value: "2.4 GHz intégré" },
    { label: "Compatibilité",value: "Toute TV avec port HDMI" },
    { label: "Alimentation", value: "Via USB / adaptateur secteur inclus" },
    { label: "Contenu boîte",value: "TV Stick + câble USB + adaptateur secteur" },
  ],
  productReviews: [
    { id: 1, author: "Omar L.", rating: 5, date: "13 mai 2026", content: "Parfait pour transformer ma vieille TV en Smart TV. Branchez et c'est parti ! Tout fonctionne sans aucun problème.", verified: true },
    { id: 2, author: "Zineb A.", rating: 4, date: "7 mai 2026", content: "Très compact et discret. Je l'emporte en déplacement. Installation en 2 minutes chrono. Bon rapport qualité/prix.", verified: true },
  ],
};

const remoteControl: Product = {
  id: 4,
  name: "Télécommande Universelle Smart TV Box",
  description:
    "Télécommande de remplacement universelle compatible X96Q, MXQ, HK1, TX3 et toutes les Android TV Box – bouton KODI dédié, pavé numérique complet et contrôle multimédia intégral",
  originalPrice: 12,
  currentPrice: 8.5,
  image: "/products/Remote%20Control%20Replacement%20Smart%20TV%20Box/1.jpg",
  images: [
    "/products/Remote%20Control%20Replacement%20Smart%20TV%20Box/1.jpg",
    "/products/Remote%20Control%20Replacement%20Smart%20TV%20Box/2.jpg",
    "/products/Remote%20Control%20Replacement%20Smart%20TV%20Box/3.jpg",
  ],
  badge: "-34%",
  category: "accessoires",
  brand: "Universel",
  slug: "telecommande-universelle-smart-tv-box",
  sku: "RC-TVBOX-UNIV",
  condition: "Produit neuf",
  guarantee: "6 Mois",
  inStock: true,
  specs: [
    "Compatibilité : X96Q, MXQ, HK1, TX3, X96, T95 et toutes Android Box",
    "Bouton KODI dédié",
    "Boutons : Multimédia + numérique + navigation directionnelle",
    "Portée infrarouge : 8 à 10 mètres",
    "Alimentation : 2× piles AAA (non incluses)",
    "Dimensions : 140 × 45 × 18 mm",
  ],
  descriptionSections: [
    {
      title: "Compatible avec toutes les Android TV Box",
      body: "Cette télécommande universelle fonctionne avec les principales marques de box Android TV : X96Q, MXQ, HK1, TX3, T95 et bien d'autres. Aucune configuration ni couplage requis — prête à l'emploi immédiatement.\n\nFini les pannes de télécommande qui paralysent votre expérience multimédia. Une solution de remplacement fiable et économique.",
      image: "/products/Remote%20Control%20Replacement%20Smart%20TV%20Box/2.jpg",
      imageRight: true,
    },
    {
      title: "Ergonomique avec bouton KODI dédié",
      body: "Équipée d'un bouton KODI dédié, d'une navigation directionnelle complète (haut, bas, gauche, droite, OK), d'un pavé numérique et des touches multimédia essentielles (play, pause, stop, avance rapide).\n\nPortée infrarouge jusqu'à 10 mètres pour un confort d'utilisation optimal depuis votre canapé.",
      image: "/products/Remote%20Control%20Replacement%20Smart%20TV%20Box/3.jpg",
      imageRight: false,
    },
  ],
  characteristics: [
    { label: "Marque",          value: "Universel" },
    { label: "Référence",       value: "RC-TVBOX-UNIV" },
    { label: "État",            value: "Neuf" },
    { label: "Garantie",        value: "6 Mois" },
    { label: "Compatibilité",   value: "X96Q, MXQ, HK1, TX3, X96, T95 et toutes Android Box" },
    { label: "Bouton KODI",     value: "Oui (dédié)" },
    { label: "Type de signal",  value: "Infrarouge (IR)" },
    { label: "Portée",          value: "8 à 10 mètres" },
    { label: "Alimentation",    value: "2× piles AAA (non incluses)" },
    { label: "Dimensions",      value: "140 × 45 × 18 mm" },
  ],
  productReviews: [
    { id: 1, author: "Mehdi B.", rating: 5, date: "11 mai 2026", content: "Compatible avec ma X96Q immédiatement. Le bouton KODI est vraiment pratique. Portée excellente depuis l'autre bout du salon.", verified: true },
    { id: 2, author: "Laila H.", rating: 5, date: "4 mai 2026", content: "Télécommande de remplacement parfaite. Solide, agréable en main et fonctionne du premier coup avec ma box MXQ. Je recommande !", verified: true },
  ],
};

export const bestDeals: Product[] = [x96qBox, x96qPro, mortalQ8, remoteControl];
export const bestSellers: Product[] = [x96qBox, x96qPro, mortalQ8, remoteControl];
export const newArrivals: Product[] = [x96qBox, x96qPro, mortalQ8, remoteControl];

export const brands: Brand[] = [
  { id: 1, name: "X96",      slug: "x96"      },
  { id: 2, name: "Mortal",   slug: "mortal"   },
  { id: 3, name: "Universel",slug: "universel" },
];

export const reviews: Review[] = [
  {
    id: 1,
    author: "Yassine Moutawakkil",
    role: "Client vérifié",
    content:
      "La X96Q Pro est excellente – affichage LED pratique, image 4K nette, interface fluide. Livraison rapide et emballage soigné. Je recommande vivement !",
    rating: 5,
  },
  {
    id: 2,
    author: "Fatima-Zahra Benali",
    role: "Google Reviewer",
    content:
      "J'ai commandé la Android TV Box X96Q et le résultat est bluffant. Installation simple en 5 minutes, streaming impeccable. Excellent rapport qualité/prix.",
    rating: 5,
  },
  {
    id: 3,
    author: "Karim Tahiri",
    role: "Client régulier",
    content:
      "Le TV Stick Mortal Q8 est parfait pour ma chambre : compact, discret et ça marche du tonnerre pour le streaming. Livré en 48h, service très pro.",
    rating: 5,
  },
  {
    id: 4,
    author: "Samira Ouazzani",
    role: "Google Reviewer",
    content:
      "La télécommande universelle est compatible avec ma box X96Q sans aucun réglage. Produit de qualité, prix imbattable et expédition soignée !",
    rating: 5,
  },
];

