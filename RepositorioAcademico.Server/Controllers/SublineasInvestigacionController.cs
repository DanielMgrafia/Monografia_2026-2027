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
        private readonly RepositorioDbContext _context;

        public SublineasInvestigacionController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SublineaInvestigacionDto>>> GetSublineasInvestigacion(
            int? lineaInvestigacionId = null)
        {
            var query = _context.SublineasInvestigacion
                .AsNoTracking()
                .Include(item => item.LineaInvestigacion)
                .Where(item => item.Estado == null || item.Estado == "Activo");

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

            var lineaInvestigacionExiste = await _context.LineasInvestigacion
                .AnyAsync(item =>
                    item.Id == request.LineaInvestigacionId &&
                    (item.Estado == null || item.Estado == "Activo"));

            if (!lineaInvestigacionExiste)
            {
                return BadRequest("La linea de investigacion seleccionada no existe o esta inactiva.");
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
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
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
