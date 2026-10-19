package com.qfome.dto;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** O SQLite devolve NUMERIC como REAL (39.9); as respostas saem sempre com 2 casas. */
public final class Dinheiro {

    private Dinheiro() {}

    public static BigDecimal arredondar(BigDecimal valor) {
        return valor == null ? null : valor.setScale(2, RoundingMode.HALF_UP);
    }
}
