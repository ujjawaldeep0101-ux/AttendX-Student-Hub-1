import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignIn, SignUp, useAuth, useClerk, useUser } from '@clerk/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import {
  Activity, ArrowRight, BarChart3, Bell, BookOpen, CalendarDays,
  Check, CheckCircle2, ChevronRight, Clock3, FileText,
  Flame, GraduationCap, Heart, Home, Library, ListChecks, LocateFixed, LockKeyhole,
  MapPin, Menu, MessageCircle, MoreHorizontal, Moon, NotebookPen, Pause, Play,
  Plus, RotateCcw, Search, Send, Settings, ShieldCheck, Sparkles, Sun, Target,
  Timer, Trophy, UserRound, Users, X, Zap, Bookmark, Brain, Coffee,
  SlidersHorizontal, ExternalLink, Upload, Pencil, Trash2, Eye, EyeOff,
  ImagePlus, UserPlus, type LucideIcon,
} from 'lucide-react';
import subhamPhoto from '@assets/WhatsApp_Image_2026-09-29_at_6.41.09_PM_1790687977737.jpeg';

type Page = 'home' | 'attendance' | 'routine' | 'study' | 'pyq' | 'notes' | 'exams' | 'community' | 'assistant' | 'developers' | 'admin' | 'profile' | 'settings';
type Modal = 'class' | 'attendance' | 'note' | 'location' | 'focus' | 'more' | 'developer-detail' | 'developer-add' | null;
type AttendanceStatus = 'present' | 'absent' | 'holiday';

type Subject = { id: string; name: string; code: string; color: string; percentage: number; present: number; absent: number; total: number; trend: number };
type RoutineClass = { id: string; subject: string; teacher: string; room: string; time: string; day: string; status?: string };
type Note = { id: string; title: string; subject: string; category: string; updated: string };
type Post = { id: string; author: string; initials: string; category: string; body: string; replies: number; likes: number; liked: boolean; time: string };
type Developer = { id: string; name: string; role: string; college: string; batch: string; branch: string; photoUrl: string; linkedinUrl: string; displayOrder: number; isActive: boolean };

const queryClient = new QueryClient();

const pageMeta: Record<Page, { label: string; icon: LucideIcon }> = {
  home: { label: 'Home', icon: Home },
  attendance: { label: 'Attendance', icon: BarChart3 },
  routine: { label: 'Routine', icon: CalendarDays },
  study: { label: 'Study', icon: Timer },
  pyq: { label: 'PYQ', icon: BookOpen },
  notes: { label: 'Notes', icon: NotebookPen },
  exams: { label: 'Exams', icon: GraduationCap },
  community: { label: 'Community', icon: Users },
  assistant: { label: 'AI Assistant', icon: Sparkles },
  developers: { label: 'Developers', icon: Users },
  admin: { label: 'Admin Panel', icon: ShieldCheck },
  profile: { label: 'Profile', icon: UserRound },
  settings: { label: 'Settings', icon: Settings },
};

