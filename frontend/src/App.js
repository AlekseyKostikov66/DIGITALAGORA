import React, { useState, useEffect } from 'react';
import './App.css';
import { register, login, setAuthToken, getAuthToken } from './api';
import CreateProposal from './components/CreateProposal';
import ProposalList from './components/ProposalList';
import VoteButton from './components/VoteButton';
import ContractorFinder from './components/ContractorFinder';
import VisualizationViewer from './components/VisualizationViewer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Форма регистрации (расширенная)
  const [regLastName, setRegLastName] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regPatronymic, setRegPatronymic] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regResidence, setRegResidence] = useState('');
  const [regWallet, setRegWallet] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Форма входа
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Проверка JWT токена при загрузке
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ name: `${payload.lastName} ${payload.firstName}`, email: payload.email });
        setIsAuthenticated(true);
      } catch(e) {
        setAuthToken(null);
      }
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const data = await register({
        lastName: regLastName,
        firstName: regFirstName,
        patronymic: regPatronymic,
        birthDate: regBirthDate,
        residence: regResidence,
        walletAddress: regWallet,
        email: regEmail,
        password: regPassword
      });
      setAuthToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setMessage({ text: 'Регистрация успешна! Добро пожаловать.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const data = await login({ email: loginEmail, password: loginPassword });
      setAuthToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setMessage({ text: 'Вход выполнен', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setShowLogin(false);
    // Очистка форм
    setRegLastName(''); setRegFirstName(''); setRegPatronymic('');
    setRegBirthDate(''); setRegResidence(''); setRegWallet('');
    setRegEmail(''); setRegPassword('');
    setLoginEmail(''); setLoginPassword('');
  };

  if (isAuthenticated) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>ЦИФРОВАЯ АГОРА</h1>
          <div>
            <span>Привет, {user?.name} | </span>
            <button onClick={handleLogout}>Выйти</button>
          </div>
        </header>
        <main className="app-main">
          <p className="thesis">
            ЦИФРОВАЯ АГОРА — платформа Законотворческой Деятельности 24/7<br/>
            <strong>Народное самодержавие</strong>
          </p>
          <CreateProposal />
          <ProposalList />
          <VoteButton />
          <ContractorFinder />
          <VisualizationViewer />
        </main>
        <footer className="app-footer">
          <p>ГАО "ИИСУС ХРИСТОС" — Компромисс Добра со злом! И волки сыты, и овечки целы!</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">ЦИФРОВАЯ АГОРА</h1>
      <p className="auth-thesis">
        ЦИФРОВАЯ АГОРА является платформой для Законотворческой Деятельности каждого человека<br/>
        в режиме реального времени 24/7, что является краеугольным камнем <strong>НАРОДНОГО САМОДЕРЖАВИЯ</strong>.
      </p>

      {!showLogin ? (
        <form onSubmit={handleRegister} className="compact-form">
          <h2>Регистрация акционера</h2>
          <input type="text" placeholder="Фамилия" value={regLastName} onChange={e => setRegLastName(e.target.value)} required />
          <input type="text" placeholder="Имя" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} required />
          <input type="text" placeholder="Отчество" value={regPatronymic} onChange={e => setRegPatronymic(e.target.value)} />
          <input type="date" placeholder="Дата рождения" value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} required />
          <input type="text" placeholder="Место жительства" value={regResidence} onChange={e => setRegResidence(e.target.value)} required />
          <input type="text" placeholder="Номер кошелька (обязательно)" value={regWallet} onChange={e => setRegWallet(e.target.value)} required />
          <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Регистрация...' : 'Зарегистрироваться'}</button>
          {message.text && <p className={message.type === 'error' ? 'error' : 'success'}>{message.text}</p>}
          <p>Уже есть аккаунт? <button type="button" className="link-btn" onClick={() => { setShowLogin(true); setMessage({ text: '', type: '' }); }}>Войти</button></p>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="compact-form">
          <h2>Вход для акционеров</h2>
          <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
          <input type="password" placeholder="Пароль" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
          {message.text && <p className={message.type === 'error' ? 'error' : 'success'}>{message.text}</p>}
          <p>Нет аккаунта? <button type="button" className="link-btn" onClick={() => { setShowLogin(false); setMessage({ text: '', type: '' }); }}>Зарегистрироваться</button></p>
        </form>
      )}

      <footer className="auth-footer">
        <p>ГАО "ИИСУС ХРИСТОС" — Компромисс Добра со злом! И волки сыты, и овечки целы!</p>
      </footer>
    </div>
  );
}

export default App;