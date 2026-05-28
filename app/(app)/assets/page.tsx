import { createAdminClient } from '@/lib/supabase/admin'
import type { ContentMediaAsset } from '@/types'

export const dynamic = 'force-dynamic'

const TYPE_ICONS: Record<string, string> = {
  image: '🖼️', video: '🎬', audio: '🎵', pdf: '📄',
  slide: '📑', thumbnail: '🖼️', voiceover: '🎙️',
}

export default async function AssetsPage() {
  const supabase = createAdminClient()
  const { data: assets } = await supabase
    .from('content_media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const items: ContentMediaAsset[] = assets || []

  const byType: Record<string, number> = {}
  for (const a of items) byType[a.asset_type] = (byType[a.asset_type] || 0) + 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Asset Library</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} assets · book pages, screenshots, voiceovers, renders</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {Object.entries(byType).map(([type, count]) => (
          <div key={type} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
            <span>{TYPE_ICONS[type] || '📄'}</span>
            <span className="text-gray-300 ml-1">{type}</span>
            <span className="text-gray-500 ml-1">({count})</span>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <div className="text-gray-400 text-sm">No assets yet.</div>
          <div className="text-gray-600 text-xs mt-2">Assets are created when you generate video projects or upload files.</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map(asset => (
          <div key={asset.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{TYPE_ICONS[asset.asset_type] || '📄'}</span>
              <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{asset.asset_type}</span>
            </div>
            <div className="text-sm text-white truncate">{asset.file_name || 'Untitled'}</div>
            <div className="text-xs text-gray-500">
              {asset.source} · {asset.lane || 'general'}
            </div>
            {asset.tags?.length > 0 && (
              <div className="text-xs text-blue-400">{asset.tags.join(', ')}</div>
            )}
            {asset.file_url && (
              <a href={asset.file_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline">View →</a>
            )}
            <div className="text-xs text-gray-600">{new Date(asset.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