const initialSubjects: Subject[] = [
  { id: 'dsa', name: 'Data Structures', code: 'CS 301', color: '#1575d1', percentage: 86, present: 18, absent: 3, total: 21, trend: 4 },
  { id: 'dbms', name: 'Database Systems', code: 'CS 302', color: '#e5a43a', percentage: 78, present: 14, absent: 4, total: 18, trend: -2 },
  { id: 'os', name: 'Operating Systems', code: 'CS 303', color: '#23a37b', percentage: 92, present: 22, absent: 2, total: 24, trend: 7 },
  { id: 'cn', name: 'Computer Networks', code: 'CS 304', color: '#8668d7', percentage: 74, present: 14, absent: 5, total: 19, trend: 1 },
];
const initialRoutine: RoutineClass[] = [
  { id: 'r1', subject: 'Data Structures', teacher: 'Dr. A. Mehta', room: 'Block B · 204', time: '09:00 – 10:00', day: 'Today', status: 'completed' },
  { id: 'r2', subject: 'Database Systems', teacher: 'Prof. R. Iyer', room: 'Lab 3 · C Wing', time: '11:15 – 12:15', day: 'Today', status: 'next' },
  { id: 'r3', subject: 'Operating Systems', teacher: 'Dr. N. Rao', room: 'Block A · 301', time: '14:00 – 15:00', day: 'Today', status: 'upcoming' },
  { id: 'r4', subject: 'Computer Networks', teacher: 'Prof. K. Sen', room: 'Block B · 112', time: '10:00 – 11:00', day: 'Tomorrow', status: 'upcoming' },
  { id: 'r5', subject: 'Data Structures', teacher: 'Dr. A. Mehta', room: 'Block B · 204', time: '09:00 – 10:00', day: 'Friday', status: 'upcoming' },
];
const initialNotes: Note[] = [
  { id: 'n1', title: 'Binary trees — quick revision', subject: 'Data Structures', category: 'Revision', updated: 'Today, 8:42 AM' },
  { id: 'n2', title: 'SQL joins & indexing', subject: 'Database Systems', category: 'Lecture', updated: 'Yesterday' },
  { id: 'n3', title: 'Process scheduling patterns', subject: 'Operating Systems', category: 'Exam prep', updated: 'Mon, 6:20 PM' },
];
const initialPosts: Post[] = [
  { id: 'p1', author: 'Ananya Shah', initials: 'AS', category: 'Study groups', body: 'Anyone up for a two-hour DBMS revision sprint in the library this evening?', replies: 8, likes: 24, liked: false, time: '18 min ago' },
  { id: 'p2', author: 'Rohan Verma', initials: 'RV', category: 'Campus life', body: 'The east gate shuttle is running every 15 minutes after 4 PM today. Sharing in case someone needs it.', replies: 3, likes: 17, liked: true, time: '1 hr ago' },
  { id: 'p3', author: 'Meera Iyer', initials: 'MI', category: 'Resources', body: 'Uploaded clean OS scheduling notes to the shared drive. The worked examples are especially useful.', replies: 12, likes: 31, liked: false, time: '3 hrs ago' },
];
const initialDevelopers: Developer[] = [
  {
    id: 'subham-kumar-roy',
    name: 'Subham Kumar Roy',
    role: 'Developer',
    college: 'GEC Buxar',
    batch: '2025–2029',
    branch: 'ECE',
    photoUrl: subhamPhoto,
    linkedinUrl: 'https://www.linkedin.com/in/subham-kumar-roy-b38975347?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'harsh-ranjan',
    name: 'Harsh Ranjan',
    role: 'Developer',
    college: 'GEC Buxar',
    batch: '2025–2029',
    branch: 'ECE',
    photoUrl: '',
    linkedinUrl: '',
    displayOrder: 2,
    isActive: true,
  },
];

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function pageFromHash(): Page {
  const hash = window.location.hash.replace(/^#/, '') as Page;
  return hash && Object.prototype.hasOwnProperty.call(pageMeta, hash) ? hash : 'home';
}

type AuthRoute = 'sign-in' | 'sign-up' | null;
const authBasePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function authRouteFromPath(): AuthRoute {
  const path = window.location.pathname;
  if (path === `${authBasePath}/sign-in` || path.startsWith(`${authBasePath}/sign-in/`)) return 'sign-in';
  if (path === `${authBasePath}/sign-up` || path.startsWith(`${authBasePath}/sign-up/`)) return 'sign-up';
  return null;
}

function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [authRoute, setAuthRoute] = useState<AuthRoute>(authRouteFromPath);
  const [modal, setModal] = useState<Modal>(null);
  const [dark, setDark] = useStoredState('attendx-theme', false);
  const [locationOn, setLocationOn] = useStoredState('attendx-location', true);
  const [subjects, setSubjects] = useStoredState<Subject[]>('attendx-subjects', initialSubjects);
  const [routine, setRoutine] = useStoredState<RoutineClass[]>('attendx-routine', initialRoutine);
  const [notes, setNotes] = useStoredState<Note[]>('attendx-notes', initialNotes);
  const [posts, setPosts] = useStoredState<Post[]>('attendx-posts', initialPosts);
  const [developers, setDevelopers] = useStoredState<Developer[]>('attendx-developers', initialDevelopers);
  const [goal, setGoal] = useStoredState('attendx-pyq', 12);
  const [focusSeconds, setFocusSeconds] = useStoredState('attendx-focus', 0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => setFocusSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, setFocusSeconds]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    const onPathChange = () => setAuthRoute(authRouteFromPath());
    window.addEventListener('popstate', onPathChange);
    return () => window.removeEventListener('popstate', onPathChange);
  }, []);

  const notify = (message: string) => setToast(message);
  const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
  const navigate = (next: Page) => { setPage(next); window.history.replaceState(null, '', next === 'home' ? `${window.location.pathname}${window.location.search}` : `#${next}`); setModal(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openAuth = (route: Exclude<AuthRoute, null>) => {
    const nextPath = `${authBasePath}/${route}`;
    window.history.pushState({}, '', nextPath);
    setAuthRoute(route);
    setModal(null);
  };
  const handleSignOut = () => signOut({ redirectUrl: authBasePath || '/' });
  const averageAttendance = Math.round(subjects.reduce((sum, subject) => sum + subject.percentage, 0) / subjects.length);
  const quickActions = [
    { label: 'Mark attendance', icon: CheckCircle2, page: 'attendance' as Page, action: () => setModal('attendance'), tone: 'blue' },
    { label: 'Start focus', icon: Timer, page: 'study' as Page, action: () => setModal('focus'), tone: 'amber' },
    { label: 'Add a note', icon: NotebookPen, page: 'notes' as Page, action: () => setModal('note'), tone: 'violet' },
    { label: 'View routine', icon: CalendarDays, page: 'routine' as Page, action: () => navigate('routine'), tone: 'green' },
  ];

  const markAttendance = (subjectId: string, status: AttendanceStatus) => {
    setSubjects((current) => current.map((subject) => {
      if (subject.id !== subjectId || status === 'holiday') return subject;
      const total = subject.total + 1;
      const present = subject.present + (status === 'present' ? 1 : 0);
      return { ...subject, total, present, absent: total - present, percentage: Math.round((present / total) * 100), trend: status === 'present' ? subject.trend + 1 : subject.trend - 2 };
    }));
    setModal(null);
    notify(status === 'holiday' ? 'Holiday marked. No attendance changed.' : `Marked ${status}. Attendance updated.`);
  };
  const addClass = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setRoutine((current) => [...current, {
      id: `r${Date.now()}`, subject: String(data.get('subject') || 'New class'), teacher: String(data.get('teacher') || 'Faculty'),
      room: String(data.get('room') || 'Room TBD'), time: String(data.get('time') || '16:00 – 17:00'), day: String(data.get('day') || 'Monday'), status: 'upcoming',
    }]);
    setModal(null); notify('Class added to your routine.');
  };
  const addNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setNotes((current) => [{ id: `n${Date.now()}`, title: String(data.get('title') || 'Untitled note'), subject: String(data.get('subject') || 'General'), category: String(data.get('category') || 'Lecture'), updated: 'Just now' }, ...current]);
    setModal(null); notify('Note saved to your library.');
  };
  const toggleLike = (id: string) => setPosts((current) => current.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
  const updateDeveloper = (id: string, patch: Partial<Developer>) => setDevelopers((current) => current.map((developer) => developer.id === id ? { ...developer, ...patch } : developer));
  const handleDeveloperPhoto = (id: string, file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateDeveloper(id, { photoUrl: String(reader.result || '') });
      notify('Developer photo updated.');
    };
    reader.readAsDataURL(file);
  };
  const removeDeveloper = (id: string) => {
    const developer = developers.find((item) => item.id === id);
    if (!developer || !window.confirm(`Remove ${developer.name} from AttendX?`)) return;
    setDevelopers((current) => current.filter((item) => item.id !== id));
    notify('Developer profile removed.');
  };
  const addDeveloper = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    if (!name) return;
    setDevelopers((current) => [...current, {
      id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name,
      role: String(data.get('role') || 'Developer'),
      college: String(data.get('college') || ''),
      batch: String(data.get('batch') || ''),
      branch: String(data.get('branch') || ''),
      photoUrl: '',
      linkedinUrl: String(data.get('linkedinUrl') || ''),
      displayOrder: current.length + 1,
      isActive: true,
    }]);
    setModal(null);
    notify('Developer profile added.');
  };
  const formatTimer = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (authRoute) {
    return <AuthScreen route={authRoute} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="grain app-shell min-h-[100dvh] text-foreground">
          <div className="mx-auto flex min-h-[100dvh] max-w-[1600px]">
            <Sidebar page={page} navigate={navigate} />
            <main className="min-w-0 flex-1 pb-20 md:pb-8">
              <Topbar page={page} today={today} dark={dark} setDark={setDark} notify={notify} navigate={navigate} isSignedIn={Boolean(isSignedIn)} userName={user?.firstName || user?.emailAddresses[0]?.emailAddress || ''} onSignIn={() => openAuth('sign-in')} />
              <div className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
                {page === 'home' && <HomePage today={today} averageAttendance={averageAttendance} subjects={subjects} routine={routine} goal={goal} locationOn={locationOn} navigate={navigate} quickActions={quickActions} setModal={setModal} />}
                {page === 'attendance' && <AttendancePage subjects={subjects} average={averageAttendance} openModal={() => setModal('attendance')} />}
                {page === 'routine' && <RoutinePage routine={routine} openAdd={() => setModal('class')} />}
                {page === 'study' && <StudyPage seconds={focusSeconds} running={timerRunning} setRunning={setTimerRunning} reset={() => { setFocusSeconds(0); setTimerRunning(false); }} openFocus={() => setModal('focus')} />}
                {page === 'pyq' && <PyqPage goal={goal} setGoal={setGoal} notify={notify} />}
                {page === 'notes' && <NotesPage notes={notes} openAdd={() => setModal('note')} notify={notify} />}
                {page === 'exams' && <ExamsPage notify={notify} />}
                {page === 'community' && <CommunityPage posts={posts} toggleLike={toggleLike} notify={notify} />}
                {page === 'assistant' && <AssistantPage notify={notify} />}
                 {page === 'developers' && <DevelopersPage developers={developers} onSelect={(developer) => { setSelectedDeveloper(developer); setModal('developer-detail'); }} />}
                  {page === 'admin' && (!isLoaded ? <AdminLoadingState /> : isSignedIn ? <DeveloperAdminPage developers={developers} updateDeveloper={updateDeveloper} handlePhoto={handleDeveloperPhoto} removeDeveloper={removeDeveloper} openAdd={() => setModal('developer-add')} notify={notify} /> : <AdminAccessWall onSignIn={() => openAuth('sign-in')} />)}
                {page === 'profile' && <ProfilePage navigate={navigate} />}
                {page === 'settings' && <SettingsPage dark={dark} setDark={setDark} locationOn={locationOn} setLocationOn={setLocationOn} notify={notify} />}
              </div>
            </main>
          </div>
          <BottomNav page={page} navigate={navigate} openMore={() => setModal('more')} />
          {modal === 'attendance' && <AttendanceModal subjects={subjects} onClose={() => setModal(null)} onMark={markAttendance} />}
          {modal === 'class' && <ModalFrame title="Add to routine" subtitle="Keep your week visible at a glance." onClose={() => setModal(null)}><ClassForm onSubmit={addClass} /></ModalFrame>}
          {modal === 'note' && <ModalFrame title="Create a note" subtitle="Capture the useful bit while it is fresh." onClose={() => setModal(null)}><NoteForm onSubmit={addNote} /></ModalFrame>}
          {modal === 'focus' && <ModalFrame title="Focus session" subtitle="A small start still counts." onClose={() => setModal(null)}><FocusDialog seconds={focusSeconds} running={timerRunning} setRunning={setTimerRunning} reset={() => { setFocusSeconds(0); setTimerRunning(false); }} onClose={() => setModal(null)} /></ModalFrame>}
           {modal === 'developer-detail' && selectedDeveloper && <DeveloperDetailModal developer={selectedDeveloper} onClose={() => { setModal(null); setSelectedDeveloper(null); }} />}
           {modal === 'developer-add' && <ModalFrame title="Add developer" subtitle="Create a profile for the AttendX team." onClose={() => setModal(null)}><DeveloperForm onSubmit={addDeveloper} /></ModalFrame>}
          {modal === 'more' && <MorePanel page={page} navigate={navigate} onClose={() => setModal(null)} isSignedIn={Boolean(isSignedIn)} onSignIn={() => openAuth('sign-in')} onSignOut={handleSignOut} />}
          {toast && <div data-testid="toast-success" className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl dark:bg-white dark:text-slate-900"><CheckCircle2 size={17} className="text-emerald-400" />{toast}</div>}
        </div>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

function Sidebar({ page, navigate }: { page: Page; navigate: (page: Page) => void }) {
  const primary: Page[] = ['home', 'attendance', 'routine', 'study', 'pyq', 'notes', 'exams', 'community'];
  return <aside className="hidden w-[244px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
    <button data-testid="button-brand" onClick={() => navigate('home')} className="mb-9 flex items-center gap-3 px-3 text-left">
      <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-sidebar-primary text-lg font-extrabold text-sidebar-primary-foreground shadow-lg shadow-cyan-900/20">A</span>
      <span><span className="block text-[17px] font-extrabold tracking-[-.04em]">Attend<span className="text-sidebar-primary">X</span></span><span className="block text-[10px] font-medium uppercase tracking-[.18em] text-slate-400">Campus companion</span></span>
    </button>
    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Your workspace</p>
    <nav className="space-y-1">
      {primary.map((item) => <NavButton key={item} page={item} active={page === item} navigate={navigate} dark />)}
    </nav>
    <div className="my-7 h-px bg-sidebar-border" />
    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Personal</p>
    <nav className="space-y-1">
      {(['assistant', 'profile', 'settings'] as Page[]).map((item) => <NavButton key={item} page={item} active={page === item} navigate={navigate} dark />)}
    </nav>
    <div className="my-7 h-px bg-sidebar-border" />
    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">About AttendX</p>
    <nav className="space-y-1">
      <NavButton page="developers" active={page === 'developers'} navigate={navigate} dark />
      <NavButton page="admin" active={page === 'admin'} navigate={navigate} dark />
    </nav>
    <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent p-3">
      <div className="mb-2 flex items-center gap-2 text-sidebar-primary"><ShieldCheck size={16} /><span className="text-xs font-bold">Your data stays yours</span></div>
      <p className="text-[11px] leading-relaxed text-slate-400">Everything syncs locally on this device.</p>
    </div>
  </aside>;
}

function AuthScreen({ route }: { route: Exclude<AuthRoute, null> }) {
  const isSignIn = route === 'sign-in';
  return <div className="grain flex min-h-[100dvh] items-center justify-center bg-[radial-gradient(circle_at_70%_-10%,hsl(204_100%_95%/.9),transparent_38%),hsl(var(--background))] px-4 py-8">
    <div className="w-full max-w-[440px]">
      <button onClick={() => window.location.assign(authBasePath || '/')} className="mb-5 flex items-center gap-3 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-primary text-lg font-extrabold text-primary-foreground shadow-lg shadow-blue-900/20">A</span>
        <span><span className="block text-[17px] font-extrabold tracking-[-.04em]">Attend<span className="text-primary">X</span></span><span className="block text-[10px] font-medium uppercase tracking-[.18em] text-muted-foreground">Campus companion</span></span>
      </button>
      {isSignIn ? <SignIn routing="path" path={`${authBasePath}/sign-in`} signUpUrl={`${authBasePath}/sign-up`} /> : <SignUp routing="path" path={`${authBasePath}/sign-up`} signInUrl={`${authBasePath}/sign-in`} />}
    </div>
  </div>;
}

function NavButton({ page, active, navigate, dark = false }: { page: Page; active: boolean; navigate: (page: Page) => void; dark?: boolean }) {
  const Icon = pageMeta[page].icon;
  return <button data-testid={`nav-${page}`} onClick={() => navigate(page)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-all ${active ? (dark ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-cyan-950/20' : 'bg-primary text-primary-foreground') : (dark ? 'text-slate-400 hover:bg-sidebar-accent hover:text-sidebar-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}`}>
    <Icon size={17} strokeWidth={active ? 2.5 : 2} /><span>{pageMeta[page].label}</span>{active && <ChevronRight className="ml-auto" size={15} />}
  </button>;
}

function Topbar({ page, today, dark, setDark, notify, navigate, isSignedIn, userName, onSignIn }: { page: Page; today: string; dark: boolean; setDark: (value: boolean) => void; notify: (message: string) => void; navigate: (page: Page) => void; isSignedIn: boolean; userName: string; onSignIn: () => void }) {
  const initials = userName.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AK';
  return <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
    <div><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-muted-foreground">{today}</p><h1 data-testid="text-current-page" className="mt-0.5 text-xl font-extrabold tracking-[-.035em] sm:text-2xl">{page === 'home' ? 'Good morning, Aarav' : pageMeta[page].label}</h1></div>
    <div className="flex items-center gap-1.5 sm:gap-3">
      <button data-testid="button-search" onClick={() => notify('Search is ready for your campus content.')} className="hidden h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex"><Search size={18} /></button>
      <button data-testid="button-theme-topbar" onClick={() => setDark(!dark)} className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
      <button data-testid="button-notifications" onClick={() => notify('You are all caught up.')} className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" /></button>
      {isSignedIn ? <button data-testid="button-avatar-topbar" title="Open profile" onClick={() => navigate('profile')} className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-extrabold text-primary-foreground">{initials}</button> : <button data-testid="button-sign-in-topbar" onClick={onSignIn} className="ml-1 rounded-xl bg-primary px-3.5 py-2 text-xs font-extrabold text-primary-foreground transition hover:bg-primary/90">Sign in</button>}
    </div>
  </header>;
}

function BottomNav({ page, navigate, openMore }: { page: Page; navigate: (page: Page) => void; openMore: () => void }) {
  const items: Page[] = ['home', 'attendance', 'study', 'pyq', 'profile'];
  return <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[70px] items-center justify-around border-t border-border bg-card/95 px-2 backdrop-blur-xl md:hidden">
    {items.map((item) => { const Icon = pageMeta[item].icon; return <button data-testid={`bottom-nav-${item}`} key={item} onClick={() => navigate(item)} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold transition ${page === item ? 'text-primary' : 'text-muted-foreground'}`}><Icon size={19} strokeWidth={page === item ? 2.6 : 2} /><span>{pageMeta[item].label}</span>{page === item && <span className="h-0.5 w-4 rounded-full bg-primary" />}</button>; })}
    <button data-testid="bottom-nav-more" onClick={openMore} className="flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-bold text-muted-foreground"><MoreHorizontal size={19} /><span>More</span></button>
  </nav>;
}

