package com.fcfs.coupon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * [Spring Boot / JPA Auditing 활성화]
 * 
 * - @EnableJpaAuditing
 *   엔티티가 생성되거나 수정될 때 시간 값(@CreatedDate, @LastModifiedDate)을 
 *   자동으로 입력해 주는 Spring Data JPA Auditing 기능을 활성화합니다.
 */
@EnableJpaAuditing
@SpringBootApplication
public class CouponSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(CouponSystemApplication.class, args);
	}

}

