package com.fittrends.backend.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "buyers")
public class Buyer {

    @Id
    private String id;

    private String buyerName;
    private String town;
    private String province;

    public Buyer() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getTown() { return town; }
    public void setTown(String town) { this.town = town; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
}
