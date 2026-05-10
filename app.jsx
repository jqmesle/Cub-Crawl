// CubCrawl app — router + tweaks
const { Sidebar, Header, RightRail, FeedView, ExploreView, AlertsView, ProfileView, ClubView, ComposeModal, LoginModal, MyClubsView } = window.CC_VIEWS;

function App() {
  // route: { name, params }
  const [route, setRoute] = React.useState({ name: 'home' });
  const [feedTab, setFeedTab] = React.useState('foryou');
  const [composing, setComposing] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);

  // Tweakable design tokens
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#3E6040",
    "accentLight": "#b0d4ac",
    "bg": "#fdfaf3",
    "displayFont": "Jolly Lodger",
    "feedDensity": "comfy",
    "showRail": true,
    "tagPalette": ["#b0d4ac", "#3E6040", "#fdfaf3"]
  }/*EDITMODE-END*/;

  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks to CSS vars
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--green-600', tweaks.accent);
    r.setProperty('--green-300', tweaks.accentLight);
    r.setProperty('--bg', tweaks.bg);
    r.setProperty('--display', `'${tweaks.displayFont}', system-ui, sans-serif`);
  }, [tweaks]);

  // Hide splash after mount
  React.useEffect(() => {
    const sp = document.getElementById('splash');
    if (sp) setTimeout(() => sp.remove(), 1300);
  }, []);

  const go = (name, params = {}) => setRoute({ name, params });

  const headers = {
    home:    { title: 'Home', subtitle: 'Your campus feed' },
    explore: { title: 'Explore', subtitle: 'Find your people at UC Davis' },
    alerts:  { title: 'Alerts', subtitle: '3 new today' },
    clubs:   { title: 'My Clubs', subtitle: '4 memberships' },
    profile: { title: 'Profile', subtitle: ME.handle },
    club:    { title: (CLUBS[route.params?.id] || {}).name || 'Club', subtitle: (CLUBS[route.params?.id] || {}).handle || '' },
  };
  const head = headers[route.name] || headers.home;

  const showRail = tweaks.showRail && (route.name === 'home' || route.name === 'explore');

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: showRail
          ? `var(--sidebar-w) minmax(0, 1fr) var(--rail-w)`
          : `var(--sidebar-w) minmax(0, 1fr)`,
        minHeight: '100vh',
      }}>
        <Sidebar route={route} go={go} onCompose={() => setComposing(true)} />

        <main style={{ minWidth: 0, borderRight: showRail ? '1px solid var(--hairline)' : '0' }}>
          <Header title={head.title} subtitle={head.subtitle} />
          {route.name === 'home'    && <FeedView go={go} tab={feedTab} setTab={setFeedTab} onCompose={() => setComposing(true)} />}
          {route.name === 'explore' && <ExploreView go={go} />}
          {route.name === 'alerts'  && <AlertsView />}
          {route.name === 'clubs'   && <MyClubsView go={go} />}
          {route.name === 'profile' && <ProfileView go={go} />}
          {route.name === 'club'    && <ClubView id={route.params.id} go={go} />}
        </main>

        {showRail && <RightRail go={go} />}
      </div>

      <ComposeModal open={composing} onClose={() => setComposing(false)} />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Tweaks panel */}
      <window.TweaksPanel>
        <window.TweakSection title="Theme">
          <window.TweakColor
            label="Accent (deep green)"
            value={tweaks.accent}
            onChange={v => setTweak('accent', v)}
            options={['#3E6040', '#0b6e3b', '#1d4f8a', '#7a3e8a', '#9c4a23']}
          />
          <window.TweakColor
            label="Tag pill"
            value={tweaks.accentLight}
            onChange={v => setTweak('accentLight', v)}
            options={['#b0d4ac', '#cfe7c2', '#cfd9ee', '#e7cfe6', '#efd9c8']}
          />
          <window.TweakColor
            label="Page background"
            value={tweaks.bg}
            onChange={v => setTweak('bg', v)}
            options={['#fdfaf3', '#ffffff', '#f3f7ee', '#1a1a18']}
          />
        </window.TweakSection>

        <window.TweakSection title="Typography">
          <window.TweakSelect
            label="Display font"
            value={tweaks.displayFont}
            onChange={v => setTweak('displayFont', v)}
            options={[
              { value: 'Jolly Lodger', label: 'Jolly Lodger (default)' },
              { value: 'Bree Serif',   label: 'Bree Serif' },
              { value: 'Castoro',      label: 'Castoro' },
              { value: 'Inria Sans',   label: 'Inria Sans' },
            ]}
          />
        </window.TweakSection>

        <window.TweakSection title="Layout">
          <window.TweakToggle
            label="Show right rail"
            value={tweaks.showRail}
            onChange={v => setTweak('showRail', v)}
          />
          <window.TweakRadio
            label="Feed density"
            value={tweaks.feedDensity}
            onChange={v => setTweak('feedDensity', v)}
            options={[{ value: 'comfy', label: 'Comfy' }, { value: 'compact', label: 'Compact' }]}
          />
        </window.TweakSection>

        <window.TweakSection title="Demo">
          <window.TweakButton onClick={() => setLoginOpen(true)}>Show login splash</window.TweakButton>
          <window.TweakButton onClick={() => setComposing(true)}>Open compose modal</window.TweakButton>
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
