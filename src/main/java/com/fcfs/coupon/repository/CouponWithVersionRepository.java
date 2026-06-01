package com.fcfs.coupon.repository;

import com.fcfs.coupon.entity.CouponWithVersion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponWithVersionRepository extends JpaRepository<CouponWithVersion, Long> {
}
