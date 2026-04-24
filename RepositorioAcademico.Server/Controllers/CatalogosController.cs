using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/catalogos")]
    public class CatalogosController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public CatalogosController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet("tipos-documento")]
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

        [HttpGet("facultades")]
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
    }
}
