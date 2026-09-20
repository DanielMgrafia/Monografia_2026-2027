using Microsoft.AspNetCore.Authorization;

namespace RepositorioAcademico.Server.Infrastructure.Security
{
    public static class AuthorizationPolicies
    {
        public const string GestionarUsuarios = "USUARIO.GESTIONAR";
        public const string GestionarRoles = "ROL.GESTIONAR";
        public const string GestionarCatalogos = "CATALOGO.GESTIONAR";
        public const string ConsultarRolesAdministrativos = "ROLES.CONSULTAR_ADMIN";

        public static void Configure(AuthorizationOptions options)
        {
            options.AddPolicy(GestionarUsuarios, policy =>
                policy.RequireClaim("permission", GestionarUsuarios));

            options.AddPolicy(GestionarRoles, policy =>
                policy.RequireClaim("permission", GestionarRoles));

            options.AddPolicy(GestionarCatalogos, policy =>
                policy.RequireClaim("permission", GestionarCatalogos));

            options.AddPolicy(ConsultarRolesAdministrativos, policy =>
                policy.RequireAssertion(context =>
                    TienePermiso(context, GestionarUsuarios) ||
                    TienePermiso(context, GestionarRoles)));
        }

        private static bool TienePermiso(AuthorizationHandlerContext context, string permiso)
        {
            return context.User.Claims.Any(claim =>
                claim.Type == "permission" &&
                string.Equals(claim.Value, permiso, StringComparison.OrdinalIgnoreCase));
        }
    }
}
