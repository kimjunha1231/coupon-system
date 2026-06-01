package com.fcfs.coupon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.LocalDateTime;

/**
 * [Spring Boot / JPA / Auditing - 공통 시간 관리 엔티티]
 * 
 * - 모든 테이블에 공통적으로 들어가는 생성일자(createdAt), 수정일자(updatedAt)를 관리하는 추상 클래스입니다.
 * - 이 상속 구조를 통해 개별 엔티티마다 생성일자, 수정일자 코드를 중복해서 적지 않아도 됩니다.
 * 
 * 1. @MappedSuperclass
 *    - 이 클래스는 실제 데이터베이스 테이블과 매핑되지 않고, 
 *      이 클래스를 상속받는 자식 엔티티 클래스들에게 필드(createdAt, updatedAt) 정보만 상속해 주도록 설정합니다.
 * 
 * 2. @EntityListeners(AuditingEntityListener.class)
 *    - 엔티티의 생성, 수정 시점을 감시하여 해당 이벤트가 발생할 때 자동으로 동작하게 합니다.
 */
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {

    /**
     * @CreatedDate
     * - 엔티티가 최초로 저장(persist)될 때 생성 일시를 자동으로 저장해 줍니다.
     * - updatable = false: 데이터가 한 번 들어가면 이후 수정(Update) 시 이 컬럼은 반영되지 않도록 막아줍니다.
     */
    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    /**
     * @LastModifiedDate
     * - 엔티티의 값이 변경되어 데이터베이스에 수정(update)이 일어날 때 마지막 수정 일시를 자동으로 저장해 줍니다.
     */
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
