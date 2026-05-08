export type MarketingLanguage = "moroccan" | "gulf" | "english" | "french";

export type AvatarOption = {
  id: string;
  name: string;
  title: string;
  mood: string;
  imageUrl: string;
};

export const avatars: AvatarOption[] = [
  {
    id: "maya",
    name: "مايا",
    title: "مقدمة فاخرة للمنتجات",
    mood: "واثقة وراقية",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=90",
  },
  {
    id: "adam",
    name: "آدم",
    title: "خبير مبيعات تقني",
    mood: "واضح ومقنع",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90",
  },
  {
    id: "lina",
    name: "لينا",
    title: "صانعة محتوى اجتماعي",
    mood: "حماسية وقريبة من الجمهور",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=90",
  },
  {
    id: "nour",
    name: "نور",
    title: "مستشارة علامات تجارية",
    mood: "هادئة واحترافية",
    imageUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=90",
  },
];

export const languages: Record<
  MarketingLanguage,
  { label: string; helper: string; voiceId: string; voiceLanguage: string }
> = {
  moroccan: {
    label: "دارجة مغربية",
    helper: "نص قصير ومقنع بلمسة مغربية",
    voiceId: "ar-MA-MounaNeural",
    voiceLanguage: "Arabic (Morocco)",
  },
  gulf: {
    label: "خليجية",
    helper: "أسلوب خليجي أنيق ومباشر",
    voiceId: "ar-SA-ZariyahNeural",
    voiceLanguage: "Arabic (Saudi Arabia)",
  },
  english: {
    label: "English",
    helper: "Premium direct-response pitch",
    voiceId: "en-US-JennyNeural",
    voiceLanguage: "English (United States)",
  },
  french: {
    label: "Français",
    helper: "Argumentaire commercial fluide",
    voiceId: "fr-FR-DeniseNeural",
    voiceLanguage: "French (France)",
  },
};

export function findAvatar(avatarId: string) {
  return avatars.find((avatar) => avatar.id === avatarId) ?? avatars[0];
}

export function isMarketingLanguage(value: string): value is MarketingLanguage {
  return value in languages;
}

export function buildMarketingScript({
  description,
  language,
}: {
  description: string;
  language: MarketingLanguage;
}) {
  const cleanDescription = description.trim().replace(/\s+/g, " ");

  const scripts: Record<MarketingLanguage, string> = {
    moroccan: `واش كتقلب على منتج يسهّل عليك الاختيار ويعطيك نتيجة كتستاهلها؟ ${cleanDescription}. هاد العرض صممناه باش يبان المنتج ديالك باحترافية، يبرز القيمة ديالو، ويقنع الزبون من أول ثواني. جرّبو اليوم وخلي الانطباع الأول يخدم لصالحك.`,
    gulf: `إذا كنت تدور على منتج يلفت الانتباه ويعطي قيمة واضحة من أول لحظة، فهذا هو اختيارك. ${cleanDescription}. صممناه ليبرز الميزة الأساسية، يقنع العميل بسرعة، ويخلي علامتك تظهر بصورة راقية واحترافية. اطلبه الآن وخل منتجك يتكلم عن نفسه.`,
    english: `Meet a product designed to stand out and convert attention into action. ${cleanDescription}. This offer highlights the value clearly, builds trust fast, and gives your audience a strong reason to choose you today. Try it now and let your product make a premium first impression.`,
    french: `Découvrez un produit pensé pour attirer l'attention et transformer l'intérêt en action. ${cleanDescription}. Cette présentation met en avant sa valeur, crée rapidement la confiance et donne à votre audience une vraie raison de passer à l'achat dès aujourd'hui.`,
  };

  return scripts[language];
}

export function buildDidAuthHeader() {
  const apiKey = process.env.D_ID_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (apiKey.startsWith("Basic ")) {
    return apiKey;
  }

  if (apiKey.includes(":")) {
    return `Basic ${Buffer.from(apiKey).toString("base64")}`;
  }

  return `Basic ${apiKey}`;
}
