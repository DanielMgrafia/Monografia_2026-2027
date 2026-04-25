using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;
using RepositorioAcademico.Server.Infrastructure.Security;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly RepositorioDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly JwtTokenService _jwtTokenService;

        public AuthController(
            RepositorioDbContext context,
            PasswordService passwordService,
            JwtTokenService jwtTokenService)
        {
            _context = context;
            _passwordService = passwordService;
            _jwtTokenService = jwtTokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequest request)
        {
            var login = request.Login?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Debes enviar el correo o carnet y la contrasena.");
            }

            var loginLower = login.ToLowerInvariant();
            var loginUpper = login.ToUpperInvariant();

            var usuario = await _context.Usuarios
                .AsNoTracking()
                .Include(item => item.UsuarioRoles)
                .ThenInclude(item => item.Rol)
                .ThenInclude(item => item!.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstOrDefaultAsync(item =>
                    item.Correo.ToLower() == loginLower ||
                    item.Carnet.ToUpper() == loginUpper);

            if (usuario == null || usuario.Estado != "Activo")
            {
                return Unauthorized("Credenciales invalidas.");
            }

            var passwordValida = _passwordService.VerifyPassword(request.Password, usuario.PasswordHash);
            if (!passwordValida)
            {
                return Unauthorized("Credenciales invalidas.");
            }

            var usuarioDto = MapearUsuario(usuario);
            var roles = usuarioDto.Roles.Select(item => item.Nombre);
            var permisos = usuarioDto.Permisos;
            var token = _jwtTokenService.CrearToken(usuario, roles, permisos);

            return new AuthResponseDto
            {
                Token = token.Token,
                ExpiraEn = token.ExpiraEn,
                Usuario = usuarioDto
            };
        }

        private static UsuarioDto MapearUsuario(Usuario usuario)
        {
            var rolesActivos = usuario.UsuarioRoles
                .Where(item => item.Estado == "Activo" && item.Rol != null && item.Rol.Estado == "Activo")
                .Select(item => item.Rol!)
                .OrderBy(item => item.Nombre)
                .ToList();

            return new UsuarioDto
            {
                Id = usuario.Id,
                Nombres = usuario.Nombres,
                Apellidos = usuario.Apellidos,
                Correo = usuario.Correo,
                Carnet = usuario.Carnet,
                Estado = usuario.Estado,
                FechaCreacion = usuario.FechaCreacion,
                Roles = rolesActivos.Select(rol => new RolResumenDto
                {
                    Id = rol.Id,
                    Nombre = rol.Nombre,
                    Descripcion = rol.Descripcion,
                    Estado = rol.Estado
                }).ToList(),
                Permisos = rolesActivos
                    .SelectMany(rol => rol.RolPermisos)
                    .Where(item => item.Estado == "Activo" && item.Permiso != null && item.Permiso.Estado == "Activo")
                    .Select(item => item.Permiso!.Codigo)
                    .Distinct()
                    .OrderBy(item => item)
                    .ToList()
            };
        }
    }
}
