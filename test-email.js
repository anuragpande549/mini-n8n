fetch('http://localhost:3000/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test',
    body: 'Hello world'
  })
}).then(res => res.json()).then(console.log).catch(console.error);
