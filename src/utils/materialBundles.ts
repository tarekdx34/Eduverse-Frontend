import type { CourseMaterial } from '../services/api/courseService';

export type MaterialBundle = {
  key: string;
  baseTitle: string;
  items: CourseMaterial[];
  video: CourseMaterial | null;
  documents: CourseMaterial[];
  instructions: string;
  weekNumber: number | null;
  isPublished: boolean;
};

type ParsedBundleTitle = {
  baseTitle: string;
  suffix: string;
};

export const parseBundleTitle = (title: string): ParsedBundleTitle | null => {
  const normalized = title.trim();
  if (!normalized.includes(' - ')) return null;
  const parts = normalized.split(' - ');
  if (parts.length < 2) return null;

  const baseTitle = parts.slice(0, -1).join(' - ').trim();
  const suffix = parts[parts.length - 1].trim();
  if (!baseTitle || !suffix) return null;

  return { baseTitle, suffix };
};

const buildBundleKey = (weekNumber: number | null | undefined, baseTitle: string): string =>
  `${weekNumber == null ? 'general' : String(weekNumber)}::${baseTitle.toLowerCase()}`;

export const getBundleSuffix = (material: CourseMaterial, baseTitle: string): string => {
  const expectedPrefix = `${baseTitle} - `;
  if (material.title.startsWith(expectedPrefix)) {
    const extracted = material.title.slice(expectedPrefix.length).trim();
    if (extracted) return extracted;
  }

  if (material.materialType === 'video') return 'Video';

  const normalizedFileName = (material.fileName || '').replace(/\.[^.]+$/, '').trim();
  if (normalizedFileName) return normalizedFileName;

  return material.materialType.charAt(0).toUpperCase() + material.materialType.slice(1);
};

export const groupMaterialsIntoBundles = (materials: CourseMaterial[]) => {
  const candidates = new Map<
    string,
    {
      baseTitle: string;
      items: CourseMaterial[];
      parsedSuffixes: string[];
      hasVideoLikeItem: boolean;
    }
  >();
  const singles: CourseMaterial[] = [];
  const bundleByMaterialId: Record<string, MaterialBundle> = {};

  for (const material of materials) {
    const parsed = parseBundleTitle(material.title || '');
    if (!parsed) {
      singles.push(material);
      continue;
    }

    const key = buildBundleKey(material.weekNumber ?? null, parsed.baseTitle);
    if (!candidates.has(key)) {
      candidates.set(key, {
        baseTitle: parsed.baseTitle,
        items: [],
        parsedSuffixes: [],
        hasVideoLikeItem: false,
      });
    }

    const candidate = candidates.get(key)!;
    candidate.items.push(material);
    candidate.parsedSuffixes.push(parsed.suffix);
    if (material.materialType === 'video' || parsed.suffix.toLowerCase() === 'video') {
      candidate.hasVideoLikeItem = true;
    }
  }

  const bundles: MaterialBundle[] = [];

  for (const [key, candidate] of candidates.entries()) {
    const sortedItems = [...candidate.items].sort(
      (a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0)
    );
    const shouldBeBundle = candidate.items.length > 1 || candidate.hasVideoLikeItem;

    if (!shouldBeBundle) {
      singles.push(...candidate.items);
      continue;
    }

    const video =
      sortedItems.find((item) => item.materialType === 'video') ||
      sortedItems.find((item, index) => candidate.parsedSuffixes[index]?.toLowerCase() === 'video') ||
      null;

    const documents = sortedItems.filter((item) => item.materialId !== video?.materialId);
    const instructions =
      sortedItems.find((item) => (item.description || '').trim().length > 0)?.description?.trim() || '';
    const weekNumber = sortedItems[0]?.weekNumber ?? null;
    const isPublished = sortedItems.every((item) => item.isPublished === 1);

    const bundle: MaterialBundle = {
      key,
      baseTitle: candidate.baseTitle,
      items: sortedItems,
      video,
      documents,
      instructions,
      weekNumber,
      isPublished,
    };

    bundles.push(bundle);
    for (const item of sortedItems) {
      bundleByMaterialId[item.materialId] = bundle;
    }
  }

  return {
    bundles,
    singles,
    bundleByMaterialId,
  };
};
