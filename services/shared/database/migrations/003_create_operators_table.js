exports.up = function(knex) {
  return knex.schema.createTable('operators', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('email');
    table.string('phone');
    table.string('website');
    table.enum('status', ['active', 'inactive', 'pending']).defaultTo('active');
    table.timestamps(true, true);
    
    // Indexes
    table.index('name');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('operators');
};
