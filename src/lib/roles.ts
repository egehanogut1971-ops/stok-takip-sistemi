export const ROLES = {
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function isStaff(role: string | undefined | null) {
  return role === ROLES.STAFF;
}
