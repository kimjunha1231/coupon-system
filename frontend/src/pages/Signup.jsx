import React, { useState } from 'react';
import axios from 'axios';

/**
 * [React Page - Signup]
 * 
 * - 새로운 사용자 계정을 등록하는 페이지입니다.
 * - 아이디, 비밀번호와 함께 회원 권한(일반 사용자 / 관리자)을 선택할 수 있도록 구현되어 있습니다.
 */
function Signup({ setCurrentPage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setToast({ type: 'error', message: '모든 필드를 입력해 주세요.' });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      // POST http://localhost:8080/api/users/signup 호출
      await axios.post('http://localhost:8080/api/users/signup', {
        username: username.trim(),
        password: password.trim(),
        role: role
      });

      setToast({ type: 'success', message: '🎉 회원가입에 성공했습니다! 로그인 페이지로 이동합니다...' });
      
      // 1.5초 후 로그인 페이지로 전환
      setTimeout(() => {
        setCurrentPage('login');
      }, 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || '회원가입 중 에러가 발생했습니다.';
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
        <h1 className="gradient-text" style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0' }}>회원가입</h1>
        <p className="sub-text" style={{ margin: 0, fontSize: '0.95rem' }}>선착순 쿠폰 시스템의 계정을 생성합니다.</p>
      </div>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className={shake && !username.trim() ? 'shake-animation' : ''}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>아이디</label>
          <input
            type="text"
            placeholder="새로운 아이디를 입력하세요"
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
            placeholder="비밀번호를 입력하세요"
            className="custom-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 권한 등급 선택 (ADMIN/USER) */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>가입 권한</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.8rem',
              borderRadius: '12px',
              border: `1px solid ${role === 'USER' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}`,
              background: role === 'USER' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="role"
                value="USER"
                checked={role === 'USER'}
                onChange={() => setRole('USER')}
                style={{ display: 'none' }}
              />
              일반 사용자 (USER)
            </label>
            <label style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.8rem',
              borderRadius: '12px',
              border: `1px solid ${role === 'ADMIN' ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}`,
              background: role === 'ADMIN' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="role"
                value="ADMIN"
                checked={role === 'ADMIN'}
                onChange={() => setRole('ADMIN')}
                style={{ display: 'none' }}
              />
              관리자 (ADMIN)
            </label>
          </div>
        </div>

        <button type="submit" className="glow-button" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? '가입 처리 중...' : '회원가입'}
        </button>
      </form>

      {/* 로그인 페이지 유도 */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        이미 계정이 있으신가요?{' '}
        <span 
          onClick={() => setCurrentPage('login')} 
          style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
        >
          로그인하기
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

export default Signup;
