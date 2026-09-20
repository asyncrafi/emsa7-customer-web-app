export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  category: string;
  imageUrl: string;
  isPopular?: boolean;
  rating?: number;
  calories?: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export type CategoryId = 'all' | 'ramen' | 'sides' | 'drinks' | 'desserts';

export interface Category {
  id: CategoryId;
  name: string;
  nameAr: string;
  icon?: string;
  emoji?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'All', nameAr: 'الكل', emoji: '🍱' },
  { id: 'ramen', name: 'Ramen', nameAr: 'رامن', emoji: '🍜' },
  { id: 'sides', name: 'Sides', nameAr: 'المقبلات', emoji: '🥟' },
  { id: 'drinks', name: 'Drinks', nameAr: 'المشروبات', emoji: '🍹' },
  { id: 'desserts', name: 'Desserts', nameAr: 'الحلويات', emoji: '🍰' },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 'ramen-1',
    name: 'Shoyu Ramen',
    nameAr: 'شويو رامن',
    description: 'Lightly battered, served with zesty lemon garlic aioli.',
    descriptionAr: 'مغلف بطبقة خفيفة، يقدم مع أيولي الليمون والثوم.',
    price: 15.99,
    category: 'ramen',
    imageUrl: '/images/food/ramen.png',
    isPopular: true,
  },
  {
    id: 'drink-1',
    name: 'Iced Green Tea',
    nameAr: 'شاي أخضر مثلج',
    description: 'Lightly battered, served with fresh mint and lime slice.',
    descriptionAr: 'منعش مع أوراق النعناع وشرائح الليمون الأخضر.',
    price: 15.99,
    category: 'drinks',
    imageUrl: '/images/food/iced-tea.png',
    isPopular: true,
  },
  {
    id: 'side-1',
    name: 'Crispy Gyoza',
    nameAr: 'جايوزا مقرمشة',
    description: 'Pan-fried pork dumplings served with savory sesame dipping sauce.',
    descriptionAr: 'فطائر زابانية مقلية تقدم مع صلصة السمسم المتبلة.',
    price: 12.99,
    category: 'sides',
    imageUrl: '/images/food/gyoza.png',
    isPopular: true,
  },
  {
    id: 'ramen-2',
    name: 'Spicy Miso Ramen',
    nameAr: 'رامن ميسو حار',
    description: 'Rich chili miso broth, slow-cooked pork belly, soft boiled egg.',
    descriptionAr: 'مرق الميسو الحار الغني مع شرائح اللحم المطهية ببطء والبيض.',
    price: 17.50,
    category: 'ramen',
    imageUrl: '/images/food/ramen.png',
    isPopular: false,
  },
  {
    id: 'drink-2',
    name: 'Matcha Iced Latte',
    nameAr: 'ماتشا أيس لاتيه',
    description: 'Premium ceremonial grade Japanese matcha blended with cold milk.',
    descriptionAr: 'ماتشا يابانية فاخرة ممزوجة مع الحليب البارد والثلج.',
    price: 14.00,
    category: 'drinks',
    imageUrl: '/images/food/iced-tea.png',
    isPopular: false,
  },
];

export function formatPrice(price: number, language: 'ENGLISH' | 'ARABIC' = 'ENGLISH'): string {
  if (language === 'ARABIC') {
    return `${price.toFixed(2)} ج.م`;
  }
  return `EGP ${price.toFixed(2)}`;
}
