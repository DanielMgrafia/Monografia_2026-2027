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
    [Route("api/carreras")]
    public class CarrerasController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public CarrerasController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CarreraDto>>> GetCarreras(bool incluirInactivas = false)
        {
            var query = ConstruirConsultaCarreras();

            if (!incluirInactivas)
            {
                query = query.Where(item => item.Estado == null || item.Estado == "Activo");
            }

            var carreras = await query
                .OrderBy(item => item.Descripcion)
                .ToListAsync();

            return carreras.Select(MapearCarrera).ToList();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CarreraDto>> GetCarrera(int id)
        {
            var carrera = await ConstruirConsultaCarreras()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (carrera == null)
            {
                return NotFound();
            }

            return MapearCarrera(carrera);
        }

        [HttpPost]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CarreraDto>> CrearCarrera([FromBody] CrearCarreraRequest request)
        {
            var descripcion = request.Descripcion?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(descripcion))
            {
                return BadRequest("La descripcion es obligatoria.");
            }

            var validacionCatalogos = await ValidarCatalogosAsync(request.FacultadId, request.AreaConocimientoId);
            if (validacionCatalogos is not null)
            {
                return validacionCatalogos;
            }

            var existeCarrera = await _context.Carreras
                .AnyAsync(item => item.FacultadId == request.FacultadId && item.Descripcion == descripcion);

            if (existeCarrera)
            {
                return Conflict("Ya existe una carrera con esa descripcion en la facultad seleccionada.");
            }

            var carrera = new Carrera
            {
                Descripcion = descripcion,
                FacultadId = request.FacultadId,
                AreaConocimientoId = request.AreaConocimientoId,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Activo" : request.Estado.Trim()
            };

            _context.Carreras.Add(carrera);
            await _context.SaveChangesAsync();

            var creada = await ConstruirConsultaCarreras()
                .FirstAsync(item => item.Id == carrera.Id);

            return CreatedAtAction(nameof(GetCarrera), new { id = carrera.Id }, MapearCarrera(creada));
        }

        [HttpPut("{id:int}/lineas-investigacion")]
        [Authorize(Policy = AuthorizationPolicies.GestionarCatalogos)]
        public async Task<ActionResult<CarreraDto>> ActualizarLineasInvestigacion(
            int id,
            [FromBody] ActualizarLineasCarreraRequest request)
        {
            var carrera = await _context.Carreras
                .Include(item => item.CarreraLineasInvestigacion)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (carrera == null)
            {
                return NotFound();
            }

            var lineaInvestigacionIds = (request.LineaInvestigacionIds ?? [])
                .Distinct()
                .ToList();
            if (lineaInvestigacionIds.Count > 0)
            {
                var lineasValidas = await _context.LineasInvestigacion
                    .CountAsync(item =>
                        lineaInvestigacionIds.Contains(item.Id) &&
                        (item.Estado == null || item.Estado == "Activo"));

                if (lineasValidas != lineaInvestigacionIds.Count)
                {
                    return BadRequest("Una o mas lineas de investigacion no existen o estan inactivas.");
                }
            }

            foreach (var carreraLinea in carrera.CarreraLineasInvestigacion)
            {
                carreraLinea.Estado = lineaInvestigacionIds.Contains(carreraLinea.LineaInvestigacionId)
                    ? "Activo"
                    : "Inactivo";
            }

            var lineasExistentes = carrera.CarreraLineasInvestigacion
                .Select(item => item.LineaInvestigacionId)
                .ToHashSet();

            foreach (var lineaInvestigacionId in lineaInvestigacionIds.Where(item => !lineasExistentes.Contains(item)))
            {
                carrera.CarreraLineasInvestigacion.Add(new CarreraLineaInvestigacion
                {
                    CarreraId = carrera.Id,
                    LineaInvestigacionId = lineaInvestigacionId,
                    Estado = "Activo",
                    FechaAsignacion = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            var actualizada = await ConstruirConsultaCarreras()
                .FirstAsync(item => item.Id == id);

            return Ok(MapearCarrera(actualizada));
        }

        private IQueryable<Carrera> ConstruirConsultaCarreras()
        {
            return _context.Carreras
                .AsNoTracking()
                .Include(item => item.Facultad)
                .Include(item => item.AreaConocimiento)
                .Include(item => item.CarreraLineasInvestigacion)
                .ThenInclude(item => item.LineaInvestigacion);
        }

        private async Task<ActionResult?> ValidarCatalogosAsync(int facultadId, int areaConocimientoId)
        {
            var facultadExiste = await _context.Facultades
                .AnyAsync(item => item.Id == facultadId && (item.Estado == null || item.Estado == "Activo"));

            if (!facultadExiste)
            {
                return BadRequest("La facultad seleccionada no existe o esta inactiva.");
            }

            var areaConocimientoExiste = await _context.AreasConocimiento
                .AnyAsync(item => item.Id == areaConocimientoId && (item.Estado == null || item.Estado == "Activo"));

            if (!areaConocimientoExiste)
            {
                return BadRequest("El area de conocimiento seleccionada no existe o esta inactiva.");
            }

            return null;
        }

        private static CarreraDto MapearCarrera(Carrera carrera)
        {
            return new CarreraDto
            {
                Id = carrera.Id,
                Descripcion = carrera.Descripcion,
                Estado = carrera.Estado,
                FacultadId = carrera.FacultadId,
                Facultad = carrera.Facultad?.Descripcion,
                AreaConocimientoId = carrera.AreaConocimientoId,
                AreaConocimiento = carrera.AreaConocimiento?.Descripcion,
                LineasInvestigacion = carrera.CarreraLineasInvestigacion
                    .Where(item =>
                        item.Estado == "Activo" &&
                        item.LineaInvestigacion != null &&
                        (item.LineaInvestigacion.Estado == null || item.LineaInvestigacion.Estado == "Activo"))
                    .OrderBy(item => item.LineaInvestigacion!.Descripcion)
                    .Select(item => new CatalogoDto
                    {
                        Id = item.LineaInvestigacionId,
                        Descripcion = item.LineaInvestigacion!.Descripcion
                    })
                    .ToList()
            };
        }
    }
}