function HomePage({ today, averageAttendance, subjects, routine, goal, locationOn, navigate, quickActions, setModal }: { today: string; averageAttendance: number; subjects: Subject[]; routine: RoutineClass[]; goal: number; locationOn: boolean; navigate: (page: Page) => void; quickActions: { label: string; icon: LucideIcon; page: Page; action: () => void; tone: string }[]; setModal: (modal: Modal) => void }) {
  const upcoming = routine.filter((item) => item.day === 'Today' && item.status !== 'completed');
  return <div className="space-y-6">
    <section className="animate-rise relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#075db4] via-[#147bd3] to-[#45b8de] p-5 text-white shadow-xl shadow-blue-900/10 sm:p-7">
      <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full border-[28px] border-white/10" /><div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full border-[18px] border-cyan-200/10" />
      <div className="relative max-w-2xl"><div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-blue-100"><span className="h-2 w-2 rounded-full bg-[#ffcf73]" /> Your daily rhythm</div><h2 className="max-w-xl text-[29px] font-extrabold leading-[1.12] tracking-[-.045em] sm:text-[38px]">Make today count, <span className="font-serif font-normal italic text-[#ffe0a0]">one class at a time.</span></h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-blue-50/85">Your command center for the classes, focus blocks, and little wins that move your semester forward.</p><div className="mt-6 flex flex-wrap gap-3"><button data-testid="button-check-location" onClick={() => setModal('attendance')} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#075db4] shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5"><LocateFixed size={16} />{locationOn ? 'Mark attendance nearby' : 'Verify location'}</button><button data-testid="button-open-routine-hero" onClick={() => navigate('routine')} className="flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10">See today’s plan <ArrowRight size={15} /></button></div></div>
    </section>
    <section className="animate-rise animate-rise-delay-1 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {quickActions.map(({ label, icon: Icon, action, tone }) => <button data-testid={`quick-action-${label.toLowerCase().replaceAll(' ', '-')}`} key={label} onClick={action} className="glass-card lift group flex items-center gap-3 rounded-2xl p-3.5 text-left sm:p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : tone === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : tone === 'violet' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}><Icon size={19} /></span><span className="min-w-0"><span className="block truncate text-xs font-extrabold sm:text-sm">{label}</span><span className="mt-0.5 block text-[10px] text-muted-foreground">Open workspace</span></span><ChevronRight className="ml-auto hidden shrink-0 text-muted-foreground sm:block" size={15} /></button>)}
    </section>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <section className="glass-card animate-rise animate-rise-delay-2 rounded-2xl p-5 sm:p-6"><SectionHeading icon={Activity} title="Attendance health" action="View all" onClick={() => navigate('attendance')} /><div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center"><div className="relative mx-auto h-36 w-36 shrink-0 sm:mx-0"><svg viewBox="0 0 120 120" className="-rotate-90"><circle cx="60" cy="60" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="11" /><circle cx="60" cy="60" r="48" fill="none" stroke="#1575d1" strokeWidth="11" strokeLinecap="round" strokeDasharray={`${averageAttendance * 3.01} 400`} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span data-testid="text-average-attendance" className="text-3xl font-extrabold tracking-tight">{averageAttendance}%</span><span className="text-[10px] font-semibold text-muted-foreground">overall</span></div></div><div className="min-w-0 flex-1 space-y-3">{subjects.slice(0, 3).map((subject) => <div data-testid={`row-attendance-${subject.id}`} key={subject.id}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="truncate font-bold">{subject.name}</span><span className="font-mono text-muted-foreground">{subject.percentage}%</span></div><div className="progress-track h-1.5"><div className="progress-fill" style={{ width: `${subject.percentage}%`, background: subject.color }} /></div></div>)}</div></div></section>
      <section className="glass-card animate-rise animate-rise-delay-3 rounded-2xl p-5 sm:p-6"><SectionHeading icon={Target} title="Today's focus" action="Open study" onClick={() => navigate('study')} /><div className="mt-5 flex items-center gap-4 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/20"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"><Flame size={23} /></div><div><p className="text-2xl font-extrabold">{Math.floor(goal / 3)}<span className="text-sm font-semibold text-muted-foreground"> / 4 blocks</span></p><p className="text-xs text-muted-foreground">A focused hour beats a busy day.</p></div></div><div className="mt-5 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">This week</p><p className="mt-1 text-lg font-extrabold">4h 25m <span className="text-xs font-semibold text-emerald-600">+18%</span></p></div><div className="flex h-10 items-end gap-1.5">{[32, 44, 28, 72, 55, 84, 62].map((height, index) => <span key={index} className={`w-2.5 rounded-full ${index === 5 ? 'bg-primary' : 'bg-blue-100 dark:bg-blue-950'}`} style={{ height: `${height}%` }} />)}</div></div></section>
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <section className="glass-card animate-rise animate-rise-delay-3 rounded-2xl p-5 sm:p-6"><SectionHeading icon={CalendarDays} title="Up next" action="Full routine" onClick={() => navigate('routine')} /><div className="mt-4 divide-y divide-border">{upcoming.map((item, index) => <div data-testid={`home-class-${item.id}`} key={item.id} className="flex items-center gap-3 py-3 first:pt-1"><div className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl ${item.status === 'next' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><span className="text-[10px] font-bold">{item.time.split(' ')[0]}</span><Clock3 size={13} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{item.subject}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{item.time} · {item.room}</p></div>{item.status === 'next' && <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Next</span>}</div>)}</div></section>
      <section className="glass-card animate-rise animate-rise-delay-4 rounded-2xl p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Next exam</p><h3 className="mt-1 text-lg font-extrabold">Data Structures</h3></div><span className="rounded-xl bg-violet-100 px-2.5 py-1.5 text-[10px] font-extrabold text-violet-700 dark:bg-violet-950 dark:text-violet-300">In 12 days</span></div><div className="mt-5 rounded-2xl bg-violet-50 p-4 dark:bg-violet-950/20"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"><GraduationCap size={19} /></div><div><p className="text-sm font-bold">Mid-semester examination</p><p className="mt-0.5 text-xs text-muted-foreground">November 18 · 10:00 AM</p></div></div><button data-testid="button-exam-prep" onClick={() => navigate('exams')} className="mt-4 flex w-full items-center justify-between rounded-xl bg-card px-3 py-2.5 text-xs font-bold shadow-sm">View prep plan <ArrowRight size={15} className="text-primary" /></button></div></section>
    </div>
  </div>;
}

