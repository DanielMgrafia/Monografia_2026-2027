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
    [Route("api/lineas-investigacion")]
    public class LineasInvestigacionController : ControllerBase
    {
        private static readonly string[] EstadosPermitidos = ["Activo", "Inactivo"];
        private readonly RepositorioDbContext _context;

        public LineasInvestigacionController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetLineasInvestigacion(bool incluirInactivos = false)
        {
            var query = _context.LineasInvestigacion.AsNoTracking();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == null || item.Estado == "Activo");
            }

            return await query
                .OrderBy(item => item.Descripcion)
                .Select(item => MapearLineaInvestigacion(item))
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CatalogoDto>> GetLineaInvestigacion(int id)
        {
            var lineaInvestigacion = await _context.LineasInvestigacion
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => MapearLineaInvestigacion(item))
                .FirstOrDefaultAsync();

            if (lineaInvestigacion == null)
            {
                return NotFound();
            }

            return lineaInvestigacion;
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> CrearLineaInvestigacion([FromBody] CrearLineaInvestigacionRequest request)
        {
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            var existeLineaInvestigacion = await _context.LineasInvestigacion
                .AnyAsync(item => item.Descripcion == descripcion);

            if (existeLineaInvestigacion)
            {
                return Conflict("Ya existe una linea de investigacion con esa descripcion.");
            }

            var estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim();
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var lineaInvestigacion = new LineaInvestigacion
            {
                Descripcion = descripcion,
                Estado = estado
            };

            _context.LineasInvestigacion.Add(lineaInvestigacion);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLineaInvestigacion), new { id = lineaInvestigacion.Id }, MapearLineaInvestigacion(lineaInvestigacion));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarLineaInvestigacion(int id, [FromBody] ActualizarCatalogoRequest request)
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

            var lineaInvestigacion = await _context.LineasInvestigacion.FirstOrDefaultAsync(item => item.Id == id);
            if (lineaInvestigacion == null)
            {
                return NotFound();
            }

            var existeLineaInvestigacion = await _context.LineasInvestigacion
                .AnyAsync(item => item.Id != id && item.Descripcion == descripcion);

            if (existeLineaInvestigacion)
            {
                return Conflict("Ya existe una linea de investigacion con esa descripcion.");
            }

            lineaInvestigacion.Descripcion = descripcion;
            lineaInvestigacion.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearLineaInvestigacion(lineaInvestigacion);
        }

        [HttpPut("{id:int}/estado")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarEstadoLineaInvestigacion(
            int id,
            [FromBody] ActualizarEstadoCatalogoRequest request)
        {
            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var lineaInvestigacion = await _context.LineasInvestigacion.FirstOrDefaultAsync(item => item.Id == id);
            if (lineaInvestigacion == null)
            {
                return NotFound();
            }

            lineaInvestigacion.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearLineaInvestigacion(lineaInvestigacion);
        }

        private static CatalogoDto MapearLineaInvestigacion(LineaInvestigacion lineaInvestigacion)
        {
            return new CatalogoDto
            {
                Id = lineaInvestigacion.Id,
                Descripcion = lineaInvestigacion.Descripcion,
                Estado = lineaInvestigacion.Estado
            };
        }
    }
}
