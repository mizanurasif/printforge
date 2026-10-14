import { Model } from './models'

// TEMPORARY: dummy data for designing the dashboard.
// Replace getMyModels with a real query later, e.g.
//   SELECT m.*, u.name AS creator_name FROM models m
//   LEFT JOIN users u ON u.id = m.user_id
//   WHERE m.user_id = ${userId} ORDER BY m.date_added DESC

const PLACEHOLDER_IMAGE = '/img/placeholder.png'

const dummyModels: Omit<Model, 'userId' | 'creatorName' | 'likedByMe' | 'modelFile'>[] = [
    {
        id: 1,
        name: 'Articulated Dragon',
        description: 'A detailed dragon model with movable joints and wings',
        likes: 1847,
        image: PLACEHOLDER_IMAGE,
        category: 'toys-games',
        dateAdded: new Date('2024-11-02T10:15:00Z'),
    },
    {
        id: 2,
        name: 'Succulent Planter',
        description: 'Geometric planter with a drainage tray, prints without supports',
        likes: 932,
        image: PLACEHOLDER_IMAGE,
        category: 'household',
        dateAdded: new Date('2024-09-18T08:40:00Z'),
    },
    {
        id: 3,
        name: 'Cosplay Helmet',
        description: 'Full-size sci-fi helmet split into printable parts',
        likes: 1210,
        image: PLACEHOLDER_IMAGE,
        category: 'props-cosplay',
        dateAdded: new Date('2024-07-27T16:05:00Z'),
    },
    {
        id: 4,
        name: 'Cable Organizer',
        description: 'Desk clip that keeps up to five cables tidy',
        likes: 418,
        image: PLACEHOLDER_IMAGE,
        category: 'tools',
        dateAdded: new Date('2024-05-11T12:30:00Z'),
    },
    {
        id: 5,
        name: 'Chess Set',
        description: 'Modern minimalist chess pieces with a folding board',
        likes: 765,
        image: PLACEHOLDER_IMAGE,
        category: 'toys-games',
        dateAdded: new Date('2024-03-03T09:00:00Z'),
    },
]

export async function getMyModels(userId: number, userName: string): Promise<Model[]> {
    return dummyModels.map((model) => ({ ...model, userId, creatorName: userName, likedByMe: false, modelFile: null }))
}
