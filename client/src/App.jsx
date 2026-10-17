function Masthead() {
  const [user, logout] = useAuth();

  return (
    <header className="masthead">
      <Link className="wordmark" to={user ? '/letters' : '/login'}>Postmarked</Link>

      </nav>
    </header>
  );
};

export default function App() {
  return (
    <div className="shell">
      <Masthead />
      <Routes>
        <Route path="/" ></Route>
      </Routes>
    </div>
  )
}