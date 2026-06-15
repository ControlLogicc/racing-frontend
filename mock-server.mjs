// Server GIẢ chỉ để test auth. KHÔNG nằm trong src/, không cần cài lib.
// Chạy:  node mock-server.mjs   (cổng 8080)
import { createServer } from 'http';

const PORT = 8080;

// Mỗi role 1 tài khoản test — mật khẩu chung: 123456
const USERS = [
  { user_id: 1, full_name: 'Admin Demo',     email: 'admin@test.com',     role: 'admin',     password: '123456' },
  { user_id: 2, full_name: 'Staff Demo',     email: 'staff@test.com',     role: 'staff',     password: '123456' },
  { user_id: 3, full_name: 'Referee Demo',   email: 'referee@test.com',   role: 'referee',   password: '123456' },
  { user_id: 4, full_name: 'Owner Demo',     email: 'owner@test.com',     role: 'owner',     password: '123456' },
  { user_id: 5, full_name: 'Jockey Demo',    email: 'jockey@test.com',    role: 'jockey',    password: '123456' },
  { user_id: 6, full_name: 'Spectator Demo', email: 'spectator@test.com', role: 'spectator', password: '123456' },
];

const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
  });

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {}); // CORS preflight

  if (req.method === 'POST' && req.url === '/auth/login') {
    const { email, password } = await readBody(req);
    const u = USERS.find((x) => x.email === email && x.password === password);
    if (!u) return send(res, 401, { message: 'Email hoặc mật khẩu không đúng.' });
    return send(res, 200, {
      token: 'fake-jwt-' + u.user_id,
      user: { user_id: u.user_id, full_name: u.full_name, role: u.role },
    });
  }

  if (req.method === 'POST' && req.url === '/auth/register') {
    const body = await readBody(req);
    if (!body.email || !body.password) return send(res, 400, { message: 'Thiếu thông tin đăng ký.' });
    if (USERS.some((x) => x.email === body.email)) return send(res, 400, { message: 'Email đã tồn tại.' });
    return send(res, 201, { message: 'Đăng ký thành công.' });
  }

  send(res, 404, { message: 'Not found' });
}).listen(PORT, () => console.log(`✅ Mock auth server: http://localhost:${PORT}`));