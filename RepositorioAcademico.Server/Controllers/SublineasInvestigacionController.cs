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
    [Route("api/sublineas-investigacion")]
    public class SublineasInvestigacionController : ControllerBase
    {
        private static readonly string[] EstadosPermitidos = ["Activo", "Inactivo"];
        private readonly RepositorioDbContext _context;

        public SublineasInvestigacionController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SublineaInvestigacionDto>>> GetSublineasInvestigacion(
            int? lineaInvestigacionId = null,
            bool incluirInactivos = false)
        {
            var query = _context.SublineasInvestigacion
                .AsNoTracking()
                .Include(item => item.LineaInvestigacion)
                .AsQueryable();

            if (!incluirInactivos)
            {
                query = query.Where(item =>
                    (item.Estado == null || item.Estado == "Activo") &&
                    item.LineaInvestigacion != null &&
                    (item.LineaInvestigacion.Estado == null || item.LineaInvestigacion.Estado == "Activo"));
            }

            if (lineaInvestigacionId.HasValue)
            {
                query = query.Where(item => item.LineaInvestigacionId == lineaInvestigacionId.Value);
            }

            var sublineas = await query
                .OrderBy(item => item.LineaInvestigacion!.Descripcion)
                .ThenBy(item => item.Descripcion)
                .ToListAsync();

            return sublineas.Select(MapearSublinea).ToList();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<SublineaInvestigacionDto>> GetSublineaInvestigacion(int id)
        {
            var sublineaInvestigacion = await _context.SublineasInvestigacion
                .AsNoTracking()
                .Include(item => item.LineaInvestigacion)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (sublineaInvestigacion == null)
            {
                return NotFound();
            }

            return MapearSublinea(sublineaInvestigacion);
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<SublineaInvestigacionDto>> CrearSublineaInvestigacion(
            [FromBody] CrearSublineaInvestigacionRequest request)
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

            var validacionLinea = await ValidarLineaInvestigacionActivaAsync(request.LineaInvestigacionId);
            if (validacionLinea is not null)
            {
                return validacionLinea;
            }

            var existeSublinea = await _context.SublineasInvestigacion
                .AnyAsync(item =>
                    item.LineaInvestigacionId == request.LineaInvestigacionId &&
                    item.Descripcion == descripcion);

            if (existeSublinea)
            {
                return Conflict("Ya existe una sublinea con esa descripcion para la linea seleccionada.");
            }

            var sublineaInvestigacion = new SublineaInvestigacion
            {
                Descripcion = descripcion,
                LineaInvestigacionId = request.LineaInvestigacionId,
                Estado = estado
            };

            _context.SublineasInvestigacion.Add(sublineaInvestigacion);
            await _context.SaveChangesAsync();

            var creada = await _context.SublineasInvestigacion
                .AsNoTracking()
                .Include(item => item.LineaInvestigacion)
                .FirstAsync(item => item.Id == sublineaInvestigacion.Id);

            return CreatedAtAction(
                nameof(GetSublineaInvestigacion),
                new { id = sublineaInvestigacion.Id },
                MapearSublinea(creada));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<SublineaInvestigacionDto>> ActualizarSublineaInvestigacion(
            int id,
            [FromBody] ActualizarSublineaInvestigacionRequest request)
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

            var validacionLinea = await ValidarLineaInvestigacionActivaAsync(request.LineaInvestigacionId);
            if (validacionLinea is not null)
            {
                return validacionLinea;
            }

            var sublineaInvestigacion = await _context.SublineasInvestigacion
                .Include(item => item.LineaInvestigacion)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (sublineaInvestigacion == null)
            {
                return NotFound();
            }

            var existeSublinea = await _context.SublineasInvestigacion
                .AnyAsync(item =>
                    item.Id != id &&
                    item.LineaInvestigacionId == request.LineaInvestigacionId &&
                    item.Descripcion == descripcion);

            if (existeSublinea)
            {
                return Conflict("Ya existe una sublinea con esa descripcion para la linea seleccionada.");
            }

            sublineaInvestigacion.Descripcion = descripcion;
            sublineaInvestigacion.LineaInvestigacionId = request.LineaInvestigacionId;
            sublineaInvestigacion.Estado = estado;
            await _context.SaveChangesAsync();

            var actualizada = await _context.SublineasInvestigacion
                .AsNoTracking()
                .Include(item => item.LineaInvestigacion)
                .FirstAsync(item => item.Id == id);

            return MapearSublinea(actualizada);
        }

        [HttpPut("{id:int}/estado")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<SublineaInvestigacionDto>> ActualizarEstadoSublineaInvestigacion(
            int id,
            [FromBody] ActualizarEstadoCatalogoRequest request)
        {
            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var sublineaInvestigacion = await _context.SublineasInvestigacion
                .Include(item => item.LineaInvestigacion)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (sublineaInvestigacion == null)
            {
                return NotFound();
            }

            if (string.Equals(estado, "Activo", StringComparison.OrdinalIgnoreCase))
            {
                var validacionLinea = await ValidarLineaInvestigacionActivaAsync(sublineaInvestigacion.LineaInvestigacionId);
                if (validacionLinea is not null)
                {
                    return validacionLinea;
                }
            }

            sublineaInvestigacion.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearSublinea(sublineaInvestigacion);
        }

        private async Task<ActionResult?> ValidarLineaInvestigacionActivaAsync(int lineaInvestigacionId)
        {
            var lineaInvestigacionExiste = await _context.LineasInvestigacion
                .AnyAsync(item =>
                    item.Id == lineaInvestigacionId &&
                    (item.Estado == null || item.Estado == "Activo"));

            return lineaInvestigacionExiste
                ? null
                : BadRequest("La linea de investigacion seleccionada no existe o esta inactiva.");
        }

        private static SublineaInvestigacionDto MapearSublinea(SublineaInvestigacion sublineaInvestigacion)
        {
            return new SublineaInvestigacionDto
            {
                Id = sublineaInvestigacion.Id,
                Descripcion = sublineaInvestigacion.Descripcion,
                Estado = sublineaInvestigacion.Estado,
                LineaInvestigacionId = sublineaInvestigacion.LineaInvestigacionId,
                LineaInvestigacion = sublineaInvestigacion.LineaInvestigacion?.Descripcion
            };
        }
    }
}
