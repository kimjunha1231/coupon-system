package com.fcfs.coupon.controller;

import com.fcfs.coupon.entity.Coupon;
import com.fcfs.coupon.entity.CouponIssue;
import com.fcfs.coupon.service.CouponService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * [Spring Boot / Web (REST API) / Controller]
 * 
 * 1. @RestController
 *    - 이 클래스가 외부 클라이언트(예: React, 모바일 앱 등)가 호출할 수 있는 RESTful 웹 서비스 API 컨트롤러임을 선언합니다.
 *    - 각 메서드의 반환값을 템플릿(HTML)이 아니라 객체/데이터 그대로 JSON 형식으로 변환하여 HTTP Response Body에 실어 보냅니다.
 * 
 * 2. @RequestMapping("/api/coupons")
 *    - 이 컨트롤러 하위 메서드들의 공통 URL 주소 접두사(Prefix)를 지정합니다. (예: http://localhost:8080/api/coupons/...)
 * 
 * 3. @CrossOrigin(origins = "*")
 *    - 웹 브라우저의 CORS(Cross-Origin Resource Sharing) 정책으로 인해 발생하는 문제를 방지합니다.
 *      로컬에서 React 서버(포트 5173 등)가 Spring 서버(포트 8080)로 API 요청을 보낼 수 있도록 다른 도메인으로부터의 접근을 허용합니다.
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // React 로컬 개발 서버와 통신 허용
public class CouponController {

    private final CouponService couponService;

    /**
     * 쿠폰 현황 조회
     * 
     * - @GetMapping("/{id}"): GET http://localhost:8080/api/coupons/{id} 요청을 처리합니다.
     * - @PathVariable Long id: URL 경로 상의 {id} 자리의 값을 추출하여 파라미터(id)에 매핑합니다.
     * - ResponseEntity<Coupon>: HTTP 응답 상태 코드(200 OK, 404 Not Found 등)와 본문(Body) 데이터를 유연하게 담는 스프링 클래스입니다.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getCoupon(@PathVariable Long id) {
        try {
            // Service를 통해 쿠폰 정보를 조회하여 성공 시 200 OK 상태 코드와 쿠폰 데이터를 반환
            return ResponseEntity.ok(couponService.getCoupon(id));
        } catch (IllegalArgumentException e) {
            // 쿠폰이 존재하지 않을 시 404 Not Found 상태 코드를 반환
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 쿠폰 발급 요청 (단일 스레드 비동작 가정 테스트용)
     * 
     * - @PostMapping("/{id}/issue"): POST http://localhost:8080/api/coupons/{id}/issue 요청을 처리합니다.
     * - @RequestBody IssueRequest request: 클라이언트가 HTTP Request Body에 JSON 형태로 보낸 데이터를 
     *   자바 객체(IssueRequest)로 역직렬화(자동 변환)하여 전달받습니다.
     */
    @PostMapping("/{id}/issue")
    public ResponseEntity<?> issueCoupon(@PathVariable Long id, @RequestBody IssueRequest request) {
        try {
            // 쿠폰 발급을 수행하고 정상 발급 시 200 OK와 함께 발급 이력(CouponIssue) 반환
            CouponIssue issue = couponService.issueCoupon(request.getUsername(), id);
            return ResponseEntity.ok(issue);
        } catch (IllegalStateException | IllegalArgumentException e) {
            // 비즈니스 검증 실패(수량 소진, 중복 발급 등) 시 400 Bad Request와 함께 에러 메세지 반환
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * 클라이언트로부터 전달받을 요청 객체 DTO (Data Transfer Object)
     * - @Data: Getter, Setter, toString, EqualsAndHashCode 등을 자동 생성해 줍니다.
     */
    @Data
    public static class IssueRequest {
        private String username;
    }

    /**
     * 에러 상황 발생 시 클라이언트에게 반환할 에러 포맷 객체
     */
    @Data
    @RequiredArgsConstructor
    public static class ErrorResponse {
        private final String message;
    }
}

