using Microsoft.AspNetCore.Mvc;
using RepositorioAcademico.Server.Domain;
using RepositorioAcademico.Server.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace RepositorioAcademico.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentosController : ControllerBase
    {
        private readonly RepositorioDbContext _context;

        public DocumentosController(RepositorioDbContext context)
        {
            _context = context;
        }

        // GET: api/documentos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Documento>>> GetDocumentos()
        {
            return await _context.Documentos.ToListAsync();
        }

        // GET: api/documentos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Documento>> GetDocumento(int id)
        {
            var documento = await _context.Documentos.FindAsync(id);

            if (documento == null)
            {
                return NotFound();
            }

            return documento;
        }

        // POST: api/documentos
        [HttpPost]
        public async Task<ActionResult<Documento>> CrearDocumento(Documento documento)
        {
            documento.FechaSubida = DateTime.Now;
            documento.Estado = "Pendiente";

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocumento), new { id = documento.Id }, documento);
        }
        [HttpPost("upload")]
        public async Task<IActionResult> SubirDocumento(
        IFormFile archivo,
        [FromForm] string titulo,
        [FromForm] string autor,
        [FromForm] string tipo,
        [FromForm] string categoria,
        [FromForm] int usuarioId)
        {

            if (archivo == null || archivo.Length == 0)
                return BadRequest("Archivo inválido");

            var nombreArchivo = Guid.NewGuid().ToString() + Path.GetExtension(archivo.FileName);

            var ruta = Path.Combine(Directory.GetCurrentDirectory(), "storage", nombreArchivo);

            using (var stream = new FileStream(ruta, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            var documento = new Documento
            {
                Titulo = titulo,
                Autor = autor,
                Tipo = tipo,
                Categoria = categoria,
                RutaDocumento = nombreArchivo,
                FechaSubida = DateTime.Now,
                Estado = "Pendiente",
                UsuarioId = usuarioId
            };

            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();

            return Ok(documento);
        }

        [HttpGet("archivo/{nombre}")]
        public IActionResult ObtenerArchivo(string nombre)
        {
            var ruta = Path.Combine(Directory.GetCurrentDirectory(), "storage", nombre);

            if (!System.IO.File.Exists(ruta))
            {
                return NotFound();
            }

            var mime = "application/pdf";

            return PhysicalFile(ruta, mime, nombre);
        }

        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<Documento>>> Buscar(
        string? titulo,
        string? autor,
        string? categoria)
        {
            var query = _context.Documentos.AsQueryable();

            if (!string.IsNullOrEmpty(titulo))
            {
                query = query.Where(d => d.Titulo.Contains(titulo));
            }

            if (!string.IsNullOrEmpty(autor))
            {
                query = query.Where(d => d.Autor.Contains(autor));
            }

            if (!string.IsNullOrEmpty(categoria))
            {
                query = query.Where(d => d.Categoria.Contains(categoria));
            }

            return await query.ToListAsync();
        }

        [HttpGet("lista")]
        public async Task<ActionResult<IEnumerable<Documento>>> Lista(int pagina = 1, int tamano = 10)
        {
            return await _context.Documentos
                .OrderByDescending(d => d.FechaSubida)
                .Skip((pagina - 1) * tamano)
                .Take(tamano)
                .ToListAsync();
        }
    }
}
