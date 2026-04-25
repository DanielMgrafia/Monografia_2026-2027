using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/roles")]
    public class RolesController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public RolesController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolDto>>> GetRoles(bool incluirInactivos = false)
        {
            var query = _context.Roles
                .AsNoTracking()
                .Include(item => item.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .AsQueryable();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == "Activo");
            }

            var roles = await query
                .OrderBy(item => item.Nombre)
                .ToListAsync();

            return roles.Select(MapearRol).ToList();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<RolDto>> GetRol(int id)
        {
            var rol = await _context.Roles
                .AsNoTracking()
                .Include(item => item.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (rol == null)
            {
                return NotFound();
            }

            return MapearRol(rol);
        }

        [HttpPost]
        public async Task<ActionResult<RolDto>> CrearRol([FromBody] CrearRolRequest request)
        {
            var nombre = request.Nombre?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(nombre))
            {
                return BadRequest("El nombre del rol es obligatorio.");
            }

            var existeRol = await _context.Roles
                .AnyAsync(item => item.Nombre.ToUpper() == nombre.ToUpper());

            if (existeRol)
            {
                return Conflict("Ya existe un rol con ese nombre.");
            }

            var permisoIds = request.PermisoIds.Distinct().ToList();
            if (permisoIds.Count > 0)
            {
                var permisosValidos = await _context.Permisos
                    .CountAsync(item => permisoIds.Contains(item.Id) && item.Estado == "Activo");

                if (permisosValidos != permisoIds.Count)
                {
                    return BadRequest("Uno o mas permisos seleccionados no existen o estan inactivos.");
                }
            }

            var rol = new Rol
            {
                Nombre = nombre,
                Descripcion = string.IsNullOrWhiteSpace(request.Descripcion) ? null : request.Descripcion.Trim(),
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            foreach (var permisoId in permisoIds)
            {
                rol.RolPermisos.Add(new RolPermiso
                {
                    PermisoId = permisoId,
                    Estado = "Activo",
                    FechaAsignacion = DateTime.UtcNow
                });
            }

            _context.Roles.Add(rol);
            await _context.SaveChangesAsync();

            var creado = await _context.Roles
                .AsNoTracking()
                .Include(item => item.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstAsync(item => item.Id == rol.Id);

            return CreatedAtAction(nameof(GetRol), new { id = rol.Id }, MapearRol(creado));
        }

        [HttpPut("{id:int}/permisos")]
        public async Task<ActionResult<RolDto>> ActualizarPermisos(int id, [FromBody] ActualizarPermisosRolRequest request)
        {
            var rol = await _context.Roles
                .Include(item => item.RolPermisos)
                .ThenInclude(item => item.Permiso)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (rol == null)
            {
                return NotFound();
            }

            var permisoIds = request.PermisoIds.Distinct().ToList();
            if (permisoIds.Count > 0)
            {
                var permisosValidos = await _context.Permisos
                    .CountAsync(item => permisoIds.Contains(item.Id) && item.Estado == "Activo");

                if (permisosValidos != permisoIds.Count)
                {
                    return BadRequest("Uno o mas permisos seleccionados no existen o estan inactivos.");
                }
            }

            foreach (var rolPermiso in rol.RolPermisos)
            {
                rolPermiso.Estado = permisoIds.Contains(rolPermiso.PermisoId) ? "Activo" : "Inactivo";
            }

            var permisosExistentes = rol.RolPermisos.Select(item => item.PermisoId).ToHashSet();
            foreach (var permisoId in permisoIds.Where(item => !permisosExistentes.Contains(item)))
            {
                rol.RolPermisos.Add(new RolPermiso
                {
                    RolId = rol.Id,
                    PermisoId = permisoId,
                    Estado = "Activo",
                    FechaAsignacion = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return MapearRol(rol);
        }

        private static RolDto MapearRol(Rol rol)
        {
            return new RolDto
            {
                Id = rol.Id,
                Nombre = rol.Nombre,
                Descripcion = rol.Descripcion,
                Estado = rol.Estado,
                Permisos = rol.RolPermisos
                    .Where(item => item.Estado == "Activo" && item.Permiso != null && item.Permiso.Estado == "Activo")
                    .OrderBy(item => item.Permiso!.Codigo)
                    .Select(item => new PermisoDto
                    {
                        Id = item.PermisoId,
                        Codigo = item.Permiso!.Codigo,
                        Descripcion = item.Permiso.Descripcion,
                        Estado = item.Permiso.Estado
                    })
                    .ToList()
            };
        }
    }
}
