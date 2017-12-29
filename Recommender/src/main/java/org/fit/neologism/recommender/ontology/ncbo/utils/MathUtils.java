package org.fit.neologism.recommender.ontology.ncbo.utils;

import java.math.BigDecimal;

public final class MathUtils {

    /**
     * Round to `roundPlaces` decimal places
     * @param value
     * @return
     */
    public static double round(double value, int roundPlaces) {
        return new BigDecimal(value).setScale(roundPlaces, BigDecimal.ROUND_HALF_EVEN).doubleValue();
    }
}
