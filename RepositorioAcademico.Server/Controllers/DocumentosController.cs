using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RepositorioAcademico.Server.Contracts;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentosController : ControllerBase
    {
        private static readonly string[] ExtensionesPermitidas = [".pdf", ".docx"];

        private readonly RepositorioDbContext _context;

        public DocumentosController(RepositorioDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> GetDocumentos()
        {
            return await ConstruirConsultaDocumentos()
                .OrderByDescending(documento => documento.FechaSubida)
                .ToListAsync();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DocumentoDto>> GetDocumento(int id)
        {
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
                UsuarioId = request.UsuarioId
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
                UsuarioId = request.UsuarioId
            };

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();

            var creado = await ConstruirConsultaDocumentos()
                .FirstAsync(item => item.Id == documento.Id);

            return Ok(creado);
        }

        [HttpGet("archivo/{nombre}")]
        public IActionResult ObtenerArchivo(string nombre)
        {
            var rutaArchivo = Path.Combine(Directory.GetCurrentDirectory(), "Storage", nombre);

            if (!System.IO.File.Exists(rutaArchivo))
            {
                return NotFound();
            }

            return PhysicalFile(rutaArchivo, ObtenerMimeType(nombre), nombre);
        }

        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> Buscar(
            string? titulo,
            string? autor,
            int? tipoDocumentoId,
            int? facultadId)
        {
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

            return await query
                .OrderByDescending(documento => documento.FechaSubida)
                .ToListAsync();
        }

        [HttpGet("lista")]
        public async Task<ActionResult<IEnumerable<DocumentoDto>>> Lista(int pagina = 1, int tamano = 10)
        {
            return await ConstruirConsultaDocumentos()
                .OrderByDescending(documento => documento.FechaSubida)
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .ToListAsync();
        }

        private IQueryable<DocumentoDto> ConstruirConsultaDocumentos()
        {
            return _context.Documentos
                .AsNoTracking()
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
                    UsuarioId = documento.UsuarioId
                });
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
