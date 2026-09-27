using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;
using RepositorioAcademico.Server.Infrastructure.Security;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Authorize(Policy = AuthorizationPolicies.GestionarUsuarios)]
    [Route("api/usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly RepositorioDbContext _context;
        private readonly PasswordService _passwordService;

        public UsuariosController(RepositorioDbContext context, PasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios(bool incluirInactivos = false, string? banderaRol = null)
        {
            var query = _context.Usuarios
                .AsNoTracking()
                .Include(item => item.UsuarioRoles)
                .ThenInclude(item => item.Rol)
                .ThenInclude(item => item!.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .AsQueryable();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == "Activo");
            }

            if (!string.IsNullOrWhiteSpace(banderaRol))
            {
                switch (banderaRol.Trim())
                {
                    case "esEstudiante":
                        query = query.Where(item => item.UsuarioRoles.Any(usuarioRol =>
                            usuarioRol.Estado == "Activo" &&
                            usuarioRol.Rol != null &&
                            usuarioRol.Rol.Estado == "Activo" &&
                            usuarioRol.Rol.EsEstudiante));
                        break;
                    case "esDocente":
                        query = query.Where(item => item.UsuarioRoles.Any(usuarioRol =>
                            usuarioRol.Estado == "Activo" &&
                            usuarioRol.Rol != null &&
                            usuarioRol.Rol.Estado == "Activo" &&
                            usuarioRol.Rol.EsDocente));
                        break;
                    case "esAdministrador":
                        query = query.Where(item => item.UsuarioRoles.Any(usuarioRol =>
                            usuarioRol.Estado == "Activo" &&
                            usuarioRol.Rol != null &&
                            usuarioRol.Rol.Estado == "Activo" &&
                            usuarioRol.Rol.EsAdministrador));
                        break;
                    case "esCargoAcademico":
                        query = query.Where(item => item.UsuarioRoles.Any(usuarioRol =>
                            usuarioRol.Estado == "Activo" &&
                            usuarioRol.Rol != null &&
                            usuarioRol.Rol.Estado == "Activo" &&
                            usuarioRol.Rol.EsCargoAcademico));
                        break;
                    default:
                        return BadRequest("La bandera de rol solicitada no es valida.");
                }
            }

            var usuarios = await query
                .OrderBy(item => item.Nombres)
                .ThenBy(item => item.Apellidos)
                .ToListAsync();

            return usuarios.Select(MapearUsuario).ToList();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios
                .AsNoTracking()
                .Include(item => item.UsuarioRoles)
                .ThenInclude(item => item.Rol)
                .ThenInclude(item => item!.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (usuario == null)
            {
                return NotFound();
            }

            return MapearUsuario(usuario);
        }

        [HttpPost]
        public async Task<ActionResult<UsuarioDto>> CrearUsuario([FromBody] CrearUsuarioRequest request)
        {
            var correo = request.Correo?.Trim().ToLowerInvariant() ?? string.Empty;
            var carnet = request.Carnet?.Trim().ToUpperInvariant() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(correo) || string.IsNullOrWhiteSpace(carnet))
            {
                return BadRequest("El correo y el carnet son obligatorios.");
            }

            if (request.RolIds.Count == 0)
            {
                return BadRequest("Debes asignar al menos un rol al usuario.");
            }

            var correoExiste = await _context.Usuarios.AnyAsync(item => item.Correo.ToLower() == correo);
            if (correoExiste)
            {
                return Conflict("Ya existe un usuario con ese correo.");
            }

            var carnetExiste = await _context.Usuarios.AnyAsync(item => item.Carnet.ToUpper() == carnet);
            if (carnetExiste)
            {
                return Conflict("Ya existe un usuario con ese carnet.");
            }

            var rolIds = request.RolIds.Distinct().ToList();
            var rolesValidos = await _context.Roles
                .CountAsync(item => rolIds.Contains(item.Id) && item.Estado == "Activo");

            if (rolesValidos != rolIds.Count)
            {
                return BadRequest("Uno o mas roles seleccionados no existen o estan inactivos.");
            }

            var usuario = new Usuario
            {
                Nombres = request.Nombres.Trim(),
                Apellidos = request.Apellidos.Trim(),
                Correo = correo,
                Carnet = carnet,
                PasswordHash = _passwordService.HashPassword(request.Password),
                DebeCambiarPassword = false,
                FechaCambioPassword = DateTime.UtcNow,
                PasswordTemporalExpiraEn = null,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim(),
                FechaCreacion = DateTime.UtcNow
            };

            foreach (var rolId in rolIds)
            {
                usuario.UsuarioRoles.Add(new UsuarioRol
                {
                    RolId = rolId,
                    Estado = "Activo",
                    FechaAsignacion = DateTime.UtcNow
                });
            }

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var creado = await _context.Usuarios
                .AsNoTracking()
                .Include(item => item.UsuarioRoles)
                .ThenInclude(item => item.Rol)
                .ThenInclude(item => item!.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstAsync(item => item.Id == usuario.Id);

            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, MapearUsuario(creado));
        }

        [HttpPut("{id:int}/roles")]
        public async Task<ActionResult<UsuarioDto>> ActualizarRoles(int id, [FromBody] ActualizarRolesUsuarioRequest request)
        {
            var usuario = await _context.Usuarios
                .Include(item => item.UsuarioRoles)
                .ThenInclude(item => item.Rol)
                .ThenInclude(item => item!.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (usuario == null)
            {
                return NotFound();
            }

            var rolIds = request.RolIds.Distinct().ToList();
            if (rolIds.Count == 0)
            {
                return BadRequest("Debes asignar al menos un rol al usuario.");
            }

            var rolesValidos = await _context.Roles
                .CountAsync(item => rolIds.Contains(item.Id) && item.Estado == "Activo");

            if (rolesValidos != rolIds.Count)
            {
                return BadRequest("Uno o mas roles seleccionados no existen o estan inactivos.");
            }

            foreach (var usuarioRol in usuario.UsuarioRoles)
            {
                usuarioRol.Estado = rolIds.Contains(usuarioRol.RolId) ? "Activo" : "Inactivo";
            }

            var rolesExistentes = usuario.UsuarioRoles.Select(item => item.RolId).ToHashSet();
            foreach (var rolId in rolIds.Where(item => !rolesExistentes.Contains(item)))
            {
                usuario.UsuarioRoles.Add(new UsuarioRol
                {
                    UsuarioId = usuario.Id,
                    RolId = rolId,
                    Estado = "Activo",
                    FechaAsignacion = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return MapearUsuario(usuario);
        }

        [HttpPost("{id:int}/restablecer-password")]
        public async Task<ActionResult<RestablecerPasswordResponseDto>> RestablecerPassword(int id)
        {
            var usuario = await _context.Usuarios
                .Include(item => item.UsuarioRoles)
                .ThenInclude(item => item.Rol)
                .ThenInclude(item => item!.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (usuario == null)
            {
                return NotFound();
            }

            if (usuario.Estado != "Activo")
            {
                return BadRequest("Solo se puede restablecer la contrasena de usuarios activos.");
            }

            var passwordTemporal = GenerarPasswordTemporal();
            var expiraEn = DateTime.UtcNow.AddHours(24);

            usuario.PasswordHash = _passwordService.HashPassword(passwordTemporal);
            usuario.DebeCambiarPassword = true;
            usuario.PasswordTemporalExpiraEn = expiraEn;

            await _context.SaveChangesAsync();

            return new RestablecerPasswordResponseDto
            {
                PasswordTemporal = passwordTemporal,
                ExpiraEn = expiraEn,
                Usuario = MapearUsuario(usuario)
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
                DebeCambiarPassword = usuario.DebeCambiarPassword,
                FechaCambioPassword = usuario.FechaCambioPassword,
                PasswordTemporalExpiraEn = usuario.PasswordTemporalExpiraEn,
                FechaCreacion = usuario.FechaCreacion,
                Roles = rolesActivos.Select(rol => new RolResumenDto
                {
                    Id = rol.Id,
                    Nombre = rol.Nombre,
                    Descripcion = rol.Descripcion,
                    IconoUrl = rol.IconoUrl,
                    Estado = rol.Estado,
                    EsEstudiante = rol.EsEstudiante,
                    EsDocente = rol.EsDocente,
                    EsAdministrador = rol.EsAdministrador,
                    EsCargoAcademico = rol.EsCargoAcademico
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

        private static string GenerarPasswordTemporal()
        {
            const string caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            Span<byte> bytes = stackalloc byte[12];
            RandomNumberGenerator.Fill(bytes);

            var resultado = new char[12];
            for (var index = 0; index < resultado.Length; index++)
            {
                resultado[index] = caracteres[bytes[index] % caracteres.Length];
            }

            return $"Tmp-{new string(resultado)}";
        }
    }
}
