exports.up = function(knex) {
  return knex.schema.createTable('stations', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('operator_id').references('operators.id').onDelete('CASCADE').notNullable();
    table.string('name').notNullable();
    table.text('description');
    table.string('address_street').notNullable();
    table.string('address_city').notNullable();
    table.string('address_state');
    table.string('address_zip', 20);
    table.string('address_country', 2).notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.specificType('amenities', 'TEXT[]').defaultTo('{}');
    table.jsonb('operating_hours');
    table.string('contact_phone', 20);
    table.string('contact_email');
    table.enum('status', ['active', 'maintenance', 'inactive']).defaultTo('active');
    table.decimal('rating', 3, 2).defaultTo(0.00);
    table.integer('reviews_count').defaultTo(0);
    table.specificType('photos', 'TEXT[]').defaultTo('{}');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['latitude', 'longitude']);
    table.index('operator_id');
    table.index('status');
    table.index('address_city');
    table.index('amenities');
    
    // Spatial index for location queries
    table.specificType('location', 'geometry(Point,4326)');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('stations');
};
