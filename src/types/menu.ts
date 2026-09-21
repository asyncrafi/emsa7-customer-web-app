export interface OptionItem {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
}

export interface OptionGroup {
  id: string;
  title: string;
  titleAr?: string;
  required: boolean;
  type: "single" | "multiple";
  options: OptionItem[];
}

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
  tags?: string[];
  optionGroups?: OptionGroup[];
}

export interface SelectedOption {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedOptions?: SelectedOption[];
  specialInstructions?: string;
}

export const getCartItemUnitPrice = (ci: CartItem): number => {
  const extrasTotal = ci.selectedOptions
    ? ci.selectedOptions.reduce((sum, opt) => sum + (opt.price || 0), 0)
    : 0;
  return (ci.item.price || 0) + extrasTotal;
};

export const getCartItemTotalPrice = (ci: CartItem): number => {
  return getCartItemUnitPrice(ci) * ci.quantity;
};

export const getCartSubtotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, ci) => sum + getCartItemTotalPrice(ci), 0);
};

export type CategoryId = "all" | "ramen" | "sides" | "drinks" | "desserts";

export interface Category {
  id: CategoryId;
  name: string;
  nameAr: string;
  icon?: string;
  emoji?: string;
}

export const CATEGORIES: Category[] = [
  { id: "all", name: "All", nameAr: "الكل", emoji: "🍱" },
  { id: "ramen", name: "Ramen", nameAr: "رامن", emoji: "🍜" },
  { id: "sides", name: "Sides", nameAr: "المقبلات", emoji: "🥟" },
  { id: "drinks", name: "Drinks", nameAr: "المشروبات", emoji: "🍹" },
  { id: "desserts", name: "Desserts", nameAr: "الحلويات", emoji: "🍰" },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: "ramen-1",
    name: "Shoyu Ramen",
    nameAr: "شويو رامن",
    description:
      "Rich creamy beef bone broth simmered 18 hours, thin noodles, chashu beef belly, soft-boiled egg, black garlic oil, nori",
    descriptionAr:
      "مرق عظام البقر الكثيف المطبوخ 18 ساعة مع النودلز الرفيعة والشرائح والبيض المسلوق.",
    price: 15.99,
    category: "ramen",
    imageUrl: "/images/food/ramen.png",
    isPopular: true,
    tags: ["bestseller", "chefs_pick"],
    optionGroups: [
      {
        id: "noodle-texture",
        title: "Noodle Texture",
        titleAr: "قوام النودلز",
        required: true,
        type: "single",
        options: [
          { id: "firm", name: "Firm (Kata)", nameAr: "قاسي (كاتا)", price: 0 },
          { id: "medium", name: "Medium", nameAr: "متوسط", price: 0 },
          { id: "soft", name: "Soft (Yawa)", nameAr: "طري (ياوا)", price: 0 },
        ],
      },
      {
        id: "add-extras",
        title: "Add Extras",
        titleAr: "إضافات خارجية",
        required: false,
        type: "multiple",
        options: [
          {
            id: "extra-beef",
            name: "Extra Beef",
            nameAr: "لحم إضافي",
            price: 3.5,
          },
          {
            id: "soft-egg",
            name: "Soft-boiled Egg",
            nameAr: "بيض مسلوق خفيف",
            price: 3.5,
          },
          {
            id: "black-garlic",
            name: "Black Garlic Oil",
            nameAr: "زيت الثوم الأسود",
            price: 3.5,
          },
        ],
      },
    ],
  },
  {
    id: "drink-1",
    name: "Iced Green Tea",
    nameAr: "شاي أخضر مثلج",
    description: "Lightly battered, served with fresh mint and lime slice.",
    descriptionAr: "منعش مع أوراق النعناع وشرائح الليمون الأخضر.",
    price: 15.99,
    category: "drinks",
    imageUrl: "/images/food/iced-tea.png",
    isPopular: true,
    tags: ["bestseller", "sweet"],
    optionGroups: [
      {
        id: "sweetness-level",
        title: "Sweetness Level",
        titleAr: "مستوى الحلاوة",
        required: true,
        type: "single",
        options: [
          {
            id: "sweet-100",
            name: "Regular (100%)",
            nameAr: "عادي (100%)",
            price: 0,
          },
          {
            id: "sweet-50",
            name: "Less Sweet (50%)",
            nameAr: "أقل حلاوة (50%)",
            price: 0,
          },
          {
            id: "sweet-0",
            name: "Unsweetened (0%)",
            nameAr: "بدون سكر (0%)",
            price: 0,
          },
        ],
      },
      {
        id: "drink-toppings",
        title: "Toppings",
        titleAr: "الإضافات",
        required: false,
        type: "multiple",
        options: [
          {
            id: "boba",
            name: "Boba Pearls",
            nameAr: "كرات البوبا",
            price: 2.0,
          },
          {
            id: "lychee-jelly",
            name: "Lychee Jelly",
            nameAr: "هلام اللتشي",
            price: 2.0,
          },
        ],
      },
    ],
  },
  {
    id: "side-1",
    name: "Crispy Gyoza",
    nameAr: "جايوزا مقرمشة",
    description: "Pan-fried dumplings served with savory sesame dipping sauce.",
    descriptionAr: "فطائر مقلية تقدم مع صلصة السمسم المتبلة.",
    price: 12.99,
    category: "sides",
    imageUrl: "/images/food/gyoza.png",
    isPopular: true,
    tags: ["bestseller", "sharing"],
    optionGroups: [
      {
        id: "sauce-choice",
        title: "Dipping Sauce",
        titleAr: "الصلصة الجانبية",
        required: true,
        type: "single",
        options: [
          {
            id: "sesame",
            name: "Savory Sesame",
            nameAr: "سمسم متبل",
            price: 0,
          },
          {
            id: "spicy-mayo",
            name: "Spicy Mayo",
            nameAr: "مايونيز حار",
            price: 0.5,
          },
        ],
      },
    ],
  },
  {
    id: "ramen-2",
    name: "Spicy Miso Ramen",
    nameAr: "رامن ميسو حار",
    description:
      "Rich chili miso broth, slow-cooked pork belly, soft boiled egg.",
    descriptionAr: "مرق الميسو الحار الغني مع شرائح اللحم المطهية ببطء والبيض.",
    price: 17.5,
    category: "ramen",
    imageUrl: "/images/food/ramen.png",
    isPopular: false,
    tags: ["chefs_pick", "seafood"],
    optionGroups: [
      {
        id: "spice-level",
        title: "Spice Level",
        titleAr: "درجة الحرارة",
        required: true,
        type: "single",
        options: [
          { id: "mild", name: "Mild Chili", nameAr: "خفيف", price: 0 },
          {
            id: "hot",
            name: "Hot Chili (Standard)",
            nameAr: "حار قياسي",
            price: 0,
          },
          {
            id: "extra-hot",
            name: "Extra Spicy Fire",
            nameAr: "حار جداً",
            price: 1.0,
          },
        ],
      },
    ],
  },
  {
    id: "drink-2",
    name: "Matcha Iced Latte",
    nameAr: "ماتشا أيس لاتيه",
    description:
      "Premium ceremonial grade Japanese matcha blended with cold milk.",
    descriptionAr: "ماتشا يابانية فاخرة ممزوجة مع الحليب البارد والثلج.",
    price: 14.0,
    category: "drinks",
    imageUrl: "/images/food/iced-tea.png",
    isPopular: false,
    tags: ["sweet", "sharing"],
  },
];

export function formatPrice(
  price: number,
  language: "ENGLISH" | "ARABIC" = "ENGLISH",
): string {
  if (language === "ARABIC") {
    return `${price.toFixed(2)} ج.م`;
  }
  return `EGP ${price.toFixed(2)}`;
}
