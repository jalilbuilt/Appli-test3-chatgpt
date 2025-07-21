// Storage utilities for the travel app
export const initializeStorage = () => {
  // Initialize with sample data if no data exists
  const existingRecits = localStorage.getItem('recits');
  
  if (!existingRecits) {
    const sampleData = [
      {
        id: '1',
        titre: 'Aventure en Patagonie',
        ville: 'El Calafate',
        pays: 'Argentine',
        contenu: 'Un voyage extraordinaire à travers les glaciers et montagnes de Patagonie. Les paysages à couper le souffle et les rencontres inoubliables ont marqué cette aventure.',
        description: 'Découverte des glaciers argentins et de la beauté sauvage de la Patagonie',
        images: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'
        ],
        auteur: { id: '1', pseudo: 'Explorateur22' },
        dateCreation: '2024-06-15',
        likes: [],
        rating: 4.8,
        views: 156,
        comments: [
          { id: '1', auteur: 'Voyageur1', contenu: 'Magnifique récit !', date: '2024-06-16' }
        ],
        type: 'Aventure',
        budget: 2500,
        duree: '15 jours'
      },
      {
        id: '2',
        titre: 'Temples de Kyoto',
        ville: 'Kyoto',
        pays: 'Japon',
        contenu: 'Exploration magique des temples séculaires de Kyoto, ancienne capitale impériale du Japon. Entre bambouseraies mystérieuses et jardins zen, cette ville offre un voyage dans le temps à travers la spiritualité japonaise traditionnelle. Chaque temple raconte une histoire millénaire, des geishas dans Gion aux moines bouddhistes en méditation.',
        description: 'Découverte spirituelle des temples et jardins zen de Kyoto',
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400'
        ],
        auteur: { id: '2', pseudo: 'ZenExplorer' },
        dateCreation: '2024-06-12',
        likes: [],
        rating: 4.2,
        views: 234,
        comments: [
          { id: '3', auteur: 'SpiritSeeker', contenu: 'Les photos sont magnifiques ! J\'ai hâte de visiter Kyoto.', date: '2024-06-13' },
          { id: '4', auteur: 'JapanLover', contenu: 'Merci pour ce partage inspirant sur la culture japonaise.', date: '2024-06-14' }
        ],
        type: 'Culture & Spiritualité',
        budget: 2100,
        duree: '8 jours'
      },
      {
        id: '4',
        titre: 'Paris romantique',
        ville: 'Paris',
        pays: 'France',
        contenu: 'Découverte de la Ville Lumière sous son angle le plus romantique. Des balades le long de la Seine aux dîners dans des bistrots authentiques, en passant par les couchers de soleil depuis la Tour Eiffel. Paris révèle ses secrets les plus intimes : jardins cachés du Marais, librairies centenaires de Saint-Germain, et terrasses secrètes avec vue sur Montmartre.',
        description: 'Escapade romantique dans la capitale française pleine de charme',
        images: [
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
          'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=400',
          'https://images.unsplash.com/photo-1516627145497-ae4e1b4c97b5?w=400'
        ],
        auteur: { id: '4', pseudo: 'ParisianDreamer' },
        dateCreation: '2024-06-08',
        likes: [],
        rating: 3.6,
        views: 187,
        comments: [
          { id: '5', auteur: 'Romantic', contenu: 'Paris est vraiment magique ! Vos conseils sont parfaits.', date: '2024-06-09' }
        ],
        type: 'Romance & Culture',
        budget: 1200,
        duree: '5 jours'
      },
      {
        id: '3',
        titre: 'Safari au Kenya',
        ville: 'Nairobi',
        pays: 'Kenya',
        contenu: 'Safari inoubliable dans les parcs nationaux du Kenya. Observer les Big Five dans leur habitat naturel est une expérience transformatrice.',
        description: 'Safari authentique à la rencontre de la faune africaine',
        images: [
          'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400'
        ],
        auteur: { id: '3', pseudo: 'SafariLover' },
        dateCreation: '2024-06-05',
        likes: [],
        rating: 4.1,
        views: 203,
        comments: [
          { id: '2', auteur: 'AnimalLover', contenu: 'Que de souvenirs !', date: '2024-06-07' }
        ],
        type: 'Safari',
        budget: 3200,
        duree: '12 jours'
      }
    ];
    
    localStorage.setItem('recits', JSON.stringify(sampleData));
  }
};