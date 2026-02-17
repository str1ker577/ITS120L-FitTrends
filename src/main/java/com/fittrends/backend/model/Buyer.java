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
}
