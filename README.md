# 🎟️ 선착순 쿠폰 시스템 (FCFS Coupon System)

선착순 100명 쿠폰 발급 기능을 점진적으로 고도화(동시성 해결 ➡️ Redis 캐싱 ➔ Kafka 비동기 큐 ➔ AI RAG 파이프라인)하며 학습하기 위한 MVP 공동 프로젝트입니다.

---

## 📌 핵심 CS 지식 가이드 (CS Knowledge Guide)

초보 팀원들의 기본기 향상을 위해 본 프로젝트를 설계하고 구축하는 데 필요한 **핵심 컴퓨터 과학(CS) 지식**을 기록합니다.

---

### 1. CORS (Cross-Origin Resource Sharing / 교차 출처 리소스 공유)

#### ❓ CORS란 무엇인가요?
**CORS**는 웹 브라우저가 실행하는 **보안 정책**입니다. 웹 애플리케이션이 **자신이 호스팅되는 출처(Origin)**가 아닌 다른 출처의 리소스(API 등)에 접근할 수 있도록 브라우저가 허용하는 메커니즘을 의미합니다.

*   **출처(Origin)**는 **`Protocol + Host + Port`** 3가지의 조합을 뜻합니다.
    *   예: `http://localhost:5173` (React 서버)와 `http://localhost:8080` (Spring Boot 서버)는 포트 번호(`5173` vs `8080`)가 다르므로 **서로 다른 출처(Cross-Origin)**입니다.

#### ⚠️ 브라우저가 기본적으로 다른 출처로의 요청을 막는 이유
브라우저는 기본적으로 **SOP (Same-Origin Policy / 동일 출처 정책)**를 따릅니다. 이는 잠재적으로 해로운 문서나 스크립트가 다른 출처의 민감한 데이터에 접근하는 위협(예: CSRF, XSS 공격)으로부터 사용자를 보호하기 위함입니다. 
따라서 웹사이트가 백엔드 서버와 포트나 도메인이 다르면, 브라우저는 백엔드 응답을 차단하고 콘솔에 빨간 에러 메시지를 띄웁니다.

#### 💡 우리 프로젝트에서의 해결 방식
이 문제를 해결하기 위해 백엔드 Spring Boot에 **"React(포트 5173)에서 오는 요청은 안전하니 차단하지 마라"**고 알려주는 설정을 추가해야 합니다.
우리 프로젝트는 [WebConfig.java](file:///c:/Users/KOSA/Desktop/coupon-system/src/main/java/com/fcfs/coupon/config/WebConfig.java) 클래스에 다음과 같이 전역 설정을 하여 해결했습니다.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 모든 API 경로에 대해
                .allowedOrigins("*") // 모든 출처에서의 호출을 허용함
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}
```

---

### 2. JPA Auditing (엔티티의 생명주기와 자동 시간 기록)

#### ❓ Auditing이란 무엇인가요?
Spring Data JPA에서 **Auditing**은 엔티티가 데이터베이스에 저장(Persist)되거나 수정(Update)될 때, **언제(시간)** 혹은 **누가(작성자)** 작업을 수행했는지를 자동으로 기록해 주는 기능입니다.

#### 🛠️ 핵심 어노테이션 원리
*   **`@CreatedDate`**: 엔티티가 생성되어 데이터베이스에 insert될 때의 시간 값을 자동으로 넣어줍니다. (`updatable = false` 설정을 주어 수정 시 변경되는 것을 방지합니다.)
*   **`@LastModifiedDate`**: 엔티티의 특정 값이 변경되어 update 쿼리가 나갈 때의 마지막 수정 시간을 자동으로 갱신해 줍니다.
*   **`@MappedSuperclass`**: 상속 관계에서 매우 중요한 JPA 개념입니다. 이 어노테이션이 붙은 클래스는 실제 DB 테이블로 만들어지지 않고, 자식 클래스 엔티티들에게 필드 속성(여기선 `createdAt`, `updatedAt`)만 상속해 줍니다.
*   **`@EntityListeners(AuditingEntityListener.class)`**: 해당 엔티티가 DB에 영속화되는 생명주기(Lifecycle) 이벤트를 감시하여, 값이 들어갈 때 가로채서 현재 시간을 주입해 줍니다.

---

### 3. 동시성 이슈 맛보기 (Race Condition / 경쟁 상태)

*   **상황**: 선착순 쿠폰은 100장만 발행되어야 합니다.
*   **현상**: 하지만 1000명의 사용자가 동시에 `발급 받기` 버튼을 누르면(동시 요청), 남은 수량이 0장이 되었는데도 100장이 넘는 쿠폰이 초과 발급(부정합성)됩니다.
*   **이유**: 스레드 A가 "남은 수량: 1"인 것을 확인하고 수량을 깎으려는 찰나에, 스레드 B가 끼어들어 동일하게 "남은 수량: 1"인 상태를 확인하기 때문에 발생합니다.
*   **해결 로직**:
    *   **Phase 1-3**: DB 락 (비관적 락/낙관적 락)
    *   **Phase 4**: Redis 인메모리 분산 락
    *   **Phase 5**: 비동기 대기열(Kafka) 구조로의 전환을 통해 해결해 나갑니다.

---

## 🏃 실행 방법 (How to Run)

### 1. Backend (Spring Boot)
1. 로컬 환경에 **MariaDB** 혹은 **MySQL**을 띄웁니다.
2. `coupondb` 데이터베이스를 생성하고 `test / 1234` 계정 권한을 추가합니다. (혹은 [application.properties](file:///c:/Users/KOSA/Desktop/coupon-system/src/main/resources/application.properties)의 접속 정보 변경)
3. 프로젝트 루트 경로에서 실행:
   ```bash
   ./gradlew bootRun
   ```

### 2. Frontend (React)
1. `frontend` 폴더로 이동합니다.
   ```bash
   cd frontend
   ```
2. 관련 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. 개발 서버를 구동합니다.
   ```bash
   npm run dev
   ```
4. 웹 브라우저에서 `http://localhost:5173`으로 접속합니다.
   * **테스트 일반 사용자**: `user` / `1234`
   * **테스트 관리자**: `admin` / `1234`
