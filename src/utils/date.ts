export const nowIso = () => new Date().toISOString();

export const todayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const weekKey = (date = new Date()) => {
  const copy = new Date(date);
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return todayKey(copy);
};

export const isYesterday = (dateKey?: string) => {
  if (!dateKey) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateKey === todayKey(yesterday);
};

export const formatDateTime = (iso?: string) => iso ? new Date(iso).toLocaleString() : "尚未记录";

export const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString() : "尚未记录";
