// Server giả KHỚP API thật + có kiểm token để test 401/403. Chạy: node mock-server.mjs
import { createServer } from 'http';
const PORT = 8080;

// "DB" trong RAM (mật khẩu: 123456). Thêm 1 acc SUSPENDED để test chặn login.
const USERS = [
  { user_id: 1, full_name: 'Admin Demo',     email: 'admin@test.com',     phone: '0900000001', role: 'admin',     password: '123456', status: 'active' },
  { user_id: 2, full_name: 'Staff Demo',     email: 'staff@test.com',     phone: '0900000002', role: 'staff',     password: '123456', status: 'active' },
  { user_id: 3, full_name: 'Referee Demo',   email: 'referee@test.com',   phone: '0900000003', role: 'referee',   password: '123456', status: 'active' },
  { user_id: 4, full_name: 'Owner Demo',     email: 'owner@test.com',     phone: '0900000004', role: 'owner',     password: '123456', status: 'active' },
  { user_id: 5, full_name: 'Jockey Demo',    email: 'jockey@test.com',    phone: '0900000005', role: 'jockey',    password: '123456', status: 'active' },
  { user_id: 6, full_name: 'Spectator Demo', email: 'spectator@test.com', phone: '0900000006', role: 'spectator', password: '123456', status: 'active' },
  { user_id: 7, full_name: 'Locked Demo',    email: 'locked@test.com',    phone: '0900000007', role: 'owner',     password: '123456', status: 'suspended' },
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
const readBody = (req) => new Promise((resolve) => {
  let d = ''; req.on('data', (c) => (d += c));
  req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
});

// register/login: có token + user lồng nhau, role chữ thường (khớp FE: data.user.role)
const toAuthResult = (u) => ({
  token: 'fake-jwt-' + u.user_id,
  user: {
    user_id: u.user_id, full_name: u.full_name, email: u.email, phone: u.phone, role: u.role,
  },
});
// admin-create / list: KHÔNG token, CÓ status (đúng doc)
const toUserRecord = (u) => ({
  userId: u.user_id, fullName: u.full_name, email: u.email, phone: u.phone,
  role: u.role.toUpperCase(), status: u.status.toUpperCase(),
});
// đọc user từ header Authorization: Bearer fake-jwt-<id>  (giả lập JWT filter)
const getUserFromAuth = (req) => {
  const m = (req.headers['authorization'] || '').match(/^Bearer\s+fake-jwt-(\d+)$/);
  return m ? USERS.find((u) => u.user_id === Number(m[1])) || null : null;
};

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = req.url || '';

  if (req.method === 'GET' && url === '/')
    return send(res, 200, { ok: true, message: 'Mock auth. Base URL = http://localhost:8080/api' });

  // ---- LOGIN (sai = 400, phải ACTIVE) ----
  if (req.method === 'POST' && url.endsWith('/auth/login')) {
    const { email, password } = await readBody(req);
    const u = USERS.find((x) => x.email === email && x.password === password);
    if (!u) return send(res, 400, { message: 'Email hoặc mật khẩu không đúng.' });
    if (u.status !== 'active') return send(res, 400, { message: 'Tài khoản chưa được kích hoạt.' });
    return send(res, 200, toAuthResult(u));
  }

  // ---- REGISTER (chỉ OWNER/JOCKEY/SPECTATOR) ----
  if (req.method === 'POST' && url.endsWith('/auth/register')) {
    const b = await readBody(req);
    const role = (b.role || '').toUpperCase();
    if (!b.email || !b.password || !b.fullName) return send(res, 400, { message: 'Thiếu thông tin đăng ký.' });
    if (!['OWNER', 'JOCKEY', 'SPECTATOR'].includes(role)) return send(res, 400, { message: 'Role này không được tự đăng ký.' });
    if (USERS.some((x) => x.email === b.email)) return send(res, 400, { message: 'Email đã tồn tại.' });
    const u = { user_id: USERS.length + 1, full_name: b.fullName, email: b.email, phone: b.phone, role: role.toLowerCase(), password: b.password, status: 'active' };
    USERS.push(u);
    return send(res, 200, toAuthResult(u));
  }

  // ---- ADMIN CREATE (chỉ ADMIN/STAFF/REFEREE, cần token admin) ----
  if (req.method === 'POST' && url.endsWith('/admin/users')) {
    const me = getUserFromAuth(req);
    if (!me) return send(res, 401, { message: 'Thiếu hoặc sai token.' });          // JWT filter
    if (me.role !== 'admin') return send(res, 403, { message: 'Chỉ admin được phép.' }); // role guard
    const b = await readBody(req);
    const role = (b.role || '').toUpperCase();
    if (!b.email || !b.password || !b.fullName) return send(res, 400, { message: 'Thiếu thông tin.' });
    if (!['ADMIN', 'STAFF', 'REFEREE'].includes(role)) return send(res, 400, { message: 'Role nội bộ phải là ADMIN/STAFF/REFEREE.' });
    if (USERS.some((x) => x.email === b.email)) return send(res, 400, { message: 'Email đã tồn tại.' });
    const u = { user_id: USERS.length + 1, full_name: b.fullName, email: b.email, phone: b.phone, role: role.toLowerCase(), password: b.password, status: 'active' };
    USERS.push(u);
    return send(res, 200, toUserRecord(u)); // doc: trả status, KHÔNG có token
  }

  // ---- USERS LIST ⚠️ GIẢ ĐỊNH: doc CHƯA định nghĩa endpoint này, phải hỏi backend ----
  if (req.method === 'GET' && url.endsWith('/admin/users')) {
    const me = getUserFromAuth(req);
    if (!me) return send(res, 401, { message: 'Thiếu hoặc sai token.' });
    if (me.role !== 'admin') return send(res, 403, { message: 'Chỉ admin được phép.' });
    return send(res, 200, USERS.map(toUserRecord)); // shape tạm — chốt với backend (mảng? hay {items,page,pageSize,total}?)
  }

  send(res, 404, { message: 'Not found' });
}).listen(PORT, () => console.log(`✅ Mock đầy đủ: http://localhost:${PORT}`));