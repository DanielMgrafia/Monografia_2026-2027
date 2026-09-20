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
        private readonly RepositorioDbContext _context;

        public LineasInvestigacionController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetLineasInvestigacion()
        {
            return await _context.LineasInvestigacion
                .AsNoTracking()
                .Where(item => item.Estado == null || item.Estado == "Activo")
                .OrderBy(item => item.Descripcion)
                .Select(item => new CatalogoDto
                {
                    Id = item.Id,
                    Descripcion = item.Descripcion
                })
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CatalogoDto>> GetLineaInvestigacion(int id)
        {
            var lineaInvestigacion = await _context.LineasInvestigacion
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => new CatalogoDto
                {
                    Id = item.Id,
                    Descripcion = item.Descripcion
                })
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

            var lineaInvestigacion = new LineaInvestigacion
            {
                Descripcion = descripcion,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            _context.LineasInvestigacion.Add(lineaInvestigacion);
            await _context.SaveChangesAsync();

            var resultado = new CatalogoDto
            {
                Id = lineaInvestigacion.Id,
                Descripcion = lineaInvestigacion.Descripcion
            };

            return CreatedAtAction(nameof(GetLineaInvestigacion), new { id = lineaInvestigacion.Id }, resultado);
        }
    }
}
