import { SparkSQL } from 'src/parser/spark';
import { readSQL } from 'test/helper';

const spark = new SparkSQL();

const features = {
    ddl: readSQL(__dirname, 'icebergDDL.sql'),
    dml: readSQL(__dirname, 'icebergDML.sql'),
};

describe('Spark Iceberg DDL Syntax Tests', () => {
    features.ddl.forEach((itemSql) => {
        it(itemSql, () => {
            expect(spark.validate(itemSql).length).toBe(0);
        });
    });
});

describe('Spark Iceberg DML and Query Syntax Tests', () => {
    features.dml.forEach((itemSql) => {
        it(itemSql, () => {
            expect(spark.validate(itemSql).length).toBe(0);
        });
    });
});

describe('Spark Iceberg identifier regressions', () => {
    test.each([
        'CREATE TABLE prod.db.analytics.sample (id BIGINT) USING iceberg',
        'ALTER TABLE prod.db.analytics.sample ADD COLUMN value STRING',
        'DROP TABLE prod.db.analytics.sample',
    ])('supports a multi-level namespace in %s', (sql) => {
        expect(spark.validate(sql)).toEqual([]);
    });

    test.each([
        'CREATE TABLE prod.db.sample (point.x DOUBLE) USING iceberg',
        'CREATE VIEW prod.db.v (point.x) AS SELECT 1',
    ])('rejects a dotted column declaration in %s', (sql) => {
        expect(spark.validate(sql).length).toBeGreaterThan(0);
    });
});
