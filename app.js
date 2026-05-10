// ============================================================
// CubCrawl app.js
// This file was separated from the original index.html.
// It contains the React components, page views, modals, routing,
// and tweak-panel logic for the CubCrawl site.
//
// IMPORTANT: This file still uses JSX, so index.html loads it with
// type="text/babel". Keep React, ReactDOM, Babel, data.jsx,
// icons.jsx, and tweaks-panel.jsx loaded before this file.
// ============================================================

(function(){
// CubCrawl views — Feed, Explore, Alerts, Profile, Club, Compose, Login
const { useState, useMemo, useEffect, useRef } = React;
const I = window.CC_ICONS;
const { CLUBS, POSTS, ALERTS, ME, TRENDING_TAGS, EVENTS } = window.CC_DATA;

// ─── Brand wordmark ───
// Displays the CubCrawl text logo using the display font.
function Wordmark({ size = 36 }) {
  return (
    <span style={{ fontFamily: 'Jolly Lodger', fontSize: size, lineHeight: 1, letterSpacing: '0.01em', color: 'var(--green-700)' }}>
      CubCrawl
    </span>
  );
}

// Displays the small bear/shield logo image.
function LogoMark({ size = 38 }) {
  return <img src="assets/logo-mark.png" alt="" style={{ width: size, height: size, objectFit: 'contain' }} />;
}

// ─── Tag chip ───
// Reusable hashtag/category pill used across posts, clubs, and filters.
function Tag({ children, variant }) {
  return <span className={`chip ${variant === 'ghost' ? 'chip--ghost' : variant === 'dark' ? 'chip--dark' : ''}`}>{children}</span>;
}

// ─── Verified check ───
// Small green verified icon placed next to official clubs/users.
function VerifiedDot() {
  return <I.Verified style={{ width: 14, height: 14, color: 'var(--green-600)', flexShrink: 0 }} />;
}

// ─── Sidebar ───
// Left-side navigation with links to Home, Explore, Alerts, My Clubs, and Profile.
function Sidebar({ route, go, onCompose }) {
  const items = [
    { id: 'home',    label: 'Home',    icon: I.Home },
    { id: 'explore', label: 'Explore', icon: I.Compass },
    { id: 'alerts',  label: 'Alerts',  icon: I.Bell, badge: 3 },
    { id: 'clubs',   label: 'My Clubs', icon: I.Group },
    { id: 'profile', label: 'Profile', icon: I.User },
  ];
  return (
    <aside style={{
      position: 'sticky', top: 0, alignSelf: 'flex-start',
      width: 'var(--sidebar-w)', height: '100vh',
      padding: '24px 18px 18px',
      borderRight: '1px solid var(--hairline)',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <button onClick={() => go('home')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 18px', justifyContent: 'flex-start' }}>
        <LogoMark size={44} />
        <Wordmark size={42} />
      </button>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const Ic = it.icon;
          const active = route.name === it.id || (it.id === 'profile' && route.name === 'profile');
          return (
            <button key={it.id} className="nav-item" data-active={active} onClick={() => go(it.id)}>
              <Ic className="nav-icon" />
              <span>{it.label}</span>
              {it.badge ? <span className="nav-badge">{it.badge}</span> : null}
            </button>
          );
        })}
      </nav>

      <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={onCompose}>
        <I.Plus style={{ width: 18, height: 18 }} /> New Post
      </button>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 0', borderTop: '1px solid var(--hairline)' }}>
        <img src={ME.avatar} className="avatar" alt="" />
        <div style={{ minWidth: 0 }}>
          <div className="serif" style={{ fontSize: 15, color: 'var(--ink)' }}>{ME.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{ME.handle}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Top header (search + small status) ───
// Sticky top bar with page title, subtitle, and a search input.
function Header({ title, subtitle, onSearch }) {
  const [q, setQ] = useState('');
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 5,
      background: 'rgba(253,250,243,0.85)',
      backdropFilter: 'saturate(140%) blur(10px)',
      borderBottom: '1px solid var(--hairline)',
      padding: '14px 28px',
      display: 'flex', alignItems: 'center', gap: 20,
    }}>
      <div style={{ minWidth: 0 }}>
        <h1 className="serif" style={{ margin: 0, fontSize: 22, color: 'var(--ink)', lineHeight: 1.1 }}>{title}</h1>
        {subtitle ? <div className="sub" style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{subtitle}</div> : null}
      </div>
      <div style={{ flex: 1, maxWidth: 460, marginLeft: 'auto', position: 'relative' }}>
        <I.Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--muted)' }} />
        <input
          value={q}
          onChange={e => { setQ(e.target.value); onSearch && onSearch(e.target.value); }}
          placeholder="Search clubs, people, hashtags…"
          style={{
            width: '100%', padding: '10px 14px 10px 38px',
            border: '1px solid var(--hairline-2)', background: '#fff',
            borderRadius: 14, outline: 'none',
            fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
          onBlur={e => e.target.style.borderColor = 'var(--hairline-2)'}
        />
      </div>
    </header>
  );
}

// ─── Right rail ───
// Right column showing trending clubs, hashtags, and upcoming events.
function RightRail({ go }) {
  return (
    <aside style={{ width: 'var(--rail-w)', padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <RailCard title="Trending Clubs">
        {Object.values(CLUBS).slice(0, 4).map(c => (
          <button key={c.id} onClick={() => go('club', { id: c.id })} className="lift" style={{
            display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px',
            border: '1px solid var(--hairline)', borderRadius: 14, background: '#fff', textAlign: 'left',
          }}>
            <img src={c.avatar} className="avatar" alt="" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="serif" style={{ fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 5 }}>
                {c.name} {c.verified && <VerifiedDot />}
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{c.members} members</div>
            </div>
            <span className="chip">Join</span>
          </button>
        ))}
      </RailCard>

      <RailCard title="Hashtags">
        <div className="tags" style={{ padding: '4px 0' }}>
          {TRENDING_TAGS.map(t => <Tag key={t}>{t}</Tag>)}
        </div>
      </RailCard>

      <RailCard title="Upcoming on campus">
        {EVENTS.map(ev => {
          const c = CLUBS[ev.clubId];
          return (
            <button key={ev.id} onClick={() => go('club', { id: ev.clubId })} className="lift" style={{
              display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px',
              border: '1px solid var(--hairline)', borderRadius: 14, background: '#fff', textAlign: 'left',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--green-100)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <I.Calendar style={{ width: 20, height: 20, color: 'var(--green-700)' }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="serif" style={{ fontSize: 13, color: 'var(--ink)' }}>{ev.title}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{ev.when} · {ev.where}</div>
              </div>
            </button>
          );
        })}
      </RailCard>

      <div style={{ fontSize: 11, color: 'var(--muted-2)', fontFamily: 'var(--mono)', lineHeight: 1.6, padding: '0 4px' }}>
        © CubCrawl 2026 · Built at UC&nbsp;Davis<br />
        For students. By students.
      </div>
    </aside>
  );
}

// Small wrapper used by the right rail sections.
function RailCard({ title, children }) {
  return (
    <section>
      <h3 className="serif" style={{ margin: '0 0 10px', fontSize: 16, color: 'var(--ink)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </section>
  );
}

// ─── Post card ───
// Reusable feed post component with avatar, text, image, tags, likes, comments, and share.
function PostCard({ post, go, onLike }) {
  const club = CLUBS[post.clubId];
  const [liked, setLiked] = useState(false);
  const [pulse, setPulse] = useState(false);
  const likeIt = () => {
    setLiked(l => !l);
    setPulse(true);
    setTimeout(() => setPulse(false), 350);
    onLike && onLike(post.id);
  };
  return (
    <article className="card post lift">
      <header className="post-head">
        <button onClick={() => go('club', { id: post.clubId })} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src={post.avatar} className="avatar" alt="" />
          <div style={{ textAlign: 'left' }}>
            <div className="post-handle" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {post.handle} {club && club.verified && <VerifiedDot />}
            </div>
            <div className="post-meta">{post.sub} · {club ? club.school.split(',')[0] : ''}</div>
          </div>
        </button>
        <span className="post-time">{post.time}</span>
      </header>

      {post.body && <div className="post-body">{post.body}</div>}

      {post.image && (
        <div style={{ padding: '4px 20px 12px' }}>
          <img src={post.image} className={`post-image ${post.fullImage ? 'post-image--full' : ''}`} alt="" style={{ borderRadius: 12, border: '1px solid var(--hairline)' }} />
        </div>
      )}

      {post.tags && post.tags.length ? (
        <div className="tags" style={{ padding: '0 20px 14px' }}>
          {post.tags.map(t => <Tag key={t} variant="ghost">{t}</Tag>)}
        </div>
      ) : null}

      <div className="post-actions">
        <button className={`action ${liked ? 'is-liked' : ''}`} onClick={likeIt}>
          <span className={pulse ? 'heart-pop' : ''} style={{ display: 'inline-flex' }}>
            <I.Heart filled={liked} />
          </span>
          <span className="mono" style={{ fontSize: 12 }}>{post.likes + (liked ? 1 : 0)}</span>
        </button>
        <button className="action">
          <I.Chat /> <span className="mono" style={{ fontSize: 12 }}>{post.comments}</span>
        </button>
        <button className="action action--right">
          <I.Share /> <span style={{ fontSize: 12 }}>Share</span>
        </button>
      </div>
    </article>
  );
}

// ─── HOME / FEED ───
// Main home timeline. Switches between For You and Following posts.
function FeedView({ go, tab, setTab, onCompose }) {
  const filtered = useMemo(() => {
    if (tab === 'following') return POSTS.filter(p => ['ebd', 'art', 'pcg'].includes(p.clubId));
    return POSTS;
  }, [tab]);

  return (
    <div className="view-fade" style={{ maxWidth: 'var(--feed-max)', margin: '0 auto', padding: '20px 24px 48px', width: '100%' }}>
      {/* tabs */}
      <div className="tab-row" style={{ marginBottom: 16, justifyContent: 'center', borderBottom: 'none' }}>
        <button className="tab" data-active={tab === 'foryou'} onClick={() => setTab('foryou')}>For You</button>
        <button className="tab" data-active={tab === 'following'} onClick={() => setTab('following')}>Following</button>
      </div>

      {/* compose nudge */}
      <button onClick={onCompose} className="card lift compose" style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: 14, marginBottom: 16, width: '100%',
        textAlign: 'left',
      }}>
        <img src={ME.avatar} className="avatar" alt="" />
        <span style={{ color: 'var(--muted)', fontFamily: 'var(--body)', fontSize: 15 }}>What's happening on campus, {ME.name}?</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <I.Image style={{ width: 18, height: 18, color: 'var(--green-700)' }} />
          <I.Tag style={{ width: 18, height: 18, color: 'var(--green-700)' }} />
          <I.Calendar style={{ width: 18, height: 18, color: 'var(--green-700)' }} />
        </span>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.map(p => <PostCard key={p.id} post={p} go={go} />)}
      </div>
    </div>
  );
}

// ─── EXPLORE ───
// Club discovery page with search, category filters, and a card grid.
function ExploreView({ go }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const list = useMemo(() => {
    let out = Object.values(CLUBS);
    if (q.trim()) {
      const s = q.toLowerCase();
      out = out.filter(c => c.name.toLowerCase().includes(s) || c.tags.some(t => t.includes(s)));
    }
    if (filter !== 'all') {
      out = out.filter(c => c.tags.some(t => t.replace('#', '') === filter));
    }
    return out;
  }, [q, filter]);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'art', label: 'Arts' },
    { id: 'culture', label: 'Culture' },
    { id: 'tech', label: 'Tech' },
    { id: 'wellness', label: 'Wellness' },
    { id: 'service', label: 'Service' },
  ];

  return (
    <div className="view-fade" style={{ padding: '24px 28px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <h2 className="serif" style={{ margin: 0, fontSize: 28, color: 'var(--ink)' }}>Discover clubs</h2>
        <div className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{Object.keys(CLUBS).length} active at UC Davis</div>
      </div>

      {/* search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <I.Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--muted)' }} />
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search by name, hashtag, or vibe…"
          style={{
            width: '100%', padding: '14px 16px 14px 44px',
            border: '1px solid var(--hairline-2)', background: '#fff',
            borderRadius: 16, fontFamily: 'var(--serif)', fontSize: 16, outline: 'none', color: 'var(--ink)',
          }}
        />
      </div>

      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="chip" style={{
            background: filter === f.id ? 'var(--green-600)' : 'transparent',
            color: filter === f.id ? '#fff' : 'var(--ink-2)',
            border: '1px solid ' + (filter === f.id ? 'var(--green-600)' : 'var(--hairline-2)'),
            cursor: 'pointer',
            fontSize: 12, padding: '6px 14px',
          }}>{f.label}</button>
        ))}
      </div>

      {/* grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {list.map(c => (
          <button key={c.id} onClick={() => go('club', { id: c.id })} className="card lift" style={{
            textAlign: 'left', padding: 0, overflow: 'hidden', cursor: 'pointer',
          }}>
            <div style={{
              height: 100,
              background: c.cover ? `url(${c.cover}) center/cover` : 'linear-gradient(135deg, var(--green-300), var(--green-500))',
            }} />
            <div style={{ padding: '0 16px 16px', marginTop: -32, position: 'relative' }}>
              <img src={c.avatar} alt="" style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #fff', objectFit: 'cover', background: '#fff' }} />
              <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                {c.name} {c.verified && <VerifiedDot />}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{c.handle} · {c.members} members</div>
              <p style={{ fontFamily: 'var(--sub)', fontSize: 13, color: 'var(--ink-3)', margin: '10px 0 12px', lineHeight: 1.4, minHeight: 36 }}>{c.bio}</p>
              <div className="tags">{c.tags.slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}</div>
            </div>
          </button>
        ))}
      </div>

      {!list.length && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }} className="serif">No clubs match — try a different search.</div>
      )}
    </div>
  );
}

// ─── ALERTS ───
// Notification page grouped by Today, Last 7 days, and Last month.
function AlertsView() {
  const sections = [
    ['Today', ALERTS.today],
    ['Last 7 days', ALERTS.week],
    ['Last month', ALERTS.month],
  ];
  return (
    <div className="view-fade" style={{ maxWidth: 720, margin: '0 auto', padding: '24px 28px 48px' }}>
      <h2 className="serif" style={{ margin: '0 0 18px', fontSize: 28, color: 'var(--ink)' }}>Alerts</h2>
      {sections.map(([label, items]) => (
        <section key={label} style={{ marginBottom: 28 }}>
          <div className="mono" style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{label}</div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {items.map((a, i) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderTop: i ? '1px solid var(--hairline)' : 0,
              }}>
                <img src={a.avatar} className="avatar" alt="" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--body)', fontSize: 14, color: 'var(--ink)' }}>{a.text}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{a.time} · {a.kind}</div>
                </div>
                <I.ArrowRight style={{ width: 16, height: 16, color: 'var(--muted)' }} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── PROFILE (Person) ───
// User profile page with clubs, events, and post tabs.
function ProfileView({ go }) {
  const [tab, setTab] = useState('clubs');
  return (
    <div className="view-fade">
      {/* cover */}
      <div style={{ height: 220, background: `url(${ME.cover}) center/cover`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.25))' }} />
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 28px 48px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 18,
          marginTop: -70,        // moves profile section higher
          position: 'relative',  // allows z-index to work
          zIndex: 2              // puts it above the banner
        }}>
          <img
            src={ME.avatar}
            className="avatar avatar--xl"
            alt=""
            style={{
              position: 'relative',
              zIndex: 3
            }}
          />
          <div style={{ flex: 1, paddingBottom: 10, transform: 'translateY(25px)' }}>
            <h2 className="serif" style={{ margin: 0, fontSize: 30, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {ME.name} <VerifiedDot />
            </h2>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{ME.handle} · {ME.pronouns}</div>
            <div className="sub" style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{ME.school}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 10 }}>
            <button className="btn btn-ghost"><I.Mail style={{ width: 16, height: 16 }} /> Message</button>
            <button className="btn btn-primary">Edit Profile</button>
          </div>
        </div>

        <p className="sub" style={{ marginTop: 18, color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.5 }}>{ME.bio}</p>
        <div className="tags" style={{ marginTop: 10 }}>{ME.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>

        {/* tabs */}
        <div className="tab-row" style={{ marginTop: 24 }}>
          <button className="tab" data-active={tab === 'clubs'} onClick={() => setTab('clubs')}>Clubs</button>
          <button className="tab" data-active={tab === 'events'} onClick={() => setTab('events')}>Events</button>
          <button className="tab" data-active={tab === 'posts'} onClick={() => setTab('posts')}>Posts</button>
        </div>

        {tab === 'clubs' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
            {ME.myClubs.map(mc => {
              const c = CLUBS[mc.id];
              return (
                <button key={mc.id} className="card lift" onClick={() => go('club', { id: mc.id })} style={{
                  display: 'flex', gap: 14, padding: 16, textAlign: 'left', alignItems: 'flex-start',
                }}>
                  <img src={c.avatar} className="avatar avatar--lg" alt="" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div className="serif" style={{ fontSize: 16, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {c.name} {c.verified && <VerifiedDot />}
                      </div>
                      <span className="role"><span className="star">✦</span>{mc.role}</span>
                    </div>
                    <p className="sub" style={{ margin: '6px 0 8px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.45 }}>{c.bio}</p>
                    <div className="tags">{c.tags.slice(0, 2).map(t => <Tag key={t}>{t}</Tag>)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'events' && (
          <div className="card" style={{ marginTop: 18, padding: 28, textAlign: 'center', color: 'var(--muted)' }}>
            <I.Calendar style={{ width: 28, height: 28, color: 'var(--green-600)' }} />
            <div className="serif" style={{ fontSize: 16, color: 'var(--ink)', marginTop: 8 }}>No events RSVP'd yet</div>
            <div className="sub" style={{ fontSize: 13, marginTop: 4 }}>RSVP to upcoming campus events from the right rail.</div>
          </div>
        )}

        {tab === 'posts' && (
          <div style={{ marginTop: 18, color: 'var(--muted)', fontFamily: 'var(--sub)' }}>
            You haven't posted anything yet — try writing something with the New Post button.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CLUB PROFILE ───
// Individual club page with follow state, posts, events, members, and about tabs.
function ClubView({ id, go }) {
  const c = CLUBS[id] || CLUBS.ebd;
  const [tab, setTab] = useState('posts');
  const [following, setFollowing] = useState(false);
  const clubPosts = POSTS.filter(p => p.clubId === c.id);

  return (
    <div className="view-fade">
      <div style={{
        height: 220,
        background: c.cover ? `url(${c.cover}) center/cover` : 'linear-gradient(135deg, var(--green-400), var(--green-700))',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.25))' }} />
      </div>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 28px 48px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 18,
          marginTop: -70,        // moves profile section higher
          position: 'relative',  // allows z-index to work
          zIndex: 2              // puts it above the banner
        }}>
          <img
            src={c.avatar}
            className="avatar avatar--xl"
            alt=""
            style={{
              position: 'relative',
              zIndex: 3
            }}
          />
          <div style={{ flex: 1, paddingBottom: 10, transform: 'translateY(25px)'}}>
            <h2 className="serif" style={{ margin: 0, fontSize: 30, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {c.name} {c.verified && <VerifiedDot />}
            </h2>
            <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{c.handle}</div>
            <div className="sub" style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{c.school}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: 10 }}>
            <button className="btn btn-ghost"><I.Bell style={{ width: 16, height: 16 }} /> Notify</button>
            <button className={`btn ${following ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setFollowing(f => !f)}>
              {following ? <><I.Check style={{ width: 16, height: 16 }} /> Following</> : 'Follow'}
            </button>
          </div>
        </div>

        <p className="sub" style={{ marginTop: 18, color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.5, maxWidth: 620 }}>{c.bio}</p>
        <div className="tags" style={{ marginTop: 10 }}>{c.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 32, marginTop: 18, fontFamily: 'var(--mono)', fontSize: 12 }}>
          <div><span className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>{c.members}</span> <span style={{ color: 'var(--muted)' }}>members</span></div>
          <div><span className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>{c.posts}</span> <span style={{ color: 'var(--muted)' }}>posts</span></div>
          <div><span className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>{c.id === 'ebd' ? 4 : 2}</span> <span style={{ color: 'var(--muted)' }}>upcoming events</span></div>
        </div>

        <div className="tab-row" style={{ marginTop: 24 }}>
          <button className="tab" data-active={tab === 'posts'} onClick={() => setTab('posts')}>Posts</button>
          <button className="tab" data-active={tab === 'events'} onClick={() => setTab('events')}>Events</button>
          <button className="tab" data-active={tab === 'members'} onClick={() => setTab('members')}>Members</button>
          <button className="tab" data-active={tab === 'about'} onClick={() => setTab('about')}>About</button>
        </div>

        {tab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
            {clubPosts.length ? clubPosts.map(p => <PostCard key={p.id} post={p} go={go} />)
              : <div className="sub" style={{ padding: 30, textAlign: 'center', color: 'var(--muted)' }}>No posts yet from {c.name}.</div>}
          </div>
        )}

        {tab === 'events' && (
          <div className="card" style={{ marginTop: 18, padding: 22 }}>
            {EVENTS.filter(e => e.clubId === c.id).concat([{ id: 'x', clubId: c.id, title: 'Weekly meeting', when: 'Mon · 7:00 PM', where: 'TLC 1010' }]).map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderTop: i ? '1px solid var(--hairline)' : 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--green-100)', display: 'grid', placeItems: 'center' }}>
                  <I.Calendar style={{ width: 24, height: 24, color: 'var(--green-700)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>{ev.title}</div>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{ev.when} · {ev.where}</div>
                </div>
                <button className="btn btn-ghost">RSVP</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'members' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 18 }}>
            {[
              { name: 'bryan9', role: 'President', avatar: ME.avatar },
              { name: 'jqmie', role: 'VP', avatar: 'assets/jem.png' },
              { name: 'anty.ny',   role: 'Treasurer', avatar: 'assets/ant.jpg' },
              { name: 'devon22', role: 'Officer', avatar: 'assets/avatar-21.png' },
              { name: 'amy.lin', role: 'Member', avatar: 'assets/avatar-23.png' },
              { name: 'kai_f',   role: 'Member', avatar: 'assets/avatar-11.png' },
            ].map(m => (
              <div key={m.name} className="card lift" style={{ padding: 16, textAlign: 'center' }}>
                <img src={m.avatar} className="avatar avatar--lg" alt="" style={{ margin: '0 auto' }} />
                <div className="serif" style={{ marginTop: 10, fontSize: 15, color: 'var(--ink)' }}>{m.name}</div>
                <div className="role" style={{ marginTop: 4 }}><span className="star">✦</span>{m.role}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'about' && (
          <div className="card" style={{ marginTop: 18, padding: 24, fontFamily: 'var(--sub)', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            <p>{c.bio}</p>
            <p style={{ marginTop: 14 }}>Founded 2018. Open to all UC Davis students. Meetings every Monday at 7pm in TLC 1010.</p>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
              <I.Pin style={{ width: 14, height: 14 }} /> TLC 1010, UC Davis · {c.handle.toLowerCase()}.cubcrawl.app
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPOSE MODAL ───
// Pop-up modal that lets the user draft a new club post.
function ComposeModal({ open, onClose }) {
  const [text, setText] = useState('');
  const [club, setClub] = useState('art');
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(20,20,18,.45)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, animation: 'fadeIn .2s',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{ width: 580, maxWidth: 'calc(100vw - 40px)', padding: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--hairline)' }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 18, color: 'var(--ink)' }}>New post</h3>
          <button onClick={onClose} style={{ marginLeft: 'auto', padding: 6, borderRadius: 8 }}><I.X style={{ width: 18, height: 18, color: 'var(--muted)' }} /></button>
        </header>
        <div style={{ padding: 18, display: 'flex', gap: 12 }}>
          <img src={ME.avatar} className="avatar" alt="" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span className="sub" style={{ fontSize: 12, color: 'var(--muted)' }}>Posting as</span>
              <select value={club} onChange={e => setClub(e.target.value)} style={{
                fontFamily: 'var(--serif)', fontSize: 14, padding: '4px 8px', border: '1px solid var(--hairline-2)', borderRadius: 8, background: '#fff', color: 'var(--ink)',
              }}>
                {Object.values(CLUBS).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share an event, ask for help, drop a link…" style={{
              width: '100%', minHeight: 120, fontFamily: 'var(--body)', fontSize: 16, lineHeight: 1.5, color: 'var(--ink)',
              border: 0, outline: 'none', resize: 'vertical', background: 'transparent',
            }} />
          </div>
        </div>
        <footer style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderTop: '1px solid var(--hairline)' }}>
          <button className="action"><I.Image /> Photo</button>
          <button className="action"><I.Calendar /> Event</button>
          <button className="action"><I.Tag /> Tag</button>
          <span className="mono" style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 11 }}>{280 - text.length}</span>
          <button className="btn btn-primary" disabled={!text.trim()} style={{ opacity: text.trim() ? 1 : .5 }} onClick={onClose}>Post</button>
        </footer>
      </div>
    </div>
  );
}

// ─── LOGIN MODAL (welcome) ───
// Welcome/sign-in modal that checks for a .edu email format.
function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  if (!open) return null;
  const valid = /\.edu$/.test(email.trim());
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(20,20,18,.45)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', zIndex: 100, animation: 'fadeIn .2s',
    }}>
      <div className="card login-splash" style={{ width: 880, maxWidth: 'calc(100vw - 40px)', padding: 0, display: 'grid', gridTemplateColumns: '1.05fr 1fr', overflow: 'hidden' }}>
        <div style={{ padding: '48px 44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <img src="assets/logo-mark.png" alt="" style={{ width: 80, height: 80, filter: 'invert(1)', opacity: .95 }} />
            <span style={{ fontFamily: 'Jolly Lodger', fontSize: 78, lineHeight: 1, color: '#fff' }}>CubCrawl</span>
          </div>
          <p className="sub" style={{ color: 'rgba(255,255,255,.92)', fontSize: 16, lineHeight: 1.5, marginTop: 28, maxWidth: 340 }}>
            Stay connected with campus life in one place. Discover club updates, opportunities and university events. Never miss what's going on.
          </p>
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="sub" style={{ color: '#fff', fontSize: 13 }}>Enter your .edu mail</span>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="bryan9@ucdavis.edu" style={{
              padding: '14px 16px', fontFamily: 'var(--body)', fontSize: 15, border: 0, outline: 'none',
              borderRadius: 14, background: 'rgba(255,255,255,.95)', color: 'var(--ink)',
            }} />
            <button className="btn btn-primary btn-primary--xl" disabled={!valid} onClick={onClose} style={{
              marginTop: 14, width: '100%', opacity: valid ? 1 : .55,
            }}>Continue <I.ArrowRight style={{ width: 18, height: 18 }} /></button>
            <div className="mono" style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, marginTop: 12, textAlign: 'center' }}>
              By continuing you agree to the campus community guidelines.
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,.18)', padding: 36, position: 'relative', display: 'grid', placeItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: `url(${ME.cover}) center/cover`, opacity: .35 }} />
          <div style={{ position: 'relative', textAlign: 'center', color: '#fff' }}>
            <div className="display" style={{ fontSize: 100, lineHeight: .9, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,.3)' }}>Hi, cub.</div>
            <div className="sub" style={{ fontSize: 14, marginTop: 14, color: 'rgba(255,255,255,.85)', maxWidth: 260, marginInline: 'auto' }}>
              Your campus, your clubs, your people — together in one feed.
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, padding: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)' }}>
          <I.X style={{ width: 18, height: 18, color: '#fff' }} />
        </button>
      </div>
    </div>
  );
}

// ─── MY CLUBS view (sidebar nav target) ───
// Lists the clubs the current user belongs to.
function MyClubsView({ go }) {
  return (
    <div className="view-fade" style={{ maxWidth: 880, margin: '0 auto', padding: '24px 28px 48px' }}>
      <h2 className="serif" style={{ margin: '0 0 6px', fontSize: 28, color: 'var(--ink)' }}>My clubs</h2>
      <p className="sub" style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0 }}>4 active memberships across UC Davis</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        {ME.myClubs.map(mc => {
          const c = CLUBS[mc.id];
          return (
            <button key={mc.id} className="card lift" onClick={() => go('club', { id: mc.id })} style={{
              display: 'flex', gap: 18, padding: 18, textAlign: 'left', alignItems: 'center', width: '100%',
            }}>
              <img src={c.avatar} className="avatar avatar--lg" alt="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {c.name} {c.verified && <VerifiedDot />}
                  <span className="role" style={{ marginLeft: 8 }}><span className="star">✦</span>{mc.role}</span>
                </div>
                <p className="sub" style={{ margin: '6px 0 8px', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.45 }}>{c.bio}</p>
                <div className="tags">{c.tags.map(t => <Tag key={t}>{t}</Tag>)}</div>
              </div>
              <I.ArrowRight style={{ width: 20, height: 20, color: 'var(--muted)' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.CC_VIEWS = { Sidebar, Header, RightRail, FeedView, ExploreView, AlertsView, ProfileView, ClubView, ComposeModal, LoginModal, MyClubsView };

})();

// ============================================================
// App shell + router
// This second section renders the whole application into #root,
// switches between pages, opens/closes modals, and applies theme tweaks.
// ============================================================

(function(){
// CubCrawl app — router + tweaks
// Pull in the view components created in the first section above.
const { Sidebar, Header, RightRail, FeedView, ExploreView, AlertsView, ProfileView, ClubView, ComposeModal, LoginModal, MyClubsView } = window.CC_VIEWS;

// Pull in shared app data used by the header and routes.
const { CLUBS, ME } = window.CC_DATA;

function App() {
  // Main route state. Example: { name: 'club', params: { id: 'art' } }
  // This works like a tiny router without React Router.
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

})();
