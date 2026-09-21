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
        private static readonly string[] EstadosPermitidos = ["Activo", "Inactivo"];
        private readonly RepositorioDbContext _context;

        public AreasConocimientoController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CatalogoDto>>> GetAreasConocimiento(bool incluirInactivos = false)
        {
            var query = _context.AreasConocimiento.AsNoTracking();

            if (!incluirInactivos)
            {
                query = query.Where(item => item.Estado == null || item.Estado == "Activo");
            }

            return await query
                .OrderBy(item => item.Descripcion)
                .Select(item => MapearAreaConocimiento(item))
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CatalogoDto>> GetAreaConocimiento(int id)
        {
            var areaConocimiento = await _context.AreasConocimiento
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => MapearAreaConocimiento(item))
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

            var estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim();
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var areaConocimiento = new AreaConocimiento
            {
                Descripcion = descripcion,
                Estado = estado
            };

            _context.AreasConocimiento.Add(areaConocimiento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAreaConocimiento), new { id = areaConocimiento.Id }, MapearAreaConocimiento(areaConocimiento));
        }

        [HttpPut("{id:int}")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarAreaConocimiento(int id, [FromBody] ActualizarCatalogoRequest request)
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

            var areaConocimiento = await _context.AreasConocimiento.FirstOrDefaultAsync(item => item.Id == id);
            if (areaConocimiento == null)
            {
                return NotFound();
            }

            var existeAreaConocimiento = await _context.AreasConocimiento
                .AnyAsync(item => item.Id != id && item.Descripcion == descripcion);

            if (existeAreaConocimiento)
            {
                return Conflict("Ya existe un area de conocimiento con esa descripcion.");
            }

            areaConocimiento.Descripcion = descripcion;
            areaConocimiento.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearAreaConocimiento(areaConocimiento);
        }

        [HttpPut("{id:int}/estado")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CatalogoDto>> ActualizarEstadoAreaConocimiento(
            int id,
            [FromBody] ActualizarEstadoCatalogoRequest request)
        {
            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var areaConocimiento = await _context.AreasConocimiento.FirstOrDefaultAsync(item => item.Id == id);
            if (areaConocimiento == null)
            {
                return NotFound();
            }

            areaConocimiento.Estado = estado;
            await _context.SaveChangesAsync();

            return MapearAreaConocimiento(areaConocimiento);
        }

        private static CatalogoDto MapearAreaConocimiento(AreaConocimiento areaConocimiento)
        {
            return new CatalogoDto
            {
                Id = areaConocimiento.Id,
                Descripcion = areaConocimiento.Descripcion,
                Estado = areaConocimiento.Estado
            };
        }
    }
}
