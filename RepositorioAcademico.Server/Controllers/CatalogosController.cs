using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Authorize]
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

        [HttpGet("areas-conocimiento")]
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

        [HttpGet("lineas-investigacion")]
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

        [HttpGet("sublineas-investigacion")]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetSublineasInvestigacion(int? lineaInvestigacionId = null)
        {
            var query = _context.SublineasInvestigacion
                .AsNoTracking()
                .Where(item => item.Estado == null || item.Estado == "Activo");

            if (lineaInvestigacionId.HasValue)
            {
                query = query.Where(item => item.LineaInvestigacionId == lineaInvestigacionId.Value);
            }

            return await query
                .OrderBy(item => item.Descripcion)
                .Select(item => new CatalogoDto
                {
                    Id = item.Id,
                    Descripcion = item.Descripcion
                })
                .ToListAsync();
        }

        [HttpGet("carreras")]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetCarreras()
        {
            return await _context.Carreras
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
