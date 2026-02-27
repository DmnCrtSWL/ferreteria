const http = require('http');

function req(method, path, body) {
    return new Promise(res => {
        const o = { method, hostname: 'localhost', port: 3000, path, headers: { 'Content-Type': 'application/json' } };
        const r = http.request(o, response => {
            let d = '';
            response.on('data', c => d += c);
            response.on('end', () => res({ s: response.statusCode, d }));
        });
        if (body) r.write(JSON.stringify(body));
        r.end();
    });
}

(async () => {
    try {
        console.log('--- Fetching Inventory ---');
        let r = await req('GET', '/api/inventory');
        let inv = JSON.parse(r.d);
        if (!inv.length) return console.log('No inventory to sell.');

        let p1 = inv[0];
        let startStock = Number(p1.stock);
        console.log('Product: ' + p1.product_name + ', Stock: ' + startStock);

        console.log('--- Creating Sale ---');
        let sr = await req('POST', '/api/sales', {
            client_name: 'Test Client',
            payment_method: 'Efectivo',
            date: new Date().toISOString().split('T')[0],
            total: 100,
            items: [{ name: p1.product_name, unit: 'Pza', quantity: 1, price: 100, subtotal: 100 }]
        });
        console.log(sr.s, sr.d);
        if (sr.s !== 201) return;

        let saleId = JSON.parse(sr.d).id;

        console.log('--- Verifying Inventory Deduction ---');
        r = await req('GET', '/api/inventory');
        let inv2 = JSON.parse(r.d);
        let p2 = Object.values(inv2).find(i => i.product_name === p1.product_name);
        console.log('New Stock: ' + p2.stock + ' (Expected: ' + (startStock - 1) + ')');

        console.log('--- Deleting Sale ---');
        let dr = await req('DELETE', '/api/sales/' + saleId);
        console.log(dr.s, dr.d);

        console.log('--- Verifying Inventory Revert ---');
        r = await req('GET', '/api/inventory');
        let inv3 = JSON.parse(r.d);
        let p3 = Object.values(inv3).find(i => i.product_name === p1.product_name);
        console.log('Final Stock: ' + p3.stock + ' (Expected: ' + startStock + ')');

        console.log('--- Success ---');
    } catch (e) { console.error(e) }
})();
