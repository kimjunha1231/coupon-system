import React from 'react';

/**
 * [React Component - Navbar]
 * 
 * - 화면 상단에 고정되어 있는 네비게이션 헤더입니다.
 * - 로그인 정보(사용자 이름, 권한)를 보여주고 로그아웃 기능을 제공합니다.
 * - 로그인한 사용자의 권한(ADMIN / USER)에 따라 관리자 페이지 또는 쿠폰 목록 페이지로 이동할 수 있는 탭을 노출합니다.
 */
function Navbar({ user, currentPage, setCurrentPage, onLogout }) {
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
      {/* 로고 / 타이틀 */}
      <div 
        onClick={() => setCurrentPage(user ? 'couponList' : 'login')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <span style={{ fontSize: '1.5rem' }}>🎟️</span>
        <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>FCFS Coupon System</span>
      </div>

      {/* 메뉴 및 로그인 상태 정보 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            {/* 페이지 이동 탭 (권한별 분기) */}
            <span 
              onClick={() => setCurrentPage('couponList')} 
              style={{
                cursor: 'pointer',
                fontWeight: currentPage === 'couponList' ? 'bold' : 'normal',
                color: currentPage === 'couponList' ? '#818cf8' : '#94a3b8',
                transition: 'color 0.2s'
              }}
            >
              쿠폰 발급
            </span>

            {user.role === 'ADMIN' && (
              <span 
                onClick={() => setCurrentPage('adminCoupon')} 
                style={{
                  cursor: 'pointer',
                  fontWeight: currentPage === 'adminCoupon' ? 'bold' : 'normal',
                  color: currentPage === 'adminCoupon' ? '#818cf8' : '#94a3b8',
                  transition: 'color 0.2s'
                }}
              >
                ⚙️ 쿠폰 관리자
              </span>
            )}

            {/* 사용자 표시 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{user.username}</span>
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : ''}`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', background: user.role === 'ADMIN' ? '#4f46e5' : '#475569', color: '#fff' }}>
                {user.role}
              </span>
            </div>

            {/* 로그아웃 버튼 */}
            <button 
              onClick={onLogout} 
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
          <>
            <span 
              onClick={() => setCurrentPage('login')} 
              style={{
                cursor: 'pointer',
                fontWeight: currentPage === 'login' ? 'bold' : 'normal',
                color: currentPage === 'login' ? '#818cf8' : '#94a3b8'
              }}
            >
              로그인
            </span>
            <span 
              onClick={() => setCurrentPage('signup')} 
              style={{
                cursor: 'pointer',
                fontWeight: currentPage === 'signup' ? 'bold' : 'normal',
                color: currentPage === 'signup' ? '#818cf8' : '#94a3b8'
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
