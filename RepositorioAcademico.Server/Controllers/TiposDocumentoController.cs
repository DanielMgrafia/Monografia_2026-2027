using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/tipos-documento")]
    public class TiposDocumentoController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public TiposDocumentoController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetTiposDocumento()
        {
            return await _context.TiposDocumento
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
        public async Task<ActionResult<CatalogoDto>> GetTipoDocumento(int id)
        {
            var tipoDocumento = await _context.TiposDocumento
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => new CatalogoDto
                {
                    Id = item.Id,
                    Descripcion = item.Descripcion
                })
                .FirstOrDefaultAsync();

            if (tipoDocumento == null)
            {
                return NotFound();
            }

            return tipoDocumento;
        }

        [HttpPost]
        public async Task<ActionResult<CatalogoDto>> CrearTipoDocumento([FromBody] CrearTipoDocumentoRequest request)
        {
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            var existeTipoDocumento = await _context.TiposDocumento
                .AnyAsync(item => item.Descripcion == descripcion);

            if (existeTipoDocumento)
            {
                return Conflict("Ya existe un tipo de documento con esa descripcion.");
            }

            var tipoDocumento = new TipoDocumento
            {
                Descripcion = descripcion,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            _context.TiposDocumento.Add(tipoDocumento);
            await _context.SaveChangesAsync();

            var resultado = new CatalogoDto
            {
                Id = tipoDocumento.Id,
                Descripcion = tipoDocumento.Descripcion
            };

            return CreatedAtAction(nameof(GetTipoDocumento), new { id = tipoDocumento.Id }, resultado);
        }
    }
}
