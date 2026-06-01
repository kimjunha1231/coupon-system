import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * [React Page - CouponList]
 * 
 * - 사용자가 발급 가능한 모든 쿠폰의 리스트를 실시간으로 확인하고 신청할 수 있는 화면입니다.
 * - 3초 주기 폴링(Polling)을 수행하여 여러 사람이 발급 시 변경되는 잔여 수량을 실시간 갱신합니다.
 */
function CouponList({ user }) {
  const [coupons, setCoupons] = useState([]);
  const [loadingMap, setLoadingMap] = useState({}); // 쿠폰 개별로 발급 진행 상태를 제어하기 위한 맵
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  // 전체 쿠폰 목록 불러오기
  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/coupons');
      setCoupons(response.data);
      setFetching(false);
    } catch (error) {
      console.error('쿠폰 목록 조회 실패:', error);
      setFetching(false);
    }
  };

  // 마운트 시 최초 조회 및 3초 간격 폴링 타이머 가동
  useEffect(() => {
    fetchCoupons();
    const interval = setInterval(fetchCoupons, 3000);
    return () => clearInterval(interval);
  }, []);

  // 쿠폰 발급 신청
  const handleIssueCoupon = async (couponId) => {
    setLoadingMap(prev => ({ ...prev, [couponId]: true }));
    setToast(null);

    try {
      // POST http://localhost:8080/api/coupons/{couponId}/issue 호출
      // 현재 로그인한 사용자(user.username)를 담아서 전송합니다.
      await axios.post(`http://localhost:8080/api/coupons/${couponId}/issue`, {
        username: user.username
      });

      setToast({ type: 'success', message: '🎉 쿠폰 발급에 성공했습니다! DB에 이력이 등록되었습니다.' });
      fetchCoupons(); // 발급 성공 직후 빠른 갱신
    } catch (error) {
      const errorMsg = error.response?.data?.message || '쿠폰 발급에 실패했습니다.';
      setToast({ type: 'error', message: `❌ ${errorMsg}` });
    } finally {
      setLoadingMap(prev => ({ ...prev, [couponId]: false }));
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>선착순 발급 진행 중</span>
        <h1 className="gradient-text" style={{ fontSize: '2.4rem', margin: '0 0 0.5rem 0' }}>쿠폰 리스트</h1>
        <p className="sub-text" style={{ margin: 0, fontSize: '1rem' }}>아래 쿠폰 리스트에서 원하는 쿠폰을 신청해 보세요!</p>
      </div>

      {fetching ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          쿠폰 목록을 조회하는 중입니다...
        </div>
      ) : coupons.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#94a3b8', margin: '0 0 1.5rem 0' }}>등록된 선착순 쿠폰이 아직 없습니다.</p>
          {user.role === 'ADMIN' && (
            <p style={{ color: '#818cf8', fontSize: '0.9rem' }}>상단 메뉴의 '쿠폰 관리자' 탭을 통해 신규 쿠폰을 등록해 주세요!</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {coupons.map((coupon) => {
            const progress = (coupon.remainingQuantity / coupon.totalQuantity) * 100;
            const isSoldOut = coupon.remainingQuantity <= 0;
            const isButtonLoading = loadingMap[coupon.id] || false;

            return (
              <div key={coupon.id} className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem 0' }}>{coupon.name}</h2>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>등록번호: #{coupon.id}</span>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: isSoldOut ? '#ef4444' : '#818cf8' }}>
                    {coupon.remainingQuantity} / {coupon.totalQuantity} 장 남음
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div className="progress-container" style={{ marginBottom: '1.5rem' }}>
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${progress}%`,
                      background: isSoldOut ? '#ef4444' : 'linear-gradient(90deg, #818cf8, #6366f1)'
                    }}
                  ></div>
                </div>

                {/* 발급 신청 버튼 */}
                <button
                  onClick={() => handleIssueCoupon(coupon.id)}
                  className="glow-button"
                  disabled={isSoldOut || isButtonLoading}
                  style={{
                    background: isSoldOut ? '#334155' : 'linear-gradient(90deg, #6366f1, #4f46e5)'
                  }}
                >
                  {isButtonLoading ? (
                    '발급 처리 중...'
                  ) : isSoldOut ? (
                    '쿠폰 소진 완료'
                  ) : (
                    '쿠폰 발급 받기'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`} style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, marginTop: 0 }}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default CouponList;
