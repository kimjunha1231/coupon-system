package com.fcfs.coupon.repository;

import com.fcfs.coupon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * [Spring Boot / Spring Data JPA - UserRepository]
 * 
 * - User 엔티티와users 테이블을 연결하여 데이터 읽기/쓰기를 해줍니다.
 * - findByUsername: 사용자 이름(username)으로 데이터베이스에 존재하는 User가 있는지 조회합니다.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 사용자 이름으로 회원을 찾아내는 쿼리 메서드
    Optional<User> findByUsername(String username);
}

