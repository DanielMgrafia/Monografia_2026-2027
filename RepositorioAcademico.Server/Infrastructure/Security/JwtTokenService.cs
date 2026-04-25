using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using RepositorioAcademico.Server.Domain;

namespace RepositorioAcademico.Server.Infrastructure.Security
{
    public class JwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public (string Token, DateTime ExpiraEn) CrearToken(
            Usuario usuario,
            IEnumerable<string> roles,
            IEnumerable<string> permisos)
        {
            var expirationMinutes = _configuration.GetValue<int?>("Jwt:ExpirationMinutes") ?? 240;
            var expiraEn = DateTime.UtcNow.AddMinutes(expirationMinutes);
            var key = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("No se ha configurado la clave JWT.");

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, usuario.Correo),
                new(JwtRegisteredClaimNames.Email, usuario.Correo),
                new("carnet", usuario.Carnet),
                new("nombreCompleto", $"{usuario.Nombres} {usuario.Apellidos}".Trim())
            };

            claims.AddRange(roles.Select(rol => new Claim(ClaimTypes.Role, rol)));
            claims.AddRange(permisos.Select(permiso => new Claim("permission", permiso)));

            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiraEn,
                signingCredentials: credentials);

            return (new JwtSecurityTokenHandler().WriteToken(token), expiraEn);
        }
    }
}
