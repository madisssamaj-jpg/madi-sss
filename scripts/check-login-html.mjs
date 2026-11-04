async function test() {
  const resNe = await fetch('http://localhost:3000/ne/admin/login');
  const htmlNe = await resNe.text();
  console.log('--- /ne/admin/login ---');
  console.log('Status:', resNe.status);
  console.log('Has "प्रशासक पासवर्ड":', htmlNe.includes('प्रशासक पासवर्ड'));
  console.log('Has type="password":', htmlNe.includes('type="password"'));
  console.log('Has name="password":', htmlNe.includes('name="password"'));
  console.log('Has name="email":', htmlNe.includes('name="email"'));

  const resEn = await fetch('http://localhost:3000/en/admin/login');
  const htmlEn = await resEn.text();
  console.log('\n--- /en/admin/login ---');
  console.log('Status:', resEn.status);
  console.log('Has "Administrator password":', htmlEn.includes('Administrator password'));
  console.log('Has type="password":', htmlEn.includes('type="password"'));
  console.log('Has name="password":', htmlEn.includes('name="password"'));
  console.log('Has name="email":', htmlEn.includes('name="email"'));
}

test().catch(console.error);

