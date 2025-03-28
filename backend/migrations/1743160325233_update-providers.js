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
    pgm.renameColumn('providers', 'base_url', 'url');
    pgm.addColumn('providers', {pair: { type: 'TEXT', notNull: true }});
    pgm.addColumn('providers', {action: { type: 'TEXT', notNull: true }});
    pgm.sql (`
        INSERT INTO providers (name, url, pair, action) VALUES ('coingecko', 'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd', 'the-open-network/usd', 'price');
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.renameColumn('providers', 'url', 'base_url');
    pgm.dropColumn('providers', 'pair');
    pgm.dropColumn('providers', 'action');
    pgm.sql (`
        DELETE FROM providers WHERE name = 'coingecko';
    `);
};