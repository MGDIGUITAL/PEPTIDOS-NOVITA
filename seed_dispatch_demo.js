const { Client } = require('pg');

async function seed() {
  const connectionString = `postgresql://postgres.qrhspijmfimjxemravyz:JoyasAdmin2026!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });

  try {
    await client.connect();
    console.log("Conectado a la base de datos de Supabase.");

    // 1. Obtener algunos productos reales de la base de datos
    const resProducts = await client.query(`SELECT id, title, sale_price FROM products LIMIT 5;`);
    const products = resProducts.rows.map(p => ({
      ...p,
      sale_price: Math.round(parseFloat(p.sale_price || '15990'))
    }));

    if (products.length === 0) {
      console.log("No hay productos en la base de datos para asociales a las órdenes.");
      await client.end();
      return;
    }

    // Dates for different months to test the filters
    const now = new Date();
    
    // 5 days ago (Weekly Filter match)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(now.getDate() - 5);

    // Current Month (Mensual Match)
    const currentMonthDate = new Date();
    currentMonthDate.setDate(15); // middle of current month

    // July 2026 (Last Month)
    const julyDate = new Date(2026, 6, 12, 14, 30, 0); // Month index 6 = July

    // June 2026 (Two Months Ago)
    const juneDate = new Date(2026, 5, 22, 10, 15, 0); // Month index 5 = June

    const demoOrders = [
      // === 3 PENDING ORDERS (Para Despachar) ===
      {
        client_name: 'Antonia Jorquera Paz',
        client_rut: '19.882.341-2',
        client_email: 'antonia.jp@gmail.com',
        client_phone: '+56 9 7788 9900',
        delivery_method: 'domicilio',
        shipping_region: 'Región de Coquimbo',
        shipping_comuna: 'La Serena',
        shipping_address: 'Av. del Mar 2400, Depto 902',
        subtotal: 31980,
        shipping_cost: 4990,
        total: 36970,
        status: 'Pagado',
        created_at: now,
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 2, price: products[0].sale_price }
        ]
      },
      {
        client_name: 'Mauricio Toledo Riquelme',
        client_rut: '15.667.112-K',
        client_email: 'mtoledo@live.cl',
        client_phone: '+56 9 5566 7788',
        delivery_method: 'punto',
        shipping_region: 'Región del Maule',
        shipping_comuna: 'Talca',
        pickup_point_name: 'Punto Blue Express - Minimarket El Centenario',
        pickup_point_address: 'Calle 1 Oriente 1420, Talca',
        subtotal: 15990,
        shipping_cost: 3990,
        total: 19980,
        status: 'Pagado',
        created_at: now,
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 1, price: products[0].sale_price }
        ]
      },
      {
        client_name: 'Francisca Larraín Cruz',
        client_rut: '17.332.991-5',
        client_email: 'fran.larrain@outlook.cl',
        client_phone: '+56 9 4433 2211',
        delivery_method: 'domicilio',
        shipping_region: 'Región Metropolitana de Santiago',
        shipping_comuna: 'Vitacura',
        shipping_address: 'Las Hualtatas 6500, Casa 12',
        subtotal: 47970,
        shipping_cost: 3490,
        total: 51460,
        status: 'Pagado',
        created_at: now,
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 3, price: products[0].sale_price }
        ]
      },

      // === 4 SHIPPED ORDERS (Para Historial y Filtros) ===
      {
        client_name: 'Claudio Valenzuela Peña',
        client_rut: '12.877.654-K',
        client_email: 'c.valenzuela@gmail.com',
        client_phone: '+56 9 8765 4321',
        delivery_method: 'domicilio',
        shipping_region: 'Región de la Araucanía',
        shipping_comuna: 'Temuco',
        shipping_address: 'Avenida Alemania 0820, Apt 304',
        subtotal: 15990,
        shipping_cost: 5190,
        total: 21180,
        status: 'Enviado',
        created_at: fiveDaysAgo, // Weekly filter match
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 1, price: products[0].sale_price }
        ]
      },
      {
        client_name: 'Daniela Medina Soto',
        client_rut: '18.112.334-9',
        client_email: 'dani.medina@vtr.net',
        client_phone: '+56 9 6543 2109',
        delivery_method: 'domicilio',
        shipping_region: 'Región Metropolitana de Santiago',
        shipping_comuna: 'Santiago Centro',
        shipping_address: 'Huérfanos 1400, Piso 15',
        subtotal: 31980,
        shipping_cost: 2990,
        total: 34970,
        status: 'Enviado',
        created_at: currentMonthDate, // Current Month match
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 2, price: products[0].sale_price }
        ]
      },
      {
        client_name: 'Gabriel Rojas Estévez',
        client_rut: '14.889.332-1',
        client_email: 'grojas@yahoo.com',
        client_phone: '+56 9 3322 1100',
        delivery_method: 'punto',
        shipping_region: 'Región de Antofagasta',
        shipping_comuna: 'Antofagasta',
        pickup_point_name: 'Punto Blue Express - Bazar Antofagasta',
        pickup_point_address: 'Prat 480, Antofagasta',
        subtotal: 15990,
        shipping_cost: 5990,
        total: 21980,
        status: 'Enviado',
        created_at: julyDate, // July 2026 match
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 1, price: products[0].sale_price }
        ]
      },
      {
        client_name: 'Sofía Martínez Vega',
        client_rut: '20.334.887-3',
        client_email: 'sofia.martinez@gmail.com',
        client_phone: '+56 9 1122 3344',
        delivery_method: 'domicilio',
        shipping_region: 'Región del Bío-Bío',
        shipping_comuna: 'Talcahuano',
        shipping_address: 'Colón 450, Casa 4',
        subtotal: 47970,
        shipping_cost: 4890,
        total: 52860,
        status: 'Enviado',
        created_at: juneDate, // June 2026 match
        items: [
          { product_id: products[0].id, title: products[0].title, quantity: 3, price: products[0].sale_price }
        ]
      }
    ];

    for (const order of demoOrders) {
      const resOrder = await client.query(`
        INSERT INTO orders (
          client_name, client_rut, client_email, client_phone,
          delivery_method, shipping_region, shipping_comuna, shipping_address,
          pickup_point_name, pickup_point_address, subtotal, shipping_cost, total, status, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING id;
      `, [
        order.client_name, order.client_rut, order.client_email, order.client_phone,
        order.delivery_method, order.shipping_region, order.shipping_comuna, order.shipping_address || null,
        order.pickup_point_name || null, order.pickup_point_address || null,
        order.subtotal, order.shipping_cost, order.total, order.status, order.created_at
      ]);

      const orderId = resOrder.rows[0].id;

      for (const item of order.items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, product_title, quantity, price)
          VALUES ($1, $2, $3, $4, $5);
        `, [orderId, item.product_id, item.title, item.quantity, item.price]);
      }
    }

    console.log("¡7 órdenes de prueba de e-commerce creadas exitosamente!");
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    await client.end();
  } catch (err) {
    console.error("Error al insertar órdenes de demo:", err.message);
  }
}

seed();
