package com.fcfs.coupon.service;

import com.fcfs.coupon.entity.Coupon;
import com.fcfs.coupon.entity.CouponIssue;
import com.fcfs.coupon.entity.User;
import com.fcfs.coupon.repository.CouponIssueRepository;
import com.fcfs.coupon.repository.CouponRepository;
import com.fcfs.coupon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * [Spring Boot / Service / Dependency Injection / Transaction]
 * 
 * 1. @Service
 *    - 이 클래스가 비즈니스 로직을 처리하는 '서비스 레이어'의 빈(Bean)임을 스프링 컨테이너에 등록합니다.
 * 
 * 2. 의존성 주입 (Dependency Injection - DI)과 lombok @RequiredArgsConstructor
 *    - final로 선언된 필드(Repository 등)를 매개변수로 갖는 생성자를 생성해 줍니다.
 *    - 스프링은 생성자가 하나이고 매개변수가 빈(Bean)으로 등록되어 있으면 자동으로 의존성을 주입(Constructor Injection)해줍니다.
 * 
 * 3. @Transactional
 *    - 데이터베이스 트랜잭션을 관리합니다. 메서드 안의 모든 DB 작업이 하나의 단위로 묶여,
 *      모든 연산이 성공해야 Commit(최종 데이터 반영)이 일어나고, 중간에 예외가 발생하면 Rollback(원래대로 되돌림)됩니다.
 *    - readOnly = true: 읽기 전용 작업에 설정하여 트랜잭션 성능을 최적화합니다.
 */
@Service
@RequiredArgsConstructor
public class CouponService {

    // final 키워드로 주입받을 레포지토리를 정의합니다.
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CouponIssueRepository couponIssueRepository;

    /**
     * 회원 가입 또는 로그인 처리 (유저 조회 후 없으면 새로 생성)
     */
    @Transactional
    public User getOrCreateUser(String username) {
        // findByUsername 결과가 비어있으면(orElseGet), 새로운 User를 데이터베이스에 저장(save)하고 반환합니다.
        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.save(User.builder().username(username).build()));
    }

    /**
     * 쿠폰 조회
     */
    @Transactional(readOnly = true)
    public Coupon getCoupon(Long couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));
    }

    /**
     * [핵심] 단일 사용자 쿠폰 발급 (동시성 처리 없는 단순 비즈니스 로직)
     * 
     * * 동시성 문제가 발생하는 이유:
     *   - 여러 사용자가 동시에 이 메서드를 호출하면, 여러 스레드가 동시에 50번 줄(쿠폰 조회)을 실행하여 동일한 수량의 쿠폰을 조회합니다.
     *   - 그 후 모든 스레드가 59번 줄(수량 감소)을 처리하고 60번 줄(저장)을 호출하므로, 
     *     실제로는 쿠폰이 여러 번 나갔음에도 수량은 1번만 줄어든 것처럼 덮어씌워지게 됩니다. (Lost Update / Race Condition)
     */
    @Transactional
    public CouponIssue issueCoupon(String username, Long couponId) {
        // 1. 유저 조회 또는 생성
        User user = getOrCreateUser(username);

        // 2. 쿠폰 존재 확인 (데이터베이스에서 쿠폰 정보를 읽어옴)
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 쿠폰입니다."));

        // 3. 중복 발급 여부 확인 (한 유저가 동일한 쿠폰을 이미 받았는지 검증)
        if (couponIssueRepository.existsByUserIdAndCouponId(user.getId(), coupon.getId())) {
            throw new IllegalStateException("이미 쿠폰을 발급받았습니다.");
        }

        // 4. 쿠폰 잔여 수량 감소 및 저장 (동시성 제어가 없는 순수 로직)
        // 객체 내부의 decreaseQuantity()를 통해 수량을 1 깎은 후, 데이터베이스에 save를 통해 반영합니다.
        coupon.decreaseQuantity();
        couponRepository.save(coupon);

        // 5. 쿠폰 발급 이력 객체 생성 및 데이터베이스 저장 (CouponIssue 레코드 추가)
        // (createdAt과 updatedAt은 JPA Auditing에 의해 저장 시 자동으로 기록됩니다.)
        CouponIssue couponIssue = CouponIssue.builder()
                .userId(user.getId())
                .couponId(coupon.getId())
                .build();


        return couponIssueRepository.save(couponIssue);
    }
}

