import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CouponList from './pages/CouponList';
import AdminCoupon from './pages/AdminCoupon';

/**
 * [React Main Entry Component - App]
 * 
 * - 애플리케이션의 최상위 컴포넌트입니다.
 * - 로그인 상태(user)를 전역적으로 소유하며, 간단한 상태 기반 라우터를 활용해
 *   현재 페이지(currentPage) 상태에 맞춰 적절한 화면 컴포넌트(로그인, 회원가입, 쿠폰신청, 어드민)를 렌더링합니다.
 */
function App() {
  // 로그인된 사용자 정보 상태 (id, username, role 등의 정보를 객체로 담음)
  const [user, setUser] = useState(null);

  // 현재 활성화된 페이지 상태 ('login', 'signup', 'couponList', 'adminCoupon')
  const [currentPage, setCurrentPage] = useState('login');

  // 로그인 성공 시 호출될 핸들러
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // 로그인 성공 시 기본 페이지인 쿠폰 목록 화면으로 이동
    setCurrentPage('couponList');
  };

  // 로그아웃 시 호출될 핸들러
  const handleLogout = () => {
    setUser(null);
    // 로그아웃 시 로그인 페이지로 이동
    setCurrentPage('login');
  };

  /**
   * [상태 기반 라우팅 로직]
   * - 비로그인 상태일 때는 로그인 혹은 회원가입 창만 노출되도록 제한합니다.
   * - 로그인 상태일 때 해당 페이지 컴포넌트를 렌더링하며, 관리자 전용 페이지 진입 시 한 번 더 권한 검사를 수행합니다.
   */
  const renderPage = () => {
    // 1. 비로그인 상태일 때
    if (!user) {
      if (currentPage === 'signup') {
        return <Signup setCurrentPage={setCurrentPage} />;
      }
      return <Login onLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />;
    }

    // 2. 로그인 상태일 때
    switch (currentPage) {
      case 'couponList':
        return <CouponList user={user} />;
      case 'adminCoupon':
        // 관리자가 아님에도 접근하려는 경우 차단
        if (user.role !== 'ADMIN') {
          setCurrentPage('couponList');
          return <CouponList user={user} />;
        }
        return <AdminCoupon user={user} setCurrentPage={setCurrentPage} />;
      case 'signup':
      case 'login':
        // 이미 로그인한 사용자가 로그인/가입 창으로 진입하려 하면 목록으로 리다이렉트
        return <CouponList user={user} />;
      default:
        return <CouponList user={user} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 상단 내비게이션 바 (App 전체 레이아웃에 배치) */}
      <Navbar 
        user={user} 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
      />

      {/* 본문 콘텐츠 렌더링 */}
      <main style={{ flex: 1, padding: '1rem 0' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
