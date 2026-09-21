using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;
using RepositorioAcademico.Server.Infrastructure.Security;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/facultades")]
    public class FacultadesController : ControllerBase
    {
        private static readonly string[] EstadosPermitidos = ["Activo", "Inactivo"];
        private readonly RepositorioDbContext _context;

        public FacultadesController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetFacultades(bool incluirInactivos = false)
        {
            var query = _context.Facultades.AsNoTracking();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == null || item.Estado == "Activo");
            }

            return await query
                .OrderBy(item => item.Descripcion)
                .Select(item => MapearFacultad(item))
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CatalogoDto>> GetFacultad(int id)
        {
            var facultad = await _context.Facultades
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => MapearFacultad(item))
                .FirstOrDefaultAsync();

            if (facultad == null)
            {
                return NotFound();
            }

            return facultad;
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> CrearFacultad([FromBody] CrearFacultadRequest request)
        {
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            var existeFacultad = await _context.Facultades
                .AnyAsync(item => item.Descripcion == descripcion);

            if (existeFacultad)
            {
                return Conflict("Ya existe una facultad con esa descripcion.");
            }

            var estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim();
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var facultad = new Facultad
            {
                Descripcion = descripcion,
                Estado = estado
            };

            _context.Facultades.Add(facultad);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFacultad), new { id = facultad.Id }, MapearFacultad(facultad));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarFacultad(int id, [FromBody] ActualizarCatalogoRequest request)
        {
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            var estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim();
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var facultad = await _context.Facultades.FirstOrDefaultAsync(item => item.Id == id);
            if (facultad == null)
            {
                return NotFound();
            }

            var existeFacultad = await _context.Facultades
                .AnyAsync(item => item.Id != id && item.Descripcion == descripcion);

            if (existeFacultad)
            {
                return Conflict("Ya existe una facultad con esa descripcion.");
            }

            facultad.Descripcion = descripcion;
            facultad.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearFacultad(facultad);
        }

        [HttpPut("{id:int}/estado")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarEstadoFacultad(
            int id,
            [FromBody] ActualizarEstadoCatalogoRequest request)
        {
            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var facultad = await _context.Facultades.FirstOrDefaultAsync(item => item.Id == id);
            if (facultad == null)
            {
                return NotFound();
            }

            facultad.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearFacultad(facultad);
        }

        private static CatalogoDto MapearFacultad(Facultad facultad)
        {
            return new CatalogoDto
            {
                Id = facultad.Id,
                Descripcion = facultad.Descripcion,
                Estado = facultad.Estado
            };
        }
    }
}
