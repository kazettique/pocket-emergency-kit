import { useEffect, useState } from 'react'
import { useSyncEngine } from './hooks/useSyncEngine'
import { ThemeProvider } from './theme'
import { I18nProvider } from './i18n'
import { TabBar, type TabKey } from './components/TabBar'
import { TopStatusBar } from './components/TopStatusBar'
import { OfflineBanner } from './components/OfflineBanner'
import Home from './screens/Home'
import Map from './screens/Map'
import Kit from './screens/Kit'
import Guide from './screens/Guide'
import Sos from './screens/Sos'
import Setup from './screens/Setup'
import './App.css'

const TAB_KEYS: readonly TabKey[] = ['home', 'map', 'kit', 'guide', 'sos']

function parseHash(): TabKey | null {
  const raw = window.location.hash.replace(/^#/, '')
  return (TAB_KEYS as readonly string[]).includes(raw) ? (raw as TabKey) : null
}

function Shell() {
  const sync = useSyncEngine()
  const [tab, setTab] = useState<TabKey>(() => parseHash() ?? 'home')
  const [setupOpen, setSetupOpen] = useState(false)

  useEffect(() => {
    const onHash = () => setTab(parseHash() ?? 'home')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (next: TabKey) => {
    setTab(next)
    history.replaceState(null, '', `#${next}`)
  }

  return (
    <div className="app">
      {!sync.isOnline ? <OfflineBanner /> : null}
      <TopStatusBar isOnline={sync.isOnline} lastSyncAt={sync.lastSyncAt} status={sync.status} />
      <main className="app-main">
        {tab === 'home' && <Home sync={sync} onOpenSetup={() => setSetupOpen(true)} />}
        {tab === 'map' && <Map />}
        {tab === 'kit' && <Kit />}
        {tab === 'guide' && <Guide />}
        {tab === 'sos' && <Sos />}
      </main>
      <TabBar active={tab} onChange={go} />
      {setupOpen ? <Setup sync={sync} onClose={() => setSetupOpen(false)} /> : null}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Shell />
      </I18nProvider>
    </ThemeProvider>
  )
}
