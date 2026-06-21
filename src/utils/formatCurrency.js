// Format số tiền VND — dùng chung cho bảng kết quả và CSV export
export const formatCurrency = (amount) =>
  amount != null ? Number(amount).toLocaleString('vi-VN') + ' ₫' : '—';
