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
    [Route("api/areas-conocimiento")]
    public class AreasConocimientoController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public AreasConocimientoController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetAreasConocimiento()
        {
            return await _context.AreasConocimiento
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
        public async Task<ActionResult<CatalogoDto>> GetAreaConocimiento(int id)
        {
            var areaConocimiento = await _context.AreasConocimiento
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => new CatalogoDto
                {
                    Id = item.Id,
                    Descripcion = item.Descripcion
                })
                .FirstOrDefaultAsync();

            if (areaConocimiento == null)
            {
                return NotFound();
            }

            return areaConocimiento;
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> CrearAreaConocimiento([FromBody] CrearAreaConocimientoRequest request)
        {
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            var existeAreaConocimiento = await _context.AreasConocimiento
                .AnyAsync(item => item.Descripcion == descripcion);

            if (existeAreaConocimiento)
            {
                return Conflict("Ya existe un area de conocimiento con esa descripcion.");
            }

            var areaConocimiento = new AreaConocimiento
            {
                Descripcion = descripcion,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            _context.AreasConocimiento.Add(areaConocimiento);
            await _context.SaveChangesAsync();

            var resultado = new CatalogoDto
            {
                Id = areaConocimiento.Id,
                Descripcion = areaConocimiento.Descripcion
            };

            return CreatedAtAction(nameof(GetAreaConocimiento), new { id = areaConocimiento.Id }, resultado);
        }
    }
}
