import { useState, useEffect } from 'react'; // React에서 상태 관리와 생명주기를 위해 사용되는 핵심 React Hooks 입니다.
import axios from 'axios'; // 백엔드 API와 비동기 HTTP 통신을 하기 위한 라이브러리입니다.

// 백엔드 스프링 부트 서버의 API 주소입니다. (CORS 허용 포트 8080)
const API_BASE_URL = 'http://localhost:8080/api/coupons';
const DEFAULT_COUPON_ID = 1; // 실습에 사용할 기본 쿠폰 ID

function App() {
  /**
   * [React Hook - useState]
   * 
   * - 컴포넌트 내부에서 동적으로 변경되는 데이터를 관리(상태값 저장)할 때 사용합니다.
   * - 구문: const [상태변수명, 상태변경함수명] = useState(초기값);
   * - 상태변경함수(예: setUsername)를 호출하여 변수 값을 바꾸면 React가 화면(DOM)을 알아서 다시 그려줍니다(Re-rendering).
   */
  const [username, setUsername] = useState(''); // 사용자 아이디 입력 필드 상태
  const [coupon, setCoupon] = useState(null); // 백엔드로부터 받아온 쿠폰 정보 상태
  const [loading, setLoading] = useState(false); // 쿠폰 발급 요청 중인지 여부 (버튼 스피너 제어용)
  const [fetching, setFetching] = useState(true); // 처음 데이터를 불러오는 중인지 여부 (첫 로딩 화면용)
  const [toast, setToast] = useState(null); // 화면 하단에 띄울 안내/성공/에러 메시지 알림 상태
  const [shake, setShake] = useState(false); // 잘못된 입력값일 때 인풋창에 흔들리는 CSS 애니메이션을 주기 위한 상태

  /**
   * [비동기 API 통신 함수]
   * 
   * - async/await 키워드를 통해 비동기 작업(서버 요청)을 동기식 코드 흐름처럼 직관적으로 작성합니다.
   * - axios.get을 사용하여 서버에 있는 쿠폰 정보를 가져옵니다.
   */
  const fetchCouponDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${DEFAULT_COUPON_ID}`);
      setCoupon(response.data); // 성공 시 응답 데이터(쿠폰 정보)로 상태 업데이트
      setFetching(false); // 로딩 종료
    } catch (error) {
      console.error('쿠폰 정보를 가져오는 중 에러 발생:', error);
      setFetching(false);
    }
  };

  /**
   * [React Hook - useEffect]
   * 
   * - 컴포넌트가 처음 화면에 렌더링되거나 특정 상태가 바뀔 때 실행해야 하는 '부수 효과(Side Effect)'를 작성합니다.
   * - 두 번째 매개변수인 의존성 배열(dependency array)이 비어있기([]) 때문에, 이 훅은 컴포넌트가 처음 켜질 때(Mount) 딱 한 번만 실행됩니다.
   * - 주기적인 서버 수량 변화를 모니터링하기 위해 3초마다 fetchCouponDetails를 수행하는 폴링(Polling) 타이머를 켭니다.
   * - return () => clearInterval(interval); 은 컴포넌트가 꺼질 때(Unmount) 메모리 누수를 방지하기 위한 정리(Cleanup) 함수입니다.
   */
  useEffect(() => {
    fetchCouponDetails(); // 최초 1회 실행
    const interval = setInterval(fetchCouponDetails, 3000); // 3초 간격 폴링 설정
    return () => clearInterval(interval); // 컴포넌트 파괴 시 타이머 정리
  }, []);

  /**
   * [쿠폰 발급 요청 핸들러]
   */
  const handleIssueCoupon = async (e) => {
    e.preventDefault(); // 폼 제출 시 웹 브라우저가 기본적으로 페이지를 새로고침하는 동작을 차단합니다.
    
    // 입력값 유효성 검증 (공백 제외 유저명이 비어있는 경우)
    if (!username.trim()) {
      setShake(true); // 입력창 흔들림 효과 활성화
      setTimeout(() => setShake(false), 500); // 0.5초 뒤 효과 해제
      setToast({ type: 'error', message: '사용자 이름을 입력해주세요!' });
      return;
    }

    setLoading(true); // 로딩 상태 활성화 (중복 클릭 방지 및 스피너 가동)
    setToast(null); // 이전 안내 메시지 초기화

    try {
      // POST http://localhost:8080/api/coupons/1/issue API 호출
      // 서버에서 기대하는 JSON 형태의 Body 데이터({ username })를 담아 전송합니다.
      const response = await axios.post(`${API_BASE_URL}/${DEFAULT_COUPON_ID}/issue`, {
        username: username.trim(),
      });
      
      setToast({ type: 'success', message: '🎉 쿠폰 발급에 성공했습니다! DB에 이력이 등록되었습니다.' });
      fetchCouponDetails(); // 발급 직후 화면 갱신을 위해 쿠폰 잔여 수량 재조회
    } catch (error) {
      // 에러 발생 시 백엔드 응답에서 에러 메세지를 추출하여 보여줍니다.
      const errorMessage = error.response?.data?.message || '쿠폰 발급 요청 중 오류가 발생했습니다.';
      setToast({ type: 'error', message: `❌ ${errorMessage}` });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  };

  // 남은 수량 비율 계산 (프로그레스 바 렌더링용)
  const progressPercentage = coupon
    ? (coupon.remainingQuantity / coupon.totalQuantity) * 100
    : 0;

  /**
   * [JSX - HTML과 유사한 React 렌더링 템플릿]
   * 
   * - {} (중괄호): JSX 본문 안에 자바스크립트 변수나 조건식, 함수를 쓸 때는 중괄호를 사용하여 바인딩합니다.
   * - 삼항 연산자 (? :): React에서 UI를 조건부 렌더링할 때 가장 널리 쓰이는 패턴입니다.
   *   (예: fetching이 참이면 로딩창, 아니면 쿠폰 정보 또는 에러창 표시)
   */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center' }}>
      <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
        {/* 상단 헤더 영역 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-info" style={{ marginBottom: '0.75rem' }}>Phase 1-1: Happy Path</span>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>선착순 쿠폰 발급</h1>
          <p className="sub-text" style={{ margin: 0 }}>실시간 선착순 쿠폰 발급 시스템 (MVP)</p>
        </div>

        {/* 쿠폰 현황 표시 영역 (데이터 유무 및 로딩 상태에 따라 조건부 화면 출력) */}
        <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {fetching ? (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>쿠폰 정보를 불러오는 중...</div>
          ) : coupon ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{coupon.name}</span>
                <span style={{ color: '#818cf8', fontWeight: 700 }}>
                  {coupon.remainingQuantity} / {coupon.totalQuantity}
                </span>
              </div>
              
              {/* 프로그레스 바 표시 */}
              <div className="progress-container" style={{ marginBottom: '0.5rem' }}>
                <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                <span>남은 수량</span>
                <span>{Math.round(progressPercentage)}% 남음</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#ef4444' }}>⚠️ 백엔드 서버가 구동 중이지 않거나 쿠폰 데이터가 없습니다.</div>
          )}
        </div>

        {/* 사용자 아이디 입력 및 발급 요청 폼 */}
        <form onSubmit={handleIssueCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className={shake ? 'shake-animation' : ''}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>사용자 아이디 (닉네임)</label>
            <input
              type="text"
              placeholder="예: gildong123"
              className="custom-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 사용자가 입력한 값을 즉시 username 상태에 반영
              disabled={loading || fetching} // 데이터 로딩 중에는 인풋 비활성화
            />
          </div>

          <button
            type="submit"
            className="glow-button"
            // 로딩 중이거나, 조회 중이거나, 쿠폰이 아예 없거나, 남은 수량이 0 이하면 버튼 비활성화
            disabled={loading || fetching || !coupon || coupon.remainingQuantity <= 0}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '0.5rem' }}></span>
                처리 중...
              </>
            ) : coupon && coupon.remainingQuantity <= 0 ? (
              '쿠폰 소진 완료'
            ) : (
              '쿠폰 발급 신청'
            )}
          </button>
        </form>

        {/* 결과 알림 토스트 (메시지가 설정되었을 때만 렌더링됨) */}
        {toast && (
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            <span>{toast.message}</span>
          </div>
        )}

        {/* 스피너 회전 애니메이션용 inline style 정의 */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default App;

