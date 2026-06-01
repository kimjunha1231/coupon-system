import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

/**
 * [React Application Entry Point - main.jsx]
 * 
 * - Vite가 빌드할 때 웹브라우저가 가장 먼저 읽어서 실행하는 자바스크립트 진입 파일입니다.
 * - HTML 템플릿(index.html)에 존재하는 `<div id="root"></div>` 태그를 찾아
 *   그 안에 React 컴포넌트 트리(App)를 주입하고 화면을 그립니다(렌더링).
 */

createRoot(document.getElementById('root')).render(
  // <StrictMode>: 개발 중에 잠재적인 버그나 안전하지 않은 코드를 경고하기 위한 도구입니다. (실제 빌드 시에는 동작하지 않음)
  <StrictMode>
    {/* 
      <BrowserRouter>: 
      - react-router-dom 라이브러리가 브라우저의 HTML5 History API를 활용해 URL 주소창을 감시하고 제어하게 해주는 최상위 라우터 컴포넌트입니다.
      - 이 컴포넌트 아래에 있는 모든 자식 컴포넌트들은 useNavigate, useLocation 등의 훅을 자유롭게 사용할 수 있습니다.
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
