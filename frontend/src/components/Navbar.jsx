import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * [React Component - Navbar]
 * 
 * - 화면 상단에 고정되어 있는 네비게이션 헤더입니다.
 * - 로그인 정보(사용자 이름, 권한)를 보여주고 로그아웃 기능을 제공합니다.
 * - 로그인한 사용자의 권한(ADMIN / USER)에 따라 관리자 페이지 또는 쿠폰 목록 페이지로 이동할 수 있는 탭을 노출합니다.
 */
function Navbar({ user, onLogout }) {
  // [React Router - useNavigate]
  // - 프로그래밍 방식으로 페이지를 이동시키기 위해 사용하는 훅입니다. (예: 버튼 클릭 시 특정 URL로 주소 변경 및 화면 전환)
  const navigate = useNavigate();

  // [React Router - useLocation]
  // - 현재 브라우저의 URL 주소 정보가 담긴 객체를 반환합니다. (location.pathname 등을 확인하여 현재 어떤 메뉴에 위치해 있는지 판단할 때 활용)
  const location = useLocation();

  // 로그아웃 버튼을 눌렀을 때 실행될 핸들러
  const handleLogoutClick = () => {
    onLogout();         // 1. App 컴포넌트의 user 상태 초기화 (로그아웃 처리)
    navigate('/login'); // 2. 로그인 화면(/login)으로 주소 변경 이동
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'rgba(30, 41, 59, 0.45)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      marginBottom: '2rem'
    }}>
      {/* 
        로고 / 타이틀 영역
        - 클릭 시 로그인 상태에 따라 대시보드(/coupons) 또는 로그인창(/login)으로 이동시킵니다.
      */}
      <div 
        onClick={() => navigate(user ? '/coupons' : '/login')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <span style={{ fontSize: '1.5rem' }}>🎟️</span>
        <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>FCFS Coupon System</span>
      </div>

      {/* 메뉴 및 로그인 상태 정보 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          // ==========================================
          // 로그인한 사용자용 상단 메뉴 구성
          // ==========================================
          <>
            {/* 
              쿠폰 발급 탭
              - location.pathname === '/coupons' 검사를 통해 현재 이 주소에 머물고 있으면 폰트 굵기를 bold로, 색상을 하이라이트 블루(#818cf8)로 활성화 스타일 처리합니다.
            */}
            <span 
              onClick={() => navigate('/coupons')} 
              style={{
                cursor: 'pointer',
                fontWeight: location.pathname === '/coupons' ? 'bold' : 'normal',
                color: location.pathname === '/coupons' ? '#818cf8' : '#94a3b8',
                transition: 'color 0.2s'
              }}
            >
              쿠폰 발급
            </span>

            {/* 관리자(ADMIN) 권한 소유 유저에게만 '쿠폰 관리자' 메뉴를 노출합니다. */}
            {user.role === 'ADMIN' && (
              <span 
                onClick={() => navigate('/admin')} 
                style={{
                  cursor: 'pointer',
                  fontWeight: location.pathname === '/admin' ? 'bold' : 'normal',
                  color: location.pathname === '/admin' ? '#818cf8' : '#94a3b8',
                  transition: 'color 0.2s'
                }}
              >
                ⚙️ 쿠폰 관리자
              </span>
            )}

            {/* 현재 로그인된 사용자의 아이디와 권한(배지) 표시 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{user.username}</span>
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : ''}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: user.role === 'ADMIN' ? '#4f46e5' : '#475569', color: '#fff' }}>
                {user.role}
              </span>
            </div>

            {/* 로그아웃 버튼 */}
            <button 
              onClick={handleLogoutClick} 
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          // ==========================================
          // 비로그인 사용자용 상단 메뉴 구성 (로그인 / 회원가입)
          // ==========================================
          <>
            <span 
              onClick={() => navigate('/login')} 
              style={{
                cursor: 'pointer',
                fontWeight: location.pathname === '/login' ? 'bold' : 'normal',
                color: location.pathname === '/login' ? '#818cf8' : '#94a3b8'
              }}
            >
              로그인
            </span>
            <span 
              onClick={() => navigate('/signup')} 
              style={{
                cursor: 'pointer',
                fontWeight: location.pathname === '/signup' ? 'bold' : 'normal',
                color: location.pathname === '/signup' ? '#818cf8' : '#94a3b8'
              }}
            >
              회원가입
            </span>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
