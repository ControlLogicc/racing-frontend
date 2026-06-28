// Tài khoản test cho từng role — chỉ dùng khi VITE_USE_MOCK=true
// Khi BE xong: đặt VITE_USE_MOCK=false trong .env là xong, không cần sửa code nào khác

export const MOCK_USERS = [
  { userId: 1, fullName: 'Admin User',     email: 'admin@test.com',     password: '123456', role: 'ADMIN' },
  { userId: 2, staffId: 1, fullName: 'Staff User', email: 'staff@test.com', password: '123456', role: 'STAFF' },
  { userId: 3, refereeId: 1, fullName: 'Referee User', email: 'referee@test.com', password: '123456', role: 'REFEREE' },
  { userId: 4, fullName: 'Owner User',     email: 'owner@test.com',     password: '123456', role: 'OWNER' },
  { userId: 5, jockeyId: 1, fullName: 'Jockey User', email: 'jockey@test.com', password: '123456', role: 'JOCKEY' },
  { userId: 6, fullName: 'Spectator User', email: 'spectator@test.com', password: '123456', role: 'SPECTATOR' },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function mockLogin({ email, password }) {
  await delay(400);
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!user) {
    const err = new Error('Sai email hoặc mật khẩu');
    err.response = { data: { message: 'Sai email hoặc mật khẩu' } };
    throw err;
  }
  const { password: _pw, ...rest } = user;
  return {
    ...rest,
    token: `mock-token-${user.role.toLowerCase()}-${user.userId}`,
  };
}

export async function mockRegister({ fullName, email, phone, password, role }) {
  await delay(400);
  const exists = MOCK_USERS.find((u) => u.email === email);
  if (exists) {
    const err = new Error('Email đã được sử dụng');
    err.response = { data: { message: 'Email đã được sử dụng' } };
    throw err;
  }
  const newId = MOCK_USERS.length + 1;
  return {
    userId: newId,
    fullName,
    email,
    role: role.toUpperCase(),
    token: `mock-token-${role.toLowerCase()}-${newId}`,
  };
}
