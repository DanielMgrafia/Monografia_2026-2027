using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/facultades")]
    public class FacultadesController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public FacultadesController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetFacultades()
        {
            return await _context.Facultades
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
        public async Task<ActionResult<CatalogoDto>> GetFacultad(int id)
        {
            var facultad = await _context.Facultades
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => new CatalogoDto
                {
                    Id = item.Id,
                    Descripcion = item.Descripcion
                })
                .FirstOrDefaultAsync();

            if (facultad == null)
            {
                return NotFound();
            }

            return facultad;
        }

        [HttpPost]
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

            var facultad = new Facultad
            {
                Descripcion = descripcion,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            _context.Facultades.Add(facultad);
            await _context.SaveChangesAsync();

            var resultado = new CatalogoDto
            {
                Id = facultad.Id,
                Descripcion = facultad.Descripcion
            };

            return CreatedAtAction(nameof(GetFacultad), new { id = facultad.Id }, resultado);
        }
    }
}
