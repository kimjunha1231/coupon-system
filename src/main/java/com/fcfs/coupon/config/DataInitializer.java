package com.fcfs.coupon.config;

import com.fcfs.coupon.entity.Coupon;
import com.fcfs.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) {
        if (couponRepository.count() == 0) {
            Coupon testCoupon = Coupon.builder()
                    .name("선착순 100명 특별 쿠폰")
                    .totalQuantity(100)
                    .remainingQuantity(100)
                    .build();
            couponRepository.save(testCoupon);
            log.info("기초 쿠폰 데이터가 생성되었습니다: ID=1, {}", testCoupon.getName());
        }
    }
}
