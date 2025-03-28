/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
   pgm.createTable('crypto_prices', {
    id: { type: 'id', unique: true },
    pair: { type: 'TEXT', notNull: true },
    price: { type: 'NUMERIC', notNull: true },
    timestamp: { type: 'TIMESTAMP', default: pgm.func('NOW()') },
    provider_id: { type: 'integer', notNull: true, references: 'providers' },
  });
  
  pgm.addConstraint('crypto_prices', 'unique_pair', {
    unique: ['pair'],
  });
  
  pgm.createTable('historical_crypto_prices', {
    id: { type: 'id', unique: true },
    pair: { type: 'TEXT', notNull: true },
    price: { type: 'NUMERIC', notNull: true },
    timestamp: { type: 'TIMESTAMP', default: pgm.func('NOW()') },
  });

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('historical_crypto_prices');
  pgm.dropTable('crypto_prices');
}; 