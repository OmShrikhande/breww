export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  VIEWER: 'viewer',
};

export const roleLabel = (role) => {
  switch (role) {
    case ROLES.SUPERADMIN: return 'Super Admin';
    case ROLES.ADMIN: return 'Admin';
    case ROLES.VIEWER: return 'Viewer';
    default: return role || 'Admin';
  }
};

export const isSuperAdmin = (user) => user?.role === ROLES.SUPERADMIN;
export const isAdminOrAbove = (user) =>
  user?.role === ROLES.SUPERADMIN || user?.role === ROLES.ADMIN;
export const canWrite = (user) => isAdminOrAbove(user);
export const canManageSecurity = (user) => isSuperAdmin(user);
