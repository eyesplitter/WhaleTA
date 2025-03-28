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
  pgm.createTable('providers', {
    id: { type: 'id', unique: true },
    name: { type: 'TEXT', notNull: true },
    base_url: { type: 'TEXT' },
    created_at: { type: 'TIMESTAMP', default: pgm.func('NOW()') },
    updated_at: { type: 'TIMESTAMP', default: pgm.func('NOW()') },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('providers');
}; 