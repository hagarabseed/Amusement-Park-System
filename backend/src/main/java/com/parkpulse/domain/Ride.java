package com.parkpulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rides")
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RideCategory category;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "min_age", nullable = false)
    private int minAge;

    @Column(name = "min_height_m", nullable = false, precision = 4, scale = 2)
    private BigDecimal minHeightM;

    @Column(name = "need_maintenance", nullable = false)
    private boolean needMaintenance = false;

    @Column(name = "maintenance_reason", length = 255)
    private String maintenanceReason;

    @Column(name = "specific_details", length = 255)
    private String specificDetails;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    public boolean isOperational() {
        return !needMaintenance;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public RideCategory getCategory() { return category; }
    public void setCategory(RideCategory category) { this.category = category; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getMinAge() { return minAge; }
    public void setMinAge(int minAge) { this.minAge = minAge; }
    public BigDecimal getMinHeightM() { return minHeightM; }
    public void setMinHeightM(BigDecimal minHeightM) { this.minHeightM = minHeightM; }
    public boolean isNeedMaintenance() { return needMaintenance; }
    public void setNeedMaintenance(boolean needMaintenance) { this.needMaintenance = needMaintenance; }
    public String getMaintenanceReason() { return maintenanceReason; }
    public void setMaintenanceReason(String maintenanceReason) { this.maintenanceReason = maintenanceReason; }
    public String getSpecificDetails() { return specificDetails; }
    public void setSpecificDetails(String specificDetails) { this.specificDetails = specificDetails; }
    public Long getVersion() { return version; }
}
