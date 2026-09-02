const { Client } = require('pg');

async function run() {
  const connectionString = `postgresql://postgres.qrhspijmfimjxemravyz:JoyasAdmin2026!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });

  try {
    await client.connect();
    console.log("Conectado a la base de datos de Supabase.");

    // Obtener un producto de prueba
    const resProducts = await client.query(`SELECT id, title, sale_price FROM products LIMIT 1;`);
    if (resProducts.rows.length === 0) {
      console.log("No products found.");
      await client.end();
      return;
    }
    const product = resProducts.rows[0];
    const price = Math.round(parseFloat(product.sale_price || '15990'));

    const pendingOrders = [
      {
        client_name: 'Roberto Gómez Bolaños',
        client_rut: '12.345.678-9',
        client_email: 'roberto@chavo.cl',
        client_phone: '+56 9 1111 2222',
        delivery_method: 'domicilio',
        shipping_region: 'Región Metropolitana de Santiago',
        shipping_comuna: 'Providencia',
        shipping_address: 'Manuel Montt 120, Depto 54',
        subtotal: price,
        shipping_cost: 3990,
        total: price + 3990,
        status: 'Pagado'
      },
      {
        client_name: 'María Luisa Godoy',
        client_rut: '14.567.890-1',
        client_email: 'marialuisa@tvn.cl',
        client_phone: '+56 9 2222 3333',
        delivery_method: 'domicilio',
        shipping_region: 'Región Metropolitana de Santiago',
        shipping_comuna: 'Lo Barnechea',
        shipping_address: 'La Dehesa 2500, Casa 4',
        subtotal: price * 2,
        shipping_cost: 3490,
        total: (price * 2) + 3490,
        status: 'Pagado'
      },
      {
        client_name: 'Pedro Pascal Balmaceda',
        client_rut: '15.987.654-3',
        client_email: 'pedro.pascal@hollywood.com',
        client_phone: '+56 9 3333 4444',
        delivery_method: 'punto',
        shipping_region: 'Región de Tarapacá',
        shipping_comuna: 'Iquique',
        pickup_point_name: 'Punto Blue Express - Farmacia Iquique',
        pickup_point_address: 'Aníbal Pinto 450, Iquique',
        subtotal: price,
        shipping_cost: 5990,
        total: price + 5990,
        status: 'Pagado'
      },
      {
        client_name: 'Mon Laferte Bustamante',
        client_rut: '16.123.456-7',
        client_email: 'mon.laferte@musica.cl',
        client_phone: '+56 9 4444 5555',
        delivery_method: 'domicilio',
        shipping_region: 'Región de Valparaíso',
        shipping_comuna: 'Viña del Mar',
        shipping_address: 'Cerro Castillo 12, Casa Mon',
        subtotal: price * 3,
        shipping_cost: 4190,
        total: (price * 3) + 4190,
        status: 'Pagado'
      },
      {
        client_name: 'Arturo Vidal Pardo',
        client_rut: '16.777.888-9',
        client_email: 'kingarturo@colocolo.cl',
        client_phone: '+56 9 8888 9999',
        delivery_method: 'domicilio',
        shipping_region: 'Región Metropolitana de Santiago',
        shipping_comuna: 'Peñalolén',
        shipping_address: 'El Encón 4500, Casa King',
        subtotal: price * 4,
        shipping_cost: 3490,
        total: (price * 4) + 3490,
        status: 'Pagado'
      },
      {
        client_name: 'Alexis Sánchez Sánchez',
        client_rut: '17.111.222-3',
        client_email: 'maravilla@tocopilla.cl',
        client_phone: '+56 9 7777 8888',
        delivery_method: 'domicilio',
        shipping_region: 'Región de Antofagasta',
        shipping_comuna: 'Tocopilla',
        shipping_address: 'Avenida Baquedano 145',
        subtotal: price,
        shipping_cost: 5990,
        total: price + 5990,
        status: 'Pagado'
      },
      {
        client_name: 'Christian Nodal González',
        client_rut: '18.999.000-K',
        client_email: 'nodal@musica.mx',
        client_phone: '+56 9 9999 0000',
        delivery_method: 'punto',
        shipping_region: 'Región de Coquimbo',
        shipping_comuna: 'Coquimbo',
        pickup_point_name: 'Punto Blue Express - Almacén Puerto',
        pickup_point_address: 'Aldunate 1020, Coquimbo',
        subtotal: price * 2,
        shipping_cost: 4890,
        total: (price * 2) + 4890,
        status: 'Pagado'
      },
      {
        client_name: 'Camila Vallejo Dowling',
        client_rut: '17.888.999-0',
        client_email: 'camila.vallejo@gobierno.cl',
        client_phone: '+56 9 1234 5678',
        delivery_method: 'domicilio',
        shipping_region: 'Región Metropolitana de Santiago',
        shipping_comuna: 'La Florida',
        shipping_address: 'Walker Martínez 1500, Casa 20',
        subtotal: price,
        shipping_cost: 3490,
        total: price + 3490,
        status: 'Pagado'
      }
    ];

    for (const order of pendingOrders) {
      const resOrder = await client.query(`
        INSERT INTO orders (
          client_name, client_rut, client_email, client_phone,
          delivery_method, shipping_region, shipping_comuna, shipping_address,
          pickup_point_name, pickup_point_address, subtotal, shipping_cost, total, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING id;
      `, [
        order.client_name, order.client_rut, order.client_email, order.client_phone,
        order.delivery_method, order.shipping_region, order.shipping_comuna, order.shipping_address || null,
        order.pickup_point_name || null, order.pickup_point_address || null,
        order.subtotal, order.shipping_cost, order.total, order.status
      ]);

      const orderId = resOrder.rows[0].id;

      // Insert item
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_title, quantity, price)
        VALUES ($1, $2, $3, $4, $5);
      `, [orderId, product.id, product.title, order.subtotal / price, price]);
    }

    console.log("¡8 órdenes pendientes adicionales insertadas exitosamente!");
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    await client.end();
  } catch (err) {
    console.error("Error inserting pending orders:", err.message);
  }
}

run();
