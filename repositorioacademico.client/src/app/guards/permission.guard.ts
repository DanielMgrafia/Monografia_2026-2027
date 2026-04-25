import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

function extractPermissions(route: ActivatedRouteSnapshot): string[] {
  const dataPermissions = route.data['permissions'];
  if (Array.isArray(dataPermissions)) {
    return dataPermissions.filter((value): value is string => typeof value === 'string');
  }

  const singlePermission = route.data['permission'];
  return typeof singlePermission === 'string' ? [singlePermission] : [];
}

export const permissionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredPermissions = extractPermissions(route);

  if (requiredPermissions.length === 0) {
    return true;
  }

  return authService.hasAnyPermission(requiredPermissions)
    ? true
    : router.createUrlTree(['/panel']);
};