function SectionHeading({ icon: Icon, title, action, onClick }: { icon: LucideIcon; title: string; action?: string; onClick?: () => void }) {
  return <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-primary dark:bg-blue-950/60"><Icon size={16} /></span><h2 className="text-base font-extrabold tracking-[-.02em]">{title}</h2></div>{action && <button data-testid={`button-${action.toLowerCase().replaceAll(' ', '-')}`} onClick={onClick} className="flex items-center gap-1 text-xs font-bold text-primary transition hover:gap-2">{action}<ArrowRight size={13} /></button>}</div>;
}

function AttendancePage({ subjects, average, openModal }: { subjects: Subject[]; average: number; openModal: () => void }) {
  return <div className="space-y-6"><PageIntro eyebrow="Stay above the line" title="Attendance, without the guesswork." description="A clear view of where you stand and what one more class does for you." action={<button data-testid="button-mark-attendance" onClick={openModal} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground shadow-lg shadow-blue-900/10"><CheckCircle2 size={16} /> Mark attendance</button>} /><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Overall attendance" value={`${average}%`} note={average >= 75 ? 'Above safe threshold' : 'Needs attention'} icon={BarChart3} tone="blue" /><MetricCard label="Classes attended" value={`${subjects.reduce((a, s) => a + s.present, 0)}`} note="This semester" icon={Check} tone="green" /><MetricCard label="Safe absences left" value="7" note="Across your schedule" icon={ShieldCheck} tone="amber" /></div><section className="glass-card rounded-2xl p-5 sm:p-6"><SectionHeading icon={ListChecks} title="Subject breakdown" /><div className="mt-5 grid gap-3">{subjects.map((subject) => <div data-testid={`attendance-card-${subject.id}`} key={subject.id} className="rounded-2xl border border-border p-4 transition hover:border-primary/30"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="h-10 w-1.5 rounded-full" style={{ backgroundColor: subject.color }} /><div><p className="font-extrabold">{subject.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{subject.code} · {subject.present} present / {subject.absent} absent</p></div></div><div className="text-right"><p className="text-xl font-extrabold">{subject.percentage}%</p><p className={`text-[10px] font-bold ${subject.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{subject.trend >= 0 ? '+' : ''}{subject.trend}% this month</p></div></div><div className="mt-4 progress-track h-2"><div className="progress-fill" style={{ width: `${subject.percentage}%`, backgroundColor: subject.color }} /></div></div>)}</div></section></div>;
}

function RoutinePage({ routine, openAdd }: { routine: RoutineClass[]; openAdd: () => void }) {
  const [selectedDay, setSelectedDay] = useState('Today');
  const days = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'];
  const selectedClasses = routine.filter((item) => item.day === selectedDay);
  return <div className="space-y-6"><PageIntro eyebrow="The week, in rhythm" title="Your routine, made lighter." description="Know what is next, where to be, and when your day opens up." action={<button data-testid="button-add-class" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Plus size={16} /> Add class</button>} /><div className="flex gap-2 overflow-x-auto pb-1 nav-scroll">{days.map((day, index) => <button data-testid={`routine-day-${day.toLowerCase()}`} key={day} onClick={() => setSelectedDay(day)} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold ${selectedDay === day ? 'bg-primary text-primary-foreground' : 'glass-card text-muted-foreground'}`}>{day}{index === 0 && <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">3</span>}</button>)}</div><section className="glass-card rounded-2xl p-5 sm:p-7"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">{selectedDay === 'Today' ? 'Today’s classes' : `${selectedDay}'s classes`}</h2><p className="mt-1 text-xs text-muted-foreground">{selectedClasses.length ? `${selectedClasses.length} class${selectedClasses.length === 1 ? '' : 'es'} planned` : 'A clear window in your schedule'}</p></div><span className="rounded-xl bg-emerald-100 px-3 py-1.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{selectedClasses.length ? 'On track' : 'Open'}</span></div><div className="space-y-3">{selectedClasses.length ? selectedClasses.map((item) => <RoutineRow key={item.id} item={item} />) : <EmptyState icon={CalendarDays} title="Nothing planned here" description="Add a class when you know what this window holds." action="Add a class" onClick={openAdd} />}</div><div className="mt-7 border-t border-border pt-5"><p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Coming up</p><div className="grid gap-3 sm:grid-cols-2">{routine.filter((item) => item.day !== selectedDay).slice(0, 2).map((item) => <RoutineRow key={item.id} item={item} compact />)}</div></div></section></div>;
}

function RoutineRow({ item, compact = false }: { item: RoutineClass; compact?: boolean }) {
  const status = item.status === 'completed' ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><Check size={13} /> Done</span> : item.status === 'next' ? <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">Next up</span> : <span className="text-[10px] font-semibold text-muted-foreground">{item.day}</span>;
  return <div data-testid={`routine-row-${item.id}`} className={`flex items-center gap-3 rounded-2xl border border-border p-3.5 ${item.status === 'next' ? 'border-primary/30 bg-blue-50/70 dark:bg-blue-950/20' : ''} ${compact ? 'p-3' : ''}`}><div className="flex w-14 shrink-0 flex-col text-center"><span className="text-xs font-extrabold">{item.time.split(' – ')[0]}</span><span className="mt-0.5 text-[9px] text-muted-foreground">{item.time.split(' – ')[1]}</span></div><div className="h-9 w-px bg-border" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{item.subject}</p><p className="mt-1 truncate text-xs text-muted-foreground">{item.teacher} · {item.room}</p></div>{status}</div>;
}

function StudyPage({ seconds, running, setRunning, reset, openFocus }: { seconds: number; running: boolean; setRunning: (value: boolean) => void; reset: () => void; openFocus: () => void }) {
  return <div className="space-y-6"><PageIntro eyebrow="Protect your attention" title="Study in a way that feels doable." description="Short, intentional blocks add up. Your only job is to begin." action={<button data-testid="button-start-study" onClick={openFocus} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Play size={16} /> Focus session</button>} /><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><section className="relative overflow-hidden rounded-2xl bg-[#112b4b] p-6 text-white sm:p-8"><div className="absolute -right-10 -top-14 h-48 w-48 rounded-full border-[24px] border-cyan-300/10" /><div className="relative"><div className="flex items-center gap-2 text-xs font-bold text-cyan-200"><Brain size={16} /> CURRENT FOCUS</div><h2 className="mt-6 font-mono text-6xl font-bold tracking-[-.08em] sm:text-8xl">{formatStudyTimer(seconds)}</h2><p className="mt-3 text-sm text-slate-300">{running ? 'Deep work is in progress.' : 'Ready when you are.'}</p><div className="mt-7 flex gap-2"><button data-testid="button-toggle-timer" onClick={() => setRunning(!running)} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#112b4b]">{running ? <Pause size={15} /> : <Play size={15} />}{running ? 'Pause' : 'Start timer'}</button><button data-testid="button-reset-timer" onClick={reset} className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white"><RotateCcw size={15} /> Reset</button></div></div></section><section className="glass-card rounded-2xl p-5 sm:p-7"><SectionHeading icon={BarChart3} title="Your study pulse" /><div className="mt-7 grid grid-cols-2 gap-4"><MetricCard label="This week" value="4h 25m" note="+18% from last week" icon={Clock3} tone="amber" /><MetricCard label="Sessions" value="12" note="Best streak: 4 days" icon={Flame} tone="violet" /></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs"><span className="font-bold">Weekly target</span><span className="font-mono text-muted-foreground">4.4 / 8 hrs</span></div><div className="progress-track h-2.5"><div className="progress-fill bg-accent" style={{ width: '55%' }} /></div></div></section></div><section className="glass-card rounded-2xl p-5 sm:p-7"><SectionHeading icon={Zap} title="Make the next block easy" /><div className="mt-5 grid gap-3 sm:grid-cols-3">{[['25 min', 'Quick review', 'Great for a gap between classes'], ['50 min', 'Deep work', 'One meaningful chapter'], ['90 min', 'Mock test', 'Timed practice, no distractions']].map(([time, name, detail]) => <button data-testid={`study-preset-${time.replace(' ', '-')}`} onClick={openFocus} key={time} className="rounded-2xl border border-border p-4 text-left transition hover:border-primary/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"><p className="font-mono text-lg font-bold text-primary">{time}</p><p className="mt-2 text-sm font-extrabold">{name}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p></button>)}</div></section></div>;
}

function formatStudyTimer(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }

function PyqPage({ goal, setGoal, notify }: { goal: number; setGoal: (value: number | ((value: number) => number)) => void; notify: (message: string) => void }) {
  const target = 20;
  return <div className="space-y-6"><PageIntro eyebrow="Practice with signal" title="Turn past papers into confidence." description="A small daily target, measured honestly, makes exam season quieter." action={<button data-testid="button-log-pyq" onClick={() => { setGoal((value) => value + 1); notify('One practice question logged.'); }} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Plus size={16} /> Log practice</button>} /><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><section className="rounded-2xl bg-gradient-to-br from-[#142f54] to-[#185f9d] p-6 text-white shadow-lg sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-blue-200">Today’s goal</p><p data-testid="text-pyq-progress" className="mt-5 text-6xl font-extrabold tracking-[-.08em]">{goal}<span className="text-2xl text-blue-200">/{target}</span></p><p className="mt-2 text-sm text-blue-100">questions practiced</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Target size={23} /></div></div><div className="mt-8 progress-track h-2 bg-white/20"><div className="progress-fill bg-[#ffca70]" style={{ width: `${Math.min(100, goal / target * 100)}%` }} /></div><p className="mt-3 text-xs text-blue-100">{Math.max(0, target - goal)} more to complete your daily goal.</p><button data-testid="button-increment-pyq" onClick={() => { setGoal((value) => value + 1); notify('Practice progress updated.'); }} className="mt-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#142f54]"><Check size={15} /> Count one more</button></section><section className="glass-card rounded-2xl p-5 sm:p-7"><SectionHeading icon={BarChart3} title="Performance snapshot" /><div className="mt-6 grid grid-cols-2 gap-4"><MetricCard label="Accuracy" value="74%" note="+6% this week" icon={Target} tone="green" /><MetricCard label="Questions solved" value="186" note="Across 4 subjects" icon={BookOpen} tone="blue" /></div><div className="mt-6 rounded-2xl bg-muted/70 p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/25 text-amber-700 dark:text-amber-300"><Sparkles size={17} /></div><div><p className="text-sm font-extrabold">A pattern worth revisiting</p><p className="mt-1 text-xs text-muted-foreground">You miss 1 in 4 indexing questions. Add a 15-minute review block.</p></div></div></div></section></div><section className="glass-card rounded-2xl p-5 sm:p-7"><SectionHeading icon={BookOpen} title="Practice by subject" /><div className="mt-5 grid gap-3 sm:grid-cols-2">{['Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks'].map((subject, i) => <div key={subject} className="flex items-center gap-3 rounded-2xl border border-border p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-primary dark:bg-blue-950/60"><FileText size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{subject}</p><p className="mt-1 text-xs text-muted-foreground">{[48, 41, 56, 41][i]} attempted · {[81, 69, 76, 64][i]}% accuracy</p></div><ChevronRight size={17} className="text-muted-foreground" /></div>)}</div></section></div>;
}

function NotesPage({ notes, openAdd, notify }: { notes: Note[]; openAdd: () => void; notify: (message: string) => void }) {
  return <div className="space-y-6"><PageIntro eyebrow="Your second brain" title="Notes that come back when you need them." description="Keep lecture fragments, revision cues, and exam-ready thoughts in one calm shelf." action={<button data-testid="button-create-note" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Plus size={16} /> New note</button>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{notes.map((note, index) => <article data-testid={`note-card-${note.id}`} key={note.id} className="glass-card lift rounded-2xl p-5"><div className="flex items-start justify-between"><span className={`rounded-lg px-2 py-1 text-[10px] font-extrabold ${index % 2 === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'}`}>{note.category}</span><Bookmark size={17} className="text-muted-foreground" /></div><h3 className="mt-7 text-base font-extrabold leading-snug">{note.title}</h3><p className="mt-2 text-xs text-muted-foreground">{note.subject}</p><div className="mt-6 flex items-center justify-between border-t border-border pt-3 text-[10px] font-semibold text-muted-foreground"><span>{note.updated}</span><button data-testid={`button-open-note-${note.id}`} onClick={() => notify(`Opening ${note.title}.`)} className="font-bold text-primary">Open note <ArrowRight size={12} className="ml-1 inline" /></button></div></article>)}</div>{notes.length === 0 && <EmptyState icon={NotebookPen} title="Your note shelf is clear" description="Start with the idea you want to remember." action="Create a note" onClick={openAdd} />}</div>;
}

function ExamsPage({ notify }: { notify: (message: string) => void }) {
  const exams = [{ subject: 'Data Structures', type: 'Mid-semester examination', date: 'Nov 18, 2025', days: 12, color: 'violet' }, { subject: 'Database Systems', type: 'Quiz 2', date: 'Nov 24, 2025', days: 18, color: 'blue' }, { subject: 'Operating Systems', type: 'Mid-semester examination', date: 'Dec 02, 2025', days: 26, color: 'emerald' }];
  return <div className="space-y-6"><PageIntro eyebrow="No last-minute surprises" title="Exams, with room to prepare." description="See the runway ahead and turn each deadline into a few smaller moves." action={<button data-testid="button-exam-calendar" onClick={() => notify('Calendar export is ready to connect.')} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-extrabold"><CalendarDays size={16} /> Add to calendar</button>} /><section className="glass-card rounded-2xl p-5 sm:p-7"><SectionHeading icon={GraduationCap} title="Upcoming assessments" /><div className="mt-5 space-y-3">{exams.map((exam) => <div data-testid={`exam-card-${exam.subject.toLowerCase().replaceAll(' ', '-')}`} key={exam.subject} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border p-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${exam.color === 'violet' ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300' : exam.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}><GraduationCap size={21} /></div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{exam.subject}</p><p className="mt-1 text-xs text-muted-foreground">{exam.type} · {exam.date}</p></div><div className="text-right"><p className="text-lg font-extrabold">{exam.days}</p><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">days left</p></div><button data-testid={`button-plan-${exam.subject.toLowerCase().replaceAll(' ', '-')}`} onClick={() => notify(`Prep plan opened for ${exam.subject}.`)} className="flex items-center gap-1 text-xs font-bold text-primary">Plan <ArrowRight size={14} /></button></div>)}</div></section></div>;
}

function CommunityPage({ posts, toggleLike, notify }: { posts: Post[]; toggleLike: (id: string) => void; notify: (message: string) => void }) {
  const [filter, setFilter] = useState('For you');
  return <div className="space-y-6"><PageIntro eyebrow="Campus, together" title="A useful corner of campus." description="Ask, share, and find the people making the semester a little easier." action={<button data-testid="button-new-post" onClick={() => notify('Post composer is ready for your next thought.')} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Plus size={16} /> New post</button>} /><div className="flex gap-2 overflow-x-auto pb-1 nav-scroll">{['For you', 'Study groups', 'Resources', 'Campus life'].map((item) => <button data-testid={`community-filter-${item.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setFilter(item)} key={item} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold ${filter === item ? 'bg-primary text-primary-foreground' : 'glass-card text-muted-foreground'}`}>{item}</button>)}</div><div className="grid gap-4 lg:max-w-3xl">{posts.filter((post) => filter === 'For you' || post.category === filter).map((post) => <article data-testid={`post-card-${post.id}`} key={post.id} className="glass-card rounded-2xl p-5 sm:p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xs font-extrabold text-primary dark:bg-blue-950 dark:text-blue-300">{post.initials}</div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{post.author}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{post.category} · {post.time}</p></div><button data-testid={`button-post-menu-${post.id}`} onClick={() => notify('Post actions are ready.')} className="text-muted-foreground"><MoreHorizontal size={18} /></button></div><p className="mt-5 text-sm leading-7">{post.body}</p><div className="mt-5 flex items-center gap-5 border-t border-border pt-4 text-xs font-semibold text-muted-foreground"><button data-testid={`button-like-post-${post.id}`} onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 transition ${post.liked ? 'text-rose-500' : 'hover:text-rose-500'}`}><Heart size={16} fill={post.liked ? 'currentColor' : 'none'} /> {post.likes}</button><button data-testid={`button-reply-post-${post.id}`} onClick={() => notify('Reply composer is ready.')} className="flex items-center gap-1.5 hover:text-primary"><MessageCircle size={16} /> {post.replies} replies</button><button data-testid={`button-save-post-${post.id}`} onClick={() => notify('Post saved to your shelf.')} className="ml-auto hover:text-primary"><Bookmark size={16} /></button></div></article>)}</div>{posts.filter((post) => filter === 'For you' || post.category === filter).length === 0 && <EmptyState icon={Users} title="No posts in this lane yet" description="Try another campus topic or start the conversation." action="Create a post" onClick={() => notify('Post composer is ready for your next thought.')} />}</div>;
}

function AssistantPage({ notify }: { notify: (message: string) => void }) {
  const prompts = ['What can I safely skip this week?', 'Make a 7-day OS revision plan', 'Find my weakest subject'];
  return <div className="space-y-6"><PageIntro eyebrow="A thinking partner" title="Ask AttendX anything about your semester." description="A calm, practical starting point when the plan feels bigger than the day." action={<button data-testid="button-ai-new-chat" onClick={() => notify('New conversation ready.')} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-extrabold"><Sparkles size={16} /> New chat</button>} /><section className="glass-card max-w-3xl rounded-2xl p-5 sm:p-8"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Sparkles size={21} /></div><div><p className="text-sm font-extrabold">Hi Aarav, what are we making easier today?</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">I can use your routine, attendance, and goals to make a grounded plan.</p></div></div><div className="mt-7 space-y-2.5">{prompts.map((prompt) => <button data-testid={`button-ai-prompt-${prompt.slice(0, 8).replaceAll(' ', '-')}`} onClick={() => notify('That plan is coming together.')} key={prompt} className="flex w-full items-center justify-between rounded-xl border border-border p-3.5 text-left text-xs font-bold transition hover:border-primary/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"><span>{prompt}</span><ArrowRight size={15} className="text-primary" /></button>)}</div><div className="mt-6 flex items-center gap-2 rounded-xl border border-border px-3 py-2"><input data-testid="input-ai-message" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" placeholder="Ask about your semester..." /><button data-testid="button-send-ai" onClick={() => notify('Message noted. Your study context is ready.')} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Send size={16} /></button></div></section></div>;
}

function ProfilePage({ navigate }: { navigate: (page: Page) => void }) {
  return <div className="space-y-6"><PageIntro eyebrow="Your campus identity" title="Aarav, keep your semester yours." description="Your profile helps AttendX make every view feel relevant." action={<button data-testid="button-edit-profile" onClick={() => navigate('settings')} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-extrabold"><SlidersHorizontal size={16} /> Edit profile</button>} /><section className="glass-card flex flex-col gap-5 rounded-2xl p-5 sm:flex-row sm:items-center sm:p-7"><div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-primary to-cyan-400 text-2xl font-extrabold text-white shadow-lg shadow-blue-900/15">AK</div><div className="flex-1"><p className="text-2xl font-extrabold tracking-tight">Aarav Kapoor</p><p className="mt-1 text-sm text-muted-foreground">B.Tech Computer Science · Semester 5</p><p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><MapPin size={13} /> Vellore Institute of Technology</p></div><div className="rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/20"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Semester pulse</p><p className="mt-1 text-lg font-extrabold text-emerald-800 dark:text-emerald-200">On track</p></div></section><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Attendance" value="82%" note="Healthy rhythm" icon={CheckCircle2} tone="green" /><MetricCard label="Focus time" value="18.4h" note="This semester" icon={Timer} tone="amber" /><MetricCard label="PYQs solved" value="186" note="Keep building" icon={Trophy} tone="violet" /></div></div>;
}

function SettingsPage({ dark, setDark, locationOn, setLocationOn, notify }: { dark: boolean; setDark: (value: boolean) => void; locationOn: boolean; setLocationOn: (value: boolean) => void; notify: (message: string) => void }) {
  const setLocation = () => { setLocationOn(!locationOn); notify(locationOn ? 'Location verification turned off.' : 'Location verification is on.'); };
  return <div className="space-y-6"><PageIntro eyebrow="Make it yours" title="Settings that stay out of your way." description="A few quiet controls for how AttendX fits into your day." /><section className="glass-card divide-y divide-border rounded-2xl p-2 sm:max-w-3xl"><SettingRow icon={dark ? Moon : Sun} title="Appearance" description={dark ? 'Dark mode is on' : 'Light mode is on'} control={<Toggle data-testid="toggle-theme" checked={dark} onClick={() => setDark(!dark)} />} /><SettingRow icon={MapPin} title="Location verification" description={locationOn ? 'Confirm attendance near your campus' : 'Attendance will be confirmed manually'} control={<Toggle data-testid="toggle-location" checked={locationOn} onClick={setLocation} />} /><SettingRow icon={Bell} title="Smart reminders" description="Upcoming classes and study nudges" control={<Toggle data-testid="toggle-reminders" checked onClick={() => notify('Smart reminders are enabled.')} />} /><SettingRow icon={LockKeyhole} title="Privacy" description="Your data is stored on this device" control={<ChevronRight size={18} className="text-muted-foreground" />} /></section><section className="glass-card rounded-2xl p-5 sm:max-w-3xl"><div className="flex items-start gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-primary dark:bg-blue-950/60"><ShieldCheck size={17} /></div><div><p className="text-sm font-extrabold">Local-first by design</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">AttendX keeps your routine, notes, and progress on this device. No account or server is needed for this demo.</p></div></div></section></div>;
}

function DevelopersPage({ developers, onSelect }: { developers: Developer[]; onSelect: (developer: Developer) => void }) {
  const activeDevelopers = developers.filter((developer) => developer.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  return <div className="space-y-6">
    <PageIntro eyebrow="The people behind AttendX" title="Meet the Developers" description="Built by students, for students." />
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e4c92] via-[#147bd3] to-[#45b8de] p-5 text-white shadow-xl shadow-blue-900/10 sm:p-7">
      <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full border-[22px] border-white/10" />
      <div className="relative max-w-2xl"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.18em] text-blue-100"><Users size={14} /> Team AttendX</div><h2 className="text-2xl font-extrabold tracking-[-.04em] sm:text-3xl">A student-built space for better semesters.</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-50/85">Meet the people shaping a simpler way to attend, study, prepare, and achieve.</p></div>
    </section>
    {activeDevelopers.length ? <div className="grid gap-5 sm:grid-cols-2">{activeDevelopers.map((developer) => <DeveloperCard key={developer.id} developer={developer} onSelect={onSelect} />)}</div> : <EmptyState icon={Users} title="Team profiles are taking shape" description="Developer profiles will appear here once they are published." action="Open admin panel" onClick={() => window.location.hash = 'admin'} />}
  </div>;
}

function DeveloperCard({ developer, onSelect }: { developer: Developer; onSelect: (developer: Developer) => void }) {
  return <article data-testid={`developer-card-${developer.id}`} role="button" tabIndex={0} onClick={() => onSelect(developer)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(developer); }} className="glass-card lift group cursor-pointer overflow-hidden rounded-[24px] transition-transform active:scale-[.99]">
    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 dark:from-blue-950/60 dark:via-slate-900 dark:to-cyan-950/40">
      {developer.photoUrl ? <img src={developer.photoUrl} alt={`${developer.name} profile`} className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]" /> : <DeveloperPlaceholder name={developer.name} />}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-white backdrop-blur">{developer.role}</span>
    </div>
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-extrabold tracking-[-.03em]">{developer.name}</h3><p className="mt-1 text-sm font-semibold text-primary">{developer.role}</p></div><ChevronRight size={18} className="mt-1 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div>
      <div className="mt-5 space-y-2 text-xs text-muted-foreground"><p className="flex items-center gap-2"><GraduationCap size={14} className="text-primary" />{developer.college}</p><p className="flex items-center gap-2"><BookOpen size={14} className="text-primary" />{developer.branch} <span className="text-border">•</span> {developer.batch}</p></div>
      {developer.linkedinUrl && <a data-testid={`developer-linkedin-${developer.id}`} href={developer.linkedinUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#07579f]"><ExternalLink size={14} /> LinkedIn</a>}
    </div>
  </article>;
}

function DeveloperPlaceholder({ name }: { name: string }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_25%,hsl(200_85%_78%/.8),transparent_38%),linear-gradient(145deg,hsl(215_70%_93%),hsl(196_80%_83%))] text-primary dark:bg-[radial-gradient(circle_at_50%_25%,hsl(200_75%_32%/.55),transparent_38%),linear-gradient(145deg,hsl(221_45%_18%),hsl(205_55%_24%))]"><div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/70 bg-white/60 text-2xl font-extrabold shadow-xl dark:border-white/10 dark:bg-white/10">{initials}</div><p className="mt-4 text-xs font-bold uppercase tracking-[.16em] text-primary/70 dark:text-cyan-200/70">Photo pending</p></div>;
}

function DeveloperDetailModal({ developer, onClose }: { developer: Developer; onClose: () => void }) {
  return <ModalFrame title="Developer profile" subtitle="The people building your campus companion." onClose={onClose}>
    <div className="overflow-hidden rounded-2xl border border-border bg-muted/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">{developer.photoUrl ? <img src={developer.photoUrl} alt={`${developer.name} profile`} className="h-full w-full object-cover object-center" /> : <DeveloperPlaceholder name={developer.name} />}</div>
      <div className="p-5 sm:p-6"><p className="text-2xl font-extrabold tracking-[-.04em]">{developer.name}</p><p className="mt-1 text-sm font-bold text-primary">{developer.role}</p><div className="mt-5 grid gap-3 text-sm"><div className="flex items-center gap-3"><GraduationCap size={16} className="text-primary" /><span><span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">College</span>{developer.college}</span></div><div className="flex items-center gap-3"><BookOpen size={16} className="text-primary" /><span><span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Branch · Batch</span>{developer.branch} · {developer.batch}</span></div></div>{developer.linkedinUrl && <a data-testid={`detail-linkedin-${developer.id}`} href={developer.linkedinUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#07579f]"><ExternalLink size={15} /> Open LinkedIn profile</a>}</div>
    </div>
  </ModalFrame>;
}

function DeveloperAdminPage({ developers, updateDeveloper, handlePhoto, removeDeveloper, openAdd, notify }: { developers: Developer[]; updateDeveloper: (id: string, patch: Partial<Developer>) => void; handlePhoto: (id: string, file: File | undefined) => void; removeDeveloper: (id: string) => void; openAdd: () => void; notify: (message: string) => void }) {
  const ordered = [...developers].sort((a, b) => a.displayOrder - b.displayOrder);
  return <div className="space-y-6">
    <PageIntro eyebrow="Content controls" title="Developer Management" description="Keep the AttendX team profiles accurate, polished, and ready to publish." action={<button data-testid="button-add-developer" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><UserPlus size={16} /> Add developer</button>} />
    <section className="glass-card rounded-2xl border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 sm:p-5"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-primary dark:bg-blue-950/70"><ShieldCheck size={17} /></div><div><p className="text-sm font-extrabold">Separate profile media</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Each developer has an independent photo field. Replacing one profile image never changes another developer’s image.</p></div></div></section>
    <div className="space-y-4">{ordered.map((developer) => <DeveloperAdminCard key={developer.id} developer={developer} updateDeveloper={updateDeveloper} handlePhoto={handlePhoto} removeDeveloper={removeDeveloper} notify={notify} />)}</div>
    {!ordered.length && <EmptyState icon={Users} title="No developer profiles yet" description="Add the first profile to publish it on the Developers page." action="Add developer" onClick={openAdd} />}
  </div>;
}

function AdminLoadingState() {
  return <div className="glass-card flex min-h-64 items-center justify-center rounded-2xl p-8 text-center"><div><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /><p className="mt-4 text-sm font-bold">Checking your access…</p></div></div>;
}

function AdminAccessWall({ onSignIn }: { onSignIn: () => void }) {
  return <div className="glass-card relative overflow-hidden rounded-[26px] p-6 sm:p-10"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[30px] border-primary/10" /><div className="relative max-w-xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-primary dark:bg-blue-950/60"><LockKeyhole size={22} /></div><p className="mt-6 text-[11px] font-bold uppercase tracking-[.17em] text-primary">Protected workspace</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-.045em] sm:text-4xl">Sign in to manage developers.</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">Developer Management is restricted to signed-in AttendX team members. Public developer profiles remain available without an account.</p><button data-testid="button-admin-sign-in" onClick={onSignIn} className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground"><LockKeyhole size={15} /> Sign in to continue</button></div></div>;
}

function DeveloperAdminCard({ developer, updateDeveloper, handlePhoto, removeDeveloper, notify }: { developer: Developer; updateDeveloper: (id: string, patch: Partial<Developer>) => void; handlePhoto: (id: string, file: File | undefined) => void; removeDeveloper: (id: string) => void; notify: (message: string) => void }) {
  const field = (key: keyof Developer, value: string) => updateDeveloper(developer.id, { [key]: value } as Partial<Developer>);
  return <section data-testid={`admin-developer-${developer.id}`} className="glass-card rounded-2xl p-4 sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${developer.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} /><div><p className="text-sm font-extrabold">{developer.name || 'Unnamed developer'}</p><p className="text-[11px] text-muted-foreground">{developer.isActive ? 'Published on Developers page' : 'Hidden from public page'}</p></div></div><div className="flex items-center gap-2"><label className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[11px] font-bold"><span>Order</span><input aria-label={`${developer.name} display order`} type="number" min="1" value={developer.displayOrder} onChange={(event) => updateDeveloper(developer.id, { displayOrder: Math.max(1, Number(event.target.value) || 1) })} className="w-10 bg-transparent text-center outline-none" /></label><button data-testid={`button-toggle-developer-${developer.id}`} onClick={() => updateDeveloper(developer.id, { isActive: !developer.isActive })} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[11px] font-bold">{developer.isActive ? <Eye size={14} /> : <EyeOff size={14} />}{developer.isActive ? 'Visible' : 'Hidden'}</button><button data-testid={`button-delete-developer-${developer.id}`} onClick={() => removeDeveloper(developer.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-950 dark:hover:bg-rose-950/30"><Trash2 size={15} /></button></div></div>
    <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
      <div><div className="aspect-square overflow-hidden rounded-2xl bg-muted">{developer.photoUrl ? <img src={developer.photoUrl} alt="" className="h-full w-full object-cover object-center" /> : <DeveloperPlaceholder name={developer.name || 'Developer'} />}</div><label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-extrabold transition hover:border-primary/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"><Upload size={14} /> {developer.photoUrl ? 'Replace photo' : 'Upload photo'}<input data-testid={`input-photo-${developer.id}`} type="file" accept="image/*" onChange={(event) => handlePhoto(developer.id, event.target.files?.[0])} className="sr-only" /></label>{developer.photoUrl && <button data-testid={`button-remove-photo-${developer.id}`} onClick={() => { updateDeveloper(developer.id, { photoUrl: '' }); notify('Developer photo removed.'); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold text-muted-foreground hover:bg-muted"><Trash2 size={13} /> Remove photo</button>}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Name" value={developer.name} onChange={(value) => field('name', value)} />
        <AdminField label="Role" value={developer.role} onChange={(value) => field('role', value)} />
        <AdminField label="College" value={developer.college} onChange={(value) => field('college', value)} />
        <AdminField label="Branch" value={developer.branch} onChange={(value) => field('branch', value)} />
        <AdminField label="Batch" value={developer.batch} onChange={(value) => field('batch', value)} />
        <AdminField label="LinkedIn URL (optional)" value={developer.linkedinUrl} onChange={(value) => field('linkedinUrl', value)} placeholder="https://linkedin.com/in/..." />
        <div className="sm:col-span-2 flex justify-end border-t border-border pt-4"><button data-testid={`button-save-developer-${developer.id}`} onClick={() => notify(`${developer.name || 'Developer'} profile saved.`)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"><Check size={15} /> Save changes</button></div>
      </div>
    </div>
  </section>;
}

function AdminField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary" /></label>;
}

function DeveloperForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2"><AdminFormField name="name" label="Name" placeholder="Full name" required /><AdminFormField name="role" label="Role" placeholder="Developer" defaultValue="Developer" required /><AdminFormField name="college" label="College" placeholder="GEC Buxar" required /><AdminFormField name="branch" label="Branch" placeholder="ECE" required /><AdminFormField name="batch" label="Batch" placeholder="2025–2029" required /><AdminFormField name="linkedinUrl" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/in/..." /></div>
    <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground"><div className="flex items-center gap-2 font-bold text-foreground"><ImagePlus size={15} className="text-primary" /> Photo upload</div><p className="mt-1">You can add or replace this developer’s photo from the management card after creating the profile.</p></div>
    <button data-testid="button-create-developer" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground"><UserPlus size={16} /> Add developer</button>
  </form>;
}

function AdminFormField({ name, label, placeholder, defaultValue, required = false }: { name: string; label: string; placeholder: string; defaultValue?: string; required?: boolean }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span><input name={name} required={required} defaultValue={defaultValue} placeholder={placeholder} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>;
}

function SettingRow({ icon: Icon, title, description, control }: { icon: LucideIcon; title: string; description: string; control: ReactNode }) {
  return <div className="flex items-center gap-3 p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{control}</div>;
}

function Toggle({ checked, onClick, ...props }: { checked: boolean; onClick: () => void; 'data-testid'?: string }) {
  return <button {...props} role="switch" aria-checked={checked} onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></button>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.17em] text-primary">{eyebrow}</p><h2 className="mt-2 max-w-2xl text-2xl font-extrabold tracking-[-.045em] sm:text-4xl">{title}</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p></div>{action && <div className="shrink-0">{action}</div>}</div>;
}

function MetricCard({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: LucideIcon; tone: 'blue' | 'green' | 'amber' | 'violet' }) {
  const colors = { blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300', green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' };
  return <div data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`} className="glass-card rounded-2xl p-4"><div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${colors[tone]}`}><Icon size={17} /></div><p className="text-xl font-extrabold tracking-tight">{value}</p><p className="mt-1 text-xs font-bold">{label}</p><p className="mt-1 text-[10px] text-muted-foreground">{note}</p></div>;
}

function ModalFrame({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"><div className="animate-rise max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[26px] bg-card p-5 shadow-2xl sm:rounded-[26px] sm:p-7"><div className="mb-6 flex items-start justify-between"><div><h2 className="text-xl font-extrabold tracking-tight">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><button data-testid="button-close-modal" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"><X size={18} /></button></div>{children}</div></div>;
}

function AttendanceModal({ subjects, onClose, onMark }: { subjects: Subject[]; onClose: () => void; onMark: (subjectId: string, status: AttendanceStatus) => void }) {
  const [selected, setSelected] = useState(subjects[0]?.id || '');
  return <ModalFrame title="Mark attendance" subtitle="Choose the class and what happened today." onClose={onClose}><div className="space-y-2">{subjects.map((subject) => <button data-testid={`select-attendance-${subject.id}`} key={subject.id} onClick={() => setSelected(subject.id)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${selected === subject.id ? 'border-primary bg-blue-50 dark:bg-blue-950/20' : 'border-border'}`}><span><span className="block text-sm font-extrabold">{subject.name}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">{subject.percentage}% attendance</span></span>{selected === subject.id && <CheckCircle2 size={18} className="text-primary" />}</button>)}</div><div className="mt-6 grid grid-cols-3 gap-2"><button data-testid="attendance-present" onClick={() => onMark(selected, 'present')} className="flex flex-col items-center gap-1 rounded-xl bg-emerald-100 px-2 py-3 text-xs font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check size={18} />Present</button><button data-testid="attendance-absent" onClick={() => onMark(selected, 'absent')} className="flex flex-col items-center gap-1 rounded-xl bg-rose-100 px-2 py-3 text-xs font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300"><X size={18} />Absent</button><button data-testid="attendance-holiday" onClick={() => onMark(selected, 'holiday')} className="flex flex-col items-center gap-1 rounded-xl bg-amber-100 px-2 py-3 text-xs font-extrabold text-amber-700 dark:bg-amber-950 dark:text-amber-300"><Coffee size={18} />Holiday</button></div></ModalFrame>;
}

function ClassForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="space-y-4">{[['subject', 'Subject', 'Data Structures'], ['teacher', 'Teacher', 'Faculty name'], ['room', 'Room', 'Block and room'], ['time', 'Time', '16:00 – 17:00']].map(([name, label, placeholder]) => <label key={name} className="block"><span className="mb-1.5 block text-xs font-bold">{label}</span><input data-testid={`input-class-${name}`} required name={name} placeholder={placeholder} className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>)}<label className="block"><span className="mb-1.5 block text-xs font-bold">Day</span><select data-testid="select-class-day" name="day" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></label><button data-testid="button-save-class" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground"><Plus size={17} /> Add to routine</button></form>;
}

function NoteForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <form onSubmit={onSubmit} className="space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold">Title</span><input data-testid="input-note-title" required name="title" placeholder="e.g. TCP handshake — three steps" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold">Subject</span><input data-testid="input-note-subject" required name="subject" placeholder="Data Structures" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-1.5 block text-xs font-bold">Category</span><select data-testid="select-note-category" name="category" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"><option>Lecture</option><option>Revision</option><option>Exam prep</option><option>Idea</option></select></label><label><span className="mb-1.5 block text-xs font-bold">Color</span><select data-testid="select-note-color" className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"><option>Blue</option><option>Violet</option><option>Amber</option></select></label></div><button data-testid="button-save-note" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground"><NotebookPen size={17} /> Save note</button></form>;
}

function FocusDialog({ seconds, running, setRunning, reset, onClose }: { seconds: number; running: boolean; setRunning: (value: boolean) => void; reset: () => void; onClose: () => void }) {
  return <div className="text-center"><div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border-[11px] border-primary/15 bg-blue-50 dark:bg-blue-950/30"><div><p data-testid="text-focus-dialog-timer" className="font-mono text-4xl font-bold tracking-[-.08em]">{formatStudyTimer(seconds)}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{running ? 'In focus' : 'Paused'}</p></div></div><div className="mt-7 flex justify-center gap-2"><button data-testid="button-focus-toggle-dialog" onClick={() => setRunning(!running)} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground">{running ? <Pause size={16} /> : <Play size={16} />}{running ? 'Pause' : 'Start focus'}</button><button data-testid="button-focus-reset-dialog" onClick={reset} className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-bold"><RotateCcw size={15} /> Reset</button></div><button data-testid="button-focus-done" onClick={onClose} className="mt-5 text-xs font-bold text-muted-foreground hover:text-primary">Keep this session in my study log</button></div>;
}

function MorePanel({ page, navigate, onClose, isSignedIn, onSignIn, onSignOut }: { page: Page; navigate: (page: Page) => void; onClose: () => void; isSignedIn: boolean; onSignIn: () => void; onSignOut: () => void }) {
  const pages: Page[] = ['routine', 'notes', 'exams', 'community', 'assistant', 'developers', 'admin', 'settings'];
  return <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/35 backdrop-blur-sm sm:hidden"><div className="w-full rounded-t-[26px] bg-card p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-extrabold">More of AttendX</h2><p className="mt-1 text-xs text-muted-foreground">Everything else, still one tap away.</p></div><button data-testid="button-close-more" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"><X size={18} /></button></div><div className="grid grid-cols-2 gap-2">{pages.map((item) => <button data-testid={`more-nav-${item}`} onClick={() => navigate(item)} key={item} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold ${page === item ? 'border-primary bg-blue-50 text-primary dark:bg-blue-950/30' : 'border-border'}`}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><MoreIcon page={item} /></span>{pageMeta[item].label}</button>)}</div><div className="mt-4 border-t border-border pt-4">{isSignedIn ? <button data-testid="button-sign-out" onClick={onSignOut} className="flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-xs font-extrabold text-muted-foreground">Sign out</button> : <button data-testid="button-sign-in-more" onClick={onSignIn} className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground">Sign in to manage developers</button>}</div></div></div>;
}

function MoreIcon({ page }: { page: Page }) { const Icon = pageMeta[page].icon; return <Icon size={16} />; }

function EmptyState({ icon: Icon, title, description, action, onClick }: { icon: LucideIcon; title: string; description: string; action: string; onClick: () => void }) {
  return <div className="glass-card rounded-2xl p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-primary dark:bg-blue-950/60"><Icon size={22} /></div><h3 className="mt-4 text-base font-extrabold">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p><button data-testid="button-empty-state" onClick={onClick} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground">{action}</button></div>;
}

export default App;