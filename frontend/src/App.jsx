import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CouponList from './pages/CouponList';
import AdminCoupon from './pages/AdminCoupon';

/**
 * [React Main Entry Component - App]
 * 
 * - 애플리케이션의 최상위(Root) 레이아웃 컴포넌트입니다.
 * - 로그인된 사용자의 정보(user) 상태를 중앙에서 관리(useState)합니다.
 * - [URL 라우팅 구조 도입]: 
 *   기존의 `currentPage` 상태 대신 React Router의 `<Routes>`와 `<Route>`를 사용해
 *   브라우저 주소창(URL)의 변화에 따라 적절한 화면 컴포넌트를 렌더링하고, 보안(권한) 검사를 함께 수행합니다.
 */
function App() {
  // [React 상태 관리 - useState]
  // - user: 현재 로그인한 사용자의 정보 객체 (null이면 로그아웃 상태)
  // - setUser: 이 상태 값을 변경할 수 있는 setter 함수
  const [user, setUser] = useState(null);

  // 로그인 성공 시 호출되어 전역 user 상태를 채워주는 핸들러
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // 로그아웃 시 호출되어 전역 user 상태를 비워주는 핸들러
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 
        [상단 내비게이션 바 컴포넌트]
        - 로그인 상태에 따라 다른 메뉴를 보여주기 위해 user 상태를 전달합니다.
        - 로그아웃 동작 처리를 위해 handleLogout 함수를 프롭스(props)로 전달합니다.
      */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* 
        [본문 콘텐츠 라우팅 영역]
        - <Routes>: 여러 개의 <Route> 중 현재 주소창의 URL 경로(path)와 일치하는 단 하나의 컴포넌트만 찾아 화면에 그립니다.
        - <Navigate>: 다른 주소로 즉시 이동(Redirect)시키고 싶을 때 사용하는 컴포넌트입니다. (replace 속성은 히스토리에 현재 페이지를 남기지 않음)
      */}
      <main style={{ flex: 1, padding: '1rem 0' }}>
        <Routes>
          
          {/* ==========================================
              비로그인 전용 경로 (로그인 / 회원가입)
              ========================================== */}
          {/* 
            로그인한 사용자가 주소창에 직접 `/login`이나 `/signup`을 쳐서 들어오려 하면 
            사용자 화면(Coupons)으로 자동 리다이렉트(Navigate)하고, 비로그인 상태일 때만 해당 폼을 보여줍니다.
          */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/coupons" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/coupons" replace /> : <Signup />} 
          />

          {/* ==========================================
              로그인 상태 전용 경로 (쿠폰 신청 / 어드민)
              ========================================== */}
          {/* 
            - 쿠폰 발급 목록: 로그인하지 않은 유저가 접근하면 로그인 창(`/login`)으로 돌려보냅니다.
            - 쿠폰 관리자: 로그인 검사와 동시에, 사용자의 권한(`role === 'ADMIN'`)을 한 번 더 검사하여
                          일반 사용자일 경우 쿠폰 신청 화면(`/coupons`)으로 되돌립니다.
          */}
          <Route 
            path="/coupons" 
            element={user ? <CouponList user={user} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin" 
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <AdminCoupon user={user} />
                ) : (
                  <Navigate to="/coupons" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* ==========================================
              기타 예외 경로 처리
              ========================================== */}
          {/* 
            정의되지 않은 모든 잘못된 경로(`path="*"`)로 접속했을 때는
            현재 로그인 상태 여부에 따라 자동으로 메인 페이지 또는 로그인 화면으로 튕겨냅니다.
          */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/coupons" : "/login"} replace />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
