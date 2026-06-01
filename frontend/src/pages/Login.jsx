import React, { useState } from 'react';
import axios from 'axios';

/**
 * [React Page - Login]
 * 
 * - 사용자 아이디와 비밀번호를 입력받아 로그인을 수행하는 페이지입니다.
 * - 로그인 성공 시, 부모 컴포넌트(App.jsx)에 유저 상태를 전달하여 로그인 상태를 유지하도록 돕습니다.
 */
function Login({ onLoginSuccess, setCurrentPage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setToast({ type: 'error', message: '아이디와 비밀번호를 모두 입력해주세요.' });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      // POST http://localhost:8080/api/users/login 호출
      const response = await axios.post('http://localhost:8080/api/users/login', {
        username: username.trim(),
        password: password.trim()
      });

      setToast({ type: 'success', message: '로그인에 성공했습니다!' });
      
      // 약간의 딜레이를 주어 로그인이 완료되었음을 시각적으로 보여준 후 페이지 전환
      setTimeout(() => {
        onLoginSuccess(response.data); // 부모 컴포넌트에 유저 정보 저장
      }, 500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || '로그인 중 에러가 발생했습니다.';
      setToast({ type: 'error', message: `❌ ${errorMsg}` });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '420px', margin: '4rem auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0' }}>로그인</h1>
        <p className="sub-text" style={{ margin: 0, fontSize: '0.95rem' }}>선착순 쿠폰 시스템에 오신 것을 환영합니다.</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className={shake && !username.trim() ? 'shake-animation' : ''}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>아이디</label>
          <input
            type="text"
            placeholder="아이디를 입력하세요 (예: user)"
            className="custom-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={shake && !password.trim() ? 'shake-animation' : ''}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요 (예: 1234)"
            className="custom-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className="glow-button" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? '로그인 처리 중...' : '로그인'}
        </button>
      </form>

      {/* 회원가입 페이지 유도 */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        아직 계정이 없으신가요?{' '}
        <span 
          onClick={() => setCurrentPage('signup')} 
          style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
        >
          회원가입하기
        </span>
      </div>

      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default Login;
