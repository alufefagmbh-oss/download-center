import type { SupabaseClient } from '@supabase/supabase-js'
import type { DownloadSection, DownloadGroup, Download } from '@/lib/types'

type GroupWithFiles = DownloadGroup & { downloads: Download[] }
type SectionWithContent = DownloadSection & { groups: GroupWithFiles[]; directFiles: Download[] }

function sortByOrder<T extends { sort_order?: number }>(arr: T[] | null): T[] {
  return (arr ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export async function fetchProductStructure(supabase: SupabaseClient, productTypeId: string) {
  const [sectionsRes, looseGroupsRes, standaloneRes, sectionDirectRes] = await Promise.all([
    supabase
      .from('download_sections')
      .select('*, download_groups(*, downloads(*))')
      .eq('product_type_id', productTypeId)
      .order('sort_order'),

    supabase
      .from('download_groups')
      .select('*, downloads(*)')
      .eq('product_type_id', productTypeId)
      .is('section_id', null)
      .order('sort_order'),

    supabase
      .from('downloads')
      .select('*')
      .eq('product_type_id', productTypeId)
      .is('group_id', null)
      .is('section_id', null)
      .order('sort_order'),

    supabase
      .from('downloads')
      .select('*')
      .eq('product_type_id', productTypeId)
      .not('section_id', 'is', null)
      .is('group_id', null)
      .order('sort_order'),
  ])

  // Build section_id → direct files map
  const directBySection: Record<string, Download[]> = {}
  for (const dl of sectionDirectRes.data ?? []) {
    const sid = (dl as Download).section_id
    if (sid) {
      if (!directBySection[sid]) directBySection[sid] = []
      directBySection[sid].push(dl as Download)
    }
  }

  const sections: SectionWithContent[] = sortByOrder(sectionsRes.data ?? []).map(
    (s: DownloadSection & { download_groups?: (DownloadGroup & { downloads?: Download[] })[] }) => ({
      ...s,
      groups: sortByOrder(s.download_groups ?? []).map((g) => ({
        ...g,
        downloads: sortByOrder(g.downloads ?? []),
      })),
      directFiles: sortByOrder(directBySection[s.id] ?? []),
    })
  )

  const looseGroups: GroupWithFiles[] = sortByOrder(looseGroupsRes.data ?? []).map(
    (g: DownloadGroup & { downloads?: Download[] }) => ({
      ...g,
      downloads: sortByOrder(g.downloads ?? []),
    })
  )

  const standaloneFiles: Download[] = sortByOrder(standaloneRes.data ?? [])

  return { sections, looseGroups, standaloneFiles }
}
