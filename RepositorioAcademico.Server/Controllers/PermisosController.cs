using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/permisos")]
    public class PermisosController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public PermisosController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PermisoDto>>> GetPermisos(bool incluirInactivos = false)
        {
            var query = _context.Permisos.AsNoTracking();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == "Activo");
            }

            return await query
                .OrderBy(item => item.Codigo)
                .Select(item => new PermisoDto
                {
                    Id = item.Id,
                    Codigo = item.Codigo,
                    Descripcion = item.Descripcion,
                    Estado = item.Estado
                })
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<PermisoDto>> GetPermiso(int id)
        {
            var permiso = await _context.Permisos
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => new PermisoDto
                {
                    Id = item.Id,
                    Codigo = item.Codigo,
                    Descripcion = item.Descripcion,
                    Estado = item.Estado
                })
                .FirstOrDefaultAsync();

            if (permiso == null)
            {
                return NotFound();
            }

            return permiso;
        }

        [HttpPost]
        public async Task<ActionResult<PermisoDto>> CrearPermiso([FromBody] CrearPermisoRequest request)
        {
            var codigo = request.Codigo?.Trim().ToUpperInvariant() ?? string.Empty;
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(codigo) || string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("El codigo y la descripcion son obligatorios.");
            }

            var existePermiso = await _context.Permisos
                .AnyAsync(item => item.Codigo.ToUpper() == codigo);

            if (existePermiso)
            {
                return Conflict("Ya existe un permiso con ese codigo.");
            }

            var permiso = new Permiso
            {
                Codigo = codigo,
                Descripcion = descripcion,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            _context.Permisos.Add(permiso);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPermiso), new { id = permiso.Id }, new PermisoDto
            {
                Id = permiso.Id,
                Codigo = permiso.Codigo,
                Descripcion = permiso.Descripcion,
                Estado = permiso.Estado
            });
        }
    }
}
