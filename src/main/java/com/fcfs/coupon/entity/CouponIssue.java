package com.fcfs.coupon.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * [Spring Boot / JPA / Unique Constraints]
 * 
 * - CouponIssue 엔티티는 특정 유저(userId)가 특정 쿠폰(couponId)을 발급받은 이력을 저장합니다.
 * - @Table의 uniqueConstraints 설정을 통해 한 사용자가 동일한 쿠폰을 중복하여 발급받을 수 없도록
 *   데이터베이스 수준에서 복합 유니크 키(userId, couponId)를 설정해 이중 발급을 원천 차단합니다.
 */
@Entity
@Table(name = "coupon_issues", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"userId", "couponId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponIssue extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // 발급받은 회원의 고유 ID

    @Column(nullable = false)
    private Long couponId; // 발급된 쿠폰의 고유 ID
}


