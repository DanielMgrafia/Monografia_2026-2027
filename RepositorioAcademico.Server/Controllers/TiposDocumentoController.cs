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
    [Route("api/tipos-documento")]
    public class TiposDocumentoController : ControllerBase
    {
        private static readonly string[] EstadosPermitidos = ["Activo", "Inactivo"];
        private readonly RepositorioDbContext _context;

        public TiposDocumentoController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetTiposDocumento(bool incluirInactivos = false)
        {
            var query = _context.TiposDocumento.AsNoTracking();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == null || item.Estado == "Activo");
            }

            return await query
                .OrderBy(item => item.Descripcion)
                .Select(item => MapearTipoDocumento(item))
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CatalogoDto>> GetTipoDocumento(int id)
        {
            var tipoDocumento = await _context.TiposDocumento
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => MapearTipoDocumento(item))
                .FirstOrDefaultAsync();

            if (tipoDocumento == null)
            {
                return NotFound();
            }

            return tipoDocumento;
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
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

            var estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim();
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var tipoDocumento = new TipoDocumento
            {
                Descripcion = descripcion,
                Estado = estado
            };

            _context.TiposDocumento.Add(tipoDocumento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTipoDocumento), new { id = tipoDocumento.Id }, MapearTipoDocumento(tipoDocumento));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarTipoDocumento(int id, [FromBody] ActualizarCatalogoRequest request)
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

            var tipoDocumento = await _context.TiposDocumento.FirstOrDefaultAsync(item => item.Id == id);
            if (tipoDocumento == null)
            {
                return NotFound();
            }

            var existeTipoDocumento = await _context.TiposDocumento
                .AnyAsync(item => item.Id != id && item.Descripcion == descripcion);

            if (existeTipoDocumento)
            {
                return Conflict("Ya existe un tipo de documento con esa descripcion.");
            }

            tipoDocumento.Descripcion = descripcion;
            tipoDocumento.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearTipoDocumento(tipoDocumento);
        }

        [HttpPut("{id:int}/estado")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarEstadoTipoDocumento(
            int id,
            [FromBody] ActualizarEstadoCatalogoRequest request)
        {
            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var tipoDocumento = await _context.TiposDocumento.FirstOrDefaultAsync(item => item.Id == id);
            if (tipoDocumento == null)
            {
                return NotFound();
            }

            tipoDocumento.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearTipoDocumento(tipoDocumento);
        }

        private static CatalogoDto MapearTipoDocumento(TipoDocumento tipoDocumento)
        {
            return new CatalogoDto
            {
                Id = tipoDocumento.Id,
                Descripcion = tipoDocumento.Descripcion,
                Estado = tipoDocumento.Estado
            };
        }
    }
}
