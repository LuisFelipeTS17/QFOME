package com.qfome.config;

import org.hibernate.community.dialect.SQLiteDialect;
import org.hibernate.exception.ConstraintViolationException;
import org.hibernate.exception.spi.SQLExceptionConversionDelegate;
import org.hibernate.internal.util.JdbcExceptionHelper;

/**
 * Dialeto SQLite que reconhece violacao de FK/UNIQUE/CHECK (erro SQLITE_CONSTRAINT).
 * O dialeto padrao nao traduz esse codigo e o erro chegava como 500; assim ele vira
 * DataIntegrityViolationException e o GlobalExceptionHandler responde 409.
 */
public class QfomeSQLiteDialect extends SQLiteDialect {

    private static final int SQLITE_CONSTRAINT = 19;

    @Override
    public SQLExceptionConversionDelegate buildSQLExceptionConversionDelegate() {
        SQLExceptionConversionDelegate padrao = super.buildSQLExceptionConversionDelegate();
        return (sqlException, message, sql) -> {
            if ((JdbcExceptionHelper.extractErrorCode(sqlException) & 0xFF) == SQLITE_CONSTRAINT) {
                return new ConstraintViolationException(message, sqlException, sql, null);
            }
            return padrao != null ? padrao.convert(sqlException, message, sql) : null;
        };
    }
}
