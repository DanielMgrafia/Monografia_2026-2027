using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentosController : ControllerBase
    {
        private static readonly string[] ExtensionesPermitidas = [".pdf", ".docx"];
        private static readonly string[] EstadosPermitidos = ["Pendiente", "Publicado", "Observado", "Rechazado", "Aprobado"];
        private const string PermisoVerRepositorio = "REPOSITORIO.VER";
        private const string PermisoSubirDocumento = "DOCUMENTO.SUBIR";
        private const string PermisoPublicarDocumento = "DOCUMENTO.PUBLICAR";
        private const string PermisoDescargarDocumento = "DOCUMENTO.DESCARGAR";

        private readonly RepositorioDbContext _context;

        public DocumentosController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> GetDocumentos()
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            return await ConstruirConsultaDocumentos()
                .OrderByDescending(documento => documento.FechaSubida)
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DocumentoDto>> GetDocumento(int id)
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var documento = await ConstruirConsultaDocumentos()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (documento == null)
            {
                return NotFound();
            }

            return documento;
        }

        [HttpPost]
        public async Task<ActionResult<DocumentoDto>> CrearDocumento([FromBody] CrearDocumentoRequest request)
        {
            if (!TienePermiso(PermisoSubirDocumento))
            {
                return Forbid();
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (!usuarioActualId.HasValue)
            {
                return Unauthorized();
            }

            var validacionCatalogos = await ValidarCatalogosAsync(request.TipoDocumentoId, request.FacultadId);
            if (validacionCatalogos is not null)
            {
                return validacionCatalogos;
            }

            var documento = new Documento
            {
                Titulo = request.Titulo,
                Autor = request.Autor,
                TipoDocumentoId = request.TipoDocumentoId,
                FacultadId = request.FacultadId,
                RutaDocumento = request.RutaDocumento,
                FechaSubida = DateTime.UtcNow,
                Estado = string.IsNullOrWhiteSpace(request.Estado) ? "Pendiente" : request.Estado,
                SePuedeDescargar = request.SePuedeDescargar ?? true,
                UsuarioId = usuarioActualId.Value
            };

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();

            var creado = await ConstruirConsultaDocumentos()
                .FirstAsync(item => item.Id == documento.Id);

            return CreatedAtAction(nameof(GetDocumento), new { id = documento.Id }, creado);
        }

        [HttpPost("upload")]
        public async Task<ActionResult<DocumentoDto>> SubirDocumento([FromForm] SubirDocumentoRequest request)
        {
            if (!TienePermiso(PermisoSubirDocumento))
            {
                return Forbid();
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (!usuarioActualId.HasValue)
            {
                return Unauthorized();
            }

            if (request.Archivo == null || request.Archivo.Length == 0)
            {
                return BadRequest("Archivo invalido.");
            }

            var extension = Path.GetExtension(request.Archivo.FileName).ToLowerInvariant();
            if (!ExtensionesPermitidas.Contains(extension))
            {
                return BadRequest("Solo se permiten archivos PDF y Word.");
            }

            var validacionCatalogos = await ValidarCatalogosAsync(request.TipoDocumentoId, request.FacultadId);
            if (validacionCatalogos is not null)
            {
                return validacionCatalogos;
            }

            var storagePath = Path.Combine(Directory.GetCurrentDirectory(), "Storage");
            Directory.CreateDirectory(storagePath);

            var nombreArchivo = $"{Guid.NewGuid()}{extension}";
            var rutaArchivo = Path.Combine(storagePath, nombreArchivo);

            await using (var stream = new FileStream(rutaArchivo, FileMode.Create))
            {
                await request.Archivo.CopyToAsync(stream);
            }

            var documento = new Documento
            {
                Titulo = request.Titulo,
                Autor = request.Autor,
                TipoDocumentoId = request.TipoDocumentoId,
                FacultadId = request.FacultadId,
                RutaDocumento = nombreArchivo,
                FechaSubida = DateTime.UtcNow,
                Estado = "Pendiente",
                SePuedeDescargar = request.SePuedeDescargar ?? true,
                UsuarioId = usuarioActualId.Value
            };

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();

            var creado = await ConstruirConsultaDocumentos()
                .FirstAsync(item => item.Id == documento.Id);

            return Ok(creado);
        }

        [HttpGet("{id:int}/visualizar")]
        public async Task<IActionResult> VisualizarDocumento(int id)
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var documento = await ConstruirConsultaDocumentosVisiblesEntidad()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (documento == null)
            {
                return NotFound();
            }

            return ConstruirRespuestaArchivo(documento, forzarDescarga: false);
        }

        [HttpGet("{id:int}/descargar")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            if (!PuedeConsultarDocumentos() || !TienePermiso(PermisoDescargarDocumento))
            {
                return Forbid();
            }

            var documento = await ConstruirConsultaDocumentosVisiblesEntidad()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (documento == null)
            {
                return NotFound();
            }

            if (!documento.SePuedeDescargar)
            {
                return Forbid();
            }

            return ConstruirRespuestaArchivo(documento, forzarDescarga: true);
        }

        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> Buscar(
            string? titulo,
            string? autor,
            int? tipoDocumentoId,
            int? facultadId,
            string? estado,
            DateTime? fechaDesde,
            DateTime? fechaHasta)
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            var query = ConstruirConsultaDocumentos();

            if (!string.IsNullOrWhiteSpace(titulo))
            {
                query = query.Where(documento =>
                    documento.Titulo != null &&
                    documento.Titulo.Contains(titulo));
            }

            if (!string.IsNullOrWhiteSpace(autor))
            {
                query = query.Where(documento =>
                    documento.Autor != null &&
                    documento.Autor.Contains(autor));
            }

            if (tipoDocumentoId.HasValue)
            {
                query = query.Where(documento => documento.TipoDocumentoId == tipoDocumentoId.Value);
            }

            if (facultadId.HasValue)
            {
                query = query.Where(documento => documento.FacultadId == facultadId.Value);
            }

            if (!string.IsNullOrWhiteSpace(estado))
            {
                query = query.Where(documento => documento.Estado == estado);
            }

            if (fechaDesde.HasValue)
            {
                var fechaInicio = fechaDesde.Value.Date;
                query = query.Where(documento => documento.FechaSubida >= fechaInicio);
            }

            if (fechaHasta.HasValue)
            {
                var fechaFinExclusiva = fechaHasta.Value.Date.AddDays(1);
                query = query.Where(documento => documento.FechaSubida < fechaFinExclusiva);
            }

            return await query
                .OrderByDescending(documento => documento.FechaSubida)
                .ToListAsync();
        }

        [HttpGet("lista")]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> Lista(int pagina = 1, int tamano = 10)
        {
            if (!PuedeConsultarDocumentos())
            {
                return Forbid();
            }

            return await ConstruirConsultaDocumentos()
                .OrderByDescending(documento => documento.FechaSubida)
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .ToListAsync();
        }

        [HttpPut("{id:int}/estado")]
        public async Task<ActionResult<DocumentoDto>> ActualizarEstado(int id, [FromBody] ActualizarEstadoDocumentoRequest request)
        {
            if (!TienePermiso(PermisoPublicarDocumento))
            {
                return Forbid();
            }

            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var documento = await _context.Documentos.FirstOrDefaultAsync(item => item.Id == id);
            if (documento == null)
            {
                return NotFound();
            }

            documento.Estado = estado;
            await _context.SaveChangesAsync();

            var actualizado = await ConstruirConsultaDocumentos()
                .FirstAsync(item => item.Id == id);

            return Ok(actualizado);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<DocumentoDto>> ActualizarDocumento(int id, [FromBody] ActualizarDocumentoRequest request)
        {
            if (!TienePermiso(PermisoPublicarDocumento))
            {
                return Forbid();
            }

            var titulo = request.Titulo?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(titulo))
            {
                return BadRequest("El titulo es obligatorio.");
            }

            var autor = request.Autor?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(autor))
            {
                return BadRequest("El autor es obligatorio.");
            }

            var estado = request.Estado?.Trim() ?? string.Empty;
            if (!EstadosPermitidos.Contains(estado, StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest("El estado solicitado no es valido.");
            }

            var validacionCatalogos = await ValidarCatalogosAsync(request.TipoDocumentoId, request.FacultadId);
            if (validacionCatalogos is not null)
            {
                return validacionCatalogos;
            }

            var documento = await _context.Documentos.FirstOrDefaultAsync(item => item.Id == id);
            if (documento == null)
            {
                return NotFound();
            }

            documento.Titulo = titulo;
            documento.Autor = autor;
            documento.TipoDocumentoId = request.TipoDocumentoId;
            documento.FacultadId = request.FacultadId;
            documento.Estado = estado;
            documento.SePuedeDescargar = request.SePuedeDescargar;

            await _context.SaveChangesAsync();

            var actualizado = await ConstruirConsultaDocumentos()
                .FirstAsync(item => item.Id == id);

            return Ok(actualizado);
        }

        [HttpPut("{id:int}/descarga")]
        public async Task<ActionResult<DocumentoDto>> ActualizarDescarga(int id, [FromBody] ActualizarDescargaDocumentoRequest request)
        {
            if (!TienePermiso(PermisoPublicarDocumento))
            {
                return Forbid();
            }

            var documento = await _context.Documentos.FirstOrDefaultAsync(item => item.Id == id);
            if (documento == null)
            {
                return NotFound();
            }

            documento.SePuedeDescargar = request.SePuedeDescargar;
            await _context.SaveChangesAsync();

            var actualizado = await ConstruirConsultaDocumentos()
                .FirstAsync(item => item.Id == id);

            return Ok(actualizado);
        }

        private IQueryable<DocumentoDto> ConstruirConsultaDocumentos()
        {
            return ConstruirConsultaDocumentosVisiblesEntidad()
                .Include(documento => documento.TipoDocumento)
                .Include(documento => documento.Facultad)
                .Select(documento => new DocumentoDto
                {
                    Id = documento.Id,
                    Titulo = documento.Titulo,
                    Autor = documento.Autor,
                    TipoDocumentoId = documento.TipoDocumentoId,
                    TipoDocumento = documento.TipoDocumento != null ? documento.TipoDocumento.Descripcion : null,
                    FacultadId = documento.FacultadId,
                    Facultad = documento.Facultad != null ? documento.Facultad.Descripcion : null,
                    RutaDocumento = documento.RutaDocumento,
                    FechaSubida = documento.FechaSubida,
                    Estado = documento.Estado,
                    SePuedeDescargar = documento.SePuedeDescargar,
                    UsuarioId = documento.UsuarioId
                });
        }

        private IQueryable<Documento> ConstruirConsultaDocumentosVisiblesEntidad()
        {
            var query = _context.Documentos.AsNoTracking();

            if (TienePermiso(PermisoPublicarDocumento))
            {
                return query;
            }

            var usuarioActualId = ObtenerUsuarioActualId();
            if (TienePermiso(PermisoSubirDocumento) && usuarioActualId.HasValue)
            {
                return query.Where(documento =>
                    documento.Estado == "Publicado" ||
                    documento.Estado == "Aprobado" ||
                    documento.UsuarioId == usuarioActualId.Value);
            }

            return query.Where(documento =>
                documento.Estado == "Publicado" ||
                documento.Estado == "Aprobado");
        }

        private async Task<ActionResult?> ValidarCatalogosAsync(int tipoDocumentoId, int facultadId)
        {
            var tipoDocumentoExiste = await _context.TiposDocumento
                .AnyAsync(item => item.Id == tipoDocumentoId);

            if (!tipoDocumentoExiste)
            {
                return BadRequest("El tipo de documento seleccionado no existe.");
            }

            var facultadExiste = await _context.Facultades
                .AnyAsync(item => item.Id == facultadId);

            if (!facultadExiste)
            {
                return BadRequest("La facultad seleccionada no existe.");
            }

            return null;
        }

        private IActionResult ConstruirRespuestaArchivo(Documento documento, bool forzarDescarga)
        {
            if (string.IsNullOrWhiteSpace(documento.RutaDocumento))
            {
                return NotFound();
            }

            var rutaArchivo = Path.Combine(Directory.GetCurrentDirectory(), "Storage", documento.RutaDocumento);
            if (!System.IO.File.Exists(rutaArchivo))
            {
                return NotFound();
            }

            return forzarDescarga
                ? PhysicalFile(rutaArchivo, ObtenerMimeType(documento.RutaDocumento), documento.RutaDocumento)
                : PhysicalFile(rutaArchivo, ObtenerMimeType(documento.RutaDocumento));
        }

        private bool PuedeConsultarDocumentos()
        {
            return TienePermiso(PermisoVerRepositorio) ||
                   TienePermiso(PermisoSubirDocumento) ||
                   TienePermiso(PermisoPublicarDocumento);
        }

        private bool TienePermiso(string permiso)
        {
            return User.Claims.Any(claim =>
                claim.Type == "permission" &&
                string.Equals(claim.Value, permiso, StringComparison.OrdinalIgnoreCase));
        }

        private int? ObtenerUsuarioActualId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            return int.TryParse(sub, out var usuarioId) ? usuarioId : null;
        }

        private static string ObtenerMimeType(string nombreArchivo)
        {
            return Path.GetExtension(nombreArchivo).ToLowerInvariant() switch
            {
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/pdf"
            };
        }
    }
}
