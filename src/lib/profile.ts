/**
 * Trích xuất phòng ban từ tên hiển thị của người dùng (VD: "Nguyen Van A (VTI.D5)" -> "VTI.D5")
 */
export function extractDeptFromName(fullName: string | undefined | null): string {
  if (!fullName) return '';
  const match = fullName.trim().match(/\(([^)]+)\)$/);
  return match ? match[1].trim() : '';
}
